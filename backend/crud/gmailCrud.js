import axios from 'axios';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import { createHash } from 'crypto';
import WarrantyDocument from '../schemas/WarrantyDocument.js';
import { extractPDFAttachments, getHeader, evaluateWarrantyScore, parseDateString, formatGmailDate, clamp } from '../utils/gmailUtils.js';
import { sanitizeFilename } from '../utils/fileUtils.js';
import { findUserById, setLastScanAt } from './userCrud.js';

dotenv.config();

const MAX_CONCURRENT_REQUESTS = 3;
const REQUEST_TIMEOUT = 30000;
const MAX_SCAN_RESULTS = 50;
export const DEFAULT_SCAN_OPTIONS = {
  maxResults: 10,
  startDate: null,
  endDate: null
};

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8080/auth/google/callback'
);

const warrantyCache = new Map();

export const authRedirect = (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    prompt: 'consent'
  });
  res.redirect(authUrl);
};

export const authCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    
    // Encode token to pass it to frontend via URL (will be saved in localStorage)
    const encodedToken = encodeURIComponent(tokens.access_token);
    const redirectUrl = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/gmail-status?token=${encodedToken}`
      : `/gmail-status?token=${encodedToken}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google auth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/error?code=auth_failed`);
  }
};

export const saveGmailOptionsHandler = (req, res) => {
  try {
    const options = saveOptionsToSession(req.session, req.body);
    res.json({ success: true, options });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message || 'Could not save Gmail scan options.' });
  }
};

export const fetchEmails = async (req, res) => {
  try {
    // Get token from Authorization header (sent from frontend)
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.replace('Bearer ', '');
    
    if (!accessToken) {
      return res
        .status(401)
        .json({ error: 'Missing Google access token. Please connect your Gmail account again.' });
    }

    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'Missing or invalid user identifier' });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const io = req.app.get('io');
    const socketId = req.query.socketId;

    // Process emails asynchronously with socket updates
    const scanOptions = req.session.gmailOptions || DEFAULT_SCAN_OPTIONS;
    console.log('=== FETCH EMAILS CALLED ===');
    console.log('Session gmailOptions:', req.session.gmailOptions);
    console.log('Using scanOptions:', scanOptions);
    console.log('Has Socket.IO:', !!io);
    console.log('Has socketId:', !!socketId);
    console.log('========================');

    // Production (Vercel): No Socket.IO - process synchronously
    if (!io || !socketId) {
      console.log('No Socket.IO - processing synchronously (production mode)');
      const result = await fetchWarrantyEmails({
        accessToken,
        userId,
        scanOptions,
        io: null,
        socketId: null
      });
      
      await setLastScanAt(userId);
      return res.json({ 
        success: true, 
        total: result.total,
        documents: result.documents 
      });
    }

    // Localhost: Use Socket.IO for real-time updates    // With Socket.IO (local dev), send immediate response and process async
    res.json({ success: true, message: 'Processing started. Listen to socket events for progress.' });

    fetchWarrantyEmails({
      accessToken,
      userId,
      scanOptions,
      io,
      socketId
    }).then(async (result) => {
      await setLastScanAt(userId, new Date());
      clearOptions(req.session);
      
      if (io && socketId) {
        io.to(socketId).emit('gmail:complete', result);
      }
    }).catch((error) => {
      console.error('Error processing emails:', error);
      if (io && socketId) {
        io.to(socketId).emit('gmail:error', { error: error.message });
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const downloadAttachment = async (req, res) => {
  try {
    const accessToken = req.session.accessToken;
    if (!accessToken) {
      return res
        .status(401)
        .json({ error: 'Missing Google access token. Please connect your Gmail account again.' });
    }

    const { messageId, attachmentId } = req.params;
    const filename = req.query.filename;
    const attachmentRes = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: REQUEST_TIMEOUT
      }
    );

    const pdfBuffer = Buffer.from(attachmentRes.data.data, 'base64');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFilename(filename)}"`);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Eroare download atașament:', error.message);
    return res.status(500).json({ error: 'Nu s-a putut descărca atașamentul.' });
  }
};

const saveOptionsToSession = (session, options = {}) => {
  const rawMax = Number(options.maxResults) || DEFAULT_SCAN_OPTIONS.maxResults;
  const maxResults = clamp(rawMax, 1, MAX_SCAN_RESULTS);
  const startDate = parseDateString(options.startDate);
  const endDate = parseDateString(options.endDate);
  if (startDate && endDate && startDate > endDate) {
    const error = new Error('Start date must be earlier than end date.');
    error.statusCode = 400;
    throw error;
  }

  session.gmailOptions = {
    maxResults,
    startDate: startDate ? startDate.toISOString() : null,
    endDate: endDate ? endDate.toISOString() : null
  };
  return session.gmailOptions;
};

const clearOptions = (session) => {
  session.gmailOptions = { ...DEFAULT_SCAN_OPTIONS };
};

async function fetchWarrantyEmails({ accessToken, userId, scanOptions, io, socketId }) {
  console.log('Starting fetchWarrantyEmails with scanOptions:', scanOptions);
  
  if (io && socketId) {
    io.to(socketId).emit('gmail:status', { message: 'Connecting to Gmail...', step: 1, total: 4 });
  }

  const messages = await fetchAllMessages(accessToken, scanOptions);
  
  console.log(`📬 Fetched ${messages.length} total emails to scan`);
  
  if (io && socketId) {
    io.to(socketId).emit('gmail:status', { 
      message: `Found ${messages.length} emails to scan...`, 
      step: 2, 
      total: 4 
    });
  }

  const results = [];
  let emailsWithPDFs = 0;
  let emailsWithoutPDFs = 0;

  for (let i = 0; i < messages.length; i += 1) {
    if (i > 0 && i % MAX_CONCURRENT_REQUESTS === 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (io && socketId) {
      io.to(socketId).emit('gmail:progress', {
        current: i + 1,
        total: messages.length,
        message: `Processing email ${i + 1} of ${messages.length}...`
      });
    }

    try {
      const result = await processSingleEmail(messages[i].id, accessToken, userId);
      if (result) {
        emailsWithPDFs++;
        console.log(`✅ Email ${i + 1}/${messages.length} has warranty attachments:`, result.subject);
        results.push(result);
      } else {
        emailsWithoutPDFs++;
        console.log(`⏭️  Email ${i + 1}/${messages.length} skipped (no PDF attachments or no warranty)`);
      }
    } catch (error) {
      console.error(`❌ Error processing email ${i + 1}:`, error.message);
    }
  }

  console.log(`\n📊 Scan Summary:`);
  console.log(`   Total emails scanned: ${messages.length}`);
  console.log(`   Emails with PDFs: ${emailsWithPDFs}`);
  console.log(`   Emails without PDFs: ${emailsWithoutPDFs}`);
  console.log(`   Warranty documents found: ${results.length}\n`);

  if (io && socketId) {
    io.to(socketId).emit('gmail:status', { 
      message: 'Finalizing scan...', 
      step: 4, 
      total: 4 
    });
  }

  return {
    total: results.length,
    documents: results
  };
}

async function fetchAllMessages(token, scanOptions = DEFAULT_SCAN_OPTIONS) {
  let messages = [];
  let pageToken = null;
  const desiredTotal = clamp(scanOptions?.maxResults || DEFAULT_SCAN_OPTIONS.maxResults, 1, MAX_SCAN_RESULTS);
  const startDate = parseDateString(scanOptions?.startDate);
  const endDate = parseDateString(scanOptions?.endDate);
  
  console.log('fetchAllMessages called with:');
  console.log('  desiredTotal:', desiredTotal);
  console.log('  startDate:', startDate);
  console.log('  endDate:', endDate);
  
  // Strategy: Search for emails with attachments only (more efficient)
  // Then filter for PDFs during processing
  const queryParts = ['has:attachment'];
  
  if (startDate) {
    queryParts.push(`after:${formatGmailDate(startDate)}`);
  }
  if (endDate) {
    const inclusiveEnd = new Date(endDate);
    inclusiveEnd.setDate(inclusiveEnd.getDate() + 1);
    queryParts.push(`before:${formatGmailDate(inclusiveEnd)}`);
  }
  
  const query = queryParts.join(' ');
  
  console.log('🔍 Gmail API query:', query);
  console.log('📅 Date range: from', startDate, 'to', endDate);
  console.log('📧 Will fetch up to', desiredTotal, 'emails with attachments');

  do {
    try {
      const batchSize = Math.min(10, desiredTotal - messages.length);
      console.log(`Fetching batch: current=${messages.length}, batchSize=${batchSize}, remaining=${desiredTotal - messages.length}`);
      
      const response = await axios.get(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages',
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            maxResults: batchSize,
            pageToken,
            q: query
          },
          timeout: REQUEST_TIMEOUT
        }
      );

      console.log('📬 Gmail API Response:', JSON.stringify({
        messagesCount: response.data.messages?.length || 0,
        resultSizeEstimate: response.data.resultSizeEstimate,
        nextPageToken: response.data.nextPageToken ? 'EXISTS' : 'NULL'
      }, null, 2));

      const newMessages = response.data.messages || [];
      console.log(`Received ${newMessages.length} messages in this batch`);
      
      messages = messages.concat(newMessages);
      pageToken = response.data.nextPageToken;
      
      console.log(`Total messages so far: ${messages.length}/${desiredTotal}, hasNextPage: ${!!pageToken}`);
      
      if (messages.length >= desiredTotal) break;
    } catch (error) {
      console.error('Eroare preluare mesaje:', error.message);
      break;
    }
  } while (pageToken && messages.length < desiredTotal);

  const filtered = messages.filter((msg) => msg?.id);
  console.log(`Returning ${filtered.length} valid messages`);
  return filtered;
}

async function processSingleEmail(id, token, userId) {
  try {
    const msgRes = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { format: 'full' },
        timeout: REQUEST_TIMEOUT
      }
    );

    const headers = msgRes.data.payload?.headers || [];
    const parts = msgRes.data.payload?.parts || [];
    
    const attachments = extractPDFAttachments(parts);
    
    // Log if email has no PDF attachments
    if (attachments.length === 0) {
      return null;
    }
    
    const subject = getHeader(headers, 'Subject');
    console.log(`\n📎 Processing: ${subject}`);
    console.log(`   Found ${attachments.length} PDF(s): ${attachments.map(a => a.filename).join(', ')}`);
    
    const warrantyAttachments = [];

    for (const attachment of attachments) {
      try {
        console.log(`Processing attachment: ${attachment.filename}`);
        
        const attachmentRes = await axios.get(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/attachments/${attachment.attachmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: REQUEST_TIMEOUT
          }
        );

        const pdfBuffer = Buffer.from(attachmentRes.data.data, 'base64');
        
        const isWarranty = await isWarrantyDocument(pdfBuffer);
        console.log(`Attachment ${attachment.filename} is warranty: ${isWarranty}`);
        
        if (isWarranty) {
          await persistWarrantyDocument({
            userId,
            messageId: id,
            attachment,
            pdfBuffer,
            headers
          });
          warrantyAttachments.push({
            filename: attachment.filename,
            size: attachment.size,
            attachmentId: attachment.attachmentId
          });
        }
      } catch (error) {
        console.error(`Error processing attachment ${attachment.filename}:`, error.message);
        console.log(`Skipping attachment ${attachment.filename} and continuing...`);
        // Continue to next attachment
      }
    }

    const result = warrantyAttachments.length > 0
      ? {
          id,
          subject: getHeader(headers, 'Subject'),
          from: getHeader(headers, 'From'),
          date: getHeader(headers, 'Date'),
          attachments: warrantyAttachments
        }
      : null;
    
    if (result) {
      console.log(`✅ Email ${id} processed: ${warrantyAttachments.length} warranty document(s) saved`);
    } else {
      console.log(`⏭️  Email ${id} has no warranty documents`);
    }
    
    return result;
  } catch (error) {
    console.error(`Eroare procesare ${id}:`, error.message);
    return null;
  }
}

async function extractPDFText(buffer) {
  try {
    if (!Buffer.isBuffer(buffer) || buffer.length < 4) {
      throw new Error('Buffer invalid pentru PDF');
    }

    const header = buffer.toString('hex', 0, 4);
    if (header !== '25504446') {
      throw new Error('Fișierul nu este un PDF valid');
    }

    // Use pdf-parse - simple and reliable
    const pdf = await import('pdf-parse/lib/pdf-parse.js');
    const data = await pdf.default(buffer);
    
    let text = data.text || '';
    
    // Clean and normalize text
    text = text
      .replace(/\s+/g, ' ')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s{2,}/g, ' ')
      .substring(0, 3000)
      .trim();

    return text;
  } catch (error) {
    console.error('Eroare extragere text:', error.message);
    return '';
  }
}

async function isWarrantyDocument(pdfBuffer) {
  const contentHash = createHash('sha256').update(pdfBuffer).digest('hex');

  if (warrantyCache.has(contentHash)) {
    console.log('PDF found in cache, returning cached result');
    return warrantyCache.get(contentHash);
  }

  try {
    const pdfText = await extractPDFText(pdfBuffer);
    if (!pdfText.trim()) {
      console.log('⚠️ PDF ignored: Could not extract text (possibly protected/corrupted). SKIPPING and CONTINUING with next attachment...');
      warrantyCache.set(contentHash, false);
      return false;
    }
    const heuristicScore = evaluateWarrantyScore(pdfText);
    const heuristicPass = heuristicScore >= 3;

    const prompt = `Esti expert in certificate de garantie. Analizeaza textul de mai jos si raspunde EXACT cu DA daca gasesti CLAR
        cel putin trei dintre elementele enumerate. Daca gasesti doua sau mai putine, raspunde EXACT cu NU. NU adauga alte cuvinte.
        Elementele cautate:
        1. Denumire produs + model
        2. Durata sau data de expirare a garantiei
        3. Conditii/limitari privind defectele acoperite
        4. Date de contact service/producator (telefon/email/adresa)
        5. Elemente administrative (numar de serie, numar factura, data achizitie)

        Text (trunchiat la 2500 caractere):
        ${pdfText.substring(0, 2500)}`;

    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 2
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: REQUEST_TIMEOUT
      }
    );

    const aiResponse = response.data.choices[0].message.content.trim().toUpperCase();
    const aiPass = aiResponse.startsWith('DA');
    const result = aiPass || heuristicPass;
    console.log(`Warranty decision -> AI: ${aiResponse}, heuristic: ${heuristicScore}, final: ${result}`);
    warrantyCache.set(contentHash, result);

    return result;
  } catch (error) {
    console.error('Eroare validare:', error.message);
    return false;
  }
}

async function persistWarrantyDocument({ userId, messageId, attachment, pdfBuffer, headers }) {
  if (!userId || !attachment?.attachmentId) {
    return;
  }

  const contentHash = createHash('sha256').update(pdfBuffer).digest('hex');
  const subject = getHeader(headers, 'Subject');
  const from = getHeader(headers, 'From');
  const dateHeader = getHeader(headers, 'Date');
  const messageDate = dateHeader ? new Date(dateHeader) : null;

  await WarrantyDocument.findOneAndUpdate(
    {
      userId,
      $or: [
        { gmailMessageId: messageId, attachmentId: attachment.attachmentId },
        { contentHash }
      ]
    },
    {
      userId,
      gmailMessageId: messageId,
      attachmentId: attachment.attachmentId,
      contentHash,
      filename: attachment.filename || `document-${Date.now()}.pdf`,
      size: attachment.size || pdfBuffer.length,
      subject,
      from,
      messageDate,
      productName: subject || attachment.filename || 'Unknown',
      purchaseDate: messageDate,
      expirationDate: messageDate,
      provider: from || 'Unknown',
      pdfData: pdfBuffer,
      contentType: 'application/pdf'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

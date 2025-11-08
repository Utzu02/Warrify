import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import { createHash } from 'crypto';
import session from 'express-session';
import mongoose from 'mongoose';
import User from '../models/User.js';
import WarrantyDocument from '../models/WarrantyDocument.js';

const router = express.Router();
const isValidObjectId = (value = '') => mongoose.Types.ObjectId.isValid(value);

// 1. Configurare middleware
router.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// 2. Configurare OAuth2 Google
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || "http://localhost:8080/auth/google/callback"
);

// 3. Cache și constante
const warrantyCache = new Map();
const MAX_CONCURRENT_REQUESTS = 3;
const REQUEST_TIMEOUT = 30000;

// 4. Funcție extragere text PDF cu retry
// Corectare import

// Funcția corectă de extragere text
// 4. Funcție extragere text PDF îmbunătățită
async function extractPDFText(buffer) {
    try {
        // Verificare buffer valid
        if (!Buffer.isBuffer(buffer) || buffer.length < 4) {
            throw new Error('Buffer invalid pentru PDF');
        }

        // Verificare header PDF (primele 4 bytes trebuie să fie %PDF)
        const header = buffer.toString('hex', 0, 4);
        if (header !== '25504446') { // %PDF în hex
            throw new Error('Fișierul nu este un PDF valid');
        }
        
        const { default: pdfParse } = await import('pdf-parse');
        const data = await pdfParse(buffer);
        let text = data.text;

        // Curățare text păstrând diacritice
        text = text
            .replace(/\s+/g, ' ')
            .replace(/[^\p{L}\p{N}\s]/gu, ' ') // Păstrează litere, numere și spații
            .replace(/\s{2,}/g, ' ')
            .substring(0, 3000)
            .trim();

        console.log('Text extras:', text.substring(0, 200) + '...'); // Debug logging
        return text;

    } catch (error) {
        console.error('Eroare extragere text:', error.message);
        // Returnează string gol pentru PDF-uri cu probleme
        return '';
    }
}

// 5. Sistem validare îmbunătățit
async function isWarrantyDocument(pdfBuffer) {
    const contentHash = createHash('sha256').update(pdfBuffer).digest('hex');
    
    if (warrantyCache.has(contentHash)) {
        return warrantyCache.get(contentHash);
    }

    try {
        const pdfText = await extractPDFText(pdfBuffer);
        if (!pdfText.trim()) {
            console.warn('Document ignorat: nu s-a putut extrage text (posibil PDF protejat).');
            warrantyCache.set(contentHash, false);
            return false;
        }
        const heuristicScore = evaluateWarrantyScore(pdfText);
        const heuristicPass = heuristicScore >= 3;
        
        // Verificare cu DeepSeek (fallback la scorul euristic)
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
            "https://api.deepseek.com/v1/chat/completions",
            {
                model: "deepseek-chat",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1,
                max_tokens: 2
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: REQUEST_TIMEOUT
            }
        );

        const aiResponse = response.data.choices[0].message.content.trim().toUpperCase();
        const aiPass = aiResponse.startsWith("DA");
        const result = aiPass || heuristicPass;
        console.log(`Warranty decision -> AI: ${aiResponse}, heuristic: ${heuristicScore}, final: ${result}`);
        warrantyCache.set(contentHash, result);
        
        return result;

    } catch (error) {
        console.error('Eroare validare:', error.message);
        return false;
    }
}

// 6. Rute principale
router.get("/auth/google", (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/gmail.readonly"],
        prompt: "consent"
    });
    res.redirect(authUrl);
});

router.get("/auth/google/callback", async (req, res) => {
    try {
        const { code } = req.query;
        const { tokens } = await oauth2Client.getToken(code);
        req.session.accessToken = tokens.access_token;
        const redirectUrl = process.env.FRONTEND_URL
            ? `${process.env.FRONTEND_URL}/gmail-status`
            : '/gmail-status';
        res.redirect(redirectUrl);
    } catch (error) {
        res.redirect(`${process.env.FRONTEND_URL}/error?code=auth_failed`);
    }
});

router.get("/api/emails", async (req, res) => {
    try {
        const accessToken = req.session.accessToken;
        if (!accessToken) {
            return res.status(401).json({ error: 'Missing Google access token. Please connect your Gmail account again.' });
        }

        const userId = req.headers['x-user-id'] || req.query.userId;
        if (!userId || !isValidObjectId(userId)) {
            return res.status(400).json({ error: 'Missing or invalid user identifier' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const messages = await fetchAllMessages(accessToken);
        const results = [];
        
        // Procesare controlată
        for (let i = 0; i < messages.length; i++) {
            if (i > 0 && i % MAX_CONCURRENT_REQUESTS === 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            try {
                const result = await processSingleEmail(messages[i].id, accessToken, userId);
                if (result) results.push(result);
            } catch (error) {
                console.error(`Eroare mesaj ${i}:`, error.message);
            }
        }

        user.lastScanAt = new Date();
        await user.save();

        res.json({
            total: results.length,
            documents: results
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/api/emails/:messageId/attachments/:attachmentId", async (req, res) => {
    try {
        const accessToken = req.session.accessToken;
        if (!accessToken) {
            return res.status(401).json({ error: 'Missing Google access token. Please connect your Gmail account again.' });
        }

        const { messageId, attachmentId } = req.params;
        const filename = sanitizeFilename(req.query.filename || 'document.pdf');

        const attachmentRes = await axios.get(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
                timeout: REQUEST_TIMEOUT
            }
        );

        const pdfBuffer = Buffer.from(attachmentRes.data.data, 'base64');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(pdfBuffer);
    } catch (error) {
        console.error('Eroare download atașament:', error.message);
        return res.status(500).json({ error: 'Nu s-a putut descărca atașamentul.' });
    }
});

const MAX_EMAILS = 10
// 7. Funcții helper actualizate
async function fetchAllMessages(token) {
    let messages = [];
    let pageToken = null;
    
    do {
        try {
            const response = await axios.get(
                "https://gmail.googleapis.com/gmail/v1/users/me/messages", 
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        maxResults: 10,
                        pageToken,
                        q: "has:attachment (mimeType:application/pdf OR filename:.pdf)"
                    },
                    timeout: REQUEST_TIMEOUT
                }
            );

            messages = messages.concat(response.data.messages || []);
            pageToken = response.data.nextPageToken;
            if(messages.length > MAX_EMAILS) return;
        } catch (error) {
            console.error('Eroare preluare mesaje:', error.message);
            break;
        }
    } while (pageToken && messages.length < MAX_EMAILS);

    return messages.filter(msg => msg?.id);
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
        const warrantyAttachments = [];

        for (const attachment of attachments) {
            try {
                const attachmentRes = await axios.get(
                    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/attachments/${attachment.attachmentId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        timeout: REQUEST_TIMEOUT
                    }
                );

                const pdfBuffer = Buffer.from(attachmentRes.data.data, 'base64');
                if (await isWarrantyDocument(pdfBuffer)) {
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
                console.error(`Eroare atașament ${attachment.attachmentId}:`, error.message);
            }
        }

        return warrantyAttachments.length > 0 ? {
            id,
            subject: getHeader(headers, 'Subject'),
            from: getHeader(headers, 'From'),
            date: getHeader(headers, 'Date'),
            attachments: warrantyAttachments
        } : null;

    } catch (error) {
        console.error(`Eroare procesare ${id}:`, error.message);
        return null;
    }
}

// Utilitare
function extractPDFAttachments(parts, attachments = []) {
    parts.forEach(part => {
        if (part.mimeType === 'application/pdf' || part.filename?.endsWith('.pdf')) {
            attachments.push({
                filename: part.filename || `document-${Date.now()}.pdf`,
                size: part.body?.size || 0,
                attachmentId: part.body?.attachmentId
            });
        }
        if (part.parts) extractPDFAttachments(part.parts, attachments);
    });
    return attachments;
}

function getHeader(headers, name) {
    return headers.find(h => h.name === name)?.value || 'Necunoscut';
}

async function persistWarrantyDocument({ userId, messageId, attachment, pdfBuffer, headers }) {
    if (!userId || !attachment?.attachmentId) {
        return;
    }

    const subject = getHeader(headers, 'Subject');
    const from = getHeader(headers, 'From');
    const dateHeader = getHeader(headers, 'Date');
    const messageDate = dateHeader ? new Date(dateHeader) : null;

    await WarrantyDocument.findOneAndUpdate(
        { userId, attachmentId: attachment.attachmentId },
        {
            userId,
            gmailMessageId: messageId,
            attachmentId: attachment.attachmentId,
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

function evaluateWarrantyScore(text = '') {
    if (!text) return 0;
    const normalized = text.toLowerCase();
    const checks = [
        { pattern: /certificat\s+de\s+garan/i, score: 2 },
        { pattern: /(model|marca|tip)\s+[a-z0-9]/i, score: 1 },
        { pattern: /(serie|serial|sn)[\s:]/i, score: 1 },
        { pattern: /factura|bon\s+fiscal|data\s+(achizitiei|cumpararii)/i, score: 1 },
        { pattern: /garant(i|ie)\s+(valabil|expira|luni|ani)/i, score: 1 },
        { pattern: /(defect|remediere|interventie)/i, score: 1 },
        { pattern: /(service|contact|suport).*(tel|telefon|email)/i, score: 1 }
    ];

    return checks.reduce((sum, check) => (
        check.pattern.test(normalized) ? sum + check.score : sum
    ), 0);
}

function sanitizeFilename(name = 'document.pdf') {
    return String(name)
        .trim()
        .replace(/[/\\?%*:|"<>]/g, '_')
        .substring(0, 100) || 'document.pdf';
}

export default router;

import { createHash } from 'crypto';
import axios from 'axios';
import { evaluateWarrantyScore } from '../utils/gmailUtils.js';

// Cache to avoid re-validating the same PDF
const validationCache = new Map();
const REQUEST_TIMEOUT = 15000;

/**
 * Extract text from PDF buffer
 */
async function extractPDFText(buffer) {
  try {
    if (!Buffer.isBuffer(buffer) || buffer.length < 4) {
      throw new Error('Invalid buffer for PDF');
    }

    const header = buffer.toString('hex', 0, 4);
    if (header !== '25504446') {
      throw new Error('File is not a valid PDF');
    }

    // Use pdf-parse with dynamic import
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
    console.error('Error extracting PDF text:', error.message);
    return '';
  }
}

/**
 * Validate if a PDF is a warranty document using DeepSeek AI
 * Returns an object with isValid and confidence score
 */
export const validateWarrantyPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        isValid: false,
        confidence: 0
      });
    }

    const pdfBuffer = req.file.buffer;
    const contentHash = createHash('sha256').update(pdfBuffer).digest('hex');

    // Check cache first
    if (validationCache.has(contentHash)) {
      console.log('PDF validation found in cache');
      return res.status(200).json(validationCache.get(contentHash));
    }

    // Extract text from PDF
    console.log('📄 Extracting text from PDF:', req.file.originalname);
    const pdfText = await extractPDFText(pdfBuffer);
    console.log(`📝 Extracted ${pdfText.length} characters of text`);
    
    if (!pdfText.trim()) {
      const result = {
        isValid: false,
        confidence: 0,
        reason: 'Could not extract text from PDF. The file might be protected, corrupted, or image-based.',
        heuristicScore: 0,
        aiResponse: null
      };
      validationCache.set(contentHash, result);
      return res.status(200).json(result);
    }

    // Calculate heuristic score
    const heuristicScore = evaluateWarrantyScore(pdfText);
    console.log(`🔍 Heuristic score: ${heuristicScore}/5`);

    // Prepare AI prompt
    console.log('🤖 Calling DeepSeek AI for validation...');
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

    try {
      // Call DeepSeek API
      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 10
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
      const heuristicPass = heuristicScore >= 3;
      
      // Trust AI response primarily - only use heuristic if AI is uncertain
      const isValid = aiPass;
      
      // Calculate confidence score (0-100)
      let confidence = 0;
      if (aiPass && heuristicPass) {
        confidence = 95; // Both AI and heuristic agree - very high confidence
      } else if (aiPass && !heuristicPass) {
        confidence = 85; // AI says yes, but heuristic disagrees - still trust AI
      } else if (!aiPass && heuristicPass) {
        confidence = 30; // AI says no, heuristic says yes - trust AI, low confidence
      } else {
        confidence = Math.min(heuristicScore * 10, 20); // Both say no - very low confidence
      }

      const result = {
        isValid,
        confidence,
        heuristicScore,
        aiResponse,
        reason: isValid 
          ? `AI validated as warranty certificate (${aiResponse})` 
          : `AI determined this is not a warranty certificate (${aiResponse})`,
        filename: req.file.originalname,
        fileSize: req.file.size
      };

      console.log(`✓ Validation result -> AI: ${aiResponse}, heuristic: ${heuristicScore}/5, valid: ${isValid}, confidence: ${confidence}%`);
      
      // Cache the result
      validationCache.set(contentHash, result);

      return res.status(200).json(result);

    } catch (aiError) {
      console.error('❌ DeepSeek API error:', aiError.message);
      
      // Fallback to heuristic only if AI fails
      const heuristicPass = heuristicScore >= 3;
      const result = {
        isValid: false, // Always reject if AI can't validate
        confidence: 20,
        heuristicScore,
        aiResponse: null,
        reason: aiError.message.includes('timeout') 
          ? '⚠️ AI validation timed out - rejecting by default. Please try again.'
          : '⚠️ AI validation failed - rejecting by default. Please try again.',
        filename: req.file.originalname,
        fileSize: req.file.size
      };

      console.log(`⚠️ AI failed, rejecting document (heuristic was ${heuristicScore}/5)`);
      validationCache.set(contentHash, result);
      return res.status(200).json(result);
    }

  } catch (error) {
    console.error('Validation error:', error);
    return res.status(500).json({ 
      error: 'Failed to validate PDF',
      isValid: false,
      confidence: 0,
      reason: error.message
    });
  }
};

/**
 * Clear validation cache (useful for testing)
 */
export const clearValidationCache = (req, res) => {
  validationCache.clear();
  res.status(200).json({ message: 'Validation cache cleared' });
};

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// For maximum safety in production, ensure SESSION_SECRET is set in your .env
// We default to a generated one for dev to avoid crashing, but it resets on server restart.
const fallbackSecret = randomBytes(32).toString('hex');
const RAW_SECRET = process.env.SESSION_SECRET || fallbackSecret;

// Ensure exactly 32 bytes for aes-256
const SECRET_KEY = Buffer.from(RAW_SECRET.padEnd(32, '0').slice(0, 32));

export function encryptPayload(payload: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, SECRET_KEY, iv);
  
  let encrypted = cipher.update(payload, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag().toString('base64');
  
  // Format: iv:authTag:encryptedData
  return `${iv.toString('base64')}:${authTag}:${encrypted}`;
}

export function decryptPayload(encryptedPayload: string): string | null {
  try {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) return null;
    
    const [ivBase64, authTagBase64, encryptedData] = parts;
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    
    const decipher = createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('[Session] Decryption error:', error);
    return null;
  }
}

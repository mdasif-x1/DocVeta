import { describe, it, expect } from 'vitest';
import { sanitizeFilename, generateDownloadName, escapeHtml } from '../lib/utilities/sanitize';

describe('Sanitization & Security Utilities', () => {
  it('strips path traversal patterns (../..)', () => {
    expect(sanitizeFilename('../../../secret.pdf')).toBe('secret.pdf');
    expect(sanitizeFilename('..\\..\\windows\\system32.pdf')).toBe('windows_system32.pdf');
  });

  it('removes illegal characters and control characters', () => {
    expect(sanitizeFilename('my<doc>:name?.pdf')).toBe('mydocname.pdf');
    expect(sanitizeFilename('file|with*invalid"chars.png')).toBe('filewithinvalidchars.png');
  });

  it('falls back to default name when string is empty or invalid', () => {
    expect(sanitizeFilename('')).toBe('download');
    expect(sanitizeFilename('   ')).toBe('download');
    expect(sanitizeFilename('..//..//')).toBe('download');
  });

  it('generates descriptive and clean download names', () => {
    expect(generateDownloadName('merged', 'pdf')).toBe('docveta-merged.pdf');
    expect(generateDownloadName('converted', 'pdf', 'receipt.jpg')).toBe('receipt-converted.pdf');
  });

  it('properly escapes HTML special characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });
});

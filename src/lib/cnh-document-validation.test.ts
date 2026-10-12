import { describe, expect, it } from 'vitest';
import { documentSaveSchema, imageSignature, validDocumentPath, validateImage } from './cnh-document-validation';
const userId = '542fe8ee-f2bf-414f-ba81-a82f6c899600';
const extraPages = [{ side: 'page3', note: '', storagePath: null }, { side: 'page4', note: '', storagePath: null }];
describe('private CNH documents', () => {
  it('preserves an individual photo name with each side', () => {
    const result = documentSaveSchema.parse({ userId, documents: [{ side: 'front', photoName: 'Frente pessoal', note: '', storagePath: null }, { side: 'back', photoName: 'Verso pessoal', note: '', storagePath: null }, ...extraPages] });
    expect(result.documents.map(row => row.photoName)).toEqual(['Frente pessoal', 'Verso pessoal', '', '']);
  });
  it('allows draft text without an uploaded photo', () => {
    const result = documentSaveSchema.parse({ userId, documents: [{ side: 'front', note: 'Individual draft', storagePath: null }, { side: 'back', note: '', storagePath: null }, ...extraPages] });
    expect(result.documents[0]?.note).toBe('Individual draft');
    expect(result.documents[0]?.storagePath).toBeNull();
  });
  it('requires a distinct image side for each text', () => {
    expect(documentSaveSchema.safeParse({ userId, documents: [{ side: 'front', note: '', storagePath: null }, { side: 'front', note: '', storagePath: null }, ...extraPages] }).success).toBe(false);
  });
  it('requires all four CNH photos', () => {
    expect(documentSaveSchema.safeParse({ userId, documents: extraPages }).success).toBe(false);
    const result = documentSaveSchema.parse({ userId, documents: [{ side: 'front', note: '', storagePath: null }, { side: 'back', note: '', storagePath: null }, ...extraPages] });
    expect(result.documents.map(row => row.side)).toEqual(['front', 'back', 'page3', 'page4']);
  });
  it('rejects an image belonging to another user or side', () => {
    const path = `${userId}/front/12345678-1234-1234-1234-123456789abc.png`;
    expect(validDocumentPath(path, userId, 'front')).toBe(true);
    expect(validDocumentPath(path, userId, 'back')).toBe(false);
    expect(validDocumentPath(path, '12345678-1234-1234-1234-123456789abc', 'front')).toBe(false);
  });
  it('rejects unsupported image formats', () => { expect(() => validateImage({ size: 100, type: 'image/svg+xml' })).toThrow(); });
  it('enforces the 5 MB limit', () => {
    expect(() => validateImage({ size: 5 * 1024 * 1024, type: 'image/png' })).not.toThrow();
    expect(() => validateImage({ size: 5 * 1024 * 1024 + 1, type: 'image/png' })).toThrow();
  });
  it('rejects disguised non-image content', () => { expect(imageSignature(new TextEncoder().encode('<script>bad</script>'))).toBe(false); });
});
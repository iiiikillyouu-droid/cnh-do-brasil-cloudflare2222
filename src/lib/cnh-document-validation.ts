import { z } from 'zod';

export const DOCUMENT_BUCKET = 'cnh-documents';
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const documentSideSchema = z.enum(['front', 'back', 'page3', 'page4']);
export const DOCUMENT_LABELS = { front: 'Frente', back: 'Verso', page3: 'Página 3', page4: 'Página 4' };
export type DocumentSide = z.infer<typeof documentSideSchema>;
export const documentSaveSchema = z.object({
  userId: z.string().uuid(),
  documents: z.array(z.object({ side: documentSideSchema, photoName: z.string().trim().max(150).default(''), note: z.string().max(10000), storagePath: z.string().max(300).nullable() })).length(4),
}).refine(data => new Set(data.documents.map(d => d.side)).size === 4, 'As quatro fotos devem ser distintas.');
export function validateImage(file: { size: number; type: string }) {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('Selecione uma imagem JPG, PNG ou WebP.');
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) throw new Error('A imagem deve ter até 5 MB.');
}
export function validDocumentPath(path: string, userId: string, side: DocumentSide) {
  return new RegExp(`^${userId}/${side}/[a-f0-9-]{36}\\.(jpg|png|webp)$`).test(path);
}
export function imageSignature(bytes: Uint8Array) {
  return (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) ||
    (bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71 && bytes[4] === 13 && bytes[5] === 10 && bytes[6] === 26 && bytes[7] === 10) ||
    (String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP');
}
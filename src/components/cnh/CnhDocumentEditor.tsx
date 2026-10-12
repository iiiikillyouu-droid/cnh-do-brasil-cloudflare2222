import { useEffect, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DOCUMENT_LABELS, validateImage, type DocumentSide } from '@/lib/cnh-document-validation';

export type DocumentDraft = { side: DocumentSide; photoName: string; note: string; storagePath: string | null; url: string | null; file: File | null };
export function emptyDocuments(): DocumentDraft[] {
  return (['front', 'back', 'page3', 'page4'] as DocumentSide[]).map(side => ({ side, photoName: '', note: '', storagePath: null, url: null, file: null }));
}
function DocumentImage({ document }: { document: DocumentDraft }) {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!document.file) { setPreview(null); return; }
    const url = URL.createObjectURL(document.file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [document.file]);
  const source = document.file ? preview : document.url;
  return <div className="aspect-[4/3] overflow-hidden rounded-md border border-border bg-muted flex items-center justify-center">{source ? <img src={source} alt={`${DOCUMENT_LABELS[document.side]} da CNH`} className="h-full w-full object-contain"/> : <ImagePlus aria-hidden="true"/>}</div>;
}
export function CnhDocumentEditor({ documents, onChange, disabled, onError }: { documents: DocumentDraft[]; onChange: (documents: DocumentDraft[]) => void; disabled: boolean; onError: (message: string) => void }) {
  function update(side: DocumentSide, changes: Partial<DocumentDraft>) { onChange(documents.map(document => document.side === side ? { ...document, ...changes } : document)); }
  return <fieldset className="mt-6 min-w-0 border-t border-border pt-4" disabled={disabled}><legend className="cnh-auth-title">CNH do condutor</legend>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{documents.map(document => {
      const label = DOCUMENT_LABELS[document.side];
      return <div key={document.side} className="min-w-0"><h3 className="cnh-auth-label">{label}</h3><DocumentImage document={document}/>
        <div className="my-2 flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={disabled} onClick={() => window.document.getElementById(`cnh-file-${document.side}`)?.click()}><ImagePlus/>{document.file || document.storagePath ? 'Substituir' : 'Enviar foto'}</Button>
          <Button type="button" variant="outline" title={`Remover foto: ${label}`} aria-label={`Remover foto: ${label}`} disabled={disabled || !(document.file || document.storagePath)} onClick={() => update(document.side, { file: null, storagePath: null, url: null })}><Trash2/></Button></div>
        <input id={`cnh-file-${document.side}`} aria-label={`Foto: ${label}`} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; try { validateImage(file); update(document.side, { file }); onError(''); } catch (error) { onError(error instanceof Error ? error.message : 'Arquivo inválido.'); } }}/>
        <label htmlFor={`cnh-name-${document.side}`} className="cnh-auth-label">Nome da foto</label>
        <input id={`cnh-name-${document.side}`} className="cnh-auth-input" maxLength={150} value={document.photoName} onChange={event => update(document.side, { photoName: event.target.value })}/>
        <label htmlFor={`cnh-note-${document.side}`} className="cnh-auth-label">Informações — {label}</label>
        <textarea id={`cnh-note-${document.side}`} className="mt-1 min-h-16 w-full resize-y rounded-md border border-input bg-background p-3 text-sm text-foreground" maxLength={10000} value={document.note} onChange={event => update(document.side, { note: event.target.value })}/>
        {!document.file && !document.storagePath && document.note && <p className="cnh-auth-hint">Rascunho sem foto</p>}
      </div>;
    })}</div>
  </fieldset>;
}
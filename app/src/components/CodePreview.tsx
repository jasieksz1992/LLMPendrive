import type { LanguageMode } from '../types/assistant'

type Props = {
  code: string
  error: string
  status: string
  language: LanguageMode
  loading: boolean
  onCopy: () => void
  onSave: () => void
}

export const CodePreview = ({ code, error, status, language, loading, onCopy, onSave }: Props) => {
  return (
    <section className="panel preview-panel">
      <div className="preview-header">
        <div>
          <h2>Generated code</h2>
          <p>{language === 'csharp' ? 'Saved files use .cs' : 'Saved files use .java'}</p>
        </div>
        <div className="preview-actions">
          <button disabled={!code || loading} onClick={onCopy} type="button">Copy</button>
          <button disabled={!code || loading} onClick={onSave} type="button">Save to file</button>
        </div>
      </div>
      {error && <div className="message error">{error}</div>}
      {status && <div className="message success">{status}</div>}
      <pre className={code ? 'code-output' : 'code-output empty'}>
        <code>{code || 'Generated code will appear here.'}</code>
      </pre>
    </section>
  )
}

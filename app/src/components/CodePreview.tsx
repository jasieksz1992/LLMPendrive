type Props = {
  code: string
  error: string
  status: string
  loading: boolean
  onCopy: () => void
  onSave: () => void
}

export const CodePreview = ({ code, error, status, loading, onCopy, onSave }: Props) => {
  return (
    <section className="panel code-panel" aria-label="Kod">
      <div className="section-bar">
        <span>Kod</span>
        <div className="preview-actions">
          <button className="secondary-button" disabled={!code || loading} onClick={onCopy} type="button">Kopiuj</button>
          <button className="secondary-button" disabled={!code || loading} onClick={onSave} type="button">Zapisz</button>
        </div>
      </div>
      {error && <div className="message error">{error}</div>}
      {status && <div className="message success">{status}</div>}
      <pre className={code ? 'code-output' : 'code-output empty'}>
        <code>{code || 'Tutaj pojawi się gotowy kod.'}</code>
      </pre>
    </section>
  )
}

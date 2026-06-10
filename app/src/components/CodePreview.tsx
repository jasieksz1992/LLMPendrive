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

const saveDescriptions = {
  csharp: 'Zapis plików jako .cs',
  java: 'Zapis plików jako .java',
  react: 'Zapis plików jako .tsx'
}

export const CodePreview = ({ code, error, status, language, loading, onCopy, onSave }: Props) => {
  return (
    <section className="panel preview-panel code-window">
      <div className="preview-header">
        <div>
          <h2>Rezultat kodu</h2>
          <p>{saveDescriptions[language]}</p>
        </div>
        <div className="preview-actions">
          <button className="icon-button" aria-label="Kopiuj kod" title="Kopiuj kod" disabled={!code || loading} onClick={onCopy} type="button">⧉</button>
          <button disabled={!code || loading} onClick={onSave} type="button">Zapisz</button>
        </div>
      </div>
      {error && <div className="message error">{error}</div>}
      {status && <div className="message success">{status}</div>}
      <pre className={code ? 'code-output' : 'code-output empty'}>
        <code>{code || 'Wygenerowany kod pojawi się w tym oknie.'}</code>
      </pre>
    </section>
  )
}

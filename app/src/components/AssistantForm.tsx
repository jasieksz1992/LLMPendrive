import type { AssistantForm as AssistantFormValues, OutputType } from '../types/assistant'

const outputTypes: OutputType[] = [
  'Full class',
  'Function/method',
  'Refactor',
  'Unit test',
  'DTO/model',
  'Service',
  'Controller',
  'React component'
]

type Props = {
  form: AssistantFormValues
  loading: boolean
  onChange: (form: AssistantFormValues) => void
  onSubmit: () => void
}

const languageLabels = {
  csharp: 'C#',
  java: 'Java',
  react: 'React'
}

const applicationLabels = {
  desktop: 'Desktop',
  web: 'Web',
  mobile: 'Mobile',
  unknown: 'Auto'
}

export const AssistantForm = ({ form, loading, onChange, onSubmit }: Props) => {
  const updateField = <K extends keyof AssistantFormValues>(key: K, value: AssistantFormValues[K]) => {
    onChange({
      ...form,
      [key]: value
    })
  }

  return (
    <section className="panel form-panel">
      <div className="auto-detection-card" aria-live="polite">
        <span>Automatycznie wykryto</span>
        <strong>{applicationLabels[form.detectedApplicationType]} · {languageLabels[form.language]}</strong>
        <small>Desktop: Java/C# · Web: React · Mobile: Java</small>
      </div>
      <label>
        <span>Treść zadania</span>
        <textarea
          className="task-search"
          value={form.task}
          onChange={(event: { target: { value: string } }) => updateField('task', event.target.value)}
          placeholder="Wpisz krótko, co aplikacja ma zrobić..."
          rows={2}
        />
      </label>
      <label>
        <span>Kontekst projektu</span>
        <textarea
          value={form.context}
          onChange={(event: { target: { value: string } }) => updateField('context', event.target.value)}
          placeholder="Framework, architektura, nazewnictwo, zależności lub ograniczenia"
          rows={3}
        />
      </label>
      <label>
        <span>Istniejący kod</span>
        <textarea
          value={form.existingCode}
          onChange={(event: { target: { value: string } }) => updateField('existingCode', event.target.value)}
          placeholder="Wklej istniejący kod, gdy chcesz refaktor, rozszerzenie lub testy"
          rows={5}
        />
      </label>
      <label>
        <span>Typ wyniku</span>
        <select value={form.outputType} onChange={(event: { target: { value: string } }) => updateField('outputType', event.target.value as OutputType)}>
          {outputTypes.map((outputType) => (
            <option key={outputType} value={outputType}>{outputType}</option>
          ))}
        </select>
      </label>
      <button className="generate-button" disabled={loading || !form.task.trim()} onClick={onSubmit} type="button">
        {loading ? 'Generowanie...' : 'Generuj kod'}
      </button>
    </section>
  )
}

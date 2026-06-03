import type { AssistantForm as AssistantFormValues, LanguageMode, OutputType } from '../types/assistant'

const outputTypes: OutputType[] = [
  'Full class',
  'Function/method',
  'Refactor',
  'Unit test',
  'DTO/model',
  'Service',
  'Controller'
]

type Props = {
  form: AssistantFormValues
  loading: boolean
  onChange: (form: AssistantFormValues) => void
  onSubmit: () => void
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
      <div className="mode-switch" aria-label="Language mode">
        {(['csharp', 'java'] as LanguageMode[]).map((language) => (
          <button
            className={form.language === language ? 'mode-button active' : 'mode-button'}
            key={language}
            onClick={() => updateField('language', language)}
            type="button"
          >
            {language === 'csharp' ? 'C# generator' : 'Java generator'}
          </button>
        ))}
      </div>
      <label>
        <span>Task description</span>
        <textarea
          value={form.task}
          onChange={(event: { target: { value: string } }) => updateField('task', event.target.value)}
          placeholder="Describe what code you want generated"
          rows={5}
        />
      </label>
      <label>
        <span>Project context</span>
        <textarea
          value={form.context}
          onChange={(event: { target: { value: string } }) => updateField('context', event.target.value)}
          placeholder="Framework, architecture, naming rules, dependencies, or constraints"
          rows={4}
        />
      </label>
      <label>
        <span>Existing code</span>
        <textarea
          value={form.existingCode}
          onChange={(event: { target: { value: string } }) => updateField('existingCode', event.target.value)}
          placeholder="Paste existing code when refactoring, extending, or testing"
          rows={8}
        />
      </label>
      <label>
        <span>Output type</span>
        <select value={form.outputType} onChange={(event: { target: { value: string } }) => updateField('outputType', event.target.value as OutputType)}>
          {outputTypes.map((outputType) => (
            <option key={outputType} value={outputType}>{outputType}</option>
          ))}
        </select>
      </label>
      <button className="generate-button" disabled={loading || !form.task.trim()} onClick={onSubmit} type="button">
        {loading ? 'Generating...' : 'Generate code'}
      </button>
    </section>
  )
}

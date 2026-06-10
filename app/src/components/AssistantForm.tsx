import type { AssistantForm as AssistantFormValues } from '../types/assistant'

type Props = {
  form: AssistantFormValues
  loading: boolean
  onChange: (form: AssistantFormValues) => void
  onSubmit: () => void
}

export const AssistantForm = ({ form, loading, onChange, onSubmit }: Props) => {
  const updateTask = (value: string) => {
    onChange({
      ...form,
      task: value
    })
  }

  return (
    <form className="search-panel" onSubmit={(event: { preventDefault: () => void }) => {
      event.preventDefault()
      onSubmit()
    }}>
      <textarea
        aria-label="Opis zadania"
        className="task-search"
        value={form.task}
        onChange={(event: { target: { value: string } }) => updateTask(event.target.value)}
        placeholder="Opisz, co chcesz zrobić, np. program do listy produktów z ceną i stanem magazynu..."
        rows={2}
      />
      <button className="generate-button" disabled={loading || !form.task.trim()} type="submit">
        {loading ? 'Szukam rozwiązania...' : 'Szukaj'}
      </button>
    </form>
  )
}

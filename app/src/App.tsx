import { useState } from 'react'
import { AssistantForm } from './components/AssistantForm'
import { CodePreview } from './components/CodePreview'
import { generateCode } from './lib/llmClient'
import { buildPrompt } from './lib/promptBuilder'
import { saveGeneratedCode } from './lib/saveClient'
import type { AssistantForm as AssistantFormValues } from './types/assistant'
import './styles.css'

const initialForm: AssistantFormValues = {
  language: 'csharp',
  task: '',
  context: '',
  existingCode: '',
  outputType: 'Full class'
}

export const App = () => {
  const [form, setForm] = useState(initialForm)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setStatus('')

    try {
      const prompt = buildPrompt(form)
      const result = await generateCode(prompt)
      setCode(result)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    setError('')
    setStatus('')

    try {
      await navigator.clipboard.writeText(code)
      setStatus('Copied to clipboard')
    } catch {
      setError('Clipboard access failed. Select the generated code and copy it manually.')
    }
  }

  const handleSave = async () => {
    setError('')
    setStatus('')

    try {
      const result = await saveGeneratedCode(form.language, code)
      setStatus(`Saved to ${result.path}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Save failed')
    }
  }

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">USB portable offline assistant</p>
          <h1>Portable Code Assistant</h1>
          <p>Generate C# and Java code locally with llama.cpp and a GGUF model.</p>
        </div>
        <div className="offline-badge">Offline localhost only</div>
      </header>
      <div className="layout">
        <AssistantForm form={form} loading={loading} onChange={setForm} onSubmit={handleGenerate} />
        <CodePreview code={code} error={error} status={status} language={form.language} loading={loading} onCopy={handleCopy} onSave={handleSave} />
      </div>
    </main>
  )
}

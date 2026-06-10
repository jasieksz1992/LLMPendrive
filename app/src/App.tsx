import { useEffect, useState } from 'react'
import { AssistantForm } from './components/AssistantForm'
import { CodePreview } from './components/CodePreview'
import { ExplanationAccordion } from './components/ExplanationAccordion'
import { generateCode } from './lib/llmClient'
import { buildPrompt, parseGeneratedResult } from './lib/promptBuilder'
import { saveGeneratedCode } from './lib/saveClient'
import { detectTaskTarget } from './lib/taskDetection'
import type { AssistantForm as AssistantFormValues } from './types/assistant'
import './styles.css'

const initialForm: AssistantFormValues = {
  language: 'csharp',
  detectedApplicationType: 'unknown',
  task: '',
  context: '',
  existingCode: '',
  outputType: 'Full class'
}

export const App = () => {
  const [form, setForm] = useState(initialForm)
  const [code, setCode] = useState('')
  const [explanation, setExplanation] = useState<string[]>([])
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const detected = detectTaskTarget(form.task, form.context)

    if (detected.language !== form.language || detected.applicationType !== form.detectedApplicationType) {
      setForm((current) => ({
        ...current,
        language: detected.language,
        detectedApplicationType: detected.applicationType,
        outputType: detected.language === 'react' && current.outputType === 'Full class' ? 'React component' : current.outputType
      }))
    }
  }, [form.context, form.detectedApplicationType, form.language, form.task])

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setStatus('')
    setExplanation([])

    try {
      const prompt = buildPrompt(form)
      const result = await generateCode(prompt)
      const parsedResult = parseGeneratedResult(result)
      setCode(parsedResult.code)
      setExplanation(parsedResult.explanation)
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
      setStatus('Skopiowano do schowka')
    } catch {
      setError('Dostęp do schowka nie powiódł się. Zaznacz wygenerowany kod i skopiuj ręcznie.')
    }
  }

  const handleSave = async () => {
    setError('')
    setStatus('')

    try {
      const result = await saveGeneratedCode(form.language, code)
      setStatus(`Zapisano do ${result.path}`)
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
          <p>Opisz zadanie, a aplikacja sama dobierze C#, Javę albo React do typu projektu.</p>
        </div>
        <div className="offline-badge">Offline localhost only</div>
      </header>
      <div className="layout">
        <AssistantForm form={form} loading={loading} onChange={setForm} onSubmit={handleGenerate} />
        <div className="result-stack">
          <CodePreview code={code} error={error} status={status} language={form.language} loading={loading} onCopy={handleCopy} onSave={handleSave} />
          <ExplanationAccordion explanation={explanation} loading={loading} />
        </div>
      </div>
    </main>
  )
}

import { useCallback, useRef, useState } from 'react'
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

const withDetectedTarget = (form: AssistantFormValues): AssistantFormValues => {
  const detected = detectTaskTarget(form.task, form.context)

  return {
    ...form,
    language: detected.language,
    detectedApplicationType: detected.applicationType,
    outputType: detected.language === 'react' && form.outputType === 'Full class' ? 'React component' : form.outputType
  }
}

export const App = () => {
  const [form, setForm] = useState(initialForm)
  const [code, setCode] = useState('')
  const [explanation, setExplanation] = useState<string[]>([])
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const generationInProgress = useRef(false)

  const handleFormChange = useCallback((nextForm: AssistantFormValues) => {
    setForm(withDetectedTarget(nextForm))
  }, [])

  const handleGenerate = useCallback(async () => {
    if (generationInProgress.current) {
      return
    }

    generationInProgress.current = true
    setLoading(true)
    setError('')
    setStatus('')
    setCode('')
    setExplanation([])

    try {
      const promptForm = withDetectedTarget(form)
      const prompt = buildPrompt(promptForm)
      const result = await generateCode(prompt)
      const parsedResult = parseGeneratedResult(result)
      setForm(promptForm)
      setCode(parsedResult.code)
      setExplanation(parsedResult.explanation)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Generation failed')
    } finally {
      generationInProgress.current = false
      setLoading(false)
    }
  }, [form])

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
        <AssistantForm form={form} loading={loading} onChange={handleFormChange} onSubmit={handleGenerate} />
        <div className="result-stack">
          <CodePreview code={code} error={error} status={status} language={form.language} loading={loading} onCopy={handleCopy} onSave={handleSave} />
          <ExplanationAccordion explanation={explanation} loading={loading} />
        </div>
      </div>
    </main>
  )
}

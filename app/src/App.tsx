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
  task: ''
}

const withDetectedTarget = (form: AssistantFormValues): AssistantFormValues => {
  const detected = detectTaskTarget(form.task)

  return {
    ...form,
    language: detected.language,
    detectedApplicationType: detected.applicationType
  }
}

export const App = () => {
  const [form, setForm] = useState(initialForm)
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
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
    setDescription('')
    setExplanation([])

    try {
      const promptForm = withDetectedTarget(form)
      const prompt = buildPrompt(promptForm)
      const result = await generateCode(prompt)
      const parsedResult = parseGeneratedResult(result)
      setForm(promptForm)
      setCode(parsedResult.code)
      setDescription(parsedResult.description)
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
      <AssistantForm form={form} loading={loading} onChange={handleFormChange} onSubmit={handleGenerate} />
      <div className="layout">
        <ExplanationAccordion description={description} explanation={explanation} loading={loading} />
        <CodePreview code={code} error={error} status={status} loading={loading} onCopy={handleCopy} onSave={handleSave} />
      </div>
    </main>
  )
}

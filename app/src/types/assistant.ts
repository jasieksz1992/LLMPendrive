export type LanguageMode = 'csharp' | 'java' | 'react'

export type ApplicationType = 'desktop' | 'web' | 'mobile' | 'unknown'

export type AssistantForm = {
  language: LanguageMode
  detectedApplicationType: ApplicationType
  task: string
}

export type GeneratedResult = {
  code: string
  description: string
  explanation: string[]
}

export type SaveRequest = {
  language: LanguageMode
  code: string
}

export type SaveResponse = {
  ok: boolean
  fileName?: string
  path?: string
  error?: string
}

export type LlmCompletionResponse = {
  content?: string
  response?: string
  completion?: string
  choices?: Array<{
    text?: string
    message?: {
      content?: string
    }
  }>
}

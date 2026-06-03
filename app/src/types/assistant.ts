export type LanguageMode = 'csharp' | 'java'

export type OutputType = 'Full class' | 'Function/method' | 'Refactor' | 'Unit test' | 'DTO/model' | 'Service' | 'Controller'

export type AssistantForm = {
  language: LanguageMode
  task: string
  context: string
  existingCode: string
  outputType: OutputType
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

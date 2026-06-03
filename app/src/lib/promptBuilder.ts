import type { AssistantForm } from '../types/assistant'

const languageNames = {
  csharp: 'C#',
  java: 'Java'
}

export const buildPrompt = (form: AssistantForm) => {
  const language = languageNames[form.language]
  const task = form.task.trim()
  const context = form.context.trim()
  const existingCode = form.existingCode.trim()

  return [
    `You are an offline ${language} code assistant running locally from a USB drive.`,
    `Language mode: ${language}`,
    `Output type: ${form.outputType}`,
    'Return code only unless the task explicitly asks for an explanation.',
    'Generate stable, simple, production-ready code.',
    'Do not include Markdown fences unless the user explicitly requests them.',
    `Task description:\n${task || 'No task description provided'}`,
    `Project context:\n${context || 'No project context provided'}`,
    `Existing code:\n${existingCode || 'No existing code provided'}`
  ].join('\n\n')
}

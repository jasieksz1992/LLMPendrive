import type { AssistantForm, GeneratedResult } from '../types/assistant'

const languageNames = {
  csharp: 'C#',
  java: 'Java',
  react: 'React with TypeScript'
}

const applicationNames = {
  desktop: 'desktop application',
  web: 'web application',
  mobile: 'mobile application',
  unknown: 'unspecified application type'
}

const section = (content: string, start: string, end: string) => {
  const startIndex = content.indexOf(start)
  const endIndex = content.indexOf(end)

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return ''
  }

  return content.slice(startIndex + start.length, endIndex).trim()
}

export const parseGeneratedResult = (content: string): GeneratedResult => {
  const code = section(content, '---CODE_START---', '---CODE_END---') || content.trim()
  const explanationContent = section(content, '---EXPLANATION_START---', '---EXPLANATION_END---')
  const explanation = explanationContent
    .split('\n')
    .map((line) => line.replace(/^\s*(?:[-*]|\d+[.)])\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 30)

  return {
    code,
    explanation
  }
}

export const buildPrompt = (form: AssistantForm) => {
  const language = languageNames[form.language]
  const applicationType = applicationNames[form.detectedApplicationType]
  const task = form.task.trim()
  const context = form.context.trim()
  const existingCode = form.existingCode.trim()

  return [
    `You are an offline ${language} code assistant running locally from a USB drive.`,
    `Detected target: ${applicationType}.`,
    `Language mode selected automatically from the task: ${language}.`,
    `Output type: ${form.outputType}`,
    'Generate stable, simple, production-ready code.',
    'For desktop applications use Java or C# according to the selected language; for web applications use React; for mobile applications use Java.',
    'Return the response in exactly this format:',
    '---CODE_START---',
    'code only, without Markdown fences',
    '---CODE_END---',
    '---EXPLANATION_START---',
    'A concise numbered list in Polish with no more than 30 points explaining step by step how the solution was built and what the important parts do.',
    '---EXPLANATION_END---',
    `Task description:\n${task || 'No task description provided'}`,
    `Project context:\n${context || 'No project context provided'}`,
    `Existing code:\n${existingCode || 'No existing code provided'}`
  ].join('\n\n')
}

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

const codeStartMarker = '---CODE_START---'
const codeEndMarker = '---CODE_END---'
const explanationStartMarker = '---EXPLANATION_START---'
const explanationEndMarker = '---EXPLANATION_END---'

const explanationHeadingPattern = /^\s*(?:#{1,6}\s*)?(?:explanation|wyjaśnienie|wyjasnienie|tłumaczenie|tlumaczenie|opis|jak powstało rozwiązanie|jak powstalo rozwiazanie)\s*:?\s*$/imu
const codeHeadingPattern = /^\s*(?:#{1,6}\s*)?(?:code|kod|rozwiązanie|rozwiazanie)\s*:?\s*$/imu
const fencedBlockPattern = /```(?:[\w#+.-]+)?\s*\n([\s\S]*?)```/m

const normalizeNewlines = (content: string) => content.replace(/\r\n?/g, '\n').trim()

const findMarker = (content: string, marker: string, fromIndex = 0) => content.toLocaleLowerCase().indexOf(marker.toLocaleLowerCase(), fromIndex)

const section = (content: string, start: string, end: string) => {
  const startIndex = findMarker(content, start)

  if (startIndex === -1) {
    return ''
  }

  const contentStart = startIndex + start.length
  const endIndex = findMarker(content, end, contentStart)

  if (endIndex === -1 || endIndex <= contentStart) {
    return ''
  }

  return content.slice(contentStart, endIndex).trim()
}

const stripCodeFence = (content: string) => {
  const trimmed = content.trim()
  const fencedMatch = trimmed.match(/^```(?:[\w#+.-]+)?\s*\n([\s\S]*?)```$/m)

  return fencedMatch?.[1]?.trim() || trimmed
}

const removeFencedBlocks = (content: string) => content.replace(/```[\s\S]*?```/g, '').trim()

const splitAtHeading = (content: string, headingPattern: RegExp) => {
  const match = headingPattern.exec(content)

  if (!match || match.index === undefined) {
    return null
  }

  return {
    before: content.slice(0, match.index).trim(),
    after: content.slice(match.index + match[0].length).trim()
  }
}

const extractFallbackCode = (content: string) => {
  const fencedMatch = content.match(fencedBlockPattern)

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim()
  }

  const splitByExplanation = splitAtHeading(content, explanationHeadingPattern)

  if (splitByExplanation?.before) {
    return stripCodeFence(splitByExplanation.before)
  }

  const splitByCode = splitAtHeading(content, codeHeadingPattern)

  if (splitByCode?.after) {
    const codeBeforeExplanation = splitAtHeading(splitByCode.after, explanationHeadingPattern)
    return stripCodeFence(codeBeforeExplanation?.before || splitByCode.after)
  }

  return stripCodeFence(content)
}

const extractFallbackExplanation = (content: string) => {
  const withoutCodeBlocks = removeFencedBlocks(content)
  const splitByExplanation = splitAtHeading(withoutCodeBlocks, explanationHeadingPattern)

  if (splitByExplanation?.after) {
    return splitByExplanation.after
  }

  return ''
}

const parseExplanation = (content: string) => content
  .split('\n')
  .map((line) => line.replace(/^\s*(?:[-*]|\d+[.)])\s*/, '').trim())
  .map((line) => line.replace(/^(?:explanation|wyjaśnienie|wyjasnienie|tłumaczenie|tlumaczenie)\s*:?\s*/i, '').trim())
  .filter(Boolean)
  .slice(0, 30)

export const parseGeneratedResult = (rawContent: string): GeneratedResult => {
  const content = normalizeNewlines(rawContent)
  const markedCode = section(content, codeStartMarker, codeEndMarker)
  const markedExplanation = section(content, explanationStartMarker, explanationEndMarker)
  const code = markedCode ? stripCodeFence(markedCode) : extractFallbackCode(content)
  const explanationContent = markedExplanation || extractFallbackExplanation(content)

  return {
    code,
    explanation: parseExplanation(explanationContent)
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
    'Separate the answer into two strict sections: code and explanation.',
    'The code section must contain only compilable source code. Do not put task descriptions, deployment notes, screenshots, packaging instructions, Markdown, or prose inside the code section.',
    'The explanation section must be in Polish and contain only concise numbered explanation points. Put all task interpretation and implementation notes there.',
    'Return the response in exactly this format and do not add text before or after it:',
    codeStartMarker,
    'code only, without Markdown fences',
    codeEndMarker,
    explanationStartMarker,
    '1. Pierwszy punkt wyjaśnienia po polsku.',
    '2. Kolejny punkt wyjaśnienia po polsku.',
    explanationEndMarker,
    `Task description:\n${task || 'No task description provided'}`,
    `Project context:\n${context || 'No project context provided'}`,
    `Existing code:\n${existingCode || 'No existing code provided'}`
  ].join('\n\n')
}

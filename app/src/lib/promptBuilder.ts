import type { AssistantForm, GeneratedResult, LanguageMode } from '../types/assistant'

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

const descriptionStartMarker = '---DESCRIPTION_START---'
const descriptionEndMarker = '---DESCRIPTION_END---'
const codeStartMarker = '---CODE_START---'
const codeEndMarker = '---CODE_END---'
const explanationStartMarker = '---EXPLANATION_START---'
const explanationEndMarker = '---EXPLANATION_END---'

const descriptionHeadingPattern = /^\s*(?:#{1,6}\s*)?(?:description|opis|co robi program|co robi aplikacja)\s*:?\s*$/imu
const explanationHeadingPattern = /^\s*(?:#{1,6}\s*)?(?:steps|kroki|explanation|wyjaśnienie|wyjasnienie|tłumaczenie|tlumaczenie|jak powstało rozwiązanie|jak powstalo rozwiazanie|kroki rozwiązania|kroki rozwiazania)\s*:?\s*$/imu
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

const firstParagraph = (content: string) => content
  .split('\n')
  .map((line) => line.replace(/^\s*(?:[-*]|\d+[.)])\s*/, '').trim())
  .find(Boolean) || ''

const extractFallbackDescription = (content: string) => {
  const withoutCodeBlocks = removeFencedBlocks(content)
  const splitByDescription = splitAtHeading(withoutCodeBlocks, descriptionHeadingPattern)

  if (splitByDescription?.after) {
    const descriptionBeforeCode = splitAtHeading(splitByDescription.after, codeHeadingPattern)
    const descriptionBeforeExplanation = splitAtHeading(descriptionBeforeCode?.before || splitByDescription.after, explanationHeadingPattern)
    return firstParagraph(descriptionBeforeExplanation?.before || descriptionBeforeCode?.before || splitByDescription.after)
  }

  return ''
}

const extractFallbackCode = (content: string) => {
  const fencedMatch = content.match(fencedBlockPattern)

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim()
  }

  const splitByCode = splitAtHeading(content, codeHeadingPattern)

  if (splitByCode?.after) {
    const codeBeforeExplanation = splitAtHeading(splitByCode.after, explanationHeadingPattern)
    const codeBeforeDescription = splitAtHeading(codeBeforeExplanation?.before || splitByCode.after, descriptionHeadingPattern)
    return stripCodeFence(codeBeforeDescription?.before || codeBeforeExplanation?.before || splitByCode.after)
  }

  const splitByExplanation = splitAtHeading(content, explanationHeadingPattern)

  if (splitByExplanation?.before) {
    return stripCodeFence(splitByExplanation.before)
  }

  return ''
}

const extractFallbackExplanation = (content: string) => {
  const withoutCodeBlocks = removeFencedBlocks(content)
  const splitByExplanation = splitAtHeading(withoutCodeBlocks, explanationHeadingPattern)

  if (splitByExplanation?.after) {
    return splitByExplanation.after
  }

  return ''
}

const normalizeExplanationKey = (line: string) => line
  .toLocaleLowerCase('pl-PL')
  .replace(/[`*_~]/g, '')
  .replace(/\s+/g, ' ')
  .replace(/[.!?;:]+$/g, '')
  .trim()

const parseExplanation = (content: string) => {
  const seen = new Set<string>()
  const points: string[] = []

  for (const rawLine of content.split('\n')) {
    const line = rawLine
      .replace(/^\s*(?:[-*]|\d+[.)])\s*/, '')
      .replace(/^(?:steps|kroki|explanation|wyjaśnienie|wyjasnienie|tłumaczenie|tlumaczenie)\s*:?\s*/i, '')
      .trim()

    if (!line || findMarker(line, '---CODE_') !== -1 || findMarker(line, '---EXPLANATION_') !== -1 || findMarker(line, '---DESCRIPTION_') !== -1) {
      continue
    }

    const key = normalizeExplanationKey(line)

    if (!key || seen.has(key)) {
      continue
    }

    seen.add(key)
    points.push(line)

    if (points.length === 10) {
      break
    }
  }

  return points
}

export const parseGeneratedResult = (rawContent: string): GeneratedResult => {
  const content = normalizeNewlines(rawContent)
  const markedDescription = section(content, descriptionStartMarker, descriptionEndMarker)
  const markedCode = section(content, codeStartMarker, codeEndMarker)
  const markedExplanation = section(content, explanationStartMarker, explanationEndMarker)
  const code = markedCode ? stripCodeFence(markedCode) : extractFallbackCode(content)
  const explanationContent = markedExplanation || extractFallbackExplanation(content)

  return {
    code,
    description: firstParagraph(markedDescription) || extractFallbackDescription(content),
    explanation: parseExplanation(explanationContent)
  }
}

const fallbackLanguageNames: Record<LanguageMode, string> = {
  csharp: 'C#',
  java: 'Java',
  react: 'React'
}

const summarizeTask = (task: string) => task
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/[.!?;:]+$/g, '')

const buildFallbackDescription = (form: AssistantForm) => {
  const task = summarizeTask(form.task)

  if (!task) {
    return `Wygenerowany kod w języku ${fallbackLanguageNames[form.language]} tworzy proste rozwiązanie zgodne z wpisanym poleceniem.`
  }

  return `Wygenerowany kod w języku ${fallbackLanguageNames[form.language]} realizuje wpisane zadanie.`
}

const buildFallbackExplanation = (form: AssistantForm) => {
  const language = fallbackLanguageNames[form.language]

  return [
    `Najpierw kod tworzy podstawę rozwiązania w języku ${language}, żeby program miał jasne miejsce startu.`,
    'Następnie przygotowuje najważniejsze dane, czyli informacje potrzebne do wykonania zadania.',
    'Potem program wykonuje główne czynności w uporządkowanej kolejności, aby łatwo było śledzić działanie.',
    'Kolejny fragment sprawdza albo przetwarza dane tak, żeby wynik pasował do celu zadania.',
    'Na końcu kod pokazuje wynik działania w miejscu, w którym użytkownik może go od razu zobaczyć.',
    'Jeśli chcesz coś zmienić, zacznij od prostych wartości i nazw, a dopiero później zmieniaj większe części programu.'
  ]
}

const codeLanguageTokens: Record<LanguageMode, RegExp[]> = {
  csharp: [/\busing\b/, /\bnamespace\b/, /\bclass\b/, /\bstatic\b/, /\bvoid\b/, /\bConsole\./, /[{};]/],
  java: [/\bimport\b/, /\bpackage\b/, /\bpublic\s+class\b/, /\bstatic\s+void\s+main\b/, /\bSystem\.out\./, /[{};]/],
  react: [/\bimport\b/, /\bexport\b/, /\bconst\b/, /\bfunction\b/, /\breturn\b/, /<[A-Za-z][^>]*>/, /[{};]/]
}

const polishDescriptionPattern = /\b(?:zadanie|opis|napisz|utwórz|utworz|program ma|aplikacja ma|wygenerowany kod|kroki rozwiązania|kroki rozwiazania)\b/i

const isProbablyGeneratedCode = (code: string, language: LanguageMode, task: string) => {
  const trimmedCode = code.trim()
  const trimmedTask = summarizeTask(task).toLocaleLowerCase('pl-PL')

  if (!trimmedCode) {
    return false
  }

  if (trimmedTask && summarizeTask(trimmedCode).toLocaleLowerCase('pl-PL') === trimmedTask) {
    return false
  }

  const hasCodeToken = codeLanguageTokens[language].some((pattern) => pattern.test(trimmedCode))
  const shortPlainText = !trimmedCode.includes('\n') && trimmedCode.split(/\s+/).length > 8

  if (!hasCodeToken && (shortPlainText || polishDescriptionPattern.test(trimmedCode))) {
    return false
  }

  return hasCodeToken || trimmedCode.includes('\n')
}

export const completeGeneratedResult = (result: GeneratedResult, form: AssistantForm): GeneratedResult => ({
  code: isProbablyGeneratedCode(result.code, form.language, form.task) ? result.code : '',
  description: result.description || buildFallbackDescription(form),
  explanation: result.explanation.length > 0 ? result.explanation : buildFallbackExplanation(form)
})

export const buildPrompt = (form: AssistantForm) => {
  const language = languageNames[form.language]
  const applicationType = applicationNames[form.detectedApplicationType]
  const task = form.task.trim()
  return [
    `You are an offline ${language} code assistant running locally from a USB drive.`,
    `Detected target: ${applicationType}.`,
    `Language mode selected automatically from the task: ${language}.`,
    'Generate stable, simple, production-ready code.',
    'For desktop applications use Java or C# according to the selected language; for web applications use React; for mobile applications use Java.',
    'Return two strict sections only: code and explanation.',
    'Do not return a description section. Do not repeat or summarize the task description anywhere in the answer.',
    'The code section must contain only compilable source code. Do not put task descriptions, deployment notes, screenshots, packaging instructions, Markdown, comments that restate the task, or prose inside the code section.',
    'The explanation section must be in Polish and contain 6-10 numbered points. Write for a complete beginner, not for a programmer.',
    'Each explanation point must be concrete and detailed: say what happens, why it is needed, and what the user should notice. If you must use a technical word, immediately explain it in simple words.',
    'Use short, friendly sentences. Avoid unexplained jargon, vague phrases, and repeated points.',
    'Return the response in exactly this format and do not add text before or after it:',
    codeStartMarker,
    'compilable source code only, without Markdown fences or prose',
    codeEndMarker,
    explanationStartMarker,
    '1. Pierwszy dokładny krok po polsku, napisany prostym językiem dla laika.',
    '2. Następny dokładny krok po polsku, bez skrótów myślowych.',
    explanationEndMarker,
    `Task description for generation only, never display it as output:\n${task || 'No task description provided'}`
  ].join('\n\n')
}

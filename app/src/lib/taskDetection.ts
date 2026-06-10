import type { ApplicationType, LanguageMode } from '../types/assistant'

export type TaskDetectionResult = {
  applicationType: ApplicationType
  language: LanguageMode
  confidenceLabel: string
}

const containsAny = (value: string, keywords: string[]) => keywords.some((keyword) => value.includes(keyword))

export const detectTaskTarget = (task: string, context = ''): TaskDetectionResult => {
  const text = `${task} ${context}`.toLowerCase()

  if (containsAny(text, ['react', 'web', 'www', 'strona', 'aplikacja webowa', 'frontend', 'przeglądarka', 'browser', 'vite'])) {
    return {
      applicationType: 'web',
      language: 'react',
      confidenceLabel: 'Wykryto aplikację webową — generuję React.'
    }
  }

  if (containsAny(text, ['mobile', 'mobilna', 'android', 'telefon', 'smartfon', 'apk'])) {
    return {
      applicationType: 'mobile',
      language: 'java',
      confidenceLabel: 'Wykryto aplikację mobilną — generuję Java.'
    }
  }

  if (containsAny(text, ['c#', 'csharp', '.net', 'wpf', 'winforms', 'windows forms', 'maui'])) {
    return {
      applicationType: 'desktop',
      language: 'csharp',
      confidenceLabel: 'Wykryto aplikację desktopową — generuję C#.'
    }
  }

  if (containsAny(text, ['java', 'swing', 'javafx'])) {
    return {
      applicationType: 'desktop',
      language: 'java',
      confidenceLabel: 'Wykryto aplikację desktopową — generuję Java.'
    }
  }

  if (containsAny(text, ['desktop', 'desktopowa', 'okienkowa'])) {
    return {
      applicationType: 'desktop',
      language: 'csharp',
      confidenceLabel: 'Wykryto aplikację desktopową — domyślnie generuję C#.'
    }
  }

  return {
    applicationType: 'unknown',
    language: 'csharp',
    confidenceLabel: 'Nie wykryto typu aplikacji — domyślnie generuję C#.'
  }
}

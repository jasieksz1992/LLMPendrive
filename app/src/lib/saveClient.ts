import type { LanguageMode, SaveResponse } from '../types/assistant'

const saveUrl = 'http://127.0.0.1:5173/api/save'

export const saveGeneratedCode = async (language: LanguageMode, code: string) => {
  const response = await fetch(saveUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ language, code })
  })

  const data = await response.json() as SaveResponse

  if (!response.ok || !data.ok) {
    throw new Error(data.error || 'Unable to save generated code')
  }

  return data
}

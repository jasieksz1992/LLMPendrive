import type { LlmCompletionResponse } from '../types/assistant'

const llamaUrl = 'http://127.0.0.1:8080/completion'

const isLocalhostUrl = (url: string) => {
  const parsed = new URL(url)
  return parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost'
}

const getCompletionText = (data: LlmCompletionResponse) => {
  if (typeof data.content === 'string') {
    return data.content
  }

  if (typeof data.response === 'string') {
    return data.response
  }

  if (typeof data.completion === 'string') {
    return data.completion
  }

  const firstChoice = data.choices?.[0]

  if (typeof firstChoice?.text === 'string') {
    return firstChoice.text
  }

  if (typeof firstChoice?.message?.content === 'string') {
    return firstChoice.message.content
  }

  return ''
}

export const generateCode = async (prompt: string) => {
  if (!isLocalhostUrl(llamaUrl)) {
    throw new Error('Only localhost LLM requests are allowed')
  }

  let response: Response

  try {
    response = await fetch(llamaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        n_predict: 1024,
        temperature: 0.2,
        repeat_penalty: 1.15,
        repeat_last_n: 256,
        stop: ['</s>']
      })
    })
  } catch {
    throw new Error('The local LLM server is not running. Start it with scripts\\start-llm.bat or start.bat.')
  }

  if (!response.ok) {
    throw new Error(`The local LLM server returned HTTP ${response.status}`)
  }

  const data = await response.json() as LlmCompletionResponse
  const text = getCompletionText(data).trim()

  if (!text) {
    throw new Error('The local LLM server returned an empty response')
  }

  return text
}

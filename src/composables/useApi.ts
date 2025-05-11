import { ref } from 'vue'

type THTTPMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

export function useApi(baseURL = 'http://localhost:8000') {
  const data = ref<any>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const request = async (
    endpoint: string,
    method: THTTPMethod = 'GET',
    payload: Object = {},
  ): Promise<any> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${baseURL}${endpoint[0] === '/' ? endpoint : '/' + endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method === 'GET' ? undefined : JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const jsonData = await response.json()
      data.value = jsonData
      return jsonData
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return { data, isLoading, error, request }
}

import { useFetch } from '@vueuse/core'

import type { AnalysisResult } from '@/types/analysis_result'

export async function startAnalysis(task_id: number) {
  const { data, error, isFetching } = await useFetch<AnalysisResult>(`/api/analysis/start`)
    .post({ task_id })
    .json<AnalysisResult>()

  return { data, error, isFetching }
}

export async function getAnalysis(id: number) {
  const { data, error, isFetching } = await useFetch<AnalysisResult>(`/api/analysis/${id}`).json<AnalysisResult>()
  return { data, error, isFetching }
}

import { useFetch } from '@vueuse/core'

import type { CurveSet } from '@/types/curveSet'

type UploadCurveSetPayload = {
  task_id: number
  description?: string
  irf: number[]
  curves: Array<{
    time_axis: number[]
    intensity: number[]
  }>
}

export async function uploadCurveSetFromData(payload: UploadCurveSetPayload) {
  const { data, error, isFetching } = await useFetch<CurveSet>(`/api/curves/upload`)
    .post(payload)
    .json<CurveSet>()

  return { data, error, isFetching }
}

export type { UploadCurveSetPayload }

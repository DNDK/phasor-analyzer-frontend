import type { CurveSet } from './curveSet'

interface Task {
  id: number
  analysis_results_id?: number
  analysis_results: any
  processing_time?: number
  title: string
  curve_set?: CurveSet
}

export type { Task }

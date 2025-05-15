import type { CurveSet } from './curveSet'
import type { AnalysisResult } from './analysis_result'

interface Task {
  id: number
  analysis_results_id?: number
  analysis_results?: AnalysisResult
  processing_time?: number
  title: string
  curve_set?: CurveSet
  created_at: string
}

export type { Task }

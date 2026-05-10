import { apiGet, apiPost, ApiError } from './client'
import type { AnalysisResult } from '@/types/analysis_result'
import type { CurveSet } from '@/types/curveSet'

/** POST /analysis/start — run phasor analysis on an existing curve set */
export async function startAnalysis(curveSetId: number): Promise<AnalysisResult> {
  return apiPost<AnalysisResult>('/analysis/start', { curve_set_id: curveSetId })
}

/**
 * POST /analysis/process — create a curve set from raw uploaded data and
 * immediately run analysis on it. Returns both the curve set and the result.
 */
export interface ProcessPayload {
  title?: string
  description?: string
  curves: ProcessCurve[]
}

export interface ProcessCurve {
  time_axis: number[]
  raw: number[]
  irf: number[]
}

export interface ProcessResult {
  curve_set: CurveSet
  analysis_result: AnalysisResult
}

export async function processUserData(payload: ProcessPayload): Promise<ProcessResult> {
  return apiPost<ProcessResult>('/analysis/process', payload)
}

/** GET /analysis/:id — retrieve a previously stored analysis result by its own id */
export async function getAnalysis(id: number): Promise<AnalysisResult> {
  return apiGet<AnalysisResult>(`/analysis/${id}`)
}

/** GET /analysis/by-curve-set/:id — retrieve the latest analysis result for a curve set */
export async function getAnalysisByCurveSet(curveSetId: number): Promise<AnalysisResult | null> {
  try {
    return await apiGet<AnalysisResult>(`/analysis/by-curve-set/${curveSetId}`)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

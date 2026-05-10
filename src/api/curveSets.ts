import { apiDelete, apiGet, apiPatch, apiPost } from './client'
import type { CurveSet, CurveSetSummary } from '@/types/curveSet'

// ────────────────────────────────────────────────────────────────────────────
// Payload shapes matching the backend schemas
// ────────────────────────────────────────────────────────────────────────────

export interface UploadedCurve {
  time_axis: number[]
  intensity: number[]
}

export interface UploadCurveSetPayload {
  title?: string
  description?: string
  irf: number[]
  curves: UploadedCurve[]
}

export interface CurveSetPatch {
  title?: string
  description?: string
}

// ────────────────────────────────────────────────────────────────────────────
// Endpoints
// ────────────────────────────────────────────────────────────────────────────

/** GET /curve-sets — list all curve sets for the current user */
export async function listCurveSets(): Promise<CurveSetSummary[]> {
  return apiGet<CurveSetSummary[]>('/curve-sets')
}

/** GET /curve-sets/:id — fetch a single curve set with its curves */
export async function getCurveSet(id: number): Promise<CurveSet> {
  return apiGet<CurveSet>(`/curve-sets/${id}`)
}

/** POST /curve-sets/create — create an empty curve set */
export async function createCurveSet(): Promise<CurveSet> {
  return apiPost<CurveSet>('/curve-sets/create')
}

/** POST /curve-sets/upload — create a curve set from raw uploaded data */
export async function uploadCurveSet(payload: UploadCurveSetPayload): Promise<CurveSet> {
  return apiPost<CurveSet>('/curve-sets/upload', payload)
}

/** PATCH /curve-sets/:id — partially update a curve set */
export async function patchCurveSet(id: number, data: CurveSetPatch): Promise<CurveSet> {
  return apiPatch<CurveSet>(`/curve-sets/${id}`, data)
}

/** DELETE /curve-sets/:id — delete a curve set */
export async function deleteCurveSet(id: number): Promise<void> {
  return apiDelete(`/curve-sets/${id}`)
}

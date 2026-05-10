import type { Curve } from './curve'

type CurveSetStatus = 'pending' | 'running' | 'completed' | 'failed'

interface CurveSet {
  id: number
  title: string
  description: string | null
  status: CurveSetStatus
  processing_time: number | null
  created_at: string
  user_id: number
  curves: Curve[]
}

interface CurveSetSummary {
  id: number
  title: string
  description: string | null
  status: CurveSetStatus
  processing_time: number | null
  created_at: string
}

export type { CurveSet, CurveSetSummary, CurveSetStatus }

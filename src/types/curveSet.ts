import type { Curve } from './curve'

interface CurveSet {
  id: number
  curves: Curve[]
  description: string
  task_id: number
}

export type { CurveSet }

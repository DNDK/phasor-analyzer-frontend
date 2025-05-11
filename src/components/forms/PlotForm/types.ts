type TPointSet = {
  x: number[]
  y: number[]
}

type TDataSet = {
  original?: TPointSet
  convolved?: TPointSet
  noisy?: TPointSet
  metadata?: {
    color: string
    label: string
  }
}

interface CurveInputEmits {
  (e: 'trigger:curve-data', data: TDataSet): void
}

export type { TDataSet, TPointSet, CurveInputEmits }

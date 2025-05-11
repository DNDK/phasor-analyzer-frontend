type TPointSet = {
  x: number[]
  y: number[]
}

type TDataSet = {
  original?: TPointSet
  convolved?: TPointSet
  noisy?: TPointSet
}

export type { TDataSet, TPointSet }

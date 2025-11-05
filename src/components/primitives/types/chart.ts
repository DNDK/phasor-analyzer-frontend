type TChartCurve = {
  id: string | number
  time_axis: number[]
  noisy?: number[]
  convolved?: number[]
  raw_scaled?: number[]
  raw?: number[]
}

type TChartProps = {
  curves: TChartCurve[]
  xPrecision?: number
  yPrecision?: number
  legend?: boolean
}

export type {
    TChartCurve, TChartProps
}
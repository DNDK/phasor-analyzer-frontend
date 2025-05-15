interface Curve {
  id: number
  time_axis: number[]
  raw: number[]
  raw_scaled: number[]
  convolved: number[]
  noisy: number[]
  irf?: number[]
  irf_scaled?: number[]
}

export type { Curve }

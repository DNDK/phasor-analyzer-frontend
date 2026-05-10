interface Curve {
  id: number
  time_axis: number[]
  raw: number[] | null
  raw_scaled: number[] | null
  convolved: number[] | null
  noisy: number[] | null
  irf: number[] | null
  irf_scaled: number[] | null
}

export type { Curve }

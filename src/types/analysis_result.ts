interface AnalysisResult {
  id: number
  curve_set_id: number
  dw_real: number[]
  dw_imag: number[]
  coeff_v: number
  coeff_u: number
  tau1: number
  tau2: number
  a1_coeffs: number[]
  a2_coeffs: number[]
  omega: number
}

export type { AnalysisResult }

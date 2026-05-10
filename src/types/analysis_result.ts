interface AnalysisResult {
  id: number
  curve_set_id: number
  processing_time: number | null
  created_at: string
  dw_real: (number | null)[]
  dw_imag: (number | null)[]
  coeff_v: number | null
  coeff_u: number | null
  tau1: number | null
  tau2: number | null
  a1_coeffs: (number | null)[]
  a2_coeffs: (number | null)[]
  omega: number | null
}

export type { AnalysisResult }

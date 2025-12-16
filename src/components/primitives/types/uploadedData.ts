type TCurve = {
  name: string
  time: number[]
  intensity: number[]
  irf: number[]
}

type TUploadedData = {
  curves: TCurve[]
}

export { type TUploadedData, type TCurve }

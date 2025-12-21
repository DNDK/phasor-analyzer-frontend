type TCurve = {
  name: string
  time: number[]
  intensity: number[]
}

type TUploadedData = {
  curves: TCurve[]
  irf: number[]
}

export { type TUploadedData, type TCurve }

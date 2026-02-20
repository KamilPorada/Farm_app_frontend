export type Treatment = {
  id?: number
  farmerId: number
  pesticideId: number
  treatmentDate: string
  treatmentTime: string
  pesticideDose: number
  liquidVolume: number
  tunnelCount?: number | null
}

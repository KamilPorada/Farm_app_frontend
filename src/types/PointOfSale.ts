export type PointOfSale = {
    id: number
    farmerId: number
    name: string
    address: string
    type: 'Rynek hurtowy' | 'Skup' | 'Klient prywatny' | 'Inne'
    latitude: number
    longitude: number
    phone: string
    email: string
  }
  
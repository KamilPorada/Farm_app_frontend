export type TradeOfPepper = {
	id: number
	farmerId: number
	pointOfSaleId: number
	tradeDate: string
	pepperClass: 1 | 2 | 3
	pepperColor: 'Czerwona' | 'Żółta' | 'Pomarańczowa' | 'Zielona'
	tradePrice: number
	tradeWeight: number
	vatRate: number
}

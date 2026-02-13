export type CultivationCalendar = {
	id: number
	farmerId: number
	seasonYear: number

	prickingStartDate: string | null
	prickingEndDate: string | null

	plantingStartDate: string | null
	plantingEndDate: string | null

	harvestStartDate: string | null
	harvestEndDate: string | null
}

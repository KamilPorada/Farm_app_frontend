import type { CultivationCalendar } from '../../types/CultivationCalendar'

type Props = {
	item: CultivationCalendar | null
}

const daysBetween = (start: string, end: string) => {
	const s = new Date(start)
	const e = new Date(end)
	return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
}

export default function CultivationSeasonInsights({ item }: Props) {
	if (!item || !item.prickingStartDate) return null

	const {
		seasonYear,
		prickingStartDate,
		prickingEndDate,
		plantingStartDate,
		plantingEndDate,
		harvestStartDate,
		harvestEndDate,
	} = item

	const totalSeason = prickingStartDate && harvestEndDate ? daysBetween(prickingStartDate, harvestEndDate) : null

	const sections = [
		prickingEndDate && {
			label: 'Pikowanie',
			value: `${daysBetween(prickingStartDate!, prickingEndDate)} dni`,
		},
		plantingStartDate && {
			label: 'Wzrost w pikówce',
			value: `${daysBetween(prickingStartDate!, plantingStartDate)} dni`,
		},
		plantingEndDate && {
			label: 'Sadzenie',
			value: `${daysBetween(plantingStartDate!, plantingEndDate)} dni`,
		},
		harvestStartDate &&
			plantingStartDate && {
				label: 'Wzrost w tunelach',
				value: `${daysBetween(plantingStartDate!, harvestStartDate)} dni`,
			},
		harvestEndDate &&
			harvestStartDate && {
				label: 'Zbiory',
				value: `${daysBetween(harvestStartDate!, harvestEndDate)} dni`,
			},
	].filter(Boolean)

	return (
		<div className=''>
			<h2 className='text-xl font-semibold mb-5'>Sezon w liczbach</h2>
			{/* ETAPY */}
			<div className='mt-2'>
				{sections.map((section: any, i) => (
					<div key={i} className='flex justify-between items-center border-b border-gray-200 mb-3 pb-3'>
						<p className='text-gray-600'>{section.label}</p>
						<p className='font-semibold text-gray-800'>{section.value}</p>
					</div>
				))}
			</div>
		</div>
	)
}

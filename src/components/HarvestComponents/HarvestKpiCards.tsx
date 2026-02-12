import { useMemo } from 'react'
import type { Harvest } from '../../types/Harvest'
import type { VarietySeason } from '../../types/VarietySeason'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBoxesStacked, faPepperHot, faCalendarDays, faWeightHanging } from '@fortawesome/free-solid-svg-icons'
import { useFormatUtils } from '../../hooks/useFormatUtils'

type Props = {
	harvests: Harvest[]
	varieties: VarietySeason[]
	boxWeightKg: number
}

export default function HarvestKpiCards({ harvests, varieties, boxWeightKg }: Props) {
	const { formatNumber, convertWeight, getWeightSymbol } = useFormatUtils()
	const data = useMemo(() => {
		const totalBoxes = harvests.reduce((sum, h) => sum + Number(h.boxCount), 0)

		const totalWeight = totalBoxes * boxWeightKg

		const uniqueDays = new Set(harvests.map(h => h.harvestDate)).size

		const varietyMap: Record<number, number> = {}

		harvests.forEach(h => {
			varietyMap[h.varietySeasonId] = (varietyMap[h.varietySeasonId] || 0) + Number(h.boxCount)
		})

		const topVarietyId = Object.entries(varietyMap).sort((a, b) => b[1] - a[1])[0]?.[0]

		const topVariety = varieties.find(v => v.id === Number(topVarietyId))

		return {
			totalBoxes,
			totalWeight,
			uniqueDays,
			topVarietyName: topVariety?.name ?? '—',
		}
	}, [harvests, varieties, boxWeightKg])

	const cards = [
		{
			label: 'Suma skrzyń',
			value: data.totalBoxes,
			icon: faBoxesStacked,
			type: 'number',
		},
		{
			label: 'Najczęściej zbierana',
			value: data.topVarietyName,
			icon: faPepperHot,
			type: 'text',
		},
		{
			label: 'Liczba dni zbiorów',
			value: data.uniqueDays,
			icon: faCalendarDays,
			type: 'number',
		},
		{
			label: 'Szacowana masa',
			value: data.totalWeight,
			icon: faWeightHanging,
			type: 'weight',
		},
	] as const

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5'>
			{cards.map((card, i) => (
				<div
					key={i}
					className='
            group relative overflow-hidden
            rounded-xl
            bg-gradient-to-br from-white to-gray-50
            p-4
            shadow-sm hover:shadow-md
            transition-all duration-300
            hover:-translate-y-[2px]
          '>
					{/* zielony pasek */}
					<div className='absolute left-0 top-0 h-full w-1 bg-mainColor/60' />

					{/* ikona w tle */}
					<div
						className='
              absolute right-4 top-4
              text-4xl
              text-mainColor/20
              transition-colors duration-300
              group-hover:text-mainColor/40
            '>
						<FontAwesomeIcon icon={card.icon} />
					</div>

					{/* label */}
					<p className='text-[11px] uppercase tracking-wide text-gray-500 mb-2'>{card.label}</p>

					{/* value */}
					<p className='text-2xl font-semibold text-gray-900 leading-tight tabular-nums'>
						{card.type === 'text' && card.value}

						{card.type === 'number' && formatNumber(card.value as number)}

						{card.type === 'weight' && (
							<>
								{formatNumber(convertWeight(card.value as number))} {getWeightSymbol()}
							</>
						)}
					</p>
				</div>
			))}
		</div>
	)
}

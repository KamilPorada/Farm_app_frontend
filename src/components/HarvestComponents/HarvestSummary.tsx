import { useMemo } from 'react'
import type { Harvest } from '../../types/Harvest'
import type { VarietySeason } from '../../types/VarietySeason'
import { useFormatUtils } from '../../hooks/useFormatUtils'

type Props = {
	harvests: Harvest[]
	varieties: VarietySeason[]
	boxWeightKg: number
}

export default function HarvestSummary({ harvests, varieties, boxWeightKg }: Props) {
	const { formatNumber, convertWeight, getWeightSymbol } = useFormatUtils()
	function formatBoxes(value: number) {
		const abs = Math.abs(value)

		if (abs === 1) return `${value} skrzynia`

		const lastDigit = abs % 10
		const lastTwo = abs % 100

		if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) {
			return `${value} skrzynie`
		}

		return `${value} skrzyń`
	}

	const summary = useMemo(() => {
		const calculated = varieties.map(v => {
			const varietyHarvests = harvests.filter(h => h.varietySeasonId === v.id)

			const totalBoxes = varietyHarvests.reduce((sum, h) => sum + Number(h.boxCount), 0)

			const totalWeight = totalBoxes * boxWeightKg

			const avgPerTunnel = Number(v.tunnelCount) > 0 ? totalWeight / Number(v.tunnelCount) : 0

			return {
				...v,
				totalBoxes,
				totalWeight,
				avgPerTunnel: Math.round(avgPerTunnel),
			}
		})

		return calculated.sort((a, b) => b.totalBoxes - a.totalBoxes)
	}, [harvests, varieties, boxWeightKg])

	return (
		<div className='flex flex-col gap-3 w-full md:w-1/2'>
			{summary.map(item => (
				<div
					key={item.id}
					className='
          relative overflow-hidden
          rounded-xl
          border border-gray-200
          bg-gradient-to-br from-white to-gray-50
          px-4 py-3
          shadow-sm hover:shadow-md
          transition
        '>
					<div className='absolute left-0 top-0 h-full w-1 bg-mainColor/60' />

					{/* HEADER */}
					<div className='flex items-center justify-between mb-1'>
						<h3 className='text-sm font-semibold text-gray-900'>{item.name}</h3>

						<span className='text-[10px] px-2 py-0.5 rounded-full bg-mainColor text-white font-semibold'>
							{item.tunnelCount} tuneli
						</span>
					</div>

					{/* GŁÓWNA LICZBA */}
					<div className='text-lg font-bold tabular-nums text-gray-900 mb-2'>{formatBoxes(item.totalBoxes)}</div>

					{/* KPI */}
					<div className='grid grid-cols-2 text-xs gap-y-1 border-t border-gray-100 pt-2'>
						<div className='text-gray-500'>Łączna waga</div>
						<div className='text-right font-medium tabular-nums'>{formatNumber(convertWeight(item.totalWeight))} {getWeightSymbol()}</div>

						<div className='text-gray-500'>Śr. / tunel</div>
						<div className='text-right font-semibold tabular-nums'>{formatNumber(convertWeight(item.avgPerTunnel))} {getWeightSymbol()}</div>
					</div>
				</div>
			))}
		</div>
	)
}

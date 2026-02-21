import { useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWeightHanging, faCoins, faListOl } from '@fortawesome/free-solid-svg-icons'
import type { Fertigation } from '../../types/Fertigation'
import type { Fertilizer } from '../../types/Fertilizer'
import { useCountUp } from '../../hooks/useCountUp'
import { useFormatUtils } from '../../hooks/useFormatUtils'

type Props = {
	fertigations: Fertigation[]
	fertilizers: Fertilizer[]
}

export default function FertigationSummary({ fertigations, fertilizers }: Props) {
	const { getCurrencySymbol, formatNumber } = useFormatUtils()

	const fertilizerMap = useMemo(() => {
		const map: Record<number, Fertilizer> = {}
		fertilizers.forEach(f => (map[f.id] = f))
		return map
	}, [fertilizers])

	const stats = useMemo(() => {
		let totalUsed = 0
		let totalCost = 0

		fertigations.forEach(f => {
			const fertilizer = fertilizerMap[f.fertilizerId]
			if (!fertilizer) return

			const used = f.dose * f.tunnelCount
			const cost = fertilizer.price ? used * fertilizer.price : 0

			totalUsed += used
			totalCost += cost
		})

		return {
			totalUsed: Math.round(totalUsed),
			totalCost: Math.round(totalCost),
			totalCount: fertigations.length,
		}
	}, [fertigations, fertilizerMap])

	const animatedUsed = useCountUp(stats.totalUsed)
	const animatedCost = useCountUp(stats.totalCost)
	const animatedCount = useCountUp(stats.totalCount)

	return (
		<div className='my-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
			<SummaryCard label='Łączne zużycie nawozów' value={`${formatNumber(animatedUsed)} kg`} icon={faWeightHanging} />

			<SummaryCard
				label='Łączny koszt nawozów'
				value={`${formatNumber(animatedCost)} ${getCurrencySymbol()}`}
				icon={faCoins}
			/>

			<SummaryCard label='Liczba fertygacji' value={Math.round(animatedCount).toString()} icon={faListOl} />
		</div>
	)
}

/* ================= CARD ================= */

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: any }) {
	return (
		<div
			className='
			group relative overflow-hidden
			rounded-xl
			bg-gradient-to-br from-white to-gray-50
			p-4
			shadow-sm hover:shadow-md
			transition-all duration-300
			hover:-translate-y-[2px]
		'>
			<div className='absolute left-0 top-0 h-full w-1 bg-mainColor/60' />

			<div
				className='
				absolute right-3 top-3
				text-4xl
				text-mainColor/20
				transition-colors duration-300
				group-hover:text-mainColor
			'>
				<FontAwesomeIcon icon={icon} />
			</div>

			<p className='text-[11px] uppercase tracking-wide text-gray-500 mb-2'>{label}</p>

			<p className='text-2xl font-semibold text-gray-900 leading-tight'>{value}</p>
		</div>
	)
}

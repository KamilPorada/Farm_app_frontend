import { useMemo } from 'react'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faSackDollar,
	faArrowUp,
	faArrowDown,
	faMinus,
	faTents,
	faWeightHanging,
} from '@fortawesome/free-solid-svg-icons'

/* =======================
   TYPES
======================= */
type Props = {
	tunnelsInActualSeason: number
	tunnelsInPreviousSeason: number
	actualTrades: TradeOfPepper[]
	previousTrades: TradeOfPepper[]
}

type Trend = {
	direction: 'up' | 'down' | 'same'
	diff: number
}

type SeasonStats = {
	avgProfitPerTunnel: number
	avgHarvestPerTunnel: number
	profitTrend: Trend
	harvestTrend: Trend
	tunnelsTrend: Trend
}

/* =======================
   CONSTANTS
======================= */

/* =======================
   HELPERS
======================= */
function calculateTrend(current: number, previous: number): Trend {
	if (!previous) {
		return { direction: 'same', diff: 0 }
	}

	const diff = current - previous

	if (diff > 0) {
		return { direction: 'up', diff }
	}

	if (diff < 0) {
		return { direction: 'down', diff }
	}

	return { direction: 'same', diff: 0 }
}

/* =======================
   TREND BADGE
======================= */
function TrendBadge({ trend, unit, decimals = 2 }: { trend: Trend; unit: string; decimals?: number }) {
	const cfg = {
		up: 'bg-green-50 text-green-700 border-green-200',
		down: 'bg-red-50 text-red-700 border-red-200',
		same: 'bg-gray-100 text-gray-500 border-gray-200',
	}[trend.direction]

	const icon = trend.direction === 'up' ? faArrowUp : trend.direction === 'down' ? faArrowDown : faMinus

	return (
		<span
			className={`
				inline-flex items-center gap-1
				rounded-full border px-2 py-[2px]
				text-[11px] font-medium
				${cfg}
			`}>
			<FontAwesomeIcon icon={icon} />
			{Math.abs(trend.diff).toFixed(decimals)}
			<span className='ml-0.5'>{unit}</span>
		</span>
	)
}

/* =======================
   STAT CARD
======================= */
function StatCard({
	label,
	unit,
	icon,
	trend,
}: {
	label: string
	value: string
	unit?: string
	icon: any
	trend?: Trend
}) {
	return (
		<div className='relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 p-3 shadow-sm'>
			{/* accent */}
			<div className='absolute left-0 top-0 h-full w-1 bg-mainColor' />

			{/* watermark icon */}
			<div className='absolute right-2 bottom-2 text-mainColor/20  text-4xl'>
				<FontAwesomeIcon icon={icon} />
			</div>

			<div className='pl-4 space-y-3'>
				<p className='text-[11px] uppercase tracking-wide text-gray-500 leading-tight'>{label}</p>

				{trend && (
					<div>
						<TrendBadge trend={trend} unit={unit ?? ''} />
					</div>
				)}
			</div>
		</div>
	)
}

/* =======================
   MAIN COMPONENT
======================= */
export default function SeasonTunnelStatsCards({
	tunnelsInActualSeason,
	tunnelsInPreviousSeason,
	actualTrades,
	previousTrades,
}: Props) {
	const { avgProfitPerTunnel, avgHarvestPerTunnel, profitTrend, harvestTrend, tunnelsTrend } =
		useMemo<SeasonStats>(() => {
			if (!tunnelsInActualSeason || !tunnelsInPreviousSeason) {
				return {
					avgProfitPerTunnel: 0,
					avgHarvestPerTunnel: 0,
					profitTrend: { direction: 'same', diff: 0 },
					harvestTrend: { direction: 'same', diff: 0 },
					tunnelsTrend: { direction: 'same', diff: 0 },
				}
			}

			const totalHarvestKg = actualTrades.reduce((acc, t) => acc + t.tradeWeight, 0)

			const totalRevenue = actualTrades.reduce(
				(acc, t) => acc + t.tradeWeight * t.tradePrice * (1 + t.vatRate / 100),
				0,
			)

			const prevTotalHarvestKg = previousTrades.reduce((acc, t) => acc + t.tradeWeight, 0)

			const prevTotalRevenue = previousTrades.reduce(
				(acc, t) => acc + t.tradeWeight * t.tradePrice * (1 + t.vatRate / 100),
				0,
			)

			const avgHarvest = totalHarvestKg / tunnelsInActualSeason
			const avgProfit = totalRevenue / tunnelsInActualSeason

			const prevAvgHarvest = prevTotalHarvestKg / tunnelsInPreviousSeason

			const prevAvgProfit = prevTotalRevenue / tunnelsInPreviousSeason

			return {
				avgProfitPerTunnel: avgProfit,
				avgHarvestPerTunnel: avgHarvest,
				harvestTrend: calculateTrend(avgHarvest, prevAvgHarvest),
				profitTrend: calculateTrend(avgProfit, prevAvgProfit),
				tunnelsTrend: calculateTrend(tunnelsInActualSeason, tunnelsInPreviousSeason),
			}
		}, [actualTrades, previousTrades, tunnelsInActualSeason, tunnelsInPreviousSeason])

	return (
		<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
			<StatCard
				label='Liczba tuneli w sezonie'
				value={tunnelsInActualSeason.toString()}
				icon={faTents}
				trend={tunnelsTrend}
			/>

			<StatCard
				label='Średni zysk z tunelu'
				value={avgProfitPerTunnel.toFixed(0)}
				unit='zł'
				icon={faSackDollar}
				trend={profitTrend}
			/>

			<StatCard
				label='Średni zbiór z tunelu'
				value={avgHarvestPerTunnel.toFixed(0)}
				unit='kg'
				icon={faWeightHanging}
				trend={harvestTrend}
			/>
		</div>
	)
}

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
import { useMeData } from '../../hooks/useMeData'
import { useCurrencyRate } from '../../hooks/useCurrencyRate'

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
   HELPERS
======================= */
function calculateTrend(current: number, previous: number): Trend {
	if (!previous) return { direction: 'same', diff: 0 }

	const diff = current - previous
	if (diff > 0) return { direction: 'up', diff }
	if (diff < 0) return { direction: 'down', diff }

	return { direction: 'same', diff: 0 }
}

function formatNumber(value: number, useSeparator: boolean, fractionDigits: number) {
	return useSeparator
		? new Intl.NumberFormat('pl-PL', {
				minimumFractionDigits: fractionDigits,
				maximumFractionDigits: fractionDigits,
			}).format(value)
		: value.toFixed(fractionDigits)
}
function convertCurrency(valuePln: number, currency: 'PLN' | 'EUR', eurRate?: number) {
	if (currency === 'EUR' && eurRate) {
		return valuePln / eurRate
	}
	return valuePln
}

function convertWeight(valueKg: number, unit: 'kg' | 't') {
	if (unit === 't') {
		return valueKg / 1000
	}
	return valueKg
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
	value,
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
			{' '}
			{/* accent */} <div className='absolute left-0 top-0 h-full w-1 bg-mainColor' /> {/* watermark icon */}{' '}
			<div className='absolute right-2 bottom-2 text-mainColor/20 text-4xl'>
				{' '}
				<FontAwesomeIcon icon={icon} />{' '}
			</div>{' '}
			<div className='pl-4 space-y-3'>
				{' '}
				<p className='text-[11px] uppercase tracking-wide text-gray-500 leading-tight'>{label}</p>{' '}
				<div className='flex items-end gap-1'>
					<span className='text-2xl font-semibold text-gray-900'>{value}</span>
					{unit && <span className='text-xs text-gray-500 mb-0.5'>{unit}</span>}
				</div>
				{trend && (
					<div>
						{' '}
						<TrendBadge trend={trend} unit={unit ?? ''} />{' '}
					</div>
				)}{' '}
			</div>{' '}
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
	const { currency, eurRate } = useCurrencyRate()
	const { appSettings } = useMeData()

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

			/* ===== SUROWE ===== */
			const totalHarvestKg = actualTrades.reduce((a, t) => a + t.tradeWeight, 0)
			const totalRevenuePln = actualTrades.reduce((a, t) => a + t.tradeWeight * t.tradePrice * (1 + t.vatRate / 100), 0)

			const prevHarvestKg = previousTrades.reduce((a, t) => a + t.tradeWeight, 0)
			const prevRevenuePln = previousTrades.reduce(
				(a, t) => a + t.tradeWeight * t.tradePrice * (1 + t.vatRate / 100),
				0,
			)

			/* ===== ŚREDNIE ===== */
			const avgHarvestKg = totalHarvestKg / tunnelsInActualSeason
			const avgProfitPln = totalRevenuePln / tunnelsInActualSeason

			const prevAvgHarvestKg = prevHarvestKg / tunnelsInPreviousSeason
			const prevAvgProfitPln = prevRevenuePln / tunnelsInPreviousSeason

			/* ===== KONWERSJA ===== */
			const weightUnit: 'kg' | 't' = appSettings?.weightUnit === 't' ? 't' : 'kg'

			const avgHarvest = convertWeight(avgHarvestKg, weightUnit)
			const prevAvgHarvest = convertWeight(prevAvgHarvestKg, weightUnit)

			const avgProfit = convertCurrency(avgProfitPln, currency, eurRate)
			const prevAvgProfit = convertCurrency(prevAvgProfitPln, currency, eurRate)

			/* ===== TRENDY ===== */
			return {
				avgProfitPerTunnel: avgProfit,
				avgHarvestPerTunnel: avgHarvest,
				profitTrend: calculateTrend(avgProfit, prevAvgProfit),
				harvestTrend: calculateTrend(avgHarvest, prevAvgHarvest),
				tunnelsTrend: calculateTrend(tunnelsInActualSeason, tunnelsInPreviousSeason),
			}
		}, [actualTrades, previousTrades, tunnelsInActualSeason, tunnelsInPreviousSeason, appSettings, currency, eurRate])

	/* ===== FORMATOWANIE ===== */
	const useSeparator = appSettings?.useThousandsSeparator ?? true

	const profitFormatted = formatNumber(avgProfitPerTunnel, useSeparator, 0)

	const harvestFormatted = formatNumber(avgHarvestPerTunnel, useSeparator, appSettings?.weightUnit === 't' ? 2 : 0)


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
				value={profitFormatted}
				unit={currency === 'EUR' ? '€' : 'zł'}
				icon={faSackDollar}
				trend={profitTrend}
			/>

			<StatCard
				label='Średni zbiór z tunelu'
				value={harvestFormatted}
				unit={appSettings?.weightUnit ?? 'kg'}
				icon={faWeightHanging}
				trend={harvestTrend}
			/>
		</div>
	)
}

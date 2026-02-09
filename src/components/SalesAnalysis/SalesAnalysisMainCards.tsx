import { useState, useEffect, useMemo } from 'react'
import { useMeData } from '../../hooks/useMeData'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWeightHanging, faCoins, faHandHoldingDollar, faListOl } from '@fortawesome/free-solid-svg-icons'
import { useCountUp } from '../../hooks/useCountUp'
import { useFormatUtils } from '../../hooks/useFormatUtils'

type Props = {
	actualTrades: TradeOfPepper[]
	previousTrades: TradeOfPepper[]
}

function aggregateTrades(trades: TradeOfPepper[]) {
	let kg = 0
	let gross = 0
	let count = 0

	for (const t of trades) {
		const net = t.tradePrice * t.tradeWeight
		const g = net * (1 + t.vatRate / 100)

		kg += t.tradeWeight
		gross += g
		count += 1
	}

	return {
		totalKg: kg,
		totalGross: gross,
		avgGrossPerKg: kg > 0 ? gross / kg : 0,
		count,
	}
}

type Trend = {
	direction: 'up' | 'down' | 'same'
	diff: number
}

function calculateTrend(current: number, previous?: number): Trend | null {
	if (previous === undefined || previous === null || current == 0) return null
	const diff = current - previous

	if (diff > 0) return { direction: 'up', diff }
	if (diff < 0) return { direction: 'down', diff }
	return { direction: 'same', diff: 0 }
}

export default function SalesAnalysisMainCards({ actualTrades, previousTrades }: Props) {
	const { formatCurrency, formatWeight, convertWeight, toEURO, userCurrency, getWeightSymbol } = useFormatUtils()
	const [activeIndex, setActiveIndex] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => {
			setActiveIndex(i => (i + 1) % 4)
		}, 5000)

		return () => clearInterval(interval)
	}, [])

	const currentAgg = useMemo(() => aggregateTrades(actualTrades), [actualTrades])
	const previousAgg = useMemo(() => (previousTrades.length ? aggregateTrades(previousTrades) : null), [previousTrades])

	const weightTrendBase = calculateTrend(currentAgg.totalKg, previousAgg?.totalKg)

	const valueTrendBase = calculateTrend(currentAgg.totalGross, previousAgg?.totalGross)

	const avgPriceTrendBase = calculateTrend(currentAgg.avgGrossPerKg, previousAgg?.avgGrossPerKg)

	const countTrend = calculateTrend(currentAgg.count, previousAgg?.count)

	const weightTrend = weightTrendBase
		? {
				...weightTrendBase,
				diff: convertWeight(weightTrendBase.diff),
			}
		: null

	const valueTrend = valueTrendBase
		? {
				...valueTrendBase,
				diff: userCurrency === 'EUR' ? toEURO(valueTrendBase.diff) : valueTrendBase.diff,
			}
		: null

	const avgPriceTrend = avgPriceTrendBase
		? {
				...avgPriceTrendBase,
				diff: userCurrency === 'EUR' ? toEURO(avgPriceTrendBase.diff) : avgPriceTrendBase.diff,
			}
		: null

	const animatedWeight = useCountUp(currentAgg.totalKg)

	const animatedValue = useCountUp(currentAgg.totalGross)

	const animatedAvgPrice = useCountUp(currentAgg.avgGrossPerKg)

	const animatedCount = useCountUp(currentAgg.count)

	const weightUi = formatWeight(animatedWeight)

	const valueUi = formatCurrency(animatedValue)

	const avgPriceUi = formatCurrency(animatedAvgPrice)

	const currencySymbol = userCurrency === 'EUR' ? '€' : 'zł'
	const weightSymbol = getWeightSymbol()

	return (
		<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
			<SummaryCard
				label='Łączny dochód'
				value={`${valueUi}`}
				icon={faCoins}
				trend={valueTrend}
				trendUnit={currencySymbol}
				trendDecimals={2}
				active={activeIndex === 0}
			/>

			<SummaryCard
				label='Łączna masa'
				value={`${weightUi}`}
				icon={faWeightHanging}
				trend={weightTrend}
				trendUnit={weightSymbol}
				trendDecimals={weightSymbol === 't' ? 3 : 0}
				active={activeIndex === 1}
			/>

			<SummaryCard
				label='Średnia cena'
				value={`${avgPriceUi}`}
				icon={faHandHoldingDollar}
				trend={avgPriceTrend}
				trendUnit={`${currencySymbol}/kg`}
				trendDecimals={2}
				active={activeIndex === 2}
			/>

			<SummaryCard
				label='Liczba transakcji'
				value={Math.round(animatedCount).toString()}
				icon={faListOl}
				trend={countTrend}
				trendDecimals={0}
				active={activeIndex === 3}
			/>
		</div>
	)
}

function TrendBadge({ trend, unit }: { trend: Trend; unit?: string; useThousands?: boolean; decimals?: number }) {
	const cfg = {
		up: {
			icon: '↑',
			cls: 'bg-green-50 text-green-700 border-green-200',
		},
		down: {
			icon: '↓',
			cls: 'bg-red-50 text-red-700 border-red-200',
		},
		same: {
			icon: '→',
			cls: 'bg-gray-100 text-gray-500 border-gray-200',
		},
	}[trend.direction]

	const { formatNumber } = useFormatUtils()
	const formattedDiff = formatNumber(Math.abs(trend.diff))

	return (
		<span
			className={`
				inline-flex items-center gap-1
				rounded-full border
				px-2 py-[2px]
				text-[11px] font-medium
				${cfg.cls}
			`}>
			{cfg.icon}
			{formattedDiff}
			{unit && <span className='ml-0.5'>{unit}</span>}
		</span>
	)
}

function SummaryCard({
	label,
	value,
	icon,
	trend,
	trendUnit,
	trendDecimals = 2,
	active = false,
}: {
	label: string
	value: string
	icon: any
	trend?: Trend | null
	trendUnit?: string
	trendDecimals?: number
	useThousands?: boolean
	active?: boolean
}) {
	return (
		<div
			className={`
		group relative overflow-hidden
		rounded-xl
		bg-gradient-to-br from-white to-gray-50
		p-4
		shadow-sm
		transition-all duration-500
		${active ? 'shadow-md -translate-y-[2px]' : ''}
	`}>
			{/* akcent */}
			<div className='absolute left-0 top-0 h-full w-1 bg-mainColor' />

			{/* ikona (watermark) */}
			<div
				className={`
		absolute right-3 top-3
		text-4xl
		transition-colors duration-500
		${active ? 'text-mainColor' : 'text-mainColor/20'}
	`}>
				<FontAwesomeIcon icon={icon} />
			</div>

			<p className='text-[11px] uppercase tracking-wide text-gray-500 mb-2'>{label}</p>

			<p className='text-2xl font-semibold text-gray-900 leading-tight'>{value}</p>

			{trend && (
				<div className='mt-2'>
					<TrendBadge trend={trend} unit={trendUnit} decimals={trendDecimals} />
				</div>
			)}
		</div>
	)
}

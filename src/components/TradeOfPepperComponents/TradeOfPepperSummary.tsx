import { useState, useEffect, useMemo } from 'react'
import { useMeData } from '../../hooks/useMeData'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWeightHanging, faCoins, faHandHoldingDollar, faListOl } from '@fortawesome/free-solid-svg-icons'
import { useCountUp } from '../../hooks/useCountUp'

/* =======================
   PROPS
======================= */
type Props = {
	items: TradeOfPepper[] // aktualny zakres
	allTrades: TradeOfPepper[] // wszystkie (do trendu r/r)
}

/* =======================
   UTIL
======================= */
function formatNumber(value: number, decimals: number, useThousands?: boolean) {
	const fixed = value.toFixed(decimals)
	if (!useThousands) return fixed

	const [intPart, decPart] = fixed.split('.')
	const spaced = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
	return decPart ? `${spaced}.${decPart}` : spaced
}

function minusOneYear(date: string) {
	const d = new Date(date)
	d.setFullYear(d.getFullYear() - 1)
	return d.toISOString().slice(0, 10)
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
		totalKg: kg, // zawsze kg
		totalGross: gross, // zawsze PLN
		avgGrossPerKg: kg > 0 ? gross / kg : 0, // PLN/kg
		count,
	}
}

/* =======================
   TREND
======================= */
type Trend = {
	direction: 'up' | 'down' | 'same'
	diff: number
}

function calculateTrend(current: number, previous?: number): Trend | null {
	if (previous === undefined || previous === null) return null

	const diff = current - previous

	if (diff > 0) return { direction: 'up', diff }
	if (diff < 0) return { direction: 'down', diff }
	return { direction: 'same', diff: 0 }
}

/* =======================
   COMPONENT
======================= */
export default function TradeOfPepperSummary({ items, allTrades }: Props) {
	const { appSettings } = useMeData()
	const [eurRate, setEurRate] = useState(1)

	/* =======================
	   EUR RATE
	======================= */
	useEffect(() => {
		if (appSettings?.currency !== 'EUR') return

		async function fetchRate() {
			try {
				const res = await fetch('https://api.nbp.pl/api/exchangerates/rates/a/eur/?format=json')
				const data = await res.json()
				setEurRate(data.rates[0].mid)
			} catch {
				setEurRate(1)
			}
		}

		fetchRate()
	}, [appSettings?.currency])

	/* =======================
	   CURRENT AGG (BAZA)
	======================= */
	const currentAgg = useMemo(() => aggregateTrades(items), [items])

	/* =======================
	   PREVIOUS YEAR AGG (BAZA)
	======================= */
	const previousAgg = useMemo(() => {
		if (!items.length) return null

		const dates = items.map(t => t.tradeDate).sort()
		const from = minusOneYear(dates[0])
		const to = minusOneYear(dates[dates.length - 1])

		const prevItems = allTrades.filter(t => t.tradeDate >= from && t.tradeDate <= to)

		return prevItems.length ? aggregateTrades(prevItems) : null
	}, [items, allTrades])

	/* =======================
	   BASE TRENDS (BAZA)
	======================= */
	const weightTrendBase = calculateTrend(currentAgg.totalKg, previousAgg?.totalKg)

	const valueTrendBase = calculateTrend(currentAgg.totalGross, previousAgg?.totalGross)

	const avgPriceTrendBase = calculateTrend(currentAgg.avgGrossPerKg, previousAgg?.avgGrossPerKg)

	const countTrend = calculateTrend(currentAgg.count, previousAgg?.count)

	/* =======================
	   TREND → UI UNITS
	======================= */
	const weightTrend = weightTrendBase
		? {
				...weightTrendBase,
				diff: appSettings?.weightUnit === 't' ? weightTrendBase.diff / 1000 : weightTrendBase.diff,
			}
		: null

	const valueTrend = valueTrendBase
		? {
				...valueTrendBase,
				diff: appSettings?.currency === 'EUR' ? valueTrendBase.diff / eurRate : valueTrendBase.diff,
			}
		: null

	const avgPriceTrend = avgPriceTrendBase
		? {
				...avgPriceTrendBase,
				diff: appSettings?.currency === 'EUR' ? avgPriceTrendBase.diff / eurRate : avgPriceTrendBase.diff,
			}
		: null

	/* =======================
	   COUNT-UP VALUES
	======================= */
	const animatedWeight = useCountUp(appSettings?.weightUnit === 't' ? currentAgg.totalKg / 1000 : currentAgg.totalKg)

	const animatedValue = useCountUp(
		appSettings?.currency === 'EUR' ? currentAgg.totalGross / eurRate : currentAgg.totalGross,
	)

	const animatedAvgPrice = useCountUp(
		appSettings?.currency === 'EUR' ? currentAgg.avgGrossPerKg / eurRate : currentAgg.avgGrossPerKg,
	)

	const animatedCount = useCountUp(currentAgg.count)

	/* =======================
	   UI FORMAT
	======================= */
	const weightUi = formatNumber(
		animatedWeight,
		appSettings?.weightUnit === 't' ? 3 : 0,
		appSettings?.useThousandsSeparator,
	)

	const valueUi = formatNumber(animatedValue, 2, appSettings?.useThousandsSeparator)

	const avgPriceUi = formatNumber(animatedAvgPrice, 2, appSettings?.useThousandsSeparator)

	const currencySymbol = appSettings?.currency === 'EUR' ? '€' : 'zł'

	/* =======================
	   RENDER
	======================= */
	return (
		<div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
			<SummaryCard
				label='Łączny dochód'
				value={`${valueUi} ${currencySymbol}`}
				icon={faCoins}
				trend={valueTrend}
				trendUnit={currencySymbol}
				trendDecimals={2}
				useThousands={appSettings?.useThousandsSeparator}
			/>

			<SummaryCard
				label='Łączna masa'
				value={`${weightUi} ${appSettings?.weightUnit}`}
				icon={faWeightHanging}
				trend={weightTrend}
				trendUnit={appSettings?.weightUnit}
				trendDecimals={appSettings?.weightUnit === 't' ? 3 : 0}
				useThousands={appSettings?.useThousandsSeparator}
			/>

			<SummaryCard
				label='Średnia cena'
				value={`${avgPriceUi} ${currencySymbol}`}
				icon={faHandHoldingDollar}
				trend={avgPriceTrend}
				trendUnit={`${currencySymbol}/kg`}
				trendDecimals={2}
				useThousands={appSettings?.useThousandsSeparator}
			/>

			<SummaryCard
				label='Liczba transakcji'
				value={Math.round(animatedCount).toString()}
				icon={faListOl}
				trend={countTrend}
				trendDecimals={0}
			/>
		</div>
	)
}

/* =======================
   UI
======================= */
function TrendBadge({
	trend,
	unit,
	useThousands,
	decimals = 2,
}: {
	trend: Trend
	unit?: string
	useThousands?: boolean
	decimals?: number
}) {
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

	const formattedDiff = formatNumber(Math.abs(trend.diff), decimals, useThousands)

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
	useThousands,
}: {
	label: string
	value: string
	icon: any
	trend?: Trend | null
	trendUnit?: string
	trendDecimals?: number
	useThousands?: boolean
}) {
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
			{/* akcent */}
			<div className='absolute left-0 top-0 h-full w-1 bg-mainColor/60' />

			{/* ikona (watermark) */}
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

			{trend && (
				<div className='mt-2'>
					<TrendBadge trend={trend} unit={trendUnit} decimals={trendDecimals} useThousands={useThousands} />
				</div>
			)}
		</div>
	)
}

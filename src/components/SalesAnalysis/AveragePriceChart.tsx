import React, { useMemo } from 'react'
import Chart from 'react-apexcharts'
import ChartCard from '../ui/ChartCard'
import { greenPalette } from '../../theme/greenPalette'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import { MonthlyAverageCards } from './MonthlyAverageCards'
import { useMeData } from '../../hooks/useMeData'
import { useCurrencyRate } from '../../hooks/useCurrencyRate'

type Props = {
	actualTrades: TradeOfPepper[]
}

type IntervalPoint = {
	avgPrice: number
	from: Date
	to: Date
	monthLabel: string
	monthIndex: number
}

/* =======================
   HELPERS
======================= */
function getAveragePrice(trades: TradeOfPepper[]) {
	let totalKg = 0
	let totalGross = 0

	trades.forEach(t => {
		const gross = t.tradePrice * t.tradeWeight * (1 + t.vatRate / 100)
		totalKg += t.tradeWeight
		totalGross += gross
	})

	return totalKg > 0 ? totalGross / totalKg : 0
}

function formatIntervalLabel(from: Date, to: Date) {
	const fromDay = from.getDate()
	const toDay = to.getDate()

	const fromMonth = from.toLocaleString('pl-PL', { month: 'long' })
	const toMonth = to.toLocaleString('pl-PL', { month: 'long' })

	if (fromMonth === toMonth) {
		return `${fromDay}–${toDay} ${fromMonth}`
	}

	return `${fromDay} ${fromMonth} – ${toDay} ${toMonth}`
}

/* =======================
   COMPONENT
======================= */
export default function AveragePriceChart({ actualTrades }: Props) {
	const { currency, eurRate } = useCurrencyRate()

	const { appSettings } = useMeData()

	function convertPrice(value: number, currency: 'PLN' | 'EUR', eurRate: number) {
		if (currency === 'EUR') {
			return value / eurRate
		}
		return value
	}

	/* =======================
	   INTERWAŁY 10-DNIOWE
	======================= */
	const intervalData = useMemo<IntervalPoint[]>(() => {
		if (!actualTrades.length) return []

		const sorted = [...actualTrades].sort((a, b) => +new Date(a.tradeDate) - +new Date(b.tradeDate))

		const start = new Date(sorted[0].tradeDate)
		const end = new Date(sorted[sorted.length - 1].tradeDate)

		const result: IntervalPoint[] = []
		let cursor = new Date(start)

		while (cursor <= end) {
			const from = new Date(cursor)
			const to = new Date(cursor)
			to.setDate(to.getDate() + 9)

			const tradesInInterval = sorted.filter(t => {
				const d = new Date(t.tradeDate)
				return d >= from && d <= to
			})

			if (tradesInInterval.length) {
				const avg = getAveragePrice(tradesInInterval)
				const monthIndex = from.getMonth()

				result.push({
					avgPrice: Math.round(avg * 100) / 100,
					from,
					to,
					monthIndex,
					monthLabel: from.toLocaleString('pl-PL', { month: 'long' }),
				})
			}

			cursor.setDate(cursor.getDate() + 10)
		}

		return result
	}, [actualTrades])

	/* =======================
	   ETYKIETY X – TYLKO POCZĄTEK MIESIĄCA
	======================= */
	const xLabels = useMemo(() => {
		let lastMonth: number | null = null

		return intervalData.map(p => {
			if (p.monthIndex !== lastMonth) {
				lastMonth = p.monthIndex
				return p.monthLabel
			}
			return ''
		})
	}, [intervalData])

	/* =======================
	   ŚREDNIA SEZONU
	======================= */
	const seasonAvg = useMemo(() => getAveragePrice(actualTrades), [actualTrades])

	/* =======================
	   WYKRES
	======================= */
	const series = [
		{
			name: `Średnia cena kolejnych 10 dni sezonu`,
			data: intervalData.map(p => convertPrice(p.avgPrice, currency, eurRate)),
		},
		{
			name: 'Średnia sezonu',
			data: intervalData.map(() => convertPrice(seasonAvg, currency, eurRate)),
		},
	]

	const options: ApexCharts.ApexOptions = {
		chart: {
			type: 'area',
			zoom: { enabled: false }, 

			toolbar: { show: false },
			fontFamily: 'inherit',
		},

		stroke: {
			curve: 'smooth',
			width: [3, 2],
			dashArray: [0, 6],
		},

		colors: [greenPalette[5], greenPalette[2]],

		xaxis: {
			categories: xLabels,
			labels: {
				style: {
					fontSize: '11px',
					colors: '#6b7280',
				},
			},
			axisBorder: { show: false },
			axisTicks: { show: false },
		},

		yaxis: {
			labels: {
				formatter: v => `${v.toFixed(2)} ${currency === 'EUR' ? '€' : 'zł'}`,
			},
		},

		grid: {
			strokeDashArray: 0,
			borderColor: '#e5e7eb',
		},

		legend: {
			position: 'bottom',
			horizontalAlign: 'center',
		},

		tooltip: {
			shared: false,
			custom: ({ dataPointIndex }) => {
				const p = intervalData[dataPointIndex]
				if (!p) return ''

				const value = convertPrice(p.avgPrice, currency, eurRate)

				return `
			<div style="padding:8px 10px;font-size:12px">
				<div style="font-weight:600;margin-bottom:4px">
					${formatIntervalLabel(p.from, p.to)}
				</div>
				<div>
					Średnia cena:
					<strong>
						${value.toFixed(2)} ${currency === 'EUR' ? '€' : 'zł'}/kg
					</strong>
				</div>
			</div>
		`
			},
		},
	}

	/* =======================
	   KARTY MIESIĘCZNE
	======================= */
	const avgByMonth = useMemo(() => {
		const map: Record<string, TradeOfPepper[]> = {}

		actualTrades.forEach(t => {
			const m = new Date(t.tradeDate).toLocaleString('pl-PL', {
				month: 'long',
			})
			map[m] ??= []
			map[m].push(t)
		})

		return Object.entries(map).map(([month, trades]) => ({
			month,
			avg: getAveragePrice(trades),
		}))
	}, [actualTrades])

	/* =======================
	   RENDER
	======================= */
	return (
		<ChartCard title='Wykres zależności średniej ceny sprzedaży w sezonie'>
			<div className='grid grid-cols-1 lg:grid-cols-12 gap-6 h-full'>
				{/* WYKRES */}
				<div className='lg:col-span-8'>
					<div className='h-[420px] '>
						<Chart type='line' options={options} series={series} height='100%' />
					</div>
				</div>

				{/* KARTY */}
				<div className='lg:col-span-4'>
					<div className='h-[420px] overflow-y-auto pr-1 space-y-3'>
						<MonthlyAverageCards items={avgByMonth} seasonAvg={seasonAvg} currency={currency} eurRate={eurRate} />
					</div>
				</div>
			</div>
		</ChartCard>
	)
}

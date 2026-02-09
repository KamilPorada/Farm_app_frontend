import{ useMemo } from 'react'
import Chart from 'react-apexcharts'
import ChartCard from '../ui/ChartCard'
import { greenPalette } from '../../theme/greenPalette'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import { MonthlyAverageCards } from './MonthlyAverageCards'
import { useFormatUtils } from '../../hooks/useFormatUtils'

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

export default function AveragePriceChart({ actualTrades }: Props) {
	const {
		userCurrency,
		toEURO,
		formatNumber,
		getCurrencySymbol,
	} = useFormatUtils()

	const currencySymbol = getCurrencySymbol()

	const intervalData = useMemo<IntervalPoint[]>(() => {
		if (!actualTrades.length) return []

		const sorted = [...actualTrades].sort(
			(a, b) => +new Date(a.tradeDate) - +new Date(b.tradeDate),
		)

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
				const avgPln = getAveragePrice(tradesInInterval)

				result.push({
					avgPrice: avgPln,
					from,
					to,
					monthIndex: from.getMonth(),
					monthLabel: from.toLocaleString('pl-PL', { month: 'long' }),
				})
			}

			cursor.setDate(cursor.getDate() + 10)
		}

		return result
	}, [actualTrades])

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

	const seasonAvgPln = useMemo(
		() => getAveragePrice(actualTrades),
		[actualTrades],
	)

	const series = useMemo(
		() => [
			{
				name: 'Średnia cena kolejnych 10 dni sezonu',
				data: intervalData.map(p =>
					userCurrency === 'EUR' ? toEURO(p.avgPrice) : p.avgPrice,
				),
			},
			{
				name: 'Średnia sezonu',
				data: intervalData.map(() =>
					userCurrency === 'EUR' ? toEURO(seasonAvgPln) : seasonAvgPln,
				),
			},
		],
		[intervalData, seasonAvgPln, userCurrency, toEURO],
	)

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
			axisBorder: { show: false },
			axisTicks: { show: false },
			labels: {
				style: {
					fontSize: '11px',
					colors: '#6b7280',
				},
			},
		},

		yaxis: {
			labels: {
				formatter: v => `${formatNumber(v)} ${currencySymbol}`,
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
			custom: ({ dataPointIndex }) => {
				const p = intervalData[dataPointIndex]
				if (!p) return ''

				const value =
					userCurrency === 'EUR' ? toEURO(p.avgPrice) : p.avgPrice

				return `
					<div style="padding:8px 10px;font-size:12px">
						<div style="font-weight:600;margin-bottom:4px">
							${formatIntervalLabel(p.from, p.to)}
						</div>
						<div>
							Średnia cena:
							<strong>
								${formatNumber(value)} ${currencySymbol}/kg
							</strong>
						</div>
					</div>
				`
			},
		},
	}

	const avgByMonth = useMemo(() => {
		const map: Record<string, TradeOfPepper[]> = {}

		actualTrades.forEach(t => {
			const m = new Date(t.tradeDate).toLocaleString('pl-PL', { month: 'long' })
			map[m] ??= []
			map[m].push(t)
		})

		return Object.entries(map).map(([month, trades]) => ({
			month,
			avg: getAveragePrice(trades),
		}))
	}, [actualTrades])

	return (
		<ChartCard title='Wykres zależności średniej ceny sprzedaży w sezonie'>
			<div className='grid grid-cols-1 lg:grid-cols-12 gap-6 h-full'>
				<div className='lg:col-span-8 h-[420px]'>
					<Chart type='line' options={options} series={series} height='100%' />
				</div>

				<div className='lg:col-span-4 h-[420px] overflow-y-auto pr-1 space-y-3'>
					<MonthlyAverageCards
						items={avgByMonth}
						seasonAvg={seasonAvgPln}
					/>
				</div>
			</div>
		</ChartCard>
	)
}

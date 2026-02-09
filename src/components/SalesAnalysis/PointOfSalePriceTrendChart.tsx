import { useMemo } from 'react'
import Chart from 'react-apexcharts'
import ChartCard from '../ui/ChartCard'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import { greenPalette } from '../../theme/greenPalette'
import { useFormatUtils } from '../../hooks/useFormatUtils'

type Props = {
	actualTrades: TradeOfPepper[]
}

const MONTHS_PL = [
	'styczeń',
	'luty',
	'marzec',
	'kwiecień',
	'maj',
	'czerwiec',
	'lipiec',
	'sierpień',
	'wrzesień',
	'październik',
	'listopad',
	'grudzień',
]

const MONTHS_PL_GENITIVE = [
	'stycznia',
	'lutego',
	'marca',
	'kwietnia',
	'maja',
	'czerwca',
	'lipca',
	'sierpnia',
	'września',
	'października',
	'listopada',
	'grudnia',
]

function toDate(d: string) {
	return new Date(d)
}

function addDays(date: Date, days: number) {
	const d = new Date(date)
	d.setDate(d.getDate() + days)
	return d
}

function formatIntervalLabel(from: Date, to: Date) {
	const fromDay = from.getDate()
	const toDay = to.getDate()
	const fromMonth = from.getMonth()
	const toMonth = to.getMonth()

	if (fromMonth === toMonth) {
		return `${fromDay}–${toDay} ${MONTHS_PL_GENITIVE[fromMonth]}`
	}

	return `${fromDay} ${MONTHS_PL_GENITIVE[fromMonth]} – ${toDay} ${MONTHS_PL_GENITIVE[toMonth]}`
}

export default function PointOfSalePriceTrendChart({ actualTrades }: Props) {
	const { toEURO, userCurrency, getCurrencySymbol, formatNumber } = useFormatUtils()

	const { series, categories, intervalData } = useMemo(() => {
		if (actualTrades.length < 2) {
			return { series: [], categories: [], intervalData: [] }
		}

		const sorted = [...actualTrades].sort((a, b) => toDate(a.tradeDate).getTime() - toDate(b.tradeDate).getTime())

		const start = toDate(sorted[0].tradeDate)
		const end = toDate(sorted[sorted.length - 1].tradeDate)

		const buckets: { from: Date; to: Date; avgPricePln: number }[] = []

		let cursor = start

		while (cursor <= end) {
			const bucketEnd = addDays(cursor, 10)

			const tradesInRange = sorted.filter(t => {
				const d = toDate(t.tradeDate)
				return d >= cursor && d < bucketEnd
			})

			if (tradesInRange.length) {
				const totalValuePln = tradesInRange.reduce(
					(acc, t) => acc + t.tradeWeight * t.tradePrice * (1 + t.vatRate / 100),
					0,
				)

				const totalWeight = tradesInRange.reduce((acc, t) => acc + t.tradeWeight, 0)

				buckets.push({
					from: cursor,
					to: bucketEnd,
					avgPricePln: totalWeight ? totalValuePln / totalWeight : 0,
				})
			}

			cursor = bucketEnd
		}

		const categories: string[] = []
		let lastMonth: number | null = null

		buckets.forEach(b => {
			const m = b.from.getMonth()
			if (m !== lastMonth) {
				categories.push(MONTHS_PL[m])
				lastMonth = m
			} else {
				categories.push('')
			}
		})

		const avgPriceGlobalPln = buckets.reduce((acc, b) => acc + b.avgPricePln, 0) / buckets.length

		const mapPrice = (pln: number) => (userCurrency === 'EUR' ? toEURO(pln) : pln)

		const avgPriceGlobal = +mapPrice(avgPriceGlobalPln).toFixed(2)

		const series = [
			{
				name: 'Średnia cena',
				data: buckets.map(b => +mapPrice(b.avgPricePln).toFixed(2)),
			},
			{
				name: 'Średnia cena (okres)',
				data: buckets.map(() => avgPriceGlobal),
			},
		]

		return { categories, intervalData: buckets, series }
	}, [actualTrades, userCurrency, toEURO])

	if (!series.length) return null

	const currencySymbol = getCurrencySymbol()

	const options: ApexCharts.ApexOptions = {
		chart: {
			type: 'area',
			toolbar: { show: false },
			zoom: { enabled: false },
		},
		colors: [greenPalette[5], greenPalette[3]],
		stroke: {
			curve: 'smooth',
			width: [3, 2],
			dashArray: [0, 6],
		},
		dataLabels: { enabled: false },
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.35,
				opacityTo: 0.05,
				stops: [0, 90, 100],
			},
		},
		grid: {
			strokeDashArray: 0,
			borderColor: '#e5e7eb',
		},
		xaxis: {
			categories,
			labels: {
				style: { colors: '#6b7280', fontSize: '11px' },
			},
			axisBorder: { show: false },
			axisTicks: { show: false },
		},
		yaxis: {
			labels: {
				formatter: val => `${formatNumber(Number(val.toFixed(2)))} ${currencySymbol}/kg`,
			},
		},

		legend: { show: false },
		tooltip: {
			shared: false,
			custom: ({ dataPointIndex }) => {
				const p = intervalData[dataPointIndex]
				if (!p) return ''

				const value = userCurrency === 'EUR' ? toEURO(p.avgPricePln) : p.avgPricePln

				return `
					<div style="padding:8px 10px;font-size:12px;color:#111827">
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

	return (
		<div className='w-full md:w-1/2'>
			<ChartCard title='Trend cenowy'>
				<Chart type='area' options={options} series={series} height={260} />
			</ChartCard>
		</div>
	)
}

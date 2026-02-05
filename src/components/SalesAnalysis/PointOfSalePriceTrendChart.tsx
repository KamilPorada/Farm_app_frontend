import { useMemo } from 'react'
import Chart from 'react-apexcharts'
import ChartCard from '../ui/ChartCard'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import { greenPalette } from '../../theme/greenPalette'
import { useCurrencyRate } from '../../hooks/useCurrencyRate'

type Props = {
	actualTrades: TradeOfPepper[]
}

/* =======================
   CONSTS & HELPERS
======================= */
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

function convertPrice(valuePln: number, currency: 'PLN' | 'EUR', eurRate?: number) {
	if (currency === 'EUR' && eurRate) {
		return valuePln / eurRate
	}
	return valuePln
}

/* =======================
   COMPONENT
======================= */
export default function PointOfSalePriceTrendChart({ actualTrades }: Props) {
	const { currency, eurRate } = useCurrencyRate()

	const { series, categories, intervalData } = useMemo(() => {
		if (actualTrades.length < 2) {
			return { series: [], categories: [], intervalData: [] }
		}

		const sorted = [...actualTrades].sort((a, b) => toDate(a.tradeDate).getTime() - toDate(b.tradeDate).getTime())

		const start = toDate(sorted[0].tradeDate)
		const end = toDate(sorted[sorted.length - 1].tradeDate)

		const buckets: {
			from: Date
			to: Date
			avgPricePln: number
		}[] = []

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

		/* ===== OŚ X – NAZWY MIESIĘCY ===== */
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

		/* ===== ŚREDNIA CENA OKRESU ===== */
		const avgPriceGlobalPln = buckets.reduce((acc, b) => acc + b.avgPricePln, 0) / buckets.length

		const avgPriceGlobal = +convertPrice(avgPriceGlobalPln, currency, eurRate).toFixed(2)

		/* ===== SERIE ===== */
		const series = [
			{
				name: 'Średnia cena',
				data: buckets.map(b => +convertPrice(b.avgPricePln, currency, eurRate).toFixed(2)),
			},
			{
				name: 'Średnia cena (okres)',
				data: buckets.map(() => avgPriceGlobal),
			},
		]

		return {
			categories,
			intervalData: buckets,
			series,
		}
	}, [actualTrades, currency, eurRate])

	if (!series.length) return null

	const options: ApexCharts.ApexOptions = {
		chart: {
			type: 'area',
			toolbar: { show: false },
			zoom: { enabled: false },
		},
		colors: [
			greenPalette[5], // trend
			greenPalette[3], // średnia (linia przerywana)
		],
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
				style: { colors: '#6b7280', fontSize: '11px' },
				formatter: val => `${val.toFixed(2)} ${currency === 'EUR' ? '€' : 'zł'}/kg`,
			},
		},
		legend: {
			show: false,
		},
		tooltip: {
			shared: false,
			custom: ({ dataPointIndex }) => {
				const p = intervalData[dataPointIndex]
				if (!p) return ''

				const value = convertPrice(p.avgPricePln, currency, eurRate)

				return `
					<div style="padding:8px 10px;font-size:12px;color:#111827">
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

	return (
		<div className='w-full md:w-1/2'>
			<ChartCard title='Trend cenowy'>
				<Chart type='area' options={options} series={series} height={260} />
			</ChartCard>
		</div>
	)
}

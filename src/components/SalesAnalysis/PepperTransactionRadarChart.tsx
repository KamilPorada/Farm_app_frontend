import { useMemo } from 'react'
import Chart from 'react-apexcharts'
import ChartCard from '../ui/ChartCard'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import { greenPalette } from '../../theme/greenPalette'

type Props = {
	actualTrades: TradeOfPepper[]
}

const SEASON_MONTHS = [
	{ label: 'Lipiec', index: 6 },
	{ label: 'Sierpień', index: 7 },
	{ label: 'Wrzesień', index: 8 },
	{ label: 'Październik', index: 9 },
	{ label: 'Listopad', index: 10 },
]

export default function PepperTransactionsRadarChart({ actualTrades }: Props) {
	const { series, categories } = useMemo(() => {
		const monthlyCounts = Array(12).fill(0)

		actualTrades.forEach(t => {
			const month = new Date(t.tradeDate).getMonth()
			monthlyCounts[month] += 1
		})

		const categories = SEASON_MONTHS.map(m => m.label)
		const data = SEASON_MONTHS.map(m => monthlyCounts[m.index] ?? 0)

		return {
			categories,
			series: [
				{
					name: 'Liczba transakcji',
					data,
				},
			],
		}
	}, [actualTrades])

	const options: ApexCharts.ApexOptions = {
		chart: {
			type: 'radar',
			offsetX: 15,
			toolbar: { show: false },
		},
		xaxis: {
			categories: SEASON_MONTHS.map(m => m.label),
		},
		stroke: {
			width: 2,
		},
		plotOptions: {
			radar: {
				size: 120,
			},
		},
		fill: {
			opacity: 0.25,
		},
		markers: {
			size: 4,
		},
		colors: [greenPalette[5]],
		yaxis: {
			labels: {
				formatter: val => Math.round(val).toString(),
			},
		},
		tooltip: {
			shared: false,
			custom: ({ dataPointIndex }) => {
				const month = categories[dataPointIndex]
				const value = series[0].data[dataPointIndex]

				if (!month || value === undefined) return ''

				return `
				<div style="padding:8px 10px;font-size:12px;color:#111827">
					<div style="font-weight:600;margin-bottom:4px">
						${month}
					</div>
					<div>
						Liczba transakcji:
						<strong>${value}</strong>
					</div>
				</div>
			`
			},
		},
	}

	return (
		<div className='w-full md:w-1/2'>
			<ChartCard title='Wykres zależności liczby transakcji od miesiąca'>
				<Chart type='radar' series={series} options={options} height={305} />
			</ChartCard>
		</div>
	)
}

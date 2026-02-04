import { useMemo } from 'react'
import Chart from 'react-apexcharts'
import ChartCard from '../ui/ChartCard'
import type { TradeOfPepper } from '../../types/TradeOfPepper'

type Props = {
	actualTrades: TradeOfPepper[]
}

/* =======================
   CONSTANTS
======================= */
const MONTHS = [
	{ label: 'Lipiec', month: 6 },
	{ label: 'Sierpień', month: 7 },
	{ label: 'Wrzesień', month: 8 },
	{ label: 'Październik', month: 9 },
	{ label: 'Listopad', month: 10 },
]

/* =======================
   COMPONENT
======================= */
export default function PepperTransactionsRadarChart({ actualTrades }: Props) {
	const series = useMemo(() => {
		const counts = MONTHS.map(
			({ month }) =>
				actualTrades.filter(t => {
					const date = new Date(t.tradeDate)
					return date.getMonth() === month
				}).length,
		)

		return [
			{
				name: 'Liczba transakcji',
				data: counts,
			},
		]
	}, [actualTrades])

	const options: ApexCharts.ApexOptions = {
		chart: {
			type: 'radar',
			toolbar: { show: false },
		},
		xaxis: {
			categories: MONTHS.map(m => m.label),
		},
		stroke: {
			width: 2,
		},
		fill: {
			opacity: 0.25,
		},
		markers: {
			size: 4,
		},
		colors: ['#16a34a'],
		yaxis: {
			labels: {
				formatter: val => Math.round(val).toString(),
			},
		},
		tooltip: {
			y: {
				formatter: val => `${val} transakcji`,
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

import { useMemo } from 'react'
import Chart from 'react-apexcharts'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import ChartCard from '../ui/ChartCard'
import { useFormatUtils } from '../../hooks/useFormatUtils'

type Props = {
	actualTrades: TradeOfPepper[]
}

export default function PepperColorRadialChart({ actualTrades }: Props) {
	const { formatWeight, userWeightUnit } = useFormatUtils()

	const { series, labels, totalKg } = useMemo(() => {
		const grouped: Record<'Czerwona' | 'Żółta' | 'Pomarańczowa' | 'Zielona', number> = {
			Czerwona: 0,
			Żółta: 0,
			Pomarańczowa: 0,
			Zielona: 0,
		}

		actualTrades.forEach(t => {
			if (t.pepperColor in grouped) {
				grouped[t.pepperColor as keyof typeof grouped] += t.tradeWeight
			}
		})

		const values = Object.values(grouped)
		const total = values.reduce((a, b) => a + b, 0)

		return {
			series: values.map(v => (total ? (v / total) * 100 : 0)),
			labels: ['Czerwona', 'Żółta', 'Pomarańczowa', 'Zielona'],
			totalKg: total,
		}
	}, [actualTrades])

	if (!totalKg) return null

	const options = useMemo<ApexCharts.ApexOptions>(
		() => ({
			chart: {
				type: 'radialBar',
			},
			colors: ['#dc2626', '#eab308', '#f97316', '#16a34a'],
			labels,
			stroke: {
				lineCap: 'square',
			},
			plotOptions: {
				radialBar: {
					startAngle: -90,
					endAngle: 270,
					hollow: { size: '55%' },
					track: { background: '#e5e7eb' },
					dataLabels: {
						show: true,
						name: {
							show: true,
							fontSize: '12px',
							offsetY: -10,
						},
						value: {
							show: true,
							fontSize: '14px',
							fontWeight: 600,
							color: '#374151',
							offsetY: 0,
							formatter: (val: number) => formatWeight((totalKg * val) / 100),
						},
						total: {
							show: true,
							label: 'Zbiory łącznie',
							fontSize: '14px',
							fontWeight: 600,
							color: '#374151',
							formatter: () => formatWeight(totalKg),
						},
					},
				},
			},
			tooltip: {
				enabled: true,
				theme: 'dark',
				y: {
					formatter: (val: number) => `${val.toFixed(2)} %`,
				},
			},
			legend: {
				show: true,
				position: 'bottom',
			},
		}),
		[labels, totalKg, formatWeight],
	)

	return (
		<div className='w-full md:w-1/2'>
			<ChartCard title='Wykres zależności udziału zbiorów papryki od koloru'>
				<Chart key={userWeightUnit} type='radialBar' series={series} options={options} height={320} />{' '}
			</ChartCard>
		</div>
	)
}

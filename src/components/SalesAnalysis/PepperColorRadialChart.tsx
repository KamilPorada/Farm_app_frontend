import { useMemo } from 'react'
import Chart from 'react-apexcharts'
import { useMeData } from '../../hooks/useMeData'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import ChartCard from '../ui/ChartCard'

type Props = {
	actualTrades: TradeOfPepper[]
}

/* =======================
   COMPONENT
======================= */
export default function PepperColorRadialChart({ actualTrades }: Props) {
	const { appSettings } = useMeData()

	const { series, labels, totalKg } = useMemo(() => {
		const grouped = {
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
			weightsByColor: values,
		}
	}, [actualTrades])

	function formatWeight(valueKg: number) {
		const unit = appSettings?.weightUnit ?? 'kg'
		const useSeparator = appSettings?.useThousandsSeparator ?? true

		let value = valueKg
		let suffix = 'kg'
		let fractionDigits = 0

		if (unit === 't') {
			value = valueKg / 1000
			suffix = 't'
			fractionDigits = 2
		}

		if (useSeparator) {
			return (
				new Intl.NumberFormat('pl-PL', {
					minimumFractionDigits: fractionDigits,
					maximumFractionDigits: fractionDigits,
				}).format(value) + ` ${suffix}`
			)
		}

		return `${value.toFixed(fractionDigits)} ${suffix}`
	}

	if (!totalKg) return null

	const options: ApexCharts.ApexOptions = {
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

					// 👇 HOVER → KG danego koloru
					value: {
						show: true,
						fontSize: '14px',
						fontWeight: 600,
						color: '#374151',
						offsetY: 0,
						formatter: (val: number) => formatWeight((totalKg * val) / 100),
					},

					// 👇 BRAK HOVER → SUMA KG
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
	}

	return (
		<div className='w-full md:w-1/2'>
			<ChartCard title='Wykres zależności udziału zbiorów papryki od koloru'>
				<Chart type='radialBar' series={series} options={options} height={320} />
			</ChartCard>
		</div>
	)
}

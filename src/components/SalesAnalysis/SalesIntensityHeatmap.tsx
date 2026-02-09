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

export default function SalesIntensityHeatmap({ actualTrades }: Props) {
	const series = useMemo(() => {
		const matrix = SEASON_MONTHS.map(() => Array(31).fill(0))

		const dateCounter: Record<string, number> = {}

		actualTrades.forEach(t => {
			const dateObj = new Date(t.tradeDate)
			const month = dateObj.getMonth()
			const day = dateObj.getDate()

			const monthIdx = SEASON_MONTHS.findIndex(m => m.index === month)
			if (monthIdx === -1) return

			matrix[monthIdx][day - 1] += 1

			const key = dateObj.toISOString().slice(0, 10) 
			dateCounter[key] = (dateCounter[key] ?? 0) + 1
		})

		return SEASON_MONTHS.map((m, monthIdx) => ({
			name: m.label,
			data: Array.from({ length: 31 }, (_, i) => ({
				x: String(i + 1),
				y: matrix[monthIdx][i],
			})),
		}))
	}, [actualTrades])

	if (!series.length) return null

	const options: ApexCharts.ApexOptions = {
		chart: {
			type: 'heatmap',
			toolbar: { show: false },
		},

		plotOptions: {
			heatmap: {
				shadeIntensity: 0.25,
				colorScale: {
					ranges: [
						{ from: 0, to: 0, color: greenPalette[0], name: 'Brak (0)' },

						{ from: 1, to: 1, color: greenPalette[1], name: 'Bardzo niska (1)' },
						{ from: 2, to: 2, color: greenPalette[2], name: 'Niska (2)' },

						{ from: 3, to: 3, color: greenPalette[3], name: 'Umiarkowana (3)' },
						{ from: 4, to: 4, color: greenPalette[4], name: 'Średnia (4)' },

						{ from: 5, to: 5, color: greenPalette[5], name: 'Podwyższona (5)' },
						{ from: 6, to: 6, color: greenPalette[6], name: 'Wysoka (6)' },

						{ from: 7, to: 7, color: greenPalette[7], name: 'Bardzo wysoka (7)' },
						{ from: 8, to: 9999, color: greenPalette[8], name: 'Ekstremalna (8+)' },
					],
				},
			},
		},

		dataLabels: {
			enabled: false,
		},

		xaxis: {
			type: 'category',
			labels: {
				style: {
					fontSize: '10px',
					colors: '#6b7280',
				},
			},
			title: {
				text: 'Dzień miesiąca',
				style: { fontSize: '11px', color: '#6b7280' },
			},
		},

		yaxis: {
			labels: {
				style: {
					fontSize: '12px',
					colors: '#374151',
				},
			},
			title: {
				text: 'Miesiąc',
				style: { fontSize: '11px', color: '#6b7280' },
			},
		},

		tooltip: {
			custom: ({ seriesIndex, dataPointIndex, w }) => {
				const value = w.config.series[seriesIndex].data[dataPointIndex].y
				const month = SEASON_MONTHS[seriesIndex].label
				const day = dataPointIndex + 1

				return `
					<div style="padding:8px 10px;font-size:12px;color:#111827">
						<div style="font-weight:600;margin-bottom:4px">
							${day} ${month.toLowerCase()}
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
		<ChartCard title='Rozkład intensywności sprzedaży w sezonie'>
			<Chart type='heatmap' options={options} series={series} height={360} />
		</ChartCard>
	)
}

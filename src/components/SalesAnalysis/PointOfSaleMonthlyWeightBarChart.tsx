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
	'Styczeń',
	'Luty',
	'Marzec',
	'Kwiecień',
	'Maj',
	'Czerwiec',
	'Lipiec',
	'Sierpień',
	'Wrzesień',
	'Październik',
	'Listopad',
	'Grudzień',
]

export default function PointOfSaleMonthlyWeightBarChart({ actualTrades }: Props) {
	const { convertWeight, formatNumber, getWeightSymbol, userWeightUnit, useThousandsSeparator } = useFormatUtils()

	const weightUnit = getWeightSymbol()

	const { categories, series, rawValues } = useMemo(() => {
		if (!actualTrades.length) {
			return { categories: [], series: [], rawValues: [] }
		}

		const monthlyWeightKg = Array(12).fill(0)

		actualTrades.forEach(t => {
			const month = new Date(t.tradeDate).getMonth()
			monthlyWeightKg[month] += t.tradeWeight
		})

		const categories: string[] = []
		const data: number[] = []
		const rawValues: number[] = []

		monthlyWeightKg.forEach((valKg, i) => {
			if (valKg > 0) {
				const converted = convertWeight(valKg)

				categories.push(MONTHS_PL[i])
				data.push(converted)
				rawValues.push(converted)
			}
		})

		return {
			categories,
			rawValues,
			series: [
				{
					name: `Sprzedaż (${weightUnit})`,
					data,
				},
			],
		}
	}, [actualTrades, convertWeight, weightUnit])

	if (!series.length) return null


	const options: ApexCharts.ApexOptions = {
		chart: {
			type: 'bar',
			toolbar: { show: false },
		},
		colors: [greenPalette[5]],
		plotOptions: {
			bar: {
				horizontal: false,
				borderRadius: 0,
				columnWidth: '35%',
			},
		},
		dataLabels: {
			enabled: false,
		},
		grid: {
			strokeDashArray: 0,
			borderColor: '#e5e7eb',
		},
		xaxis: {
			categories,
			labels: {
				style: {
					colors: '#6b7280',
					fontSize: '11px',
				},
			},
			axisBorder: { show: false },
			axisTicks: { show: false },
		},
		yaxis: {
			labels: {
				style: {
					colors: '#6b7280',
					fontSize: '11px',
				},
				formatter: val => `${formatNumber(val)} ${weightUnit}`,
			},
		},
		tooltip: {
			shared: false,
			custom: ({ dataPointIndex }) => {
				const month = categories[dataPointIndex]
				const value = rawValues[dataPointIndex]

				if (!month || value === undefined) return ''

				return `
					<div style="padding:8px 10px;font-size:12px;color:#111827">
						<div style="font-weight:600;margin-bottom:4px">
							${month}
						</div>
						<div>
							Sprzedaż:
							<strong>
								${formatNumber(value)} ${weightUnit}
							</strong>
						</div>
					</div>
				`
			},
		},
	}

	return (
		<div className='w-full md:w-1/2'>
			<ChartCard title='Sprzedaż punktu sprzedaży wg miesięcy'>
				<Chart type='bar' options={options} series={series} height={280} />
			</ChartCard>
		</div>
	)
}

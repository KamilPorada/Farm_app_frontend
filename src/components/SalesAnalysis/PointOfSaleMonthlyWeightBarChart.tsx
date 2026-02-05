import { useMemo } from 'react'
import Chart from 'react-apexcharts'
import ChartCard from '../ui/ChartCard'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import { greenPalette } from '../../theme/greenPalette'
import { useMeData } from '../../hooks/useMeData'

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

/* =======================
   HELPERS
======================= */
function convertWeight(valueKg: number, unit: 'kg' | 't') {
	return unit === 't' ? valueKg / 1000 : valueKg
}

function formatWeight(
	value: number,
	unit: 'kg' | 't',
	useSeparator: boolean,
) {
	const decimals = unit === 't' ? 2 : 0

	return useSeparator
		? new Intl.NumberFormat('pl-PL', {
				minimumFractionDigits: decimals,
				maximumFractionDigits: decimals,
			}).format(value)
		: value.toFixed(decimals)
}

/* =======================
   COMPONENT
======================= */
export default function PointOfSaleMonthlyWeightBarChart({ actualTrades }: Props) {
	const { appSettings } = useMeData()

	const weightUnit: 'kg' | 't' =
		appSettings?.weightUnit === 't' ? 't' : 'kg'

	const useSeparator = appSettings?.useThousandsSeparator ?? true

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
				const converted = convertWeight(valKg, weightUnit)

				categories.push(MONTHS_PL[i])
				data.push(+converted.toFixed(weightUnit === 't' ? 2 : 0))
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
	}, [actualTrades, weightUnit])

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
				formatter: val =>
					`${formatWeight(
						Number(val),
						weightUnit,
						useSeparator,
					)} ${weightUnit}`,
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
								${formatWeight(
									value,
									weightUnit,
									true,
								)} ${weightUnit}
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

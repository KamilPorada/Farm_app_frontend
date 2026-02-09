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

export default function PointOfSaleMonthlyRevenueBarChart({ actualTrades }: Props) {
	const {
		userCurrency,
		formatNumber,
		getCurrencySymbol,
		toEURO,
		isCurrencyReady,
	} = useFormatUtils()

	const currencySymbol = getCurrencySymbol()

	const { categories, series, rawValues } = useMemo(() => {
		if (!actualTrades.length || !isCurrencyReady) {
			return { categories: [], series: [], rawValues: [] }
		}

		const monthlyRevenuePln = Array(12).fill(0)

		actualTrades.forEach(t => {
			const month = new Date(t.tradeDate).getMonth()
			monthlyRevenuePln[month] +=
				t.tradeWeight * t.tradePrice * (1 + t.vatRate / 100)
		})

		const categories: string[] = []
		const data: number[] = []
		const rawValues: number[] = []

		monthlyRevenuePln.forEach((val, i) => {
			if (val > 0) {
				const converted = userCurrency === 'EUR' ? toEURO(val) : val

				categories.push(MONTHS_PL[i])
				data.push(Math.round(converted))
				rawValues.push(converted)
			}
		})

		return {
			categories,
			rawValues,
			series: [
				{
					name: 'Dochód',
					data,
				},
			],
		}
	}, [actualTrades, userCurrency, toEURO, isCurrencyReady])

	if (!series.length) return null

	const options: ApexCharts.ApexOptions = {
		chart: {
			type: 'bar',
			toolbar: { show: false },
		},
		colors: [greenPalette[5]],
		plotOptions: {
			bar: {
				horizontal: true,
				borderRadius: 0,
				barHeight: '35%',
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
				formatter: val => {
					const n = Number(val)
					if (!n) return '0'
					return `${Math.round(n / 1000)} tys. ${currencySymbol}`
				},
			},
		},
		yaxis: {
			labels: {
				style: {
					colors: '#374151',
					fontSize: '12px',
				},
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
							Dochód:
							<strong>
								${formatNumber(Math.round(value))} ${currencySymbol}
							</strong>
						</div>
					</div>
				`
			},
		},
	}

	return (
		<div className='w-full md:w-1/2'>
			<ChartCard title='Dochód punktu sprzedaży wg miesięcy'>
				<Chart type='bar' options={options} series={series} height={280} />
			</ChartCard>
		</div>
	)
}

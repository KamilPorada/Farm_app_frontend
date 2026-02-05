import { useMemo } from 'react'
import Chart from 'react-apexcharts'
import ChartCard from '../ui/ChartCard'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import { greenPalette } from '../../theme/greenPalette'
import { useCurrencyRate } from '../../hooks/useCurrencyRate'

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

function convertCurrency(valuePln: number, currency: 'PLN' | 'EUR', eurRate?: number) {
	if (currency === 'EUR' && eurRate) {
		return valuePln / eurRate
	}
	return valuePln
}

function formatThousands(value: number, currency: 'PLN' | 'EUR') {
	if (!value) return '0'
	const rounded = Math.round(value / 1000)
	return `${rounded} tyś. ${currency === 'EUR' ? '€' : 'zł'}`
}

/* =======================
   COMPONENT
======================= */
export default function PointOfSaleMonthlyRevenueBarChart({ actualTrades }: Props) {
	const { currency, eurRate } = useCurrencyRate()

	const { categories, series, rawValues } = useMemo(() => {
		if (!actualTrades.length) {
			return { categories: [], series: [], rawValues: [] }
		}

		const monthlyRevenuePln = Array(12).fill(0)

		actualTrades.forEach(t => {
			const month = new Date(t.tradeDate).getMonth()
			monthlyRevenuePln[month] += t.tradeWeight * t.tradePrice * (1 + t.vatRate / 100)
		})

		const categories: string[] = []
		const data: number[] = []
		const rawValues: number[] = []

		monthlyRevenuePln.forEach((val, i) => {
			if (val > 0) {
				const converted = convertCurrency(val, currency, eurRate)

				categories.push(MONTHS_PL[i])
				data.push(+converted.toFixed(0))
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
	}, [actualTrades, currency, eurRate])

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
				dataLabels: {
					position: 'center',
				},
			},
		},

		/* ✅ TEKST NA BARACH */
		dataLabels: {
			enabled: false,
		},

		grid: {
			strokeDashArray: 0,
			borderColor: '#e5e7eb',
		},

		xaxis: {
			categories, // ✅ TO JEST KLUCZ
			labels: {
				style: {
					colors: '#6b7280',
					fontSize: '11px',
				},
				formatter: val => formatThousands(Number(val), currency),
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
								${value.toLocaleString('pl-PL', { maximumFractionDigits: 0 })}
								${currency === 'EUR' ? ' €' : ' zł'}
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

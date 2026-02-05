import React, { useMemo } from 'react'
import Chart from 'react-apexcharts'
import ChartCard from '../ui/ChartCard'
import { greenPalette } from '../../theme/greenPalette'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import { useMeData } from '../../hooks/useMeData'
import { useCurrencyRate } from '../../hooks/useCurrencyRate'

type Props = {
	actualTrades: TradeOfPepper[]
}

const MONTHS = [
	{ key: 6, label: 'Lipiec' },
	{ key: 7, label: 'Sierpień' },
	{ key: 8, label: 'Wrzesień' },
	{ key: 9, label: 'Październik' },
	{ key: 10, label: 'Listopad' },
]

/* =======================
   HELPERS
======================= */
function formatNumber(
	value: number,
	useSeparator: boolean,
	decimals: number,
) {
	return useSeparator
		? new Intl.NumberFormat('pl-PL', {
				minimumFractionDigits: decimals,
				maximumFractionDigits: decimals,
			}).format(value)
		: value.toFixed(decimals)
}

function convertCurrency(
	valuePln: number,
	currency: 'PLN' | 'EUR',
	eurRate?: number,
) {
	if (currency === 'EUR' && eurRate) {
		return valuePln / eurRate
	}
	return valuePln
}

function convertWeight(valueKg: number, unit: 'kg' | 't') {
	return unit === 't' ? valueKg / 1000 : valueKg
}

/* =======================
   COMPONENT
======================= */
export default function TradesAndHarvestByMonthChart({
	actualTrades,
}: Props) {
	const { appSettings } = useMeData()
	const { currency, eurRate } = useCurrencyRate()

	const useSeparator = appSettings?.useThousandsSeparator ?? true
	const weightUnit: 'kg' | 't' =
		appSettings?.weightUnit === 't' ? 't' : 'kg'

	/* =======================
	   AGREGACJA DANYCH
	======================= */
	const { profitByMonth, weightByMonth } = useMemo(() => {
		const profit = Array(5).fill(0)
		const weight = Array(5).fill(0)

		actualTrades.forEach(t => {
			const d = new Date(t.tradeDate)
			const m = d.getMonth()

			const monthIndex = MONTHS.findIndex(mm => mm.key === m)
			if (monthIndex === -1) return

			const gross =
				t.tradePrice * t.tradeWeight * (1 + t.vatRate / 100)

			profit[monthIndex] += gross
			weight[monthIndex] += t.tradeWeight
		})

		return {
			profitByMonth: profit,
			weightByMonth: weight,
		}
	}, [actualTrades])

	/* =======================
	   KONWERSJE
	======================= */
	const profitData = profitByMonth.map(v =>
		convertCurrency(v, currency, eurRate),
	)

	const weightData = weightByMonth.map(v =>
		convertWeight(v, weightUnit),
	)

	const currencySymbol = currency === 'EUR' ? '€' : 'zł'

	/* =======================
	   SERIE
	======================= */
	const series = [
		{
			name: `Dochód (${currencySymbol})`,
			data: profitData,
		},
		{
			name: `Zbiory (${weightUnit})`,
			data: weightData,
		},
	]

	/* =======================
	   OPCJE
	======================= */
	const options: ApexCharts.ApexOptions = {
		chart: {
			type: 'bar',
			toolbar: { show: false },
			fontFamily: 'inherit',
		},

		plotOptions: {
			bar: {
				columnWidth: '40%',
				borderRadius: 0,
			},
		},

		dataLabels: { enabled: false },

		colors: [greenPalette[5], greenPalette[2]],

		states: {
			hover: { filter: { type: 'none' } },
			active: { filter: { type: 'none' } },
		},

		xaxis: {
			categories: MONTHS.map(m => m.label),
			axisBorder: { show: false },
			axisTicks: { show: false },
		},

		yaxis: [
			{
				title: { text: `Dochód (${currencySymbol})` },
				labels: {
					formatter: v =>
						`${formatNumber(v, useSeparator, 0)} ${currencySymbol}`,
				},
			},
			{
				opposite: true,
				title: { text: `Zbiory (${weightUnit})` },
				labels: {
					formatter: v =>
						`${formatNumber(
							v,
							useSeparator,
							weightUnit === 't' ? 2 : 0,
						)} ${weightUnit}`,
				},
			},
		],

		legend: {
			show: true,
			position: 'bottom',
			horizontalAlign: 'center',
			fontSize: '12px',
			markers: {
				size: 8,
				shape: 'square',
			},
		},

		tooltip: {
			shared: true,
			intersect: false,
			y: {
				formatter: (val, { seriesIndex }) =>
					seriesIndex === 0
						? `${formatNumber(val, true, 2)} ${currencySymbol}`
						: `${formatNumber(
								val,
								true,
								weightUnit === 't' ? 2 : 0,
						  )} ${weightUnit}`,
			},
		},

		grid: {
			strokeDashArray: 0,
			borderColor: '#dddddd',
		},
	}

	return (
		<ChartCard title='Wykres zależności dochodu oraz masy zbiorów w ujęciu miesięcznym'>
			<div className='h-[260px] md:h-[350px] w-full'>
				<Chart
					options={options}
					series={series}
					type='bar'
					height='100%'
					width='100%'
				/>
			</div>
		</ChartCard>
	)
}

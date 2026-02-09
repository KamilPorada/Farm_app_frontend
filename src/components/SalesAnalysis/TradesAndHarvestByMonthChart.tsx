import React, { useMemo } from 'react'
import Chart from 'react-apexcharts'
import ChartCard from '../ui/ChartCard'
import { greenPalette } from '../../theme/greenPalette'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import { useFormatUtils } from '../../hooks/useFormatUtils'

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

function aggregateTrades(trades: TradeOfPepper[]) {
	const profit = Array(5).fill(0) 
	const weight = Array(5).fill(0) 

	trades.forEach(t => {
		const d = new Date(t.tradeDate)
		const m = d.getMonth()

		const monthIndex = MONTHS.findIndex(mm => mm.key === m)
		if (monthIndex === -1) return

		const net = t.tradePrice * t.tradeWeight
		const gross = net * (1 + t.vatRate / 100)

		profit[monthIndex] += gross
		weight[monthIndex] += t.tradeWeight
	})

	return { profit, weight }
}

export default function TradesAndHarvestByMonthChart({ actualTrades }: Props) {
	const {
		userCurrency,
		userWeightUnit,
		formatNumber,
		toEURO,
		convertWeight,
		getCurrencySymbol,
		getWeightSymbol,
	} = useFormatUtils()

	const { profit, weight } = useMemo(
		() => aggregateTrades(actualTrades),
		[actualTrades],
	)

	const profitData =
		userCurrency === 'EUR'
			? profit.map(v => toEURO(v))
			: profit

	const weightData =
		userWeightUnit === 't'
			? weight.map(v => convertWeight(v))
			: weight

	const currencySymbol = getCurrencySymbol()
	const weightSymbol = getWeightSymbol()

	const series = [
		{
			name: `Dochód (${currencySymbol})`,
			data: profitData,
		},
		{
			name: `Zbiory (${weightSymbol})`,
			data: weightData,
		},
	]

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

		xaxis: {
			categories: MONTHS.map(m => m.label),
			axisBorder: { show: false },
			axisTicks: { show: false },
		},

		yaxis: [
			{
				title: { text: `Dochód (${currencySymbol})` },
				labels: {
					formatter: v => `${formatNumber(v)} ${currencySymbol}`,
				},
			},
			{
				opposite: true,
				title: { text: `Zbiory (${weightSymbol})` },
				labels: {
					formatter: v =>
						`${formatNumber(
							v,
						)} ${weightSymbol}`,
				},
			},
		],

		tooltip: {
			shared: true,
			intersect: false,
			y: {
				formatter: (val, { seriesIndex }) =>
					seriesIndex === 0
						? `${formatNumber(val)} ${currencySymbol}`
						: `${formatNumber(val)} ${weightSymbol}`,
			},
		},

		legend: {
			position: 'bottom',
			fontSize: '12px',
			markers: { size: 8 },
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

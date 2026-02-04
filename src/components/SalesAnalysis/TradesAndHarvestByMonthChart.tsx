import React, { useEffect, useMemo, useState } from 'react'
import Chart from 'react-apexcharts'
import ChartCard from '../ui/ChartCard'
import { greenPalette } from '../../theme/greenPalette'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import { useMeData } from '../../hooks/useMeData'

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

export default function TradesAndHarvestByMonthChart({ actualTrades }: Props) {
	const { appSettings } = useMeData()
	const [eurRate, setEurRate] = useState(1)

	/* =======================
	   KURS EUR
	======================= */
	useEffect(() => {
		if (appSettings?.currency !== 'EUR') return

		async function fetchRate() {
			try {
				const res = await fetch('https://api.nbp.pl/api/exchangerates/rates/a/eur/?format=json')
				const data = await res.json()
				setEurRate(data.rates[0].mid)
			} catch {
				setEurRate(1)
			}
		}

		fetchRate()
	}, [appSettings?.currency])

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

			const net = t.tradePrice * t.tradeWeight
			const gross = net * (1 + t.vatRate / 100)

			profit[monthIndex] += gross
			weight[monthIndex] += t.tradeWeight
		})

		return {
			profitByMonth: profit.map(v => Math.round(v * 100) / 100),
			weightByMonth: weight,
		}
	}, [actualTrades])

	/* =======================
	   DANE PO USTAWIENIACH
	======================= */
	const currencySymbol = appSettings?.currency === 'EUR' ? '€' : 'zł'
	const weightUnit = appSettings?.weightUnit === 't' ? 't' : 'kg'

	const profitData = appSettings?.currency === 'EUR' ? profitByMonth.map(v => v / eurRate) : profitByMonth

	const weightData = appSettings?.weightUnit === 't' ? weightByMonth.map(v => v / 1000) : weightByMonth

	const numberFormatter = (value: number, decimals = 0) => {
		const fixed = value.toFixed(decimals)
		if (!appSettings?.useThousandsSeparator) return fixed
		return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
	}

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

		dataLabels: {
			enabled: false,
		},

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
					formatter: v => `${numberFormatter(v, 0)} ${currencySymbol}`,
				},
			},
			{
				opposite: true,
				title: { text: `Zbiory (${weightUnit})` },
				labels: {
					formatter: v => `${numberFormatter(v, weightUnit === 't' ? 2 : 0)} ${weightUnit}`,
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
				shape: 'square', // albo 'circle'
			},
		},

		tooltip: {
			shared: true,
			intersect: false,
			y: {
				formatter: (val, { seriesIndex }) =>
					seriesIndex === 0
						? `${numberFormatter(val, 2)} ${currencySymbol}`
						: `${numberFormatter(val, weightUnit === 't' ? 2 : 0)} ${weightUnit}`,
			},
		},

		grid: {
			strokeDashArray: 0,
			borderColor: '#dddddd',
		},
		responsive: [
			{
				breakpoint: 768, // mobile + small tablets
				options: {
					plotOptions: {
						bar: {
							columnWidth: '65%',
						},
					},

					xaxis: {
						labels: {
							rotate: -45,
							style: {
								fontSize: '10px',
							},
						},
					},

					yaxis: [
						{
							title: { text: '' },
							labels: {
								style: { fontSize: '10px' },
							},
						},
					],

					legend: {
						position: 'bottom',
						fontSize: '11px',
						itemMargin: {
							horizontal: 8,
							vertical: 4,
						},
					},

					chart: {
						height: 260,
					},
				},
			},
		],
	}

	return (
		<ChartCard title='Wykres zależności dochodu oraz masy zbiorów w ujęciu miesięcznym'>
			<div className='h-[260px] md:h-[350px] w-full'>
				<Chart options={options} series={series} type='bar' height='100%' width='100%' />
			</div>
		</ChartCard>
	)
}

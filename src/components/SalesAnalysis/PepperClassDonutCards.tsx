import React, { useMemo } from 'react'
import Chart from 'react-apexcharts'
import ChartCard from '../ui/ChartCard'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import { greenPalette } from '../../theme/greenPalette'
import { useMeData } from '../../hooks/useMeData'

type Props = {
	actualTrades: TradeOfPepper[]
}

/* =======================
   HELPERS
======================= */
function sumWeight(trades: TradeOfPepper[]) {
	return trades.reduce((acc, t) => acc + t.tradeWeight, 0)
}

/* =======================
   SINGLE CARD
======================= */
function PepperClassCard({
	title,
	weight,
	percent,
	color,
}: {
	title: string
	weight: number
	percent: number
	color: string
}) {
	const { appSettings } = useMeData()
	const series = [Number(percent.toFixed(2))]

	function formatWeight(valueKg: number, settings: any) {
		const unit = settings?.weightUnit ?? 'kg'
		const useSeparator = settings?.useThousandsSeparator ?? false

		let value = valueKg
		let suffix = 'kg'

		if (unit === 't') {
			value = valueKg / 1000
			suffix = 't'
		}

		const formatted = useSeparator
			? new Intl.NumberFormat('pl-PL', {
					maximumFractionDigits: unit === 't' ? 2 : 0,
				}).format(value)
			: unit === 't'
				? value.toFixed(2)
				: value.toFixed(0)

		return `${formatted} ${suffix}`
	}

	const options: ApexCharts.ApexOptions = {
		chart: {
			type: 'radialBar',
			sparkline: {
				enabled: true,
			},
		},
		colors: [color],
		states: {
			hover: { filter: { type: 'none' } },
			active: { filter: { type: 'none' } },
		},
		stroke: {
			lineCap: 'square',
		},
		dataLabels: {
			enabled: false, // ❗ globalnie OFF
		},
		plotOptions: {
			radialBar: {
				startAngle: -90,
				endAngle: 270,
				hollow: {
					size: '58%', // ✅ GRUBO
				},
				track: {
					background: '#e5e7eb',
					strokeWidth: '60%',
				},
				dataLabels: {
					show: true,
					name: {
						show: false,
					},
					value: {
						show: true,
						fontSize: '15px',
						fontWeight: 600,
						color: '#111827',
						offsetY: 4,
						formatter: (val: number) => `${val.toFixed(2)}%`,
					},
				},
			},
		},

		tooltip: {
			enabled: false,
		},
	}

	return (
		<div className='relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 p-3 shadow-sm'>
			{/* accent */}
			<div className='absolute left-0 top-0 h-full w-1' style={{ backgroundColor: color }} />

			<div className='flex items-center justify-between pl-4'>
				{/* LEFT */}
				<div className='space-y-0.5'>
					<p className='text-xs text-gray-500 leading-tight'>{title}</p>

					<p className='text-xl font-semibold text-gray-900 leading-tight'>{formatWeight(weight, appSettings)}</p>

					<p className='text-[11px] text-gray-500 leading-tight'>udział w sezonie</p>
				</div>

				{/* RIGHT */}
				<div className='w-[110px] h-[110px] shrink-0'>
					<Chart type='radialBar' series={series} options={options} height={110} />
				</div>
			</div>
		</div>
	)
}

/* =======================
   MAIN COMPONENT
======================= */
export default function PepperClassDonutCards({ actualTrades }: Props) {
	const { total, class1, class2, class3 } = useMemo(() => {
		const c1 = actualTrades.filter(t => t.pepperClass === 1)
		const c2 = actualTrades.filter(t => t.pepperClass === 2)
		const c3 = actualTrades.filter(t => t.pepperClass === 3)

		const w1 = sumWeight(c1)
		const w2 = sumWeight(c2)
		const w3 = sumWeight(c3)

		return {
			total: w1 + w2 + w3,
			class1: w1,
			class2: w2,
			class3: w3,
		}
	}, [actualTrades])

	if (!total) return null

	return (
		<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
			<PepperClassCard
				title='Papryka – klasa I'
				weight={class1}
				percent={(class1 / total) * 100}
				color={greenPalette[5]}
			/>

			<PepperClassCard
				title='Papryka – klasa II'
				weight={class2}
				percent={(class2 / total) * 100}
				color={greenPalette[5]}
			/>

			<PepperClassCard
				title='Papryka – klasa krojona'
				weight={class3}
				percent={(class3 / total) * 100}
				color={greenPalette[5]}
			/>
		</div>
	)
}

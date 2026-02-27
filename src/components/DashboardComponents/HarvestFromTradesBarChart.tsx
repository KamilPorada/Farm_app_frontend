import { useEffect, useMemo, useState } from 'react'
import Chart from 'react-apexcharts'
import { useAuthUser } from '../../hooks/useAuthUser'
import { useFormatUtils } from '../../hooks/useFormatUtils'
import { notify } from '../../utils/notify'
import { useMeData } from '../../hooks/useMeData'
import { useCountUp } from '../../hooks/useCountUp'

type Props = {
	seasonYear: number
	currentDate: string
}

type Trade = {
	tradeDate: string
	tradeWeight: number
}

function formatRange(from: Date, to: Date) {
	const fDay = from.getDate()
	const tDay = to.getDate()
	const month = from.toLocaleDateString('pl-PL', { month: 'long' })
	return `${fDay}–${tDay} ${month}`
}

export default function SoldWeightBarChart({ seasonYear, currentDate }: Props) {
	const { user, getToken } = useAuthUser()
	const { appSettings } = useMeData()
	const notificationsEnabled = appSettings?.notificationsEnabled

	const { formatNumber, convertWeight, getWeightSymbol } = useFormatUtils()

	const weightSymbol = getWeightSymbol()

	const [trades, setTrades] = useState<Trade[]>([])
	const [loading, setLoading] = useState(true)

	const selectedDate = new Date(currentDate)

	// ===== FETCH =====
	useEffect(() => {
		if (!user?.id) return

		const load = async () => {
			try {
				setLoading(true)
				const token = await getToken()

				const res = await fetch(`http://localhost:8080/api/trades-of-pepper/farmer/${user.id}/year/${seasonYear}`, {
					headers: { Authorization: `Bearer ${token}` },
				})

				if (!res.ok) throw new Error()

				setTrades(await res.json())
			} catch {
				notify(notificationsEnabled, 'error', 'Nie udało się pobrać sprzedaży')
			} finally {
				setLoading(false)
			}
		}

		load()
	}, [user, seasonYear])

	// ===== FILTR DO DATY =====
	const filteredTrades = useMemo(
		() => trades.filter(t => new Date(t.tradeDate) <= selectedDate),
		[trades, selectedDate],
	)

	const hasData = filteredTrades.length > 0

	// ===== INTERWAŁY 10 DNI =====
	const intervals = useMemo(() => {
		if (!filteredTrades.length) return []

		const sorted = [...filteredTrades].sort((a, b) => +new Date(a.tradeDate) - +new Date(b.tradeDate))

		const start = new Date(sorted[0].tradeDate)
		const end = new Date(sorted[sorted.length - 1].tradeDate)

		const result: {
			value: number
			from: Date
			to: Date
			monthIndex: number
			monthLabel: string
		}[] = []

		let cursor = new Date(start)

		while (cursor <= end) {
			const from = new Date(cursor)
			const to = new Date(cursor)
			to.setDate(to.getDate() + 9)

			const weight = sorted
				.filter(t => {
					const d = new Date(t.tradeDate)
					return d >= from && d <= to
				})
				.reduce((sum, t) => sum + (t.tradeWeight || 0), 0)

			if (weight > 0) {
				result.push({
					value: convertWeight(weight),
					from,
					to,
					monthIndex: from.getMonth(),
					monthLabel: from.toLocaleDateString('pl-PL', { month: 'long' }),
				})
			}

			cursor.setDate(cursor.getDate() + 10)
		}

		return result
	}, [filteredTrades, convertWeight])

	// ===== ETYKIETY MIESIĘCY (bez duplikatów) =====
	const monthLabels = useMemo(() => {
		let lastMonth: number | null = null

		return intervals.map(i => {
			if (i.monthIndex !== lastMonth) {
				lastMonth = i.monthIndex
				return i.monthLabel
			}
			return ''
		})
	}, [intervals])

	// ===== SUMA =====
	const totalWeight = intervals.reduce((s, i) => s + i.value, 0)
	const totalAnimated = useCountUp(totalWeight)

	const series = [
		{
			name: 'Sprzedano',
			data: intervals.map(i => i.value),
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
				columnWidth: '45%',
			},
		},

		colors: ['#76b82a'],

		dataLabels: { enabled: false },

		grid: { show: false },

		xaxis: {
			categories: monthLabels,
			labels: {
				rotate: 0,
				style: {
					fontSize: '12px',
					colors: '#6b7280',
				},
			},
			axisBorder: { show: false },
			axisTicks: { show: false },
		},

		yaxis: {
			labels: {
				formatter: v => `${Math.round(v).toLocaleString()} ${weightSymbol}`,
				style: {
					fontSize: '12px',
					colors: '#6b7280',
				},
			},
		},

		tooltip: {
			custom: ({ dataPointIndex }) => {
				const point = intervals[dataPointIndex]
				if (!point) return ''

				return `
					<div style="padding:8px 10px;font-size:12px">
						<div style="font-weight:600;margin-bottom:4px">
							${formatRange(point.from, point.to)}
						</div>
						<div>
							Sprzedano:
							<strong>
								${formatNumber(point.value)} ${weightSymbol}
							</strong>
						</div>
					</div>
				`
			},
		},
	}

	if (loading) {
		return <div className='h-[170px] rounded-2xl bg-gray-100 animate-pulse' />
	}

	if (!hasData) {
		return (
			<div className='rounded-2xl bg-gray-50 border border-gray-100 shadow-sm p-4 h-[230px] w-full flex flex-col items-center justify-center text-center'>
				<p className='text-base font-medium text-gray-700'>
					Brak odnotowanej sprzedaży
				</p>
				<p className='mt-2 text-sm text-gray-500 max-w-[260px]'>
					Dodaj pierwszą sprzedaż papryki, aby zobaczyć podsumowanie zbiorów w sezonie.
				</p>
			</div>
		)
	}

	return (
		<div className='relative rounded-2xl bg-white shadow-sm border border-gray-100 p-4 h-[230px] w-full'>
			<h2 className='absolute top-3 text-xs text-gray-500'>Kształtowanie się zbiorów w sezonie</h2>

			{/* SUMA */}
			<div className='absolute top-3 right-4 text-right'>
				<div className='text-xs text-gray-500'>Sprzedano</div>
				<div className='text-lg font-semibold text-gray-900'>
					{formatNumber(totalAnimated)} {weightSymbol}
				</div>
			</div>

			<div className='absolute inset-x-3 bottom-3 top-4'>
				<Chart options={options} series={series} type='bar' height='100%' />
			</div>
		</div>
	)
}

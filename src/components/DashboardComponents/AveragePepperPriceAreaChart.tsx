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
	tradePrice: number
	tradeWeight: number
	vatRate: number
}

function getAvgPrice(trades: Trade[]) {
	let kg = 0
	let gross = 0

	trades.forEach(t => {
		const g = t.tradePrice * t.tradeWeight * (1 + t.vatRate / 100)
		kg += t.tradeWeight
		gross += g
	})

	return kg ? gross / kg : 0
}

function formatIntervalRange(from: Date, to: Date) {
	const fromDay = from.getDate()
	const toDay = to.getDate()

	const fromMonth = from.toLocaleDateString('pl-PL', { month: 'long' })
	const toMonth = to.toLocaleDateString('pl-PL', { month: 'long' })

	if (fromMonth === toMonth) {
		return `${fromDay}–${toDay} ${fromMonth}`
	}

	return `${fromDay} ${fromMonth} – ${toDay} ${toMonth}`
}

export default function AveragePepperPriceAreaChart({ seasonYear, currentDate }: Props) {
	const { user, getToken } = useAuthUser()
	const { appSettings } = useMeData()
	const notificationsEnabled = appSettings?.notificationsEnabled

	const { userCurrency, toEURO, formatNumber, getCurrencySymbol } = useFormatUtils()
	const currencySymbol = getCurrencySymbol()

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
	const intervalData = useMemo(() => {
		if (!filteredTrades.length) return []

		const sorted = [...filteredTrades].sort((a, b) => +new Date(a.tradeDate) - +new Date(b.tradeDate))

		const start = new Date(sorted[0].tradeDate)
		const end = new Date(sorted[sorted.length - 1].tradeDate)

		const result: {
			from: Date
			to: Date
			value: number
			monthIndex: number
			monthLabel: string
		}[] = []

		let cursor = new Date(start)

		while (cursor <= end) {
			const from = new Date(cursor)
			const to = new Date(cursor)
			to.setDate(to.getDate() + 9)

			const inInterval = sorted.filter(t => {
				const d = new Date(t.tradeDate)
				return d >= from && d <= to
			})

			if (inInterval.length) {
				result.push({
					from,
					to,
					value: getAvgPrice(inInterval),
					monthIndex: from.getMonth(),
					monthLabel: from.toLocaleDateString('pl-PL', { month: 'long' }),
				})
			}

			cursor.setDate(cursor.getDate() + 10)
		}

		return result
	}, [filteredTrades])

	// ✅ miesiąc tylko raz
	const xLabels = useMemo(() => {
		let lastMonth: number | null = null

		return intervalData.map(point => {
			if (point.monthIndex !== lastMonth) {
				lastMonth = point.monthIndex
				return point.monthLabel
			}
			return ''
		})
	}, [intervalData])

	const seasonAvg = useMemo(() => {
		const avg = getAvgPrice(filteredTrades)
		return userCurrency === 'EUR' ? toEURO(avg) : avg
	}, [filteredTrades, userCurrency, toEURO])

	const avgAnimated = useCountUp(seasonAvg)

	const chartSeries = [
		{
			name: 'Średnia cena',
			data: intervalData.map(p => (userCurrency === 'EUR' ? toEURO(p.value) : p.value)),
		},
	]

	const options: ApexCharts.ApexOptions = {
		chart: {
			type: 'area',
			toolbar: { show: false },
			zoom: { enabled: false },
			fontFamily: 'inherit',
		},
		stroke: {
			curve: 'smooth',
			width: 2,
		},
		fill: {
			type: 'gradient',
			gradient: {
				opacityFrom: 0.9,
				opacityTo: 0,
			},
		},
		colors: ['#5fab18'],
		dataLabels: { enabled: false },

		grid: { show: false },

		xaxis: {
			categories: xLabels,
			axisBorder: { show: false },
			axisTicks: { show: false },
			labels: {
				style: {
					fontSize: '12px',
					colors: '#6b7280',
				},
			},
		},

		yaxis: {
			labels: {
				formatter: v => `${formatNumber(v)} ${currencySymbol}`,
				style: {
					fontSize: '12px',
					colors: '#6b7280',
				},
			},
		},

		tooltip: {
			custom: ({ dataPointIndex }) => {
				const point = intervalData[dataPointIndex]
				if (!point) return ''

				const value = userCurrency === 'EUR' ? toEURO(point.value) : point.value

				return `
					<div style="padding:8px 10px;font-size:12px">
						<div style="font-weight:600;margin-bottom:4px">
							${formatIntervalRange(point.from, point.to)}
						</div>
						<div>
							Średnia cena:
							<strong>
								${formatNumber(value)} ${currencySymbol}/kg
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
				<p className='text-base font-medium text-gray-700'>Brak odnotowanych transakcji</p>
				<p className='mt-2 text-sm text-gray-500 max-w-[260px]'>
					Dodaj pierwszą sprzedaż papryki, aby zobaczyć kształtowanie się cen w sezonie.
				</p>
			</div>
		)
	}

	return (
		<div className='relative rounded-2xl bg-white shadow-sm border border-gray-100 p-4 h-[230px] w-full'>
			{/* średnia */}
			<h2 className='absolute top-3 text-xs text-gray-500'>Kształtowanie się cen w sezonie</h2>
			<div className='absolute top-3 right-4 text-right'>
				<div className='text-xs text-gray-500'>Średnia cena</div>
				<div className='text-lg font-semibold text-gray-900'>
					{formatNumber(avgAnimated)} {currencySymbol}/kg
				</div>
			</div>

			<div className='absolute inset-x-3 bottom-3 top-4'>
				<Chart options={options} series={chartSeries} type='area' height='100%' />
			</div>
		</div>
	)
}

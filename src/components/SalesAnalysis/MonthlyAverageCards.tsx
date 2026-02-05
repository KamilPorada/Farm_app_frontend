type Trend = {
	direction: 'up' | 'down' | 'same'
	diff: number
}

type MonthItem = {
	month: string
	avg: number // zawsze w PLN
}

type Currency = 'PLN' | 'EUR'

type Props = {
	items: MonthItem[]
	seasonAvg: number // zawsze w PLN
	currency: Currency
	eurRate: number
}

/* =======================
   TREND BADGE
======================= */
function TrendBadge({
	trend,
	unit,
	decimals = 2,
}: {
	trend: Trend
	unit: string
	decimals?: number
}) {
	const cfg = {
		up: 'bg-green-50 text-green-700 border-green-200',
		down: 'bg-red-50 text-red-700 border-red-200',
		same: 'bg-gray-100 text-gray-500 border-gray-200',
	}[trend.direction]

	const icon = trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'

	return (
		<span
			className={`
				inline-flex items-center gap-1
				rounded-full border px-2 py-[2px]
				text-[11px] font-medium
				${cfg}
			`}
		>
			{icon}
			{Math.abs(trend.diff).toFixed(decimals)}
			<span className='ml-0.5'>{unit}</span>
		</span>
	)
}

/* =======================
   COMPONENT
======================= */
export function MonthlyAverageCards({
	items,
	seasonAvg,
	currency,
	eurRate,
}: Props) {
	return (
		<div className='grid grid-cols-1 gap-3'>
			{items.map(m => {
				const value = currency === 'EUR' ? m.avg / eurRate : m.avg
				const seasonValue = currency === 'EUR' ? seasonAvg / eurRate : seasonAvg
				const diff = value - seasonValue

				const trend: Trend = {
					direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same',
					diff,
				}

				const unit = currency === 'EUR' ? '€' : 'zł'

				return (
					<div
						key={m.month}
						className='relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 p-3 shadow-sm'
					>
						<div className='absolute left-0 top-0 h-full w-1 bg-mainColor' />
						{/* nagłówek */}
						<p className='text-[11px] uppercase tracking-wide text-gray-500 mb-1'>
							{m.month}
						</p>

						{/* wartość + trend */}
						<div className='flex items-center justify-between gap-2'>
							<p className='text-lg font-semibold text-gray-900'>
								{value.toFixed(2)} {unit}/kg
							</p>

							<TrendBadge trend={trend} unit={unit} decimals={2} />
						</div>
					</div>
				)
			})}
		</div>
	)
}

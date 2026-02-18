import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faClock,
	faCalendarCheck,
	faCoins,
	faSackDollar,
	faHandHoldingDollar,
	faWallet,
	faStopwatch,
} from '@fortawesome/free-solid-svg-icons'
import type { WorkTime, Employee } from '../../types/Employee'
import { useFormatUtils } from '../../hooks/useFormatUtils'

type Props = {
	items: WorkTime[]
	employee: Employee
}

export default function WorkSummary({ items, employee }: Props) {
	const { getCurrencySymbol, formatNumber } = useFormatUtils()

	if (!items.length) {
		return (
			<div className='bg-white rounded-xl p-6'>
				<p className='text-sm text-gray-500 text-center'>Brak danych do podsumowania</p>
			</div>
		)
	}

	const hourlyRate = employee.salary ?? 0

	/* =======================
	   OBLICZENIA
	======================= */

	const totalHours = items.reduce((acc, i) => acc + i.hoursWorked, 0)

	const daysWorked = items.length

	const totalEarned = items.reduce((acc, i) => acc + i.hoursWorked * hourlyRate, 0)

	const totalPaid = items.reduce((acc, i) => acc + (i.paidAmount ?? 0), 0)

	const totalToPay = totalEarned - totalPaid

	const avgHoursPerDay = totalHours / daysWorked
	const avgEarnPerDay = totalEarned / daysWorked

	/* =======================
	   MIESIĘCZNE ZAROBKI
	======================= */

	const monthly = items.reduce<Record<string, number>>((acc, i) => {
		const month = i.workDate.slice(0, 7)
		const earn = i.hoursWorked * hourlyRate

		acc[month] = (acc[month] || 0) + earn
		return acc
	}, {})

	const monthlyEntries = Object.entries(monthly).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
	const max = Math.max(...monthlyEntries.map(([, v]) => v))

	return (
		<div className='bg-white rounded-xl px-6 pt-3 pb-6 space-y-6 max-h-110 overflow-y-auto'>
			<h3 className='text-lg font-semibold'>Podsumowanie pracy</h3>

			{/* ===== KLUCZOWE METRYKI ===== */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<Metric icon={faClock} label='Łączny czas pracy' value={`${totalHours} h`} />

				<Metric icon={faCalendarCheck} label='Liczba dni pracy' value={`${daysWorked.toString()} dni`} />

				<Metric icon={faStopwatch} label='Średni czas pracy' value={`${avgHoursPerDay.toFixed(1)} h`} />

				<Metric icon={faCoins} label='Średni zarobek' value={`${formatNumber(avgEarnPerDay)} ${getCurrencySymbol()}`} />
			</div>

			{/* ===== FINANSE ===== */}
			<div className='border-t border-gray-300 pt-4 space-y-3'>
				<SummaryRow
					icon={faSackDollar}
					label='Łączny zarobek'
					value={`${formatNumber(totalEarned)} ${getCurrencySymbol()}`}
				/>

				<SummaryRow
					icon={faHandHoldingDollar}
					label='Wypłacono'
					value={`${formatNumber(totalPaid)} ${getCurrencySymbol()}`}
				/>

				<SummaryRow
					icon={faWallet}
					label='Pozostało do zapłaty'
					value={`${formatNumber(totalToPay)} ${getCurrencySymbol()}`}
					highlight
				/>
			</div>

			{/* ===== ZAROBKI MIESIĘCZNE ===== */}
			<div className='space-y-3 border-t border-gray-300 pt-4'>
				{monthlyEntries.map(([month, value]) => (
					<div key={month}>
						<div className='flex justify-between text-sm mb-1'>
							<span>{formatMonth(month)}</span>
							<span className='font-medium'>{`${formatNumber(value)} ${getCurrencySymbol()}`}</span>
						</div>

						<div className='w-full bg-gray-100 rounded-full h-1'>
							<div className='bg-mainColor h-1 rounded-full' style={{ width: `${(value / max) * 100}%` }} />
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

/* =======================
   METRIC BOX
======================= */
function Metric({ icon, label, value }: any) {
	return (
		<div
			className='
				group relative overflow-hidden
				rounded-xl
				bg-linear-to-br from-white to-gray-50
				p-3
				shadow-sm
				transition-all duration-300
				hover:shadow-md hover:-translate-y-0.5
			'>
			<div className='absolute left-0 top-0 h-full w-1 bg-mainColor' />

			<div className='absolute right-3 top-3 text-3xl text-mainColor/20'>
				<FontAwesomeIcon icon={icon} />
			</div>

			<p className='text-[11px] uppercase tracking-wide text-gray-500 mb-2'>{label}</p>

			<p className='text-xl font-semibold text-gray-900 leading-tight'>{value}</p>
		</div>
	)
}

/* =======================
   ROW
======================= */
function SummaryRow({ icon, label, value, highlight }: any) {
	return (
		<div className='flex justify-between items-center text-sm'>
			<div className='flex items-center gap-2 text-gray-600'>
				<FontAwesomeIcon icon={icon} />
				<span>{label}</span>
			</div>
			<span className={highlight ? 'font-semibold text-mainColor' : 'font-medium'}>{value}</span>
		</div>
	)
}

/* =======================
   FORMAT MONTH
======================= */
function formatMonth(month: string) {
	const [year, m] = month.split('-')
	const date = new Date(Number(year), Number(m) - 1)

	return date.toLocaleDateString('pl-PL', {
		month: 'long',
		year: 'numeric',
	})
}

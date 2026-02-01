import { useEffect, useMemo, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'

type Props = {
	year: number
	value: string // YYYY-MM-DD
	onChange: (date: string) => void
}

export default function CustomDayMonthSelect({ year, value, onChange }: Props) {
	const ref = useRef<HTMLDivElement>(null)
	const [open, setOpen] = useState(false)

	const date = new Date(value)
	const month = date.getMonth() + 1
	const day = date.getDate()
	const MONTHS = [
		{ value: 1, label: 'styczeń' },
		{ value: 2, label: 'luty' },
		{ value: 3, label: 'marzec' },
		{ value: 4, label: 'kwiecień' },
		{ value: 5, label: 'maj' },
		{ value: 6, label: 'czerwiec' },
		{ value: 7, label: 'lipiec' },
		{ value: 8, label: 'sierpień' },
		{ value: 9, label: 'wrzesień' },
		{ value: 10, label: 'październik' },
		{ value: 11, label: 'listopad' },
		{ value: 12, label: 'grudzień' },
	]

	const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate()

	const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month])

	// 👉 klik poza
	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (!ref.current?.contains(e.target as Node)) {
				setOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	function updateDate(newDay: number, newMonth: number) {
		const maxDay = getDaysInMonth(year, newMonth)
		const safeDay = Math.min(newDay, maxDay)

		onChange(`${year}-${String(newMonth).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`)
	}

	return (
		<div ref={ref} className='relative'>
			<button
				type='button'
				onClick={() => setOpen(o => !o)}
				className='flex items-center gap-3 text-gray-900 hover:text-gray-700 transition'>
				<span className='text-lg font-semibold md:text-xl'>
					{day} {MONTHS.find(m => m.value === month)?.label}
				</span>

				<span className='flex h-6 w-6 items-center justify-center rounded-full bg-mainColor cursor-pointer
									transition hover:brightness-110'>
					<FontAwesomeIcon
						icon={faChevronDown}
						className={`text-xs text-white transition-transform ${open ? 'rotate-180' : ''}`}
					/>
				</span>
			</button>

			{open && (
				<div className='absolute right-0 top-full z-20 mt-2 w-56 rounded-lg border bg-white p-3 shadow-lg'>
					{/* MIESIĄC */}
					<select
						value={month}
						onChange={e => updateDate(day, Number(e.target.value))}
						className='mb-2 w-full rounded-md border px-2 py-1 text-sm'>
						{MONTHS.map(m => (
							<option key={m.value} value={m.value}>
								{m.label}
							</option>
						))}
					</select>

					{/* DZIEŃ */}
					<select
						value={day}
						onChange={e => updateDate(Number(e.target.value), month)}
						className='w-full rounded-md border px-2 py-1 text-sm'>
						{Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
							<option key={d} value={d}>
								{d}
							</option>
						))}
					</select>
				</div>
			)}
		</div>
	)
}

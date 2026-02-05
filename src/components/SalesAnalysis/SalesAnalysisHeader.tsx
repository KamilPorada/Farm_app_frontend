import { useEffect, useMemo, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import CustomDayMonthSelect from '../ui/CustomDateSelect'

import { useMeData } from '../../hooks/useMeData'

type Props = {
	year: number
	setYear: (y: number) => void
	toDate: string
	setToDate: (d: string) => void
}

export default function SalesAnalysisHeader({ year, setYear, toDate, setToDate }: Props) {
	const { farmerTunnels } = useMeData()
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	// 👉 lata z tuneli
	const years = useMemo(() => {
		return Array.from(new Set(farmerTunnels.map(t => Number(t.year)))).sort((a, b) => b - a)
	}, [farmerTunnels])

	// 👉 zamykanie po kliknięciu poza
	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (!ref.current) return
			if (!ref.current.contains(e.target as Node)) {
				setOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	return (
		<div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
			{/* ===== LEWA STRONA ===== */}
			<div className='flex flex-col gap-2'>
				{/* Tytuł + filtry */}
				<div className='flex flex-wrap items-center gap-4'>
					<h1 className='text-xl font-semibold text-gray-900 md:text-2xl'>Analiza sprzedaży papryki</h1>

					<div className='hidden h-6 w-0.5 bg-gray-300 md:block' />

					{/* ===== SELECT ROKU ===== */}
					<div ref={ref} className='relative'>
						<button
							type='button'
							onClick={() => setOpen(o => !o)}
							className='flex items-center gap-3 text-gray-900 hover:text-gray-700 transition'>
							<span className='text-xl font-semibold md:text-2xl'>{year}</span>

							<span
								className='flex h-6 w-6 items-center justify-center rounded-full bg-mainColor cursor-pointer
									transition hover:brightness-110'>
								<FontAwesomeIcon
									icon={faChevronDown}
									className={`text-xs text-white transition-transform ${open ? 'rotate-180' : ''}`}
								/>
							</span>
						</button>

						{open && (
							<div className='absolute left-0 top-full z-20 mt-2 min-w-24 rounded-lg border bg-white py-1 shadow-lg'>
								{years.map(y => (
									<button
										key={y}
										onClick={() => {
											setYear(y)
											setOpen(false)
										}}
										className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-gray-100 hover:cursor-pointer ${
											y === year ? 'font-semibold text-mainColor' : 'text-gray-700'
										}`}>
										{y}
									</button>
								))}
							</div>
						)}
					</div>

					{/* ===== INPUT DATY (dzień + miesiąc) ===== */}
					<CustomDayMonthSelect year={year} value={toDate} onChange={setToDate} />
				</div>

				{/* PODTYTUŁ */}
				<p className='mt-2 text-sm text-gray-500 md:mt-4'>
					Monitoruj i analizuj wyniki sprzedaży papryki w jednym miejscu.
				</p>
			</div>
		</div>
	)
}

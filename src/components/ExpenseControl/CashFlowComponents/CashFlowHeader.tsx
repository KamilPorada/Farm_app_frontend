import { useEffect, useMemo, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'

import { useMeData } from '../../../hooks/useMeData'

type Props = {
	year: number
	setYear: (y: number) => void
}

export default function CashFlowHeader({ year, setYear }: Props) {
	const { farmerTunnels } = useMeData()
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	const years = useMemo(() => {
		return Array.from(new Set(farmerTunnels.map(t => Number(t.year)))).sort((a, b) => b - a)
	}, [farmerTunnels])

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
			<div className='flex flex-col gap-2'>
				<div className='flex flex-wrap items-center gap-3'>
					<h1 className='text-xl font-semibold text-gray-900 md:text-2xl'>Przepływy finansowe</h1>

					<div className='hidden h-6 w-0.5 bg-gray-300 md:block' />

					<div ref={ref} className='relative flex items-center gap-2'>
						<button
							type='button'
							onClick={() => setOpen(o => !o)}
							className='
								flex items-center gap-3
								bg-transparent
								text-gray-900
								hover:text-gray-700
								transition
							'>
							<span className='text-xl font-semibold leading-none md:text-2xl'>{year}</span>

							<span
								className='
									flex h-6 w-6 items-center justify-center
									rounded-full bg-mainColor
									cursor-pointer
									transition
									hover:brightness-110
								'>
								<FontAwesomeIcon
									icon={faChevronDown}
									className={`
										text-xs text-white
										transition-transform duration-200
										${open ? 'rotate-180' : ''}
									`}
								/>
							</span>
						</button>

						{open && (
							<div
								className='
									absolute left-0 top-full z-20 mt-2
									min-w-24
									rounded-lg border bg-white
									py-1 shadow-lg
								'>
								{years.map(y => (
									<button
										key={y}
										onClick={() => {
											setYear(y)
											setOpen(false)
										}}
										className={`
											block w-full px-4 py-2 text-left text-sm
											hover:bg-gray-100 hover:cursor-pointer
											transition
											${y === year ? 'font-semibold text-mainColor' : 'text-gray-700'}
										`}>
										{y}
									</button>
								))}
							</div>
						)}
					</div>
				</div>

				<p className='mt-2 text-sm text-gray-500 md:mt-4'>
					Szybki podgląd przychodów, kosztów oraz zysku w wybranym sezonie.
				</p>
			</div>
		</div>
	)
}

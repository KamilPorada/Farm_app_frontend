import { useMemo, useState } from 'react'
import type { Harvest } from '../../types/Harvest'
import type { VarietySeason } from '../../types/VarietySeason'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faCheck, faTimes, faChevronDown, faChevronRight, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons'

type Props = {
	harvests: Harvest[]
	varieties: VarietySeason[]
	onDelete: (h: Harvest) => void
	onUpdate: (h: Harvest) => void
}

export default function HarvestList({ harvests, varieties, onDelete, onUpdate }: Props) {
	const [editingId, setEditingId] = useState<number | null>(null)
	const [editValue, setEditValue] = useState<number | ''>('')
	const [expandedDates, setExpandedDates] = useState<string[]>([])

	/* ======================= */
	const grouped = useMemo(() => {
		const sorted = [...harvests].sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime())

		return sorted.reduce<Record<string, Harvest[]>>((acc, h) => {
			if (!acc[h.harvestDate]) acc[h.harvestDate] = []
			acc[h.harvestDate].push(h)
			return acc
		}, {})
	}, [harvests])

	function toggleDate(date: string) {
		setExpandedDates(prev => (prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]))
	}

	function isExpanded(date: string) {
		return expandedDates.includes(date)
	}

	function getVariety(id: number) {
		return varieties.find(v => v.id === id)
	}

	function getColorDot(color?: string | null) {
		switch (color) {
			case 'Czerwona':
				return 'bg-red-500'
			case 'Żółta':
				return 'bg-yellow-400'
			case 'Zielona':
				return 'bg-green-500'
			case 'Pomarańczowa':
				return 'bg-orange-400'
			default:
				return 'bg-red-500'
		}
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('pl-PL')
	}

	function formatBoxes(value: number) {
		const abs = Math.abs(value)
		if (abs === 1) return `${value} skrzynia`
		const lastDigit = abs % 10
		const lastTwo = abs % 100
		if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return `${value} skrzynie`
		return `${value} skrzyń`
	}

	function dayTotal(items: Harvest[]) {
		return items.reduce((sum, h) => sum + Number(h.boxCount), 0)
	}

	function startEdit(h: Harvest) {
		setEditingId(h.id)
		setEditValue(Number(h.boxCount))
	}

	function saveEdit(h: Harvest) {
		if (editValue === '' || Number(editValue) <= 0) return

		onUpdate({
			...h,
			boxCount: Number(editValue),
		})

		setEditingId(null)
		setEditValue('')
	}

	function cancelEdit() {
		setEditingId(null)
		setEditValue('')
	}

	/* ======================= */
	return (
		<div className='w-full md:w-1/2 rounded-lg border border-gray-200 p-4'>
			<div className='flex flex-row gap-2 items-center text-lg font-semibold pb-3'>
                <FontAwesomeIcon icon={faClockRotateLeft} className='text-mainColor text-xl' />
				<h2>Historia zbiorów</h2>
			</div>
			<div className='rounded-md border border-gray-200 shadow-sm'>
				{Object.entries(grouped).map(([date, items], index) => {
					const open = isExpanded(date)

					return (
						<div key={date} className={`overflow-hidden ${index !== 0 ? 'border-t border-gray-200' : ''}`}>
							{/* HEADER DNIA */}
							<div
								onClick={() => toggleDate(date)}
								className='flex items-center justify-between px-4 py-3 cursor-pointer'>
								<div className='flex items-center gap-3'>
									<FontAwesomeIcon icon={open ? faChevronDown : faChevronRight} className='text-gray-500 text-sm' />
									<h3 className='font-semibold text-sm md:text-base'>{formatDate(date)}</h3>
								</div>

								<span className='text-xs md:text-base font-semibold tabular-nums'>{formatBoxes(dayTotal(items))}</span>
							</div>

							{/* SUBITEMS – IDENTYCZNY UKŁAD JAK W KOSZTACH */}
							{open && (
								<div className='relative ml-6 border-l border-gray-200'>
									{items.map(h => {
										const variety = getVariety(h.varietySeasonId)

										return (
											<div
												key={h.id}
												className='relative flex flex-col gap-1 pl-6 pr-4 py-2 hover:bg-gray-50
											           sm:flex-row sm:items-center sm:justify-between'>
												{/* KROPKA NA LINII */}
												<span className='absolute left-[-9px] top-4 sm:top-1/2 sm:-translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-white border border-gray-200'>
													<span className={`h-2 w-2 rounded-full ${getColorDot(variety?.color)}`} />
												</span>

												<span className='text-xs md:text-sm break-words'>{variety?.name}</span>

												<div className='flex items-center justify-between sm:justify-end gap-2'>
													{editingId === h.id ? (
														<>
															<input
																type='number'
																min='1'
																step='0.1'
																value={editValue}
																onChange={e => setEditValue(e.target.value === '' ? '' : Number(e.target.value))}
																className='w-12 text-center rounded-md border border-gray-300 px-2 py-1 text-sm tabular-nums focus:ring-2 focus:ring-mainColor outline-none'
															/>
															<button
																onClick={() => saveEdit(h)}
																className='text-green-600 hover:text-green-700 cursor-pointer'>
																<FontAwesomeIcon icon={faCheck} />
															</button>

															<button onClick={() => cancelEdit()} className='text-red-600 hover:text-red-700 cursor-pointer'>
																<FontAwesomeIcon icon={faTimes} />
															</button>
														</>
													) : (
														<span className='cursor-pointer text-xs md:text-sm' onClick={() => startEdit(h)}>
															{formatBoxes(Number(h.boxCount))}
														</span>
													)}

													<button
														onClick={() => onDelete(h)}
														className='flex h-7 w-7 items-center justify-center text-gray-500 hover:text-red-500 cursor-pointer'>
														<FontAwesomeIcon icon={faTrash} />
													</button>
												</div>
											</div>
										)
									})}
								</div>
							)}
						</div>
					)
				})}
			</div>
		</div>
	)
}

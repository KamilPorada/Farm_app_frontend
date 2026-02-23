import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faSearch, faDownload } from '@fortawesome/free-solid-svg-icons'
import ConfirmDeleteModal from '../ui/ConfirmDeleteModal'
import type { Note } from '../../types/Note'

type Props = {
	items: Note[]
	onEdit: (note: Note) => void
	onDelete: (note: Note) => void
}

/* =======================
   MONTH NAMES
======================= */
const monthNames = [
	'Styczeń',
	'Luty',
	'Marzec',
	'Kwiecień',
	'Maj',
	'Czerwiec',
	'Lipiec',
	'Sierpień',
	'Wrzesień',
	'Październik',
	'Listopad',
	'Grudzień',
]

function getMonthName(monthKey: string) {
	const monthIndex = parseInt(monthKey.substring(5, 7), 10) - 1
	return monthNames[monthIndex]
}

/* =======================
   DAY INFO
======================= */
const dayNames = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota']

function getDayInfo(date: string) {
	const d = new Date(date)
	return {
		day: d.getDate().toString().padStart(2, '0'),
		weekday: dayNames[d.getDay()],
	}
}

export default function NoteList({ items, onEdit, onDelete }: Props) {
	const [query, setQuery] = useState('')
	const [toDelete, setToDelete] = useState<Note | null>(null)

	/* =======================
	   FILTER
	======================= */
	const filtered = useMemo(() => {
		if (!query.trim()) return items
		const q = query.toLowerCase()
		return items.filter(n => n.title.toLowerCase().includes(q))
	}, [items, query])

	/* =======================
	   GROUP BY MONTH
	======================= */
	const grouped = useMemo(() => {
		const map: Record<string, Note[]> = {}

		filtered.forEach(note => {
			const monthKey = note.noteDate.substring(0, 7)
			if (!map[monthKey]) map[monthKey] = []
			map[monthKey].push(note)
		})

		return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
	}, [filtered])

	/* =======================
	   EXPORT CSV
	======================= */
	function exportToCSV(notes: Note[]) {
		if (!notes.length) return

		const headers = ['Lp', 'Data', 'Tytuł', 'Treść']

		const rows = notes.map((n, i) => [i + 1, n.noteDate, n.title, n.content.replace(/\n/g, ' ')])

		const csv = [
			headers.join(';'),
			...rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')),
		].join('\n')

		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
		const url = URL.createObjectURL(blob)

		const link = document.createElement('a')
		link.href = url
		link.download = 'Notatki.csv'
		link.click()
		URL.revokeObjectURL(url)
	}

	if (!items.length) {
		return <p className='mt-4 text-sm text-gray-500'>Nie dodano jeszcze żadnych notatek.</p>
	}

	return (
		<div className='mt-4'>
			{/* SEARCH + EXPORT */}
			<div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
				<div className='relative w-full sm:max-w-xs cursor-pointer'>
					<FontAwesomeIcon icon={faSearch} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
					<input
						type='text'
						placeholder='Szukaj po tytule...'
						value={query}
						onChange={e => setQuery(e.target.value)}
						className='w-full rounded-md border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mainColor'
					/>
				</div>

				<button
					type='button'
					onClick={() => exportToCSV(filtered)}
					className='inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-gray-50'>
					<FontAwesomeIcon icon={faDownload} />
					Eksport CSV
				</button>
			</div>

			{/* TIMELINE */}
			<div className='space-y-8'>
				{grouped.map(([monthKey, notes]) => (
					<div key={monthKey}>
						{/* MONTH HEADER */}
						<h3 className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3'>
							{getMonthName(monthKey)}
						</h3>

						<div className='rounded-md border border-gray-400 shadow-md overflow-hidden'>
							{notes.map(note => {
								const dayInfo = getDayInfo(note.noteDate)

								return (
									<div
										key={note.id}
										className='flex items-center justify-between gap-4 px-4 py-3 border-b border-gray-300 last:border-none bg-white hover:bg-gray-50 transition'>
										{/* LEFT */}
										<div className='flex gap-4'>
											{/* DATE */}
											<div className='flex flex-col justify-center items-center min-w-17'>
												<span className='text-2xl font-semibold text-mainColor leading-none'>{dayInfo.day}</span>
												<span className='text-[11px] text-gray-500 leading-none mt-1 capitalize'>
													{dayInfo.weekday}
												</span>
											</div>

											{/* CONTENT */}
											<div>
												<p className='font-medium text-gray-900'>{note.title}</p>

												<p className='text-sm text-gray-600 whitespace-pre-line'>{note.content}</p>
											</div>
										</div>

										{/* ACTIONS */}
										<div className='flex flex-row justify-center items-center gap-1 text-gray-400 shrink-0 '>
											<button onClick={() => onEdit(note)} className='p-2 rounded-md hover:text-yellow-500 cursor-pointer'>
												<FontAwesomeIcon icon={faPen} />
											</button>

											<button
												onClick={() => setToDelete(note)}
												className='p-2 rounded-md hover:text-red-500 cursor-pointer'>
												<FontAwesomeIcon icon={faTrash} />
											</button>
										</div>
									</div>
								)
							})}
						</div>
					</div>
				))}
			</div>

			{filtered.length === 0 && <div className='mt-6 text-center text-sm text-gray-500'>Nie znaleziono notatek.</div>}

			{/* DELETE MODAL */}
			{toDelete && (
				<ConfirmDeleteModal
					onCancel={() => setToDelete(null)}
					onConfirm={() => {
						onDelete(toDelete)
						setToDelete(null)
					}}
				/>
			)}
		</div>
	)
}

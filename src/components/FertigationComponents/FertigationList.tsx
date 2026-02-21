import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faSearch, faDownload } from '@fortawesome/free-solid-svg-icons'
import { useFormatUtils } from '../../hooks/useFormatUtils'

import ConfirmDeleteModal from '../ui/ConfirmDeleteModal'
import FertilizerUsageTable from './FertilizerUsageTable'
import type { Fertigation } from '../../types/Fertigation'
import type { Fertilizer } from '../../types/Fertilizer'

type Props = {
	items: Fertigation[]
	fertilizers: Fertilizer[]
	onEdit: (f: Fertigation) => void
	onDelete: (f: Fertigation) => void
}

export default function FertigationList({ items, fertilizers, onEdit, onDelete }: Props) {
	const { formatDate } = useFormatUtils()
	const [query, setQuery] = useState('')
	const [toDelete, setToDelete] = useState<Fertigation | null>(null)

	/* 🔹 mapa nawozów */
	const fertilizerMap = useMemo(() => {
		const map: Record<number, Fertilizer> = {}
		fertilizers.forEach(f => (map[f.id] = f))
		return map
	}, [fertilizers])

	/* 🔎 filtrowanie */
	const filteredItems = useMemo(() => {
		if (!query.trim()) return items
		const q = query.toLowerCase()

		return items.filter(f => fertilizerMap[f.fertilizerId]?.name.toLowerCase().includes(q))
	}, [items, query, fertilizerMap])

	function getUnit(form?: string) {
		return form?.toLowerCase() === 'płynny' ? 'l/tunel' : 'kg/tunel'
	}

	function exportToCSV(items: Fertigation[]) {
		if (!items.length) return

		const headers = ['LP', 'Data', 'Nawóz', 'Dawka', 'Tunele']

		const rows = items.map((f, i) => {
			const fertilizer = fertilizerMap[f.fertilizerId]

			return [
				i + 1,
				formatDate(f.fertigationDate),
				fertilizer?.name ?? '',
				`${f.dose} ${getUnit(fertilizer?.form)}`,
				f.tunnelCount,
			]
		})

		const csvContent = [
			headers.join(';'),
			...rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')),
		].join('\n')

		const blob = new Blob([csvContent], {
			type: 'text/csv;charset=utf-8;',
		})

		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = 'Fertygacje.csv'
		link.click()
		URL.revokeObjectURL(url)
	}

	if (!items.length) {
		return <p className='mt-4 text-sm text-gray-500'>Nie dodano jeszcze fertygacji.</p>
	}

	return (
		<div className='mt-4'>
			{/* SEARCH + EXPORT */}
			<div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
				<div className='relative w-full sm:max-w-xs'>
					<FontAwesomeIcon icon={faSearch} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
					<input
						type='text'
						placeholder='Szukaj nawozu...'
						value={query}
						onChange={e => setQuery(e.target.value)}
						className='w-full rounded-md border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mainColor'
					/>
				</div>

				<button
					type='button'
					onClick={() => exportToCSV(filteredItems)}
					className='inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm cursor-pointer'>
					<FontAwesomeIcon icon={faDownload} />
					Eksport CSV
				</button>
			</div>

			{/* 📱 MOBILE */}
			<div className='space-y-3 md:hidden'>
				{filteredItems.map((f, index) => {
					const fertilizer = fertilizerMap[f.fertilizerId]

					return (
						<div key={f.id} className='rounded-lg border bg-white p-4 shadow-sm'>
							<div className='flex justify-between items-center gap-3'>
								<div>
									<p className='font-semibold text-gray-900'>
										{index + 1}. {fertilizer?.name}
									</p>

									<p className='text-sm text-gray-500'>{formatDate(f.fertigationDate)}</p>

									<p className='text-sm text-gray-700 mt-1'>
										{f.dose} {getUnit(fertilizer?.form)}
									</p>

									<p className='text-sm text-gray-600'>Tunele: {f.tunnelCount}</p>
								</div>

								<div className='flex gap-2 text-gray-400 shrink-0'>
									<button onClick={() => onEdit(f)} className='p-2 rounded-md hover:text-yellow-500'>
										<FontAwesomeIcon icon={faPen} />
									</button>

									<button onClick={() => setToDelete(f)} className='p-2 rounded-md hover:text-red-500'>
										<FontAwesomeIcon icon={faTrash} />
									</button>
								</div>
							</div>
						</div>
					)
				})}
			</div>

			{/* 🖥 DESKTOP */}
			<div className='hidden md:block'>
				<div
					className='px-3 py-2 text-xs font-medium bg-mainColor text-white rounded-t-lg'
					style={{
						display: 'grid',
						gridTemplateColumns: '0.6fr 1.2fr 2fr 1.2fr 1fr 0.6fr',
					}}>
					<div>LP</div>
					<div>Data</div>
					<div>Nawóz</div>
					<div>Dawka</div>
					<div>Tunele</div>
					<div>Akcje</div>
				</div>

				{filteredItems.map((f, index) => {
					const fertilizer = fertilizerMap[f.fertilizerId]

					return (
						<div
							key={f.id}
							className='px-3 py-1 border-b border-gray-300 items-center text-sm bg-white'
							style={{
								display: 'grid',
								gridTemplateColumns: '0.6fr 1.2fr 2fr 1.2fr 1fr 0.6fr',
							}}>
							<div className='text-gray-500'>{index + 1}</div>
							<div>{formatDate(f.fertigationDate)}</div>
							<div className='font-medium'>{fertilizer?.name}</div>
							<div>
								{f.dose} {getUnit(fertilizer?.form)}
							</div>
							<div>{f.tunnelCount}</div>

							<div className='flex gap-2 text-gray-500'>
								<button onClick={() => onEdit(f)} className='p-2 rounded-md hover:text-yellow-500 cursor-pointer'>
									<FontAwesomeIcon icon={faPen} />
								</button>

								<button onClick={() => setToDelete(f)} className='p-2 rounded-md hover:text-red-500 cursor-pointer'>
									<FontAwesomeIcon icon={faTrash} />
								</button>
							</div>
						</div>
					)
				})}
			</div>

			{filteredItems.length === 0 && (
				<div className='mt-6 text-center text-sm text-gray-500'>
					<p>Nie znaleziono fertygacji.</p>
				</div>
			)}

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

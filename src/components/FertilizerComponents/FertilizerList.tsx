import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faSearch, faDownload } from '@fortawesome/free-solid-svg-icons'

import ConfirmDeleteModal from '../ui/ConfirmDeleteModal'
import type { Fertilizer } from '../../types/Fertilizer'
import { useFormatUtils } from '../../hooks/useFormatUtils'

type Props = {
	items: Fertilizer[]
	onEdit: (f: Fertilizer) => void
	onDelete: (f: Fertilizer) => void
}

export default function FertilizerList({ items, onEdit, onDelete }: Props) {
	const { getCurrencySymbol } = useFormatUtils()
	const [query, setQuery] = useState('')
	const [toDelete, setToDelete] = useState<Fertilizer | null>(null)

	const filteredItems = useMemo(() => {
		if (!query.trim()) return items
		const q = query.toLowerCase()
		return items.filter(f => f.name.toLowerCase().includes(q))
	}, [items, query])

	function exportToCSV(items: Fertilizer[]) {
		if (!items.length) return

		const headers = ['Lp', 'Nazwa nawozu', 'Forma', 'Cena']

		const rows = items.map((f, i) => [
			i + 1,
			f.name,
			f.form,
			typeof f.price === 'number' ? `${f.price} ${getUnit(f.form)}` : '',
		])

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
		link.download = 'Nawozy.csv'
		link.click()
		URL.revokeObjectURL(url)
	}

	function getUnit(form: string) {
		return form.toLowerCase() === 'płynny' ? `${getCurrencySymbol()}/l` : `${getCurrencySymbol()}/kg`
	}

	// 🔥 bezpieczne formatowanie ceny
	function formatPrice(price: unknown, form: string) {
		if (typeof price !== 'number' || isNaN(price)) return '—'
		return `${price.toFixed(2)} ${getUnit(form)}`
	}

	if (!items.length) {
		return <p className='mt-4 text-sm text-gray-500'>Nie dodano jeszcze żadnych nawozów.</p>
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
				{filteredItems.map((f, index) => (
					<div key={f.id} className='rounded-lg border bg-white p-4 shadow-sm'>
						<div className='flex justify-between items-center gap-3'>
							<div>
								<p className='font-semibold text-gray-900'>
									{index + 1}. {f.name}
								</p>
								<p className='text-sm text-gray-500'>{f.form}</p>

								<p className='text-sm text-gray-700 mt-1 font-medium'>{formatPrice(f.price, f.form)}</p>
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
				))}
			</div>

			{/* 🖥 DESKTOP */}
			<div className='hidden md:block'>
				<div className='grid grid-cols-12 gap-3 px-3 py-2 text-xs font-medium bg-mainColor text-white rounded-t-lg'>
					<div className='col-span-1'>LP</div>
					<div className='col-span-4'>Nazwa nawozu</div>
					<div className='col-span-3'>Forma</div>
					<div className='col-span-2'>Cena</div>
					<div className='col-span-2'>Akcje</div>
				</div>

				{filteredItems.map((f, index) => (
					<div
						key={f.id}
						className='grid grid-cols-12 gap-3 px-3 py-1 border-b border-gray-300 items-center text-sm bg-white'>
						<div className='col-span-1 text-gray-500'>{index + 1}</div>
						<div className='col-span-4 font-medium text-gray-800'>{f.name}</div>
						<div className='col-span-3 text-gray-600'>{f.form}</div>

						<div className='col-span-2 text-gray-700 font-medium'>{formatPrice(f.price, f.form)}</div>

						<div className='col-span-2 flex gap-2 text-gray-500'>
							<button onClick={() => onEdit(f)} className='p-2 rounded-md hover:text-yellow-500 cursor-pointer'>
								<FontAwesomeIcon icon={faPen} />
							</button>

							<button onClick={() => setToDelete(f)} className='p-2 rounded-md hover:text-red-500 cursor-pointer'>
								<FontAwesomeIcon icon={faTrash} />
							</button>
						</div>
					</div>
				))}
			</div>

			{filteredItems.length === 0 && (
				<div className='mt-6 text-center text-sm text-gray-500'>
					<p>Nie znaleziono nawozów.</p>
					<p className='mt-1 text-xs text-gray-400'>Sprawdź pisownię lub wyczyść pole wyszukiwania.</p>
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

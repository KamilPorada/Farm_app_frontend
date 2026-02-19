import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faSearch, faDownload } from '@fortawesome/free-solid-svg-icons'
import type { Pesticide, PesticideType } from '../../types/Pesticide'

type Props = {
	items: Pesticide[]
	types: PesticideType[]
	onEdit: (p: Pesticide) => void
	onDelete: (p: Pesticide) => void
}

export default function PesticideList({ items, types, onEdit, onDelete }: Props) {
	const [query, setQuery] = useState('')

	/* =======================
	   SEARCH
	======================= */
	const filteredItems = useMemo(() => {
		if (!query.trim()) return items
		const q = query.toLowerCase()
		return items.filter(p => p.name.toLowerCase().includes(q))
	}, [items, query])

	const getTypeName = (id: number) => types.find(t => t.id === id)?.name ?? ''

	/* =======================
	   EXPORT CSV
	======================= */
	function exportToCSV(rows: Pesticide[]) {
		if (!rows.length) return

		const headers = ['Nazwa środka', 'Typ', 'Forma', 'Szkodnik / choroba', 'Karencja (dni)']

		const csv = [
			headers.join(';'),
			...rows.map(p =>
				[
					p.name,
					getTypeName(p.pesticideTypeId),
					p.isLiquid ? 'płynny' : 'proszek/granulat',
					p.targetPest,
					p.carenceDays,
				]
					.map(v => `"${String(v).replace(/"/g, '""')}"`)
					.join(';'),
			),
		].join('\n')

		const blob = new Blob([csv], {
			type: 'text/csv;charset=utf-8;',
		})

		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = 'Srodki_ochrony_roslin.csv'
		link.click()
		URL.revokeObjectURL(url)
	}

	function getCarenceBadge(days: number) {
		if (days <= 3) {
			return 'bg-green-100 text-green-700'
		}
		if (days <= 10) {
			return 'bg-yellow-100 text-yellow-700'
		}
		return 'bg-red-100 text-red-700'
	}

	if (!items.length) {
		return <p className='mt-4 text-sm text-gray-500'>Brak zapisanych środków.</p>
	}

	return (
		<div className='mt-4'>
			{/* ===================== */}
			{/* 🔍 SEARCH + EXPORT */}
			{/* ===================== */}
			<div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
				{/* SEARCH */}
				<div className='relative w-full sm:max-w-xs'>
					<FontAwesomeIcon icon={faSearch} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
					<input
						type='text'
						placeholder='Szukaj środka'
						value={query}
						onChange={e => setQuery(e.target.value)}
						className='
							w-full rounded-md border
							pl-9 pr-3 py-2 text-sm
							focus:outline-none focus:ring-2 focus:ring-mainColor
						'
					/>
				</div>

				<button
					type='button'
					onClick={() => exportToCSV(filteredItems)}
					className='inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm'>
					<FontAwesomeIcon icon={faDownload} />
					Eksport CSV
				</button>
			</div>

			{/* 📱 MOBILE */}
			<div className='space-y-4 md:hidden'>
				{filteredItems.map((p, i) => (
					<div key={p.id} className='rounded-lg border bg-white p-4 shadow-sm'>
						<p className='font-semibold text-gray-900'>
							{i + 1}. {p.name}
						</p>

						<div className='mt-2 text-sm text-gray-700 space-y-1'>
							<p>Forma: {p.isLiquid ? 'płynny' : 'proszek / granulat'}</p>
							<p>Szkodnik: {p.targetPest}</p>
							<div className='flex items-center gap-2'>
								<span>Karencja:</span>
								<span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getCarenceBadge(p.carenceDays)}`}>
									{p.carenceDays} dni
								</span>
							</div>
						</div>

						<div className='mt-3 flex justify-end gap-2 text-gray-500'>
							<button onClick={() => onEdit(p)} className='p-2 rounded-md hover:text-yellow-500 cursor-pointer'>
								<FontAwesomeIcon icon={faPen} />
							</button>

							<button onClick={() => onDelete(p)} className='p-2 rounded-md hover:text-red-500 cursor-pointer'>
								<FontAwesomeIcon icon={faTrash} />
							</button>
						</div>
					</div>
				))}
			</div>

			{/* 💻 DESKTOP */}
			<div className='hidden md:block'>
				<div className='grid grid-cols-[0.5fr_3fr_2fr_3fr_2fr_1fr] gap-3 px-3 py-2 text-xs text-center font-medium bg-mainColor text-white rounded-t-lg'>
					<div>Lp.</div>
					<div>Nazwa</div>
					<div>Forma</div>
					<div>Szkodnik</div>
					<div>Karencja</div>
					<div>Akcje</div>
				</div>

				{filteredItems.map((p, i) => (
					<div
						key={p.id}
						className='grid grid-cols-[0.5fr_3fr_2fr_3fr_2fr_1fr] gap-3 px-3 py-2 text-sm text-center border-b border-gray-300'>
						<div>{i + 1}</div>
						<div className='font-medium'>{p.name}</div>
						<div>{p.isLiquid ? 'płynny' : 'proszek'}</div>
						<div>{p.targetPest}</div>
						<div className='flex justify-center'>
							<span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getCarenceBadge(p.carenceDays)}`}>
								{p.carenceDays} dni
							</span>
						</div>

						<div className='flex justify-center gap-3 text-gray-500'>
							<button onClick={() => onEdit(p)} className='rounded-md hover:text-yellow-500 cursor-pointer'>
								<FontAwesomeIcon icon={faPen} />
							</button>

							<button onClick={() => onDelete(p)} className='rounded-md hover:text-red-500 cursor-pointer'>
								<FontAwesomeIcon icon={faTrash} />
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

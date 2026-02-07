import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faEye,
	faPen,
	faTrash,
	faSearch,
	faFilter,
	faDownload,
} from '@fortawesome/free-solid-svg-icons'

import PointOfSaleRow from './PointOfSaleRow'
import PointOfSaleFiltersModal from './PointOfSaleFiltersModal'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import type { PointOfSale } from '../../types/PointOfSale'

type Props = {
	items: PointOfSale[]
	onView: (p: PointOfSale) => void
	onEdit: (p: PointOfSale) => void
	onDelete: (p: PointOfSale) => void
}

type Filters = {
	type: 'ALL' | 'Rynek hurtowy' | 'Skup' | 'Klient prywatny' | 'Inne'
	sort: 'NAME_ASC' | 'NAME_DESC'
}

export default function PointOfSaleList({
	items,
	onView,
	onEdit,
	onDelete,
}: Props) {
	const [query, setQuery] = useState('')

	const [appliedFilters, setAppliedFilters] = useState<Filters>({
		type: 'ALL',
		sort: 'NAME_ASC',
	})

	const [draftFilters, setDraftFilters] =
		useState<Filters>(appliedFilters)

	const [showFilters, setShowFilters] = useState(false)

	const [toDelete, setToDelete] = useState<PointOfSale | null>(null)

	/* =======================
	   FILTROWANIE
	======================= */
	const filteredItems = useMemo(() => {
		let result = [...items]

		if (query.trim()) {
			const q = query.toLowerCase()
			result = result.filter(
				p =>
					p.name.toLowerCase().includes(q) ||
					p.address.toLowerCase().includes(q)
			)
		}

		if (appliedFilters.type !== 'ALL') {
			result = result.filter(p => p.type === appliedFilters.type)
		}

		result.sort((a, b) =>
			appliedFilters.sort === 'NAME_ASC'
				? a.name.localeCompare(b.name)
				: b.name.localeCompare(a.name)
		)

		return result
	}, [items, query, appliedFilters])

	/* =======================
	   EXPORT CSV
	======================= */
	function exportToCSV(items: PointOfSale[]) {
		if (!items.length) return

		const headers = [
			'Nazwa punktu sprzedaży',
			'Typ',
			'Adres',
			'Telefon',
			'Email',
			'Szerokość geograficzna',
			'Długość geograficzna',
		]

		const rows = items.map(p => [
			p.name,
			p.type,
			p.address,
			p.phone,
			p.email,
			p.latitude,
			p.longitude,
		])

		const csvContent = [
			headers.join(';'),
			...rows.map(r =>
				r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')
			),
		].join('\n')

		const blob = new Blob([csvContent], {
			type: 'text/csv;charset=utf-8;',
		})

		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = 'Punkty_sprzedazy.csv'
		link.click()
		URL.revokeObjectURL(url)
	}

	if (!items.length) {
		return (
			<p className="mt-4 text-sm text-gray-500">
				Brak punktów sprzedaży.
			</p>
		)
	}

	return (
		<div className="mt-4">
			{/* ===================== */}
			{/* 🔍 SEARCH + ACTIONS */}
			{/* ===================== */}
			<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				{/* SEARCH */}
				<div className="relative w-full sm:max-w-xs">
					<FontAwesomeIcon
						icon={faSearch}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
					/>
					<input
						type="text"
						placeholder="Szukaj po nazwie lub adresie"
						value={query}
						onChange={e => setQuery(e.target.value)}
						className="
							w-full rounded-md border
							pl-9 pr-3 py-2 text-sm
							focus:outline-none focus:ring-2 focus:ring-mainColor
						"
					/>
				</div>

				{/* ACTIONS */}
				<div className="flex flex-col gap-2 sm:flex-row">
					<button
						type="button"
						onClick={() => {
							setDraftFilters(appliedFilters)
							setShowFilters(true)
						}}
						className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm"
					>
						<FontAwesomeIcon icon={faFilter} />
						Filtry
					</button>

					<button
						type="button"
						onClick={() => exportToCSV(filteredItems)}
						className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm"
					>
						<FontAwesomeIcon icon={faDownload} />
						Eksport CSV
					</button>
				</div>
			</div>

			{/* MODAL FILTRÓW */}
			{showFilters && (
				<PointOfSaleFiltersModal
					filters={draftFilters}
					onChange={setDraftFilters}
					onClose={() => {
						setAppliedFilters(draftFilters)
						setShowFilters(false)
					}}
					onReset={() =>
						setDraftFilters({ type: 'ALL', sort: 'NAME_ASC' })
					}
				/>
			)}

			{/* ===================== */}
			{/* 📱 MOBILE – KARTY */}
			{/* ===================== */}
			<div className="space-y-4 md:hidden">
				{filteredItems.map(p => (
					<div
						key={p.id}
						className="rounded-lg border bg-white p-4 shadow-sm"
					>
						<p className="font-semibold text-gray-900">{p.name}</p>
						<p className="text-sm text-gray-600">{p.address}</p>

						<div className="mt-2 text-sm text-gray-600">
							<p>{p.phone}</p>
							<p className="text-gray-500">{p.email}</p>
						</div>

						<div className="mt-3 flex justify-end gap-2">
							<button
								onClick={() => onView(p)}
								className="p-2 rounded-md hover:text-mainColor hover:bg-blue-50"
							>
								<FontAwesomeIcon icon={faEye} size="lg" />
							</button>
							<button
								onClick={() => onEdit(p)}
								className="p-2 rounded-md hover:text-yellow-500 hover:bg-yellow-50"
							>
								<FontAwesomeIcon icon={faPen} size="lg" />
							</button>
							<button
								onClick={() => setToDelete(p)}
								className="p-2 rounded-md hover:text-red-600 hover:bg-red-50"
							>
								<FontAwesomeIcon icon={faTrash} size="lg" />
							</button>
						</div>
					</div>
				))}
			</div>

			{/* ===================== */}
			{/* 🖥 DESKTOP – TABELA */}
			{/* ===================== */}
			<div className="hidden md:block">
				<div className="grid grid-cols-12 gap-3 px-3 py-2 text-xs font-medium bg-mainColor text-white rounded-t-lg">
					<div className="col-span-4">Nazwa</div>
					<div className="col-span-4">Adres</div>
					<div className="col-span-3">Kontakt</div>
					<div className="col-span-1 text-left">Akcje</div>
				</div>

				{filteredItems.map(p => (
					<PointOfSaleRow
						key={p.id}
						point={p}
						onView={onView}
						onEdit={onEdit}
						onDelete={() => setToDelete(p)}
					/>
				))}
			</div>

			{/* ===================== */}
			{/* 🗑 CONFIRM DELETE */}
			{/* ===================== */}
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

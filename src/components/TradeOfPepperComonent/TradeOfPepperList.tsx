import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faFilter, faDownload } from '@fortawesome/free-solid-svg-icons'

import TradeOfPepperRow from './TradeOfPepperRow'
import TradeOfPepperFiltersModal from './TradeOfPepperFiltersModal'
import TradeOfPepperSummary from './TradeOfPepperSummary'
import ConfirmDeleteModal from '../PointOfSaleComponents/ConfirmDeleteModal'

import type { TradeOfPepper } from '../../types/TradeOfPepper'
import type { PointOfSale } from '../../types/PointOfSale'

type Props = {
	items: TradeOfPepper[]
	allFarmerTrades: TradeOfPepper[]
	points: PointOfSale[]
	onView: (t: TradeOfPepper) => void
	onEdit: (t: TradeOfPepper) => void
	onDelete: (t: TradeOfPepper) => void
}

type Filters = {
	dateFrom?: string
	dateTo?: string
	pepperClass?: 1 | 2 | 3 | 'ALL'
	pepperColor?: 'ALL' | 'Czerwona' | 'Żółta' | 'Pomarańczowa' | 'Zielona'
	pointOfSaleId?: number | 'ALL'
	vatRate?: number | 'ALL'
	sort: 'DATE_ASC' | 'DATE_DESC'
}

function calculateTotal(price: number, weight: number, vat: number) {
	const net = price * weight
	return vat > 0 ? net * (1 + vat / 100) : net
}

export default function TradeOfPepperList({ items, allFarmerTrades, points, onView, onEdit, onDelete }: Props) {
	const [toDelete, setToDelete] = useState<TradeOfPepper | null>(null)

	const [appliedFilters, setAppliedFilters] = useState<Filters>({
		sort: 'DATE_ASC',
		pepperClass: 'ALL',
		pepperColor: 'ALL',
		pointOfSaleId: 'ALL',
		vatRate: 'ALL',
	})

	const [draftFilters, setDraftFilters] = useState<Filters>(appliedFilters)
	const [showFilters, setShowFilters] = useState(false)

	/* =======================
	   FILTROWANIE + ENRICH
	======================= */
	const filtered = useMemo(() => {
		let result = [...items]

		// DATE
		if (appliedFilters.dateFrom) {
			result = result.filter(t => t.tradeDate >= appliedFilters.dateFrom!)
		}
		if (appliedFilters.dateTo) {
			result = result.filter(t => t.tradeDate <= appliedFilters.dateTo!)
		}

		// CLASS
		if (appliedFilters.pepperClass !== 'ALL') {
			result = result.filter(t => t.pepperClass === appliedFilters.pepperClass)
		}

		// COLOR
		if (appliedFilters.pepperColor !== 'ALL') {
			result = result.filter(t => t.pepperColor === appliedFilters.pepperColor)
		}

		// POINT
		if (appliedFilters.pointOfSaleId !== 'ALL') {
			result = result.filter(t => t.pointOfSaleId === appliedFilters.pointOfSaleId)
		}

		// VAT
		if (appliedFilters.vatRate !== 'ALL') {
			result = result.filter(t => t.vatRate === appliedFilters.vatRate)
		}

		// SORT
		result.sort((a, b) =>
			appliedFilters.sort === 'DATE_ASC'
				? a.tradeDate.localeCompare(b.tradeDate)
				: b.tradeDate.localeCompare(a.tradeDate),
		)

		return result.map((t, idx) => ({
			...t,
			lp: idx + 1,
			pointName: points.find(p => p.id === t.pointOfSaleId)?.name ?? '—',
			total: Number(calculateTotal(t.tradePrice, t.tradeWeight, t.vatRate).toFixed(2)),
		}))
	}, [items, points, appliedFilters])

	/* =======================
	   EXPORT CSV
	======================= */
	function exportToCSV(rows: typeof filtered) {
		if (!rows.length) return

		const headers = ['LP', 'Data', 'Klasa', 'Kolor', 'Cena', 'Masa', 'VAT', 'Suma', 'Punkt sprzedaży']

		const csv = [
			headers.join(';'),
			...rows.map(r =>
				[
					r.lp,
					r.tradeDate,
					r.pepperClass === 3 ? 'Krojona' : r.pepperClass,
					r.pepperColor,
					r.tradePrice,
					r.tradeWeight,
					r.vatRate,
					r.total,
					r.pointName,
				]
					.map(v => `"${String(v)}"`)
					.join(';'),
			),
		].join('\n')

		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
		const url = URL.createObjectURL(blob)

		const a = document.createElement('a')
		a.href = url
		a.download = 'Transakcje_papryki.csv'
		a.click()

		URL.revokeObjectURL(url)
	}

	if (!items.length) {
		return <p className='mt-4 text-sm text-gray-500'>Brak transakcji sprzedaży papryki.</p>
	}

	return (
		<div className='mt-4'>
			<TradeOfPepperSummary items={filtered} allTrades={allFarmerTrades} />
			<div className='mb-4 flex justify-end gap-2'>
				<button
					onClick={() => {
						setDraftFilters(appliedFilters)
						setShowFilters(true)
					}}
					className='inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:cursor-pointer'>
					<FontAwesomeIcon icon={faFilter} />
					Filtry
				</button>

				<button
					onClick={() => exportToCSV(filtered)}
					className='inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:cursor-pointer'>
					<FontAwesomeIcon icon={faDownload} />
					Eksport CSV
				</button>
			</div>

			{/* MODAL FILTRÓW */}
			{showFilters && (
				<TradeOfPepperFiltersModal
					filters={draftFilters}
					points={points}
					onChange={setDraftFilters}
					onClose={() => {
						setAppliedFilters(draftFilters)
						setShowFilters(false)
					}}
					onReset={() =>
						setDraftFilters({
							sort: 'DATE_DESC',
							pepperClass: 'ALL',
							pepperColor: 'ALL',
							pointOfSaleId: 'ALL',
							vatRate: 'ALL',
						})
					}
				/>
			)}

			{/* ===================== */}
			{/* 🖥 DESKTOP – TABELA */}
			{/* ===================== */}
			<div>
				<div className='hidden xl:grid  grid-cols-[1fr_2fr_1.5fr_2fr_1fr_2fr_1fr_2fr_5.5fr_1.5fr] py-2 text-xs font-semibold bg-mainColor text-white text-center'>
					<div>LP</div>
					<div>Data</div>
					<div>Klasa</div>
					<div>Kolor</div>
					<div>Cena</div>
					<div>Masa</div>
					<div>VAT</div>
					<div>Suma</div>
					<div>Punkt sprzedaży</div>
					<div>Akcje</div>
				</div>

				<div className='flex flex-row flex-wrap justify-center gap-4 xl:gap-0'>
					{filtered.map(t => (
						<TradeOfPepperRow key={t.id} item={t} onView={onView} onEdit={onEdit} onDelete={() => setToDelete(t)} />
					))}
				</div>
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

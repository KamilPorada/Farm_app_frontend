import { useMemo, useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faFilter } from '@fortawesome/free-solid-svg-icons'

import InvoiceRow from './InvoiceRow'
import InvoiceFiltersModal from './InoiveFiltersModal'
import type { Invoice } from '../../../types/Invoice'
import type { PointOfSale } from '../../../types/PointOfSale'
import { useFormatUtils } from '../../../hooks/useFormatUtils'

type Tab = 'ALL' | 'PENDING' | 'REALIZED'

type InvoiceFilters = {
	dateFrom?: string
	dateTo?: string
	pointOfSaleId?: number | 'ALL'
}

type Props = {
	items: Invoice[]
	points: PointOfSale[]
	onEdit: (i: Invoice) => void
	onDelete: (i: Invoice) => void
	onMarkAsRealized: (i: Invoice) => void
}

export default function InvoiceList({ items, points, onEdit, onDelete, onMarkAsRealized }: Props) {
	const { formatCurrency } = useFormatUtils()
	const [tab, setTab] = useState<Tab>('PENDING')

	const [filters, setFilters] = useState<InvoiceFilters>({})
	const [draftFilters, setDraftFilters] = useState<InvoiceFilters>(filters)
	const [showFilters, setShowFilters] = useState(false)

	/* =====================================================
	   1️⃣ FILTRY GLOBALNE (BEZ TABA)
	===================================================== */
	const filteredByFilters = useMemo(() => {
		let data = [...items]

		if (filters.dateFrom) {
			data = data.filter(i => i.invoiceDate >= filters.dateFrom!)
		}

		if (filters.dateTo) {
			data = data.filter(i => i.invoiceDate <= filters.dateTo!)
		}

		if (filters.pointOfSaleId && filters.pointOfSaleId !== 'ALL') {
			data = data.filter(i => i.pointOfSaleId === filters.pointOfSaleId)
		}

		return data
	}, [items, filters])

	/* =====================================================
	   2️⃣ COUNTS DO TABÓW (JUŻ PO FILTRACH)
	===================================================== */
	const counts = useMemo(() => {
		return {
			all: filteredByFilters.length,
			pending: filteredByFilters.filter(i => !i.status).length,
			realized: filteredByFilters.filter(i => i.status).length,
		}
	}, [filteredByFilters])

	/* =====================================================
	   3️⃣ TABY (NA KOŃCU)
	===================================================== */
	const filtered = useMemo(() => {
		let data = [...filteredByFilters]

		if (tab === 'PENDING') data = data.filter(i => !i.status)
		if (tab === 'REALIZED') data = data.filter(i => i.status)

		return data.map((i, idx) => ({
			...i,
			lp: idx + 1,
			pointName: points.find(p => p.id === i.pointOfSaleId)?.name ?? '—',
		}))
	}, [filteredByFilters, tab, points])

	const sumAmount = useMemo(() => {
		return filtered.reduce((acc, i) => acc + i.amount, 0)
	}, [filtered])

	

	/* =====================================================
	   EXPORT CSV
	===================================================== */
	function exportCSV() {
		if (!filtered.length) return

		const headers = ['LP', 'Data', 'Numer faktury', 'Punkt sprzedaży', 'Status']

		const rows = filtered.map(i =>
			[i.lp, i.invoiceDate, i.invoiceNumber, i.pointName, i.status ? 'Zrealizowana' : 'Oczekująca']
				.map(v => `"${v}"`)
				.join(';'),
		)

		const csv = [headers.join(';'), ...rows].join('\n')

		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
		const url = URL.createObjectURL(blob)

		const a = document.createElement('a')
		a.href = url
		a.download = 'Faktury.csv'
		a.click()

		URL.revokeObjectURL(url)
	}

	if (!items.length) {
		return <p className='mt-4 text-sm text-gray-500'>Brak faktur w wybranym roku.</p>
	}

	return (
		<div className='mt-4'>
			{/* ===== TABS + ACTIONS ===== */}
			<div className='mb-4 flex flex-col md:flex-row justify-between items-center gap-2'>
				<div className='flex flex-col md:flex-row rounded-lg border bg-gray-100 overflow-hidden'>
					<TabButton active={tab === 'PENDING'} onClick={() => setTab('PENDING')}>
						Oczekujące ({counts.pending})
					</TabButton>
					<TabButton active={tab === 'REALIZED'} onClick={() => setTab('REALIZED')}>
						Zrealizowane ({counts.realized})
					</TabButton>
					<TabButton active={tab === 'ALL'} onClick={() => setTab('ALL')}>
						Wszystkie ({counts.all})
					</TabButton>
				</div>

				<div className='flex gap-2'>
					<button
						onClick={() => {
							setDraftFilters(filters)
							setShowFilters(true)
						}}
						className='inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm cursor-pointer'>
						<FontAwesomeIcon icon={faFilter} />
						Filtry
					</button>

					<button
						onClick={exportCSV}
						className='inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm cursor-pointer'>
						<FontAwesomeIcon icon={faDownload} />
						Eksport CSV
					</button>
				</div>
			</div>
			<div className='h-[42px] px-4 mb-3 border-l-4 border-mainColor flex items-center'>
				<p className='text-sm'>
					<span className='text-gray-500'>Suma:</span>{' '}
					<span className='font-semibold text-gray-900'>{formatCurrency(sumAmount)}</span>
				</p>
			</div>

			{/* ===== MODAL FILTRÓW ===== */}
			{showFilters && (
				<InvoiceFiltersModal
					filters={draftFilters}
					points={points}
					onChange={setDraftFilters}
					onClose={() => {
						setFilters(draftFilters)
						setShowFilters(false)
					}}
					onReset={() => {
						const reset: InvoiceFilters = {}
						setDraftFilters(reset)
						setFilters(reset)
						setShowFilters(false)
					}}
				/>
			)}

			{/* ===== HEADER (DESKTOP) ===== */}
			<div className='hidden xl:grid grid-cols-[0.5fr_2fr_2fr_1.5fr_4fr_2fr_2fr] bg-mainColor text-white text-xs font-semibold py-2 rounded-t-lg text-center'>
				<div>LP</div>
				<div>Data</div>
				<div>Numer faktury</div>
				<div>Kwota</div>
				<div>Punkt sprzedaży</div>
				<div>Status</div>
				<div>Akcje</div>
			</div>

			{/* ===== ROWS ===== */}
			<div>
				{filtered.map(i => (
					<InvoiceRow
						key={i.id}
						item={i}
						onEdit={onEdit}
						onDelete={() => onDelete(i)}
						onMarkAsRealized={onMarkAsRealized}
					/>
				))}
			</div>

			{/* ===== EMPTY STATE AFTER FILTERS ===== */}
			{filtered.length === 0 && (
				<p className='mt-4 text-sm text-gray-500 text-center'>Brak faktur spełniających wybrane kryteria.</p>
			)}
		</div>
	)
}

/* =======================
   TAB BUTTON
======================= */
function TabButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
	return (
		<button
			onClick={onClick}
			className={`px-4 py-2 text-sm cursor-pointer ${
				active ? 'bg-white font-semibold text-mainColor' : 'text-gray-600'
			}`}>
			{children}
		</button>
	)
}

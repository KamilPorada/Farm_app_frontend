import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'

import EmployeeRow from './EmployeeRow'
import type { Employee } from '../../types/Employee'

type Tab = 'ALL' | 'ACTIVE' | 'INACTIVE'

type Props = {
	items: Employee[]
	onEdit: (e: Employee) => void
	onDelete: (e: Employee) => void
	onWorkTime: (e: Employee) => void
}

export default function EmployeeList({ items, onEdit, onDelete, onWorkTime }: Props) {
	const [tab, setTab] = useState<Tab>('ACTIVE')

	/* =====================================================
	   COUNTS
	===================================================== */
	const counts = useMemo(() => {
		return {
			all: items.length,
			active: items.filter(e => !e.finishDate).length,
			inactive: items.filter(e => e.finishDate).length,
		}
	}, [items])

	/* =====================================================
	   FILTER BY TAB
	===================================================== */
	const filtered = useMemo(() => {
		let data = [...items]

		if (tab === 'ACTIVE') data = data.filter(e => !e.finishDate)
		if (tab === 'INACTIVE') data = data.filter(e => e.finishDate)

		return data.map((e, idx) => ({
			...e,
			lp: idx + 1,
		}))
	}, [items, tab])

	/* =====================================================
	   EXPORT CSV
	===================================================== */
	function exportCSV() {
		if (!filtered.length) return

		const headers = ['LP', 'Imię', 'Nazwisko', 'Wiek', 'Narodowość', 'Wynagrodzenie', 'Data zatrudnienia', 'Data zakończenia']

		const rows = filtered.map(e =>
			[
				e.lp,
				e.firstName,
				e.lastName,
				e.age ?? '',
				e.nationality ?? '',
				e.salary,
                e.startDate,
				e.finishDate==null ? '-' : e.finishDate,
			]
				.map(v => `"${v}"`)
				.join(';'),
		)

		const csv = [headers.join(';'), ...rows].join('\n')

		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
		const url = URL.createObjectURL(blob)

		const a = document.createElement('a')
		a.href = url
		a.download = 'Pracownicy.csv'
		a.click()

		URL.revokeObjectURL(url)
	}

	if (!items.length) {
		return <p className='mt-4 text-sm text-gray-500'>Brak pracowników w tym sezonie.</p>
	}

	return (
		<div className='mt-4'>
			{/* ===== TABS + ACTIONS ===== */}
			<div className='mb-4 flex flex-col md:flex-row justify-between items-center gap-2'>
				<div className='flex flex-col md:flex-row rounded-lg border bg-gray-100 overflow-hidden'>
					<TabButton active={tab === 'ACTIVE'} onClick={() => setTab('ACTIVE')}>
						Pracujący ({counts.active})
					</TabButton>

					<TabButton active={tab === 'INACTIVE'} onClick={() => setTab('INACTIVE')}>
						Nie pracujący ({counts.inactive})
					</TabButton>

					<TabButton active={tab === 'ALL'} onClick={() => setTab('ALL')}>
						Wszyscy ({counts.all})
					</TabButton>
				</div>

				<button
					onClick={exportCSV}
					className='inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm cursor-pointer'>
					<FontAwesomeIcon icon={faDownload} />
					Eksport CSV
				</button>
			</div>

			{/* ===== HEADER ===== */}
			<div className='hidden xl:grid grid-cols-[0.5fr_3fr_1fr_2fr_2fr_2fr_2fr] bg-mainColor text-white text-xs font-semibold py-2 rounded-t-lg text-center'>
				<div>LP</div>
				<div>Pracownik</div>
				<div>Wiek</div>
				<div>Narodowość</div>
				<div>Wynagrodzenie</div>
				<div>Status</div>
				<div>Akcje</div>
			</div>

			{/* ===== ROWS ===== */}
			<div className='flex flex-col gap-4 xl:gap-0'>
				{filtered.map(emp => (
					<EmployeeRow
						key={emp.id}
						item={emp}
						onEdit={() => onEdit(emp)}
						onDelete={() => onDelete(emp)}
						onWorkTime={() => onWorkTime(emp)}
					/>
				))}
			</div>

			{/* ===== EMPTY AFTER FILTER ===== */}
			{filtered.length === 0 && (
				<p className='mt-4 text-sm text-gray-500 text-center'>Brak pracowników spełniających kryteria.</p>
			)}
		</div>
	)
}

/* =======================
   TAB BUTTON
======================= */
function TabButton({
	children,
	active,
	onClick,
}: {
	children: React.ReactNode
	active: boolean
	onClick: () => void
}) {
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

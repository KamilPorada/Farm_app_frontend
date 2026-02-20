import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faSearch, faDownload, faCheck, faFilter } from '@fortawesome/free-solid-svg-icons'
import { PESTICIDE_TYPE_ICON_MAP } from '../../constans/pesticideTypeIcons'

import ConfirmDeleteModal from '../ui/ConfirmDeleteModal'
import TreatmentFiltersModal from './TreatmentFiltersModal'
import type { Treatment } from '../../types/Treatment'
import type { Pesticide, PesticideType } from '../../types/Pesticide'
import { useFormatUtils } from '../../hooks/useFormatUtils'

type Filters = {
	dateFrom: string | null
	dateTo: string | null
	typeIds: number[]
	status: 'ALL' | 'ACTIVE' | 'FINISHED'
}

type Props = {
	items: Treatment[]
	pesticides: Pesticide[]
	types: PesticideType[]
	onEdit: (t: Treatment) => void
	onDelete: (t: Treatment) => void
}

export default function TreatmentList({ items, pesticides, types, onEdit, onDelete }: Props) {
	const { formatDate } = useFormatUtils()
	const [query, setQuery] = useState('')
	const [toDelete, setToDelete] = useState<Treatment | null>(null)
	const [filters, setFilters] = useState<Filters>({
		dateFrom: null,
		dateTo: null,
		typeIds: [],
		status: 'ALL',
	})

	const [draftFilters, setDraftFilters] = useState(filters)
	const [showFilters, setShowFilters] = useState(false)

	/* ===== MAPY ===== */
	const pesticideMap = useMemo(() => {
		const map = new Map<number, Pesticide>()
		pesticides.forEach(p => map.set(p.id, p))
		return map
	}, [pesticides])

	const typeMap = useMemo(() => {
		const map = new Map<number, PesticideType>()
		types.forEach(t => map.set(t.id, t))
		return map
	}, [types])

	const filtered = useMemo(() => {
		let result = [...items]

		// 🔍 search
		if (query.trim()) {
			const q = query.toLowerCase()
			result = result.filter(t => {
				const pesticide = pesticideMap.get(t.pesticideId)
				return pesticide?.name.toLowerCase().includes(q)
			})
		}

		// 📅 zakres dat
		if (filters.dateFrom) {
			result = result.filter(t => t.treatmentDate >= filters.dateFrom!)
		}

		if (filters.dateTo) {
			result = result.filter(t => t.treatmentDate <= filters.dateTo!)
		}

		// 🧪 typ pestycydu
		if (filters.typeIds.length > 0) {
			result = result.filter(t => {
				const pesticide = pesticideMap.get(t.pesticideId)
				return pesticide && filters.typeIds.includes(pesticide.pesticideTypeId)
			})
		}

		// ⏳ status karencji
		if (filters.status !== 'ALL') {
			result = result.filter(t => {
				const pesticide = pesticideMap.get(t.pesticideId)
				if (!pesticide) return false

				const { finished } = getCarenceData(t.treatmentDate, pesticide.carenceDays ?? 0)

				return filters.status === 'FINISHED' ? finished : !finished
			})
		}

		return result
	}, [items, query, filters, pesticideMap])

	const hasAnyData = items.length > 0
	const hasFilteredData = filtered.length > 0

	function exportToCSV(rows: Treatment[]) {
		if (!rows.length) return

		const headers = [
			'Data zabiegu',
			'Godzina',
			'Środek',
			'Forma',
			'Dawka',
			'Ilość wody (l)',
			'Liczba tuneli',
			'Koniec karencji',
			'Status karencji',
		]

		const csvRows = rows.map(t => {
			const pesticide = pesticideMap.get(t.pesticideId)
			if (!pesticide) return []

			const unit = pesticide.isLiquid ? 'ml' : 'g'
			const form = pesticide.isLiquid ? 'płynny' : 'proszek'

			const carenceDays = pesticide.carenceDays ?? 0
			const data = getCarenceData(t.treatmentDate, carenceDays)

			return [
				t.treatmentDate,
				t.treatmentTime?.slice(0, 5),
				pesticide.name,
				form,
				`${t.pesticideDose}${unit}/100l`,
				t.liquidVolume,
				t.tunnelCount ?? '',
				data.endDateStr,
				data.finished ? 'zakończona' : 'trwa',
			]
		})

		const csvContent = [
			headers.join(';'),
			...csvRows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(';')),
		].join('\n')

		const blob = new Blob(['\uFEFF' + csvContent], {
			type: 'text/csv;charset=utf-8;',
		})

		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = `zabiegi_${new Date().toISOString().slice(0, 10)}.csv`
		link.click()
		URL.revokeObjectURL(url)
	}

	/* ===== FUNKCJA LICZENIA KARENCJI ===== */
	function getCarenceData(treatmentDate: string, intervalDays: number) {
		const MS_PER_DAY = 1000 * 60 * 60 * 24

		const start = new Date(treatmentDate)
		const today = new Date()

		start.setHours(0, 0, 0, 0)
		today.setHours(0, 0, 0, 0)

		const daysPassed = Math.floor((today.getTime() - start.getTime()) / MS_PER_DAY)

		const safePassed = Math.max(0, daysPassed)
		const daysLeft = intervalDays - safePassed
		const finished = daysLeft <= 0

		const percent = intervalDays > 0 ? Math.min(100, (safePassed / intervalDays) * 100) : 100

		const endDate = new Date(start)
		endDate.setDate(start.getDate() + intervalDays)

		const endDateStr = endDate.toISOString().slice(0, 10)

		return { safePassed, daysLeft, finished, percent, endDateStr }
	}

	/* ===== PILL POSTĘPU ===== */
	function CarencePill({
		passed,
		total,
		finished,
		percent,
	}: {
		passed: number
		total: number
		finished: boolean
		percent: number
	}) {
		let color = 'bg-[#77b641]'

		if (!finished) {
			if (percent < 33)
				color = 'bg-[#d85956]' // czerwony
			else if (percent < 66)
				color = 'bg-[#e6cc42]' // żółty
			else color = 'bg-[#77b641]' // zielony
		}

		return (
			<div
				className={`w-3/4 inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold text-white ${color}`}>
				{finished ? <FontAwesomeIcon icon={faCheck} /> : `${passed}/${total}`}
			</div>
		)
	}

	if (!items.length) {
		return (
			<div className='py-20 text-center text-gray-500'>
				<p className='text-sm font-medium'>Brak zapisanych zabiegów</p>
				<p className='text-xs mt-1'>Dodaj pierwszy zabieg, aby rozpocząć historię ochrony roślin.</p>
			</div>
		)
	}

	return (
		<div className='mt-4'>
			<div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
				{/* SEARCH */}
				<div className='relative w-full sm:max-w-xs'>
					<FontAwesomeIcon icon={faSearch} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
					<input
						type='text'
						placeholder='Szukaj po nazwie środka'
						value={query}
						onChange={e => setQuery(e.target.value)}
						className='w-full rounded-md border pl-9 pr-3 py-2 text-sm'
					/>
				</div>

				{/* ACTIONS */}
				<div className='flex flex-col gap-2 sm:flex-row'>
					<button
						type='button'
						onClick={() => {
							setDraftFilters(filters)
							setShowFilters(true)
						}}
						className='inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm cursor-pointer'>
						<FontAwesomeIcon icon={faFilter} />
						Filtry
					</button>

					<button
						type='button'
						onClick={() => exportToCSV(filtered)}
						className='inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm cursor-pointer'>
						<FontAwesomeIcon icon={faDownload} />
						Eksport CSV
					</button>
				</div>
			</div>

			{/* ===== DESKTOP ===== */}
			<div className='hidden md:block'>
				<div className='grid grid-cols-[0.4fr_1fr_2fr_1fr_0.9fr_0.5fr_1.2fr_1.2fr_0.6fr] gap-3 px-3 py-2 text-xs font-medium bg-mainColor text-white rounded-t-lg'>
					<div>Lp</div>
					<div>Data</div>
					<div>Środek</div>
					<div>Dawka</div>
					<div>Ilość wody</div>
					<div>Tunele</div>
					<div>Koniec karencji</div>
					<div>Postęp karencji</div>
					<div>Akcja</div>
				</div>

				{filtered.map((t, i) => {
					const pesticide = pesticideMap.get(t.pesticideId)
					const type = pesticide?.pesticideTypeId ? typeMap.get(pesticide.pesticideTypeId) : null
					const unit = pesticide?.isLiquid ? 'ml' : 'g'

					const data = getCarenceData(t.treatmentDate, pesticide?.carenceDays ?? 0)

					return (
						<div
							key={t.id}
							className='grid grid-cols-[0.4fr_1fr_2fr_1fr_0.9fr_0.5fr_1.2fr_1.2fr_0.6fr] gap-3 px-3 py-2 border-b border-gray-300 items-center text-sm'>
							<div>{i + 1}</div>

							<div>
								<p>{formatDate(t.treatmentDate)}</p>
								<p className='text-xs text-gray-500'>{t.treatmentTime.slice(0, 5)}</p>
							</div>

							<div className='flex items-center gap-2'>
								<FontAwesomeIcon
									icon={PESTICIDE_TYPE_ICON_MAP[type?.icon ?? 'fa-ellipsis']}
									className='text-mainColor text-sm opacity-70'
								/>
								<div>
									<p className='font-medium'>{pesticide?.name}</p>
									<p className='text-xs text-gray-500'>{pesticide?.isLiquid ? 'płynny' : 'proszek'}</p>
								</div>
							</div>

							<div>
								{t.pesticideDose}
								{unit}/100l
							</div>
							<div>{t.liquidVolume}l</div>
							<div>{t.tunnelCount ?? '-'}</div>
							<div>{formatDate(data.endDateStr)}</div>
							<div>
								<CarencePill
									passed={data.safePassed}
									total={pesticide?.carenceDays ?? 0}
									finished={data.finished}
									percent={data.percent}
								/>
							</div>
							<div className='flex justify-start gap-3 text-gray-500'>
								<button onClick={() => onEdit(t)} className='rounded-md hover:text-yellow-500 cursor-pointer'>
									<FontAwesomeIcon icon={faPen} />
								</button>

								<button onClick={() => setToDelete(t)} className='rounded-md hover:text-red-500 cursor-pointer'>
									<FontAwesomeIcon icon={faTrash} />
								</button>
							</div>
						</div>
					)
				})}
			</div>

			{hasAnyData && !hasFilteredData && (
				<div className='py-16 text-center text-gray-500'>
					<p className='text-sm font-medium'>Brak wyników</p>
					<p className='text-xs mt-1'>Zmień filtry lub usuń wyszukiwanie, aby zobaczyć zabiegi.</p>
				</div>
			)}

			{/* ===== MOBILE ===== */}
			{/* ===== MOBILE ===== */}
			<div className='space-y-3 md:hidden'>
				{filtered.map(t => {
					const pesticide = pesticideMap.get(t.pesticideId)
					const type = pesticide?.pesticideTypeId ? typeMap.get(pesticide.pesticideTypeId) : null

					const unit = pesticide?.isLiquid ? 'ml' : 'g'

					const data = getCarenceData(t.treatmentDate, pesticide?.carenceDays ?? 0)

					return (
						<div key={t.id} className='border rounded-xl p-4 bg-white shadow-sm'>
							{/* HEADER */}
							<div className='flex justify-between items-start'>
								<div>
									<p className='font-semibold leading-tight'>{pesticide?.name}</p>
									<p className='text-xs text-gray-500'>
										{formatDate(t.treatmentDate)} • {t.treatmentTime.slice(0, 5)}
									</p>
								</div>

								<FontAwesomeIcon
									icon={PESTICIDE_TYPE_ICON_MAP[type?.icon ?? 'fa-ellipsis']}
									className='text-mainColor opacity-80 text-3xl'
								/>
							</div>

							{/* TYPE */}
							<p className='text-xs text-gray-500 mt-1'>{pesticide?.isLiquid ? 'Płynny' : 'Proszek'}</p>

							{/* DATA GRID */}
							<div className='grid grid-cols-2 gap-y-1 text-sm mt-3'>
								<span className='text-gray-500'>Dawka:</span>
								<span>
									{t.pesticideDose}
									{unit}/100l
								</span>

								<span className='text-gray-500'>Woda:</span>
								<span>{t.liquidVolume}l</span>

								<span className='text-gray-500'>Tunele:</span>
								<span>{t.tunnelCount ?? '-'}</span>
							</div>

							{/* CARENCE */}
							<div className='mt-3'>
								<CarencePill
									passed={data.safePassed}
									total={pesticide?.carenceDays ?? 0}
									finished={data.finished}
									percent={data.percent}
								/>

								<p className='text-xs text-gray-500 mt-1'>Do zbioru: {formatDate(data.endDateStr)}</p>
							</div>

							{/* ACTIONS */}
							<div className='mt-3 flex justify-end gap-4 text-gray-500'>
								<button onClick={() => onEdit(t)} className='hover:text-yellow-500'>
									<FontAwesomeIcon icon={faPen} />
								</button>

								<button onClick={() => setToDelete(t)} className='hover:text-red-500'>
									<FontAwesomeIcon icon={faTrash} />
								</button>
							</div>
						</div>
					)
				})}
			</div>

			{toDelete && (
				<ConfirmDeleteModal
					onCancel={() => setToDelete(null)}
					onConfirm={() => {
						onDelete(toDelete)
						setToDelete(null)
					}}
				/>
			)}

			{showFilters && (
				<TreatmentFiltersModal
					filters={draftFilters}
					types={types}
					onChange={setDraftFilters}
					onClose={() => {
						setFilters(draftFilters)
						setShowFilters(false)
					}}
					onReset={() =>
						setDraftFilters({
							dateFrom: null,
							dateTo: null,
							typeIds: [],
							status: 'ALL',
						})
					}
				/>
			)}
		</div>
	)
}

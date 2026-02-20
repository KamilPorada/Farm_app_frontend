import SystemButton from '../ui/SystemButton'
import type { PesticideType } from '../../types/Pesticide'

type Filters = {
	dateFrom: string | null
	dateTo: string | null
	typeIds: number[]
	status: 'ALL' | 'ACTIVE' | 'FINISHED'
}

type Props = {
	filters: Filters
	types: PesticideType[]
	onChange: (f: Filters) => void
	onClose: () => void
	onReset: () => void
}

export default function TreatmentFiltersModal({ filters, types, onChange, onClose, onReset }: Props) {
	function toggleType(id: number) {
		if (filters.typeIds.includes(id)) {
			onChange({ ...filters, typeIds: filters.typeIds.filter(x => x !== id) })
		} else {
			onChange({ ...filters, typeIds: [...filters.typeIds, id] })
		}
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
			<div className='w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
				<h3 className='text-lg font-semibold'>Filtry</h3>
				<p className='mt-1 text-sm text-gray-500'>
					Dostosuj widok listy zabiegów ochrony roślin. Zmiany zostaną zastosowane po zatwierdzeniu.
				</p>

				{/* DATA */}
				<div className='mt-2'>
					<label className='text-sm font-medium'>Zakres dat</label>
					<div className='flex gap-2 mt-1'>
						<input
							type='date'
							value={filters.dateFrom ?? ''}
							onChange={e => onChange({ ...filters, dateFrom: e.target.value || null })}
							className='border rounded px-2 py-1 text-sm w-full'
						/>
						<input
							type='date'
							value={filters.dateTo ?? ''}
							onChange={e => onChange({ ...filters, dateTo: e.target.value || null })}
							className='border rounded px-2 py-1 text-sm w-full'
						/>
					</div>
				</div>

				{/* TYPY */}
				<div className='mt-4'>
					<label className='text-sm font-medium'>Typ pestycydu</label>
					<div className='mt-2 space-y-1'>
						{types.map(t => (
							<label key={t.id} className='flex items-center gap-2 text-sm'>
								<input type='checkbox' checked={filters.typeIds.includes(t.id)} onChange={() => toggleType(t.id)} />
								{t.name}
							</label>
						))}
					</div>
				</div>

				{/* STATUS */}
				<div className='mt-4'>
					<label className='text-sm font-medium'>Karencja</label>
					<select
						value={filters.status}
						onChange={e => onChange({ ...filters, status: e.target.value as any })}
						className='mt-1 w-full border rounded px-2 py-1 text-sm'>
						<option value='ALL'>Wszystkie</option>
						<option value='ACTIVE'>Karencja trwa</option>
						<option value='FINISHED'>Karencja zakończona</option>
					</select>
				</div>

				<div className='mt-6 flex justify-end gap-3'>
					<SystemButton variant='outline' onClick={onReset}>
						Wyczyść
					</SystemButton>
					<SystemButton onClick={onClose}>Zastosuj</SystemButton>
				</div>
			</div>
		</div>
	)
}

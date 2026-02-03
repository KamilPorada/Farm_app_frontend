import SystemButton from '../ui/SystemButton'

type Filters = {
	type: 'ALL' | 'Rynek hurtowy' | 'Skup' | 'Klient prywatny' | 'Inne'
	sort: 'NAME_ASC' | 'NAME_DESC'
}

type Props = {
	filters: Filters
	onChange: (f: Filters) => void
	onClose: () => void
	onReset: () => void
}

export default function PointOfSaleFiltersModal({ filters, onChange, onClose, onReset }: Props) {
	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
			<div className='w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
				<h3 className='text-lg font-semibold'>Filtry</h3>
				<p className='mt-1 text-sm text-gray-500'>
					Dostosuj widok listy punktów sprzedaży. Zmiany zostaną zastosowane po zatwierdzeniu.
				</p>

				{/* TYP */}
				<div className='mt-4'>
					<label className='text-sm font-medium'>Typ punktu</label>
					<select
						value={filters.type}
						onChange={e => onChange({ ...filters, type: e.target.value as any })}
						className='mt-1 w-full rounded-md border px-3 py-2 text-sm'>
						<option value='wszytskie'>Wszystkie</option>
						<option value='Rynek hurtowy'>Rynek hurtowy</option>
						<option value='Skup'>Skup</option>
						<option value='Klient prywatny'>Klient prywatny</option>
						<option value='Inne'>Inne</option>
					</select>
				</div>

				{/* SORT */}
				<div className='mt-4'>
					<label className='text-sm font-medium'>Sortowanie</label>
					<select
						value={filters.sort}
						onChange={e => onChange({ ...filters, sort: e.target.value as any })}
						className='mt-1 w-full rounded-md border px-3 py-2 text-sm'>
						<option value='NAME_ASC'>Nazwa A → Z</option>
						<option value='NAME_DESC'>Nazwa Z → A</option>
					</select>
				</div>

				{/* ACTIONS */}
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

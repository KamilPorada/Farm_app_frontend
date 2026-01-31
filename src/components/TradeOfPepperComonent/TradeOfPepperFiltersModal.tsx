import type { PointOfSale } from '../../types/PointOfSale'

type Filters = {
	dateFrom?: string
	dateTo?: string
	pepperClass?: 1 | 2 | 3 | 'ALL'
	pepperColor?: 'ALL' | 'Czerwona' | 'Żółta' | 'Pomarańczowa' | 'Zielona'
	pointOfSaleId?: number | 'ALL'
	vatRate?: number | 'ALL'
	sort: 'DATE_ASC' | 'DATE_DESC'
}

type Props = {
	filters: Filters
	points: PointOfSale[]
	onChange: (f: Filters) => void
	onClose: () => void
	onReset: () => void
}

export default function TradeOfPepperFiltersModal({ filters, points, onChange, onClose, onReset }: Props) {
	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
			<div className='w-full max-w-lg rounded-lg bg-white p-6 shadow-lg'>
				<h3 className='mb-4 text-lg font-semibold'>Filtry transakcji papryki</h3>
				<p className='mt-1 text-sm text-gray-500'>
					Dostosuj widok listy transakcji sprzedaży papryki. Zmiany zostaną zastosowane po zatwierdzeniu.
				</p>

				<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
					{/* DATA OD */}
					<div>
						<label className='text-sm font-medium'>Data od</label>
						<input
							type='date'
							value={filters.dateFrom ?? ''}
							onChange={e =>
								onChange({
									...filters,
									dateFrom: e.target.value || undefined,
								})
							}
							className='mt-1 w-full rounded-md border px-3 py-2 text-sm'
						/>
					</div>

					{/* DATA DO */}
					<div>
						<label className='text-sm font-medium'>Data do</label>
						<input
							type='date'
							value={filters.dateTo ?? ''}
							onChange={e =>
								onChange({
									...filters,
									dateTo: e.target.value || undefined,
								})
							}
							className='mt-1 w-full rounded-md border px-3 py-2 text-sm'
						/>
					</div>

					{/* KLASA */}
					<div>
						<label className='text-sm font-medium'>Klasa papryki</label>
						<select
							value={filters.pepperClass ?? 'ALL'}
							onChange={e =>
								onChange({
									...filters,
									pepperClass: e.target.value === 'ALL' ? 'ALL' : (Number(e.target.value) as 1 | 2 | 3),
								})
							}
							className='mt-1 w-full rounded-md border px-3 py-2 text-sm'>
							<option value='ALL'>Wszystkie</option>
							<option value='1'>1</option>
							<option value='2'>2</option>
							<option value='3'>Krojona</option>
						</select>
					</div>

					{/* KOLOR */}
					<div>
						<label className='text-sm font-medium'>Kolor papryki</label>
						<select
							value={filters.pepperColor ?? 'ALL'}
							onChange={e =>
								onChange({
									...filters,
									pepperColor: e.target.value as Filters['pepperColor'],
								})
							}
							className='mt-1 w-full rounded-md border px-3 py-2 text-sm'>
							<option value='ALL'>Wszystkie</option>
							<option value='Czerwona'>Czerwona</option>
							<option value='Żółta'>Żółta</option>
							<option value='Pomarańczowa'>Pomarańczowa</option>
							<option value='Zielona'>Zielona</option>
						</select>
					</div>

					{/* PUNKT SPRZEDAŻY */}
					<div>
						<label className='text-sm font-medium'>Punkt sprzedaży</label>
						<select
							value={filters.pointOfSaleId ?? 'ALL'}
							onChange={e =>
								onChange({
									...filters,
									pointOfSaleId: e.target.value === 'ALL' ? 'ALL' : Number(e.target.value),
								})
							}
							className='mt-1 w-full rounded-md border px-3 py-2 text-sm'>
							<option value='ALL'>Wszystkie</option>
							{points.map(p => (
								<option key={p.id} value={p.id}>
									{p.name}
								</option>
							))}
						</select>
					</div>

					{/* VAT */}
					<div>
						<label className='text-sm font-medium'>Stawka VAT</label>
						<select
							value={filters.vatRate ?? 'ALL'}
							onChange={e =>
								onChange({
									...filters,
									vatRate: e.target.value === 'ALL' ? 'ALL' : Number(e.target.value),
								})
							}
							className='mt-1 w-full rounded-md border px-3 py-2 text-sm'>
							<option value='ALL'>Wszystkie</option>
							<option value='0'>0%</option>
							<option value='7'>7%</option>
						</select>
					</div>

					{/* SORT */}
					<div className='md:col-span-2'>
						<label className='text-sm font-medium'>Sortowanie</label>
						<select
							value={filters.sort}
							onChange={e =>
								onChange({
									...filters,
									sort: e.target.value as Filters['sort'],
								})
							}
							className='mt-1 w-full rounded-md border px-3 py-2 text-sm'>
							<option value='DATE_DESC'>Data – malejąco</option>
							<option value='DATE_ASC'>Data – rosnąco</option>
						</select>
					</div>
				</div>

				{/* ACTIONS */}
				<div className='mt-6 flex justify-end gap-3'>
					<button onClick={onReset} className='rounded-md border px-4 py-2 text-sm hover:cursor-pointer'>
						Resetuj
					</button>
					<button
						onClick={onClose}
						className='rounded-md bg-mainColor px-4 py-2 text-sm text-white hover:cursor-pointer'>
						Zastosuj
					</button>
				</div>
			</div>
		</div>
	)
}

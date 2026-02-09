import type { PointOfSale } from '../../../types/PointOfSale'

type InvoiceFilters = {
	dateFrom?: string
	dateTo?: string
	pointOfSaleId?: number | 'ALL'
}

type Props = {
	filters: InvoiceFilters
	points: PointOfSale[]
	onChange: (f: InvoiceFilters) => void
	onClose: () => void
	onReset: () => void
}

export default function InvoiceFiltersModal({ filters, points, onChange, onClose, onReset }: Props) {
	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
			<div className='w-full max-w-lg rounded-lg bg-white p-6 shadow-lg'>
				<h3 className='mb-2 text-lg font-semibold'>Filtry faktur</h3>
				<p className='mb-4 text-sm text-gray-500'>Zawęź listę faktur według zakresu dat oraz punktu sprzedaży.</p>

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

					{/* PUNKT SPRZEDAŻY */}
					<div className='md:col-span-2'>
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

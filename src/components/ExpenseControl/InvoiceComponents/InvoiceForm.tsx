import { useState } from 'react'
import SystemButton from '../../ui/SystemButton'
import type { Invoice } from '../../../types/Invoice'
import type { PointOfSale } from '../../../types/PointOfSale'
import { useFormatUtils } from '../../../hooks/useFormatUtils'

/* =======================
   TYPES
======================= */
type Props = {
	initial: Invoice | null
	points: PointOfSale[]
	onSave: (i: Invoice) => void
	onCancel: () => void
}

type InvoiceFormState = {
	id: number
	farmerId: number
	pointOfSaleId: number | ''
	invoiceDate: string
	invoiceNumber: string
	amount: number | ''
}

type Errors = Partial<Record<keyof InvoiceFormState, string>>

/* =======================
   COMPONENT
======================= */
export default function InvoiceForm({ initial, points, onSave, onCancel }: Props) {
	/* =======================
     STATE
  ======================= */
	const { userCurrency, getCurrencySymbol, convertCurrency } = useFormatUtils()
	const [errors, setErrors] = useState<Errors>({})

	const [form, setForm] = useState<InvoiceFormState>({
		id: initial?.id ?? 0,
		farmerId: initial?.farmerId ?? 0,
		pointOfSaleId: initial?.pointOfSaleId ?? '',
		invoiceDate: initial?.invoiceDate ?? new Date().toISOString().slice(0, 10),
		invoiceNumber: initial?.invoiceNumber ?? '',
		amount: initial?.amount ?? '',
	})

	/* =======================
     VALIDATION
  ======================= */
	function validateAll(): boolean {
		const e: Errors = {}

		if (!form.invoiceDate) e.invoiceDate = 'Wybierz datę wystawienia'
		if (!form.pointOfSaleId) e.pointOfSaleId = 'Wybierz punkt sprzedaży'
		if (!form.invoiceNumber.trim()) e.invoiceNumber = 'Podaj numer faktury'
		if (form.amount === '' || form.amount <= 0) e.amount = 'Nieprawidłowa kwota'

		setErrors(e)
		return Object.keys(e).length === 0
	}

	/* =======================
     SAVE
  ======================= */
	function handleSave() {
		if (!validateAll()) return

		const amountInPln = userCurrency === 'EUR' ? convertCurrency(Number(form.amount), 'PLN') : Number(form.amount)

		const payload: Invoice = {
			id: form.id,
			farmerId: form.farmerId,
			pointOfSaleId: Number(form.pointOfSaleId),
			invoiceDate: form.invoiceDate,
			invoiceNumber: form.invoiceNumber.trim(),
			amount: amountInPln,
			status: initial?.status ?? false, // nowa = oczekująca
		}

		onSave(payload)
	}

	/* =======================
     RENDER
  ======================= */
	return (
		<section className='mt-6 border-t pt-4'>
			<h2 className='text-xl font-semibold'>{initial ? 'Edytuj fakturę' : 'Dodaj fakturę'}</h2>

			<div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
				<Input
					label='Data wystawienia'
					type='date'
					value={form.invoiceDate}
					error={errors.invoiceDate}
					onChange={e => setForm(p => ({ ...p, invoiceDate: e.target.value }))}
				/>

				<Select
					label='Punkt sprzedaży'
					value={String(form.pointOfSaleId)}
					error={errors.pointOfSaleId}
					options={[
						{ label: '— Wybierz punkt sprzedaży —', value: '' },
						...points.map(p => ({ label: p.name, value: String(p.id) })),
					]}
					onChange={e =>
						setForm(p => ({
							...p,
							pointOfSaleId: e.target.value === '' ? '' : Number(e.target.value),
						}))
					}
				/>

				<Input
					label='Numer faktury'
					value={form.invoiceNumber}
					error={errors.invoiceNumber}
					onChange={e => setForm(p => ({ ...p, invoiceNumber: e.target.value }))}
				/>

				<Input
					type='number'
					step='0.01'
					label={`Kwota (${getCurrencySymbol()})`}
					value={form.amount}
					error={errors.amount}
					onChange={e =>
						setForm(p => ({
							...p,
							amount: e.target.value === '' ? '' : Number(e.target.value),
						}))
					}
				/>
			</div>

			<div className='mt-6 flex gap-3'>
				<SystemButton onClick={handleSave}>Zapisz</SystemButton>
				<SystemButton variant='outline' onClick={onCancel}>
					Anuluj
				</SystemButton>
			</div>
		</section>
	)
}

/* =======================
   INPUT
======================= */
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
	label: string
	error?: string
}

function Input({ label, error, ...props }: InputProps) {
	return (
		<div>
			<label className='block text-sm font-medium text-gray-700'>{label}</label>
			<input
				{...props}
				className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${error ? 'border-red-500' : ''}`}
			/>
			{error && <p className='mt-1 text-xs text-red-600'>{error}</p>}
		</div>
	)
}

/* =======================
   SELECT
======================= */
type SelectOption = { label: string; value: string }

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
	label: string
	options: SelectOption[]
	error?: string
}

function Select({ label, options, error, ...props }: SelectProps) {
	return (
		<div>
			<label className='block text-sm font-medium text-gray-700'>{label}</label>
			<select {...props} className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${error ? 'border-red-500' : ''}`}>
				{options.map(o => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>
			{error && <p className='mt-1 text-xs text-red-600'>{error}</p>}
		</div>
	)
}

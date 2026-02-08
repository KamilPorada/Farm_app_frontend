import { useState } from 'react'
import SystemButton from '../../ui/SystemButton'
import type { Expense, ExpenseCategory } from '../../../types/Expense'
import { useMeData } from '../../../hooks/useMeData'
import { useCurrencyRate } from '../../../hooks/useCurrencyRate'

type Props = {
	initial: Expense | null
	categories: ExpenseCategory[]
	onSave: (e: Expense) => void
	onCancel: () => void
}

type FormState = {
	expenseDate: string
	title: string
	expenseCategoryId: number | ''
	unit: string
	quantity: number | ''
	price: number | '' 
}

type Errors = Partial<Record<keyof FormState, string>>

export default function ExpenseForm({ initial, categories, onSave, onCancel }: Props) {
	const { appSettings } = useMeData()
	const { eurRate } = useCurrencyRate()

	const currency = appSettings?.currency === 'EUR' ? 'EUR' : 'PLN'

	const [errors, setErrors] = useState<Errors>({})

	const [form, setForm] = useState<FormState>({
		expenseDate: initial?.expenseDate ?? new Date().toISOString().slice(0, 10),
		title: initial?.title ?? '',
		expenseCategoryId: initial?.expenseCategoryId ?? '',
		unit: initial?.unit ?? '',
		quantity: initial?.quantity ?? '',
		price:
			initial?.price !== undefined
				? currency === 'EUR'
					? Number((initial.price / eurRate).toFixed(2))
					: initial.price
				: '',
	})

	/* =======================
	   VALIDATION
	======================= */
	function validate(): boolean {
		const e: Errors = {}

		if (!form.expenseDate) e.expenseDate = 'Wybierz datę'
		if (!form.title.trim()) e.title = 'Podaj tytuł'
		if (!form.expenseCategoryId) e.expenseCategoryId = 'Wybierz kategorię'
		if (!form.unit.trim()) e.unit = 'Podaj jednostkę'
		if (form.quantity === '' || form.quantity <= 0) e.quantity = 'Nieprawidłowa ilość'
		if (form.price === '' || form.price <= 0) e.price = 'Nieprawidłowa kwota'

		setErrors(e)
		return Object.keys(e).length === 0
	}

	/* =======================
	   SAVE
	======================= */
	function handleSave() {
		if (!validate()) return

		const pricePln =
			currency === 'EUR'
				? Number((Number(form.price) * eurRate).toFixed(2))
				: Number(form.price)

		const payload: Expense = {
			id: initial?.id ?? 0,
			farmerId: initial?.farmerId ?? 0,
			expenseCategoryId: Number(form.expenseCategoryId),
			expenseDate: form.expenseDate,
			title: form.title.trim(),
			unit: form.unit.trim(),
			quantity: Number(form.quantity),
			price: pricePln,
		}

		onSave(payload)
	}

	/* =======================
	   RENDER
	======================= */
	return (
		<section className='mt-6 border-t pt-6'>
			<h2 className='text-xl font-semibold'>
				{initial ? 'Edytuj wydatek' : 'Dodaj wydatek'}
			</h2>

			<div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
				<Input
					label='Data'
					type='date'
					value={form.expenseDate}
					error={errors.expenseDate}
					onChange={e => setForm(p => ({ ...p, expenseDate: e.target.value }))}
				/>

				<Input
					label='Tytuł'
					value={form.title}
					error={errors.title}
					onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
				/>

				<Select
					label='Kategoria'
					value={String(form.expenseCategoryId)}
					error={errors.expenseCategoryId}
					options={[
						{ label: '— Wybierz kategorię —', value: '' },
						...categories.map(c => ({ label: c.name, value: String(c.id) })),
					]}
					onChange={e =>
						setForm(p => ({
							...p,
							expenseCategoryId: e.target.value === '' ? '' : Number(e.target.value),
						}))
					}
				/>

				<Input
					label='Jednostka'
					value={form.unit}
					error={errors.unit}
					onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
				/>

				<Input
					type='number'
					step='0.01'
					label='Ilość'
					value={form.quantity}
					error={errors.quantity}
					onChange={e =>
						setForm(p => ({
							...p,
							quantity: e.target.value === '' ? '' : Number(e.target.value),
						}))
					}
				/>

				<Input
					type='number'
					step='0.01'
					label={`Kwota (${currency})`}
					value={form.price}
					error={errors.price}
					onChange={e =>
						setForm(p => ({
							...p,
							price: e.target.value === '' ? '' : Number(e.target.value),
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
				className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${
					error ? 'border-red-500' : ''
				}`}
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
			<select
				{...props}
				className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${
					error ? 'border-red-500' : ''
				}`}
			>
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

import { useState } from 'react'
import SystemButton from '../ui/SystemButton'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import type { PointOfSale } from '../../types/PointOfSale'
import { useFormatUtils } from '../../hooks/useFormatUtils'

/* =======================
   TYPES
======================= */
type Props = {
	initial: TradeOfPepper | null
	points: PointOfSale[]
	onSave: (t: TradeOfPepper) => void
	onCancel: () => void
}

type TradeOfPepperFormState = {
	id: number
	farmerId: number
	pointOfSaleId: number | ''
	tradeDate: string
	pepperClass: 1 | 2 | 3
	pepperColor: 'Czerwona' | 'Żółta' | 'Pomarańczowa' | 'Zielona'
	tradePrice: number | '' // UI currency
	tradeWeight: number | '' // UI unit
	vatRate: number | ''
}

type Errors = Partial<Record<keyof TradeOfPepperFormState, string>>

/* =======================
   COMPONENT
======================= */
export default function TradeOfPepperForm({ initial, points, onSave, onCancel }: Props) {
	const {
		userCurrency,
		userWeightUnit,
		getCurrencySymbol,
		isCurrencyReady,
		toPLN,
	} = useFormatUtils()

	/* =======================
	   STATE
	======================= */
	const [errors, setErrors] = useState<Errors>({})

	const [form, setForm] = useState<TradeOfPepperFormState>({
		id: initial?.id ?? 0,
		farmerId: initial?.farmerId ?? 0,
		pointOfSaleId: initial?.pointOfSaleId ?? '',
		tradeDate: initial?.tradeDate ?? new Date().toISOString().slice(0, 10),
		pepperClass: initial?.pepperClass ?? 1,
		pepperColor: initial?.pepperColor ?? 'Czerwona',
		tradePrice:
			initial?.tradePrice !== undefined
				? userCurrency === 'EUR'
					? toPLN(Number(initial.tradePrice))
					: initial.tradePrice
				: '',
		tradeWeight:
			initial?.tradeWeight !== undefined
				? userWeightUnit === 't'
					? initial.tradeWeight / 1000
					: initial.tradeWeight
				: '',
		vatRate: initial?.vatRate ?? '',
	})

	/* =======================
	   VALIDATION
	======================= */
	function validateAll(): boolean {
		const e: Errors = {}

		if (!form.tradeDate) e.tradeDate = 'Wybierz datę transakcji'
		if (!form.pointOfSaleId) e.pointOfSaleId = 'Wybierz punkt sprzedaży'
		if (![1, 2, 3].includes(form.pepperClass)) e.pepperClass = 'Wybierz klasę'
		if (!form.pepperColor) e.pepperColor = 'Wybierz kolor'
		if (form.tradePrice === '' || form.tradePrice <= 0) e.tradePrice = 'Nieprawidłowa cena'
		if (form.tradeWeight === '' || form.tradeWeight <= 0) e.tradeWeight = 'Nieprawidłowa waga'
		if (form.vatRate === '' || form.vatRate < 0 || form.vatRate > 100) e.vatRate = 'Nieprawidłowy VAT'

		setErrors(e)
		return Object.keys(e).length === 0
	}

	/* =======================
	   SAVE → BASE UNITS
	   PLN + kg
	======================= */
	function handleSave() {
		if (!validateAll()) return
		if (!isCurrencyReady) return

		const payload: TradeOfPepper = {
			id: form.id,
			farmerId: form.farmerId,
			pointOfSaleId: Number(form.pointOfSaleId),
			tradeDate: form.tradeDate,
			pepperClass: form.pepperClass,
			pepperColor: form.pepperColor,

			// 🔒 ZŁOTA ZASADA
			tradePrice: userCurrency === 'EUR' ? toPLN(Number(form.tradePrice)) : Number(form.tradePrice),

			tradeWeight: userWeightUnit === 't' ? Number(form.tradeWeight) * 1000 : Number(form.tradeWeight),

			vatRate: Number(form.vatRate),
		}

		onSave(payload)
	}

	/* =======================
	   RENDER
	======================= */
	return (
		<section className='mt-6 border-t pt-4'>
			<h2 className='text-xl font-semibold'>{initial ? 'Edytuj transakcję papryki' : 'Dodaj transakcję papryki'}</h2>

			<div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
				<Input
					label='Data transakcji'
					type='date'
					value={form.tradeDate}
					error={errors.tradeDate}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, tradeDate: e.target.value }))}
				/>

				<Select
					label='Punkt sprzedaży'
					value={String(form.pointOfSaleId)}
					error={errors.pointOfSaleId}
					options={[
						{ label: '— Wybierz punkt sprzedaży —', value: '' },
						...points.map(p => ({ label: p.name, value: String(p.id) })),
					]}
					onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
						setForm(p => ({
							...p,
							pointOfSaleId: e.target.value === '' ? '' : Number(e.target.value),
						}))
					}
				/>

				<Select
					label='Klasa'
					value={String(form.pepperClass)}
					error={errors.pepperClass}
					options={[
						{ label: '1', value: '1' },
						{ label: '2', value: '2' },
						{ label: 'Krojona', value: '3' },
					]}
					onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
						setForm(p => ({
							...p,
							pepperClass: Number(e.target.value) as 1 | 2 | 3,
						}))
					}
				/>

				<Select
					label='Kolor'
					value={form.pepperColor}
					error={errors.pepperColor}
					options={[
						{ label: 'Czerwona', value: 'Czerwona' },
						{ label: 'Żółta', value: 'Żółta' },
						{ label: 'Pomarańczowa', value: 'Pomarańczowa' },
						{ label: 'Zielona', value: 'Zielona' },
					]}
					onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
						setForm(p => ({
							...p,
							pepperColor: e.target.value as TradeOfPepperFormState['pepperColor'],
						}))
					}
				/>

				<Input
					type='number'
					step='0.01'
					label={`Cena (${getCurrencySymbol()} / kg)`}
					value={form.tradePrice}
					error={errors.tradePrice}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setForm(p => ({
							...p,
							tradePrice: e.target.value === '' ? '' : Number(e.target.value),
						}))
					}
				/>

				<Input
					type='number'
					step='0.01'
					label={`Waga (${userWeightUnit})`}
					value={form.tradeWeight}
					error={errors.tradeWeight}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setForm(p => ({
							...p,
							tradeWeight: e.target.value === '' ? '' : Number(e.target.value),
						}))
					}
				/>

				<Input
					type='number'
					label='VAT (%)'
					value={form.vatRate}
					error={errors.vatRate}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setForm(p => ({
							...p,
							vatRate: e.target.value === '' ? '' : Number(e.target.value),
						}))
					}
				/>
			</div>

			<div className='mt-6 flex gap-3'>
				<SystemButton onClick={handleSave} disabled={!isCurrencyReady}>
					Zapisz
				</SystemButton>
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

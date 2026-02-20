import { useState } from 'react'
import SystemButton from '../ui/SystemButton'
import type { Fertilizer } from '../../types/Fertilizer'

type Props = {
	initial: Fertilizer | null
	onSave: (f: Fertilizer) => void
	onCancel: () => void
}

type Errors = {
	name?: string
	form?: string
}

const FORM_OPTIONS = ['Płynny', 'Krystaliczny', 'Granulowany', 'Proszkowy']

export default function FertilizerForm({ initial, onSave, onCancel }: Props) {
	const [errors, setErrors] = useState<Errors>({})

	const [form, setForm] = useState<Fertilizer>({
		id: initial?.id ?? 0,
		farmerId: initial?.farmerId ?? 0,
		name: initial?.name ?? '',
		form: initial?.form ?? FORM_OPTIONS[0],
	})

	/* =======================
	   WALIDACJA
	======================= */
	function validate(): boolean {
		const e: Errors = {}

		if (!form.name.trim()) {
			e.name = 'Podaj nazwę nawozu'
		} else if (form.name.trim().length < 2) {
			e.name = 'Nazwa musi mieć minimum 2 znaki'
		}

		if (!form.form) {
			e.form = 'Wybierz formę nawozu'
		}

		setErrors(e)
		return Object.keys(e).length === 0
	}

	function handleSave() {
		if (!validate()) return
		onSave(form)
	}

	return (
		<section className='mt-6 border-t pt-4'>
			<h2 className='text-xl font-semibold'>{initial ? 'Edytuj nawóz' : 'Dodaj nawóz'}</h2>

			<div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
				<Input
					label='Nazwa nawozu'
					value={form.name}
					error={errors.name}
					onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
				/>

				<Select
					label='Forma nawozu'
					value={form.form}
					error={errors.form}
					options={FORM_OPTIONS}
					onChange={e => setForm(p => ({ ...p, form: e.target.value }))}
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

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
	label: string
	options: string[]
	error?: string
}

function Select({ label, options, error, ...props }: SelectProps) {
	return (
		<div>
			<label className='block text-sm font-medium text-gray-700'>{label}</label>
			<select {...props} className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${error ? 'border-red-500' : ''}`}>
				{options.map(option => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
			{error && <p className='mt-1 text-xs text-red-600'>{error}</p>}
		</div>
	)
}

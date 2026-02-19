import { useState } from 'react'
import SystemButton from '../ui/SystemButton'
import type { Pesticide, PesticideType } from '../../types/Pesticide'

type Props = {
	initial: Pesticide | null
	types: PesticideType[]
	onSave: (p: Pesticide) => void
	onCancel: () => void
}

type FormState = {
	name: string
	pesticideTypeId: number | ''
	isLiquid: boolean
	targetPest: string
	carenceDays: number | ''
}

type Errors = Partial<Record<keyof FormState, string>>

export default function PesticideForm({ initial, types, onSave, onCancel }: Props) {
	const [errors, setErrors] = useState<Errors>({})

	const [form, setForm] = useState<FormState>({
		name: initial?.name ?? '',
		pesticideTypeId: initial?.pesticideTypeId ?? '',
		isLiquid: initial?.isLiquid ?? true,
		targetPest: initial?.targetPest ?? '',
		carenceDays: initial?.carenceDays ?? '',
	})

	function validate(): boolean {
		const e: Errors = {}

		if (!form.name.trim()) e.name = 'Podaj nazwę środka'
		if (!form.pesticideTypeId) e.pesticideTypeId = 'Wybierz typ środka'
		if (!form.targetPest.trim()) e.targetPest = 'Podaj nazwę zwalczanego szkodnika'
		if (form.carenceDays === '' || form.carenceDays < 0)
			e.carenceDays = 'Nieprawidłowa liczba dni'

		setErrors(e)
		return Object.keys(e).length === 0
	}

	function handleSave() {
		if (!validate()) return

		const payload: Pesticide = {
			id: initial?.id ?? 0,
			farmerId: initial?.farmerId ?? 0,
			pesticideTypeId: Number(form.pesticideTypeId),
			name: form.name.trim(),
			isLiquid: form.isLiquid,
			targetPest: form.targetPest.trim(),
			carenceDays: Number(form.carenceDays),
		}

		onSave(payload)
	}

	return (
		<section className='mt-6 border-t pt-6'>
			<h2 className='text-xl font-semibold'>
				{initial ? 'Edytuj środek' : 'Dodaj środek ochrony roślin'}
			</h2>

			<div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
				<Input
					label='Nazwa środka'
					value={form.name}
					error={errors.name}
					onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
				/>

				<Select
					label='Typ środka'
					value={String(form.pesticideTypeId)}
					error={errors.pesticideTypeId}
					options={[
						{ label: '— Wybierz typ —', value: '' },
						...types.map(t => ({ label: t.name, value: String(t.id) })),
					]}
					onChange={e =>
						setForm(p => ({
							...p,
							pesticideTypeId: e.target.value === '' ? '' : Number(e.target.value),
						}))
					}
				/>

				<div>
					<label className='block text-sm font-medium text-gray-700'>Forma środka</label>
					<select
						className='mt-1 w-full rounded-md border px-3 py-2 text-sm'
						value={form.isLiquid ? 'liquid' : 'solid'}
						onChange={e =>
							setForm(p => ({
								...p,
								isLiquid: e.target.value === 'liquid',
							}))
						}
					>
						<option value='liquid'>Płynna</option>
						<option value='solid'>Proszek / granulat</option>
					</select>
				</div>

				<Input
					label='Zwalczany szkodnik / choroba'
					value={form.targetPest}
					error={errors.targetPest}
					onChange={e => setForm(p => ({ ...p, targetPest: e.target.value }))}
				/>

				<Input
					type='number'
					label='Karencja (dni)'
					value={form.carenceDays}
					error={errors.carenceDays}
					onChange={e =>
						setForm(p => ({
							...p,
							carenceDays: e.target.value === '' ? '' : Number(e.target.value),
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

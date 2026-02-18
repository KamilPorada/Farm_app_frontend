import { useState, useEffect } from 'react'
import SystemButton from '../ui/SystemButton'
import type { Employee } from '../../types/Employee'
import { useFormatUtils } from '../../hooks/useFormatUtils'

/* =======================
   TYPES
======================= */
type Props = {
	initial: Employee | null
	farmerId: number
	seasonYear: number
	onSave: (e: Employee) => void
	onCancel: () => void
}

type EmployeeFormState = {
	id: number
	firstName: string
	lastName: string
	age: number | ''
	nationality: string
	salary: number | ''
	startDate: string
}

type Errors = Partial<Record<keyof EmployeeFormState, string>>

/* =======================
   COMPONENT
======================= */
export default function EmployeeForm({ initial, farmerId, seasonYear, onSave, onCancel }: Props) {
	const { userCurrency, getCurrencySymbol, toPLN, toEURO } = useFormatUtils()
	const [errors, setErrors] = useState<Errors>({})

	const [form, setForm] = useState<EmployeeFormState>({
		id: initial?.id ?? 0,
		firstName: initial?.firstName ?? '',
		lastName: initial?.lastName ?? '',
		age: initial?.age ?? '',
		nationality: initial?.nationality ?? '',
		salary: initial?.salary ?? '',
		startDate: initial?.startDate ?? new Date().toISOString().slice(0, 10),
	})

	console.log(initial?.salary !== undefined ? (userCurrency === 'EUR' ? toEURO(initial.salary) : initial.salary) : '')

	/* =======================
	   VALIDATION
	======================= */
	function validate(): boolean {
		const e: Errors = {}

		if (!form.firstName.trim()) e.firstName = 'Podaj imię!'
		if (!form.lastName.trim()) e.lastName = 'Podaj nazwisko!'

		// AGE
		if (form.age == '') {
			e.age = 'Podaj wiek!'
		}

		// NATIONALITY
		if (form.nationality.trim().length === 0) {
			e.nationality = 'Podaj nazwę narodowości!'
		}

		// SALARY
		if (form.salary === '' || form.salary <= 0) {
			e.salary = 'Podaj wynagrodzenie!'
		}

		// START DATE
		if (!form.startDate) {
			e.startDate = 'Wybierz datę zatrudnienia!'
		} else {
			const year = new Date(form.startDate).getFullYear()
			if (year !== seasonYear) {
				e.startDate = `Data musi należeć do sezonu ${seasonYear}!`
			}
		}

		setErrors(e)
		return Object.keys(e).length === 0
	}

	/* =======================
	   SAVE
	======================= */
	function handleSave() {
		if (!validate()) return

		const salaryInPln = userCurrency === 'EUR' ? toPLN(Number(form.salary)) : Number(form.salary)

		const payload: Employee = {
			id: form.id,
			farmerId,
			firstName: form.firstName.trim(),
			lastName: form.lastName.trim(),
			age: form.age === '' ? null : Number(form.age),
			nationality: form.nationality.trim() || null,
			salary: salaryInPln,
			startDate: form.startDate,
			finishDate: initial?.finishDate ?? null,
			seasonYear,
		}

		onSave(payload)
	}

	if (!form) return null

	/* =======================
	   RENDER
	======================= */
	return (
		<section className='mt-6 border-t pt-4'>
			<h2 className='text-xl font-semibold'>{initial ? 'Edytuj pracownika' : 'Dodaj pracownika'}</h2>

			<div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
				<Input
					label='Imię'
					value={form.firstName}
					error={errors.firstName}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, firstName: e.target.value }))}
				/>

				<Input
					label='Nazwisko'
					value={form.lastName}
					error={errors.lastName}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, lastName: e.target.value }))}
				/>

				<Input
					label='Wiek'
					type='number'
					value={form.age}
					error={errors.age}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setForm(p => ({
							...p,
							age: e.target.value === '' ? '' : Number(e.target.value),
						}))
					}
				/>

				<Input
					label='Narodowość'
					value={form.nationality}
					error={errors.nationality}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, nationality: e.target.value }))}
				/>

				<Input
					label={`Wynagrodzenie (${getCurrencySymbol()}/h)`}
					type='number'
					step='0.01'
					value={form.salary}
					error={errors.salary}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setForm(p => ({
							...p,
							salary: e.target.value === '' ? '' : Number(e.target.value),
						}))
					}
				/>

				<Input
					label='Data zatrudnienia'
					type='date'
					value={form.startDate}
					error={errors.startDate}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, startDate: e.target.value }))}
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

function Input({ label, error, value, ...props }: InputProps) {
	return (
		<div>
			<label className='block text-sm font-medium text-gray-700'>{label}</label>
			<input
				{...props}
				value={value ?? ''}
				className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${error ? 'border-red-500' : ''}`}
			/>
			{error && <p className='mt-1 text-xs text-red-600'>{error}</p>}
		</div>
	)
}

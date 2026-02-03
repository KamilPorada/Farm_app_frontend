import { useState } from 'react'
import SystemButton from '../ui/SystemButton'
import type { PointOfSale } from '../../types/PointOfSale'

type Props = {
	initial: PointOfSale | null
	onSave: (p: PointOfSale) => void
	onCancel: () => void
}

type Errors = Partial<Record<keyof PointOfSale, string>>

export default function PointOfSaleForm({ initial, onSave, onCancel }: Props) {
	const [errors, setErrors] = useState<Errors>({})

	const [form, setForm] = useState<PointOfSale>({
		id: initial?.id ?? 0,
		farmerId: initial?.farmerId ?? 0,
		name: initial?.name ?? '',
		address: initial?.address ?? '',
		type: initial?.type ?? 'Rynek hurtowy',
		latitude: initial?.latitude ?? 0,
		longitude: initial?.longitude ?? 0,
		phone: initial?.phone ?? '+48 ',
		email: initial?.email ?? '',
	})

	/* =======================
	   FORMAT TELEFONU
	======================= */
	function formatPhone(value: string) {
		const digits = value.replace(/\D/g, '').slice(2, 11)
		const parts = digits.match(/(\d{0,3})(\d{0,3})(\d{0,3})/)
		if (!parts) return '+48 '
		return `+48 ${[parts[1], parts[2], parts[3]].filter(Boolean).join(' ')}`
	}

	/* =======================
	   WALIDACJA CAŁOŚCI
	======================= */
	function validateAll(): boolean {
		const e: Errors = {}

		// Nazwa
		if (!form.name.trim() || form.name.trim().length < 3) {
			e.name = 'Nazwa musi mieć co najmniej 3 znaki'
		}

		// Typ
		if (!form.type) {
			e.type = 'Wybierz typ punktu'
		}

		// Adres
		if (!form.address.trim() || form.address.trim().length < 5) {
			e.address = 'Adres musi mieć co najmniej 5 znaków'
		}

		// Email
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
			e.email = 'Nieprawidłowy adres email'
		}

		// Telefon
		if (!/^\+48 \d{3} \d{3} \d{3}$/.test(form.phone)) {
			e.phone = 'Telefon musi mieć format +48 123 123 123'
		}

		// Szerokość
		if (Number.isNaN(form.latitude) || form.latitude < -90 || form.latitude > 90) {
			e.latitude = 'Szerokość musi być w zakresie -90 do 90'
		}

		// Długość
		if (Number.isNaN(form.longitude) || form.longitude < -180 || form.longitude > 180) {
			e.longitude = 'Długość musi być w zakresie -180 do 180'
		}

		setErrors(e)
		return Object.keys(e).length === 0
	}

	function handleSave() {
		if (!validateAll()) return
		onSave(form)
	}

	return (
		<section className="mt-6 border-t pt-4">
			<h2 className="text-xl font-semibold">
				{initial ? 'Edytuj punkt sprzedaży' : 'Dodaj punkt sprzedaży'}
			</h2>

			<div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
				<Input label="Nazwa" value={form.name} error={errors.name}
					onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />

				<Select label="Typ punktu" value={form.type} error={errors.type}
					options={[
						{ label: 'Rynek hurtowy', value: 'Rynek hurtowy' },
						{ label: 'Skup', value: 'Skup' },
						{ label: 'Klient prywatny', value: 'Klient prywatny' },
						{ label: 'Inne', value: 'Inne' },
					]}
					onChange={e => setForm(p => ({ ...p, type: e.target.value as any }))} />

				<div className="md:col-span-2">
					<Input label="Adres" value={form.address} error={errors.address}
						onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
				</div>

				<Input label="Email" value={form.email} error={errors.email}
					onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />

				<Input label="Telefon" value={form.phone} error={errors.phone}
					onChange={e => setForm(p => ({ ...p, phone: formatPhone(e.target.value) }))} />

				<Input label="Szerokość geograficzna" type="number"
					value={form.latitude} error={errors.latitude}
					onChange={e => setForm(p => ({ ...p, latitude: Number(e.target.value) }))} />

				<Input label="Długość geograficzna" type="number"
					value={form.longitude} error={errors.longitude}
					onChange={e => setForm(p => ({ ...p, longitude: Number(e.target.value) }))} />
			</div>

			<div className="mt-6 flex gap-3">
				<SystemButton onClick={handleSave}>Zapisz</SystemButton>
				<SystemButton variant="outline" onClick={onCancel}>Anuluj</SystemButton>
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
			<label className="block text-sm font-medium text-gray-700">{label}</label>
			<input
				{...props}
				className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${
					error ? 'border-red-500' : ''
				}`}
			/>
			{error && <p className="mt-1 text-xs text-red-600">{error}</p>}
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
			<label className="block text-sm font-medium text-gray-700">{label}</label>
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
			{error && <p className="mt-1 text-xs text-red-600">{error}</p>}
		</div>
	)
}

import React, { useState } from 'react'
import Button from '../ui/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons'

export type TunnelYear = {
	year: string
	count: string
}

type form = {
	voivodeship: string
	district: string
	commune: string
	locality: string
	farmAreaHa: string
	settlementType: string
}

type Props = {
	form: {
		voivodeship: string
		district: string
		commune: string
		locality: string
		farmAreaHa: string
		settlementType: string
	}
	setForm: React.Dispatch<React.SetStateAction<form>>
	tunnels: TunnelYear[]
	setTunnels: React.Dispatch<React.SetStateAction<TunnelYear[]>>

	crops: string[]
	setCrops: React.Dispatch<React.SetStateAction<string[]>>

	cropInput: string
	setCropInput: (value: string) => void
	onSave: () => void
}

export default function FarmSection({
	form,
	setForm,
	tunnels,
	setTunnels,
	crops,
	setCrops,
	cropInput,
	setCropInput,
	onSave,
}: Props) {
	const [isAddingCrop, setIsAddingCrop] = useState(false)
	const [mode, setMode] = useState<'add' | 'edit' | null>(null)
	const [editingYear, setEditingYear] = useState<string | null>(null)
	const [newYear, setNewYear] = useState('')
	const [newCount, setNewCount] = useState('')
	const [error, setError] = useState<string | null>(null)

	/* ===== UPRAWY ===== */

	const addCrop = (): void => {
		const value = cropInput.trim()
		if (!value) return
		if (crops.includes(value)) return

		setCrops(prev => [...prev, value])
		setCropInput('')
	}

	const resetForm = () => {
		setMode(null)
		setEditingYear(null)
		setNewYear('')
		setNewCount('')
		setError(null)
	}

	const handleSave = () => {
		if (!newYear || !newCount) {
			setError('Uzupełnij wszystkie pola')
			return
		}

		if (mode === 'add' && tunnels.some(t => t.year === newYear)) {
			setError('Ten rok już istnieje')
			return
		}

		if (mode === 'add') {
			setTunnels(prev => [...prev, { year: newYear, count: newCount }])
		}

		if (mode === 'edit' && editingYear) {
			setTunnels(prev => prev.map(t => (t.year === editingYear ? { ...t, count: newCount } : t)))
		}

		resetForm()
	}

	const handleDelete = (year: string) => {
		setTunnels(prev => prev.filter(t => t.year !== year))
		if (editingYear === year) resetForm()
	}

	return (
		<section className='mt-5 border-t pt-4'>
			<h2 className='text-xl font-semibold text-gray-900'>Dane gospodarstwa</h2>
			<p className='mt-1 text-sm text-gray-500'>Informacje wykorzystywane w analizach, raportach oraz rozliczeniach.</p>

			{/* ===== ADRES ===== */}
			<div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
				<Select
					label='Województwo'
					options={[
						{ label: 'Dolnośląskie', value: 'DOLNOSLASKIE' },
						{ label: 'Kujawsko-Pomorskie', value: 'KUJAWSKO_POMORSKIE' },
						{ label: 'Lubelskie', value: 'LUBELSKIE' },
						{ label: 'Lubuskie', value: 'LUBUSKIE' },
						{ label: 'Łódzkie', value: 'LODZKIE' },
						{ label: 'Małopolskie', value: 'MALOPOLSKIE' },
						{ label: 'Mazowieckie', value: 'MAZOWIECKIE' },
						{ label: 'Opolskie', value: 'OPOLSKIE' },
						{ label: 'Podkarpackie', value: 'PODKARPACKIE' },
						{ label: 'Podlaskie', value: 'PODLASKIE' },
						{ label: 'Pomorskie', value: 'POMORSKIE' },
						{ label: 'Śląskie', value: 'SLASKIE' },
						{ label: 'Świętokrzyskie', value: 'SWIETOKRZYSKIE' },
						{ label: 'Warmińsko-Mazurskie', value: 'WARMINSKO_MAZURSKIE' },
						{ label: 'Wielkopolskie', value: 'WIELKOPOLSKIE' },
						{ label: 'Zachodniopomorskie', value: 'ZACHODNIOPOMORSKIE' },
					]}
					value={form.voivodeship}
					onChange={e => setForm(prev => ({ ...prev, voivodeship: e.target.value }))}
				/>

				<Input
					label='Powiat'
					value={form.district}
					onChange={e => setForm(prev => ({ ...prev, district: e.target.value }))}
				/>

				<Input
					label='Gmina'
					value={form.commune}
					onChange={e => setForm(prev => ({ ...prev, commune: e.target.value }))}
				/>

				<Input
					label='Miejscowość'
					value={form.locality}
					onChange={e => setForm(prev => ({ ...prev, locality: e.target.value }))}
				/>
			</div>

			{/* ===== POWIERZCHNIA + VAT ===== */}
			<div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
				<Input
					label='Powierzchnia gospodarstwa (ha)'
					type='number'
					min='0'
					step='0.01'
					value={form.farmAreaHa}
					onChange={e => setForm(prev => ({ ...prev, farmAreaHa: e.target.value }))}
				/>

				<Select
					label='Forma rozliczenia'
					options={[
						{ label: 'Podatnik VAT', value: 'VAT' },
						{ label: 'Ryczałt', value: 'RYCZALT' },
					]}
					value={form.settlementType}
					onChange={e => setForm(prev => ({ ...prev, settlementType: e.target.value }))}
				/>
			</div>

			{/* ===== TUNELE ===== */}
			{/* ===== TUNELE ===== */}
			{/* ===== TUNELE FOLIOWE ===== */}
			<div className='mt-8'>
				{/* ===== HEADER ===== */}
				<div className='flex items-center justify-between'>
					<div>
						<h3 className='text-sm font-medium text-gray-900'>Tunele foliowe</h3>
						<p className='mt-1 text-sm text-gray-500'>Liczba tuneli w poszczególnych latach.</p>
					</div>

					<button
						type='button'
						onClick={() => {
							setMode('add')
							setNewYear('')
							setNewCount('')
							setError(null)
						}}
						className='flex items-center gap-1 text-sm text-mainColor hover:underline hover:cursor-pointer'>
						<span className='text-lg leading-none'>＋</span> Dodaj
					</button>
				</div>

				{/* ===== LISTA ===== */}
				{tunnels.length > 0 && (
					<div className='mt-4 md:w-1/2 space-y-2'>
						{[...tunnels]
							.sort((a, b) => Number(a.year) - Number(b.year))
							.map(t => (
								<div key={t.year} className='flex items-center gap-4 rounded-md border bg-white px-4 py-2 text-sm'>
									{/* ROK */}
									<div className='flex-1'>
										<p className='text-xs text-gray-500'>Rok</p>
										<p className='font-medium text-gray-900'>{t.year}</p>
									</div>

									{/* TUNELE */}
									<div className='flex-1 text-right'>
										<p className='text-xs text-gray-500'>Tunele</p>
										<p className='font-medium text-gray-900'>{t.count}</p>
									</div>

									{/* ACTIONS */}
									<div className='flex items-center gap-1'>
										<button
											type='button'
											onClick={() => {
												setMode('edit')
												setEditingYear(t.year)
												setNewYear(t.year)
												setNewCount(t.count)
												setError(null)
											}}
											className='flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-mainColor hover:cursor-pointer'
											aria-label={`Edytuj rok ${t.year}`}>
											<FontAwesomeIcon icon={faPen} />
										</button>

										<button
											type='button'
											onClick={() => handleDelete(t.year)}
											className='flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 hover:cursor-pointer'
											aria-label={`Usuń rok ${t.year}`}>
											<FontAwesomeIcon icon={faTrash} />
										</button>
									</div>
								</div>
							))}
					</div>
				)}

				{/* ===== FORMULARZ (ADD + EDIT) ===== */}
				{mode && (
					<div className='mt-4 md:w-1/2 rounded-md border bg-white p-4'>
						<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
							<Input
								label='Rok'
								value={newYear}
								disabled={mode === 'edit'}
								onChange={e => {
									setNewYear(e.target.value)
									setError(null)
								}}
							/>
							<Input
								label='Tunele'
								type='number'
								value={newCount}
								onChange={e => {
									setNewCount(e.target.value)
									setError(null)
								}}
							/>
						</div>

						{error && <p className='mt-2 text-sm text-red-600'>{error}</p>}

						<div className='mt-4 flex justify-end gap-2'>
							<button
								type='button'
								onClick={resetForm}
								className='rounded-md border px-3 py-1 text-sm hover:bg-gray-50 hover:cursor-pointer'>
								Anuluj
							</button>

							<button
								type='button'
								onClick={handleSave}
								className='rounded-md bg-mainColor px-3 py-1 text-sm text-white hover:cursor-pointer'>
								{mode === 'edit' ? 'Zapisz zmiany' : 'Zapisz'}
							</button>
						</div>
					</div>
				)}
			</div>

			{/* ===== UPRAWY ===== */}
			{/* ===== UPRAWY ===== */}
			<div className='mt-8'>
				<div className='flex items-center justify-between'>
					<div>
						<h3 className='text-sm font-medium text-gray-900'>Uprawy</h3>
						<p className='mt-1 text-sm text-gray-500'>Dodaj uprawy prowadzone w gospodarstwie.</p>
					</div>

					<button
						type='button'
						onClick={() => setIsAddingCrop(true)}
						className='flex items-center gap-1 text-sm text-mainColor hover:underline hover:cursor-pointer'>
						<span className='text-lg leading-none'>＋</span> Dodaj
					</button>
				</div>

				{/* ===== FORMULARZ ===== */}
				{isAddingCrop && (
					<div className='mt-4 md:w-1/2 rounded-md border bg-white p-4'>
						<div className='flex gap-3'>
							<Input
								label='Nazwa uprawy'
								value={cropInput}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCropInput(e.target.value)}
								onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && addCrop()}
							/>

							<div className='flex items-end gap-2'>
								<button
									type='button'
									onClick={() => {
										setIsAddingCrop(false)
										setCropInput('')
									}}
									className='rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 hover:cursor-pointer'>
									Anuluj
								</button>

								<button
									type='button'
									onClick={() => {
										addCrop()
										setIsAddingCrop(false)
									}}
									className='rounded-md bg-mainColor px-3 py-1.5 text-sm text-white hover:cursor-pointer'>
									Zapisz
								</button>
							</div>
						</div>
					</div>
				)}

				{/* ===== LISTA PASTYLEK ===== */}
				{crops.length > 0 && (
					<div className='mt-4 flex flex-wrap gap-2'>
						{crops.map(crop => (
							<span
								key={crop}
								className='flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-gray-700 bg-white'>
								{crop}
								<button
									type='button'
									onClick={() => setCrops(prev => prev.filter(c => c !== crop))}
									className='text-gray-400 hover:text-red-500'
									aria-label={`Usuń ${crop}`}>
									×
								</button>
							</span>
						))}
					</div>
				)}
			</div>
			<Button className='mt-4' onClick={onSave}>
				Zapisz dane
			</Button>
		</section>
	)
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
	label: string
}

function Input({ label, className, ...props }: InputProps) {
	return (
		<div>
			<label className='block text-sm font-medium text-gray-700'>{label}</label>
			<input
				{...props}
				className={`mt-1 w-full rounded-md border px-3 py-2 text-sm disabled:bg-gray-100 ${className ?? ''}`}
			/>
		</div>
	)
}

type SelectOption = {
	label: string
	value: string
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
	label: string
	options: SelectOption[]
}

function Select({ label, options, className, ...props }: SelectProps) {
	return (
		<div>
			<label className='block text-sm font-medium text-gray-700'>{label}</label>
			<select {...props} className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${className ?? ''}`}>
				<option value=''>— wybierz —</option>
				{options.map(option => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	)
}

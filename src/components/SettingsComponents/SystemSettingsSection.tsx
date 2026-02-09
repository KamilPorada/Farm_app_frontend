import Button from '../ui/Button'

type AppSettingsForm = {
	language: string
	weightUnit: string
	currency: string
	dateFormat: string
	useThousandsSeparator: boolean
	boxWeightKg: string
	notificationsEnabled: boolean
}

type Props = {
	form: AppSettingsForm
	setForm: React.Dispatch<React.SetStateAction<AppSettingsForm>>
	onSave: () => void
}

export default function SystemSettingsSection({ form, setForm, onSave }: Props) {
	return (
		<section className='mt-5 border-t pt-4'>
			<h2 className='text-xl font-semibold text-gray-900'>Ustawienia systemowe</h2>
			<p className='mt-1 text-sm text-gray-500'>Dostosuj sposób działania aplikacji do własnych preferencji.</p>

			{/* ===== PODSTAWOWE ===== */}
			<div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
				<Select
					label='Język interfejsu'
					value={form.language}
					options={[
						{ label: 'Polski', value: 'pl' },
						{ label: 'English', value: 'en' },
					]}
					onChange={e => setForm(p => ({ ...p, language: e.target.value }))}
				/>

				<Select
					label='Jednostka masy'
					value={form.weightUnit}
					options={[
						{ label: 'kg', value: 'kg' },
						{ label: 't', value: 't' },
					]}
					onChange={e => setForm(p => ({ ...p, weightUnit: e.target.value }))}
				/>

				<Select
					label='Waluta'
					value={form.currency}
					options={[
						{ label: 'PLN', value: 'PLN' },
						{ label: 'EUR', value: 'EUR' },
					]}
					onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
				/>

				<Select
					label='Format daty'
					value={form.dateFormat}
					options={[
						{ label: 'DD-MM-YYYY', value: 'DD-MM-YYYY' },
						{ label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
						{ label: 'DD.MM.YYYY', value: 'DD.MM.YYYY' },
						{ label: 'YYYY.MM.DD', value: 'YYYY.MM.DD' },
					]}
					onChange={e => setForm(p => ({ ...p, dateFormat: e.target.value }))}
				/>
			</div>

			<div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
				<Input
					label='Waga skrzyni z towarem (kg)'
					type='number'
					min='0'
					step='0.01'
					value={form.boxWeightKg}
					onChange={e => setForm(p => ({ ...p, boxWeightKg: e.target.value }))}
				/>
			</div>

			<div className='mt-6 space-y-3'>
				<Checkbox
					label='Używaj separatora tysięcy (100 000)'
					checked={form.useThousandsSeparator}
					onChange={checked => setForm(p => ({ ...p, useThousandsSeparator: checked }))}
				/>

				<Checkbox
					label='Włącz powiadomienia systemowe'
					checked={form.notificationsEnabled}
					onChange={checked => setForm(p => ({ ...p, notificationsEnabled: checked }))}
				/>
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

function Input({ label, ...props }: InputProps) {
	return (
		<div>
			<label className='block text-sm font-medium text-gray-700'>{label}</label>
			<input {...props} className='mt-1 w-full rounded-md border px-3 py-2 text-sm' />
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

function Select({ label, options, ...props }: SelectProps) {
	return (
		<div>
			<label className='block text-sm font-medium text-gray-700'>{label}</label>
			<select {...props} className='mt-1 w-full rounded-md border px-3 py-2 text-sm'>
				{options.map(o => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>
		</div>
	)
}

type CheckboxProps = {
	label: string
	checked: boolean
	onChange: (checked: boolean) => void
}

function Checkbox({ label, checked, onChange }: CheckboxProps) {
	return (
		<label className='flex items-center gap-2 text-sm text-gray-700 accent-green-600'>
			<input type='checkbox' checked={checked} onChange={e => onChange(e.target.checked)} />
			{label}
		</label>
	)
}

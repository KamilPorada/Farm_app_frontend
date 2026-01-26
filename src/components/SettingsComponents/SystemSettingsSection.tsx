type Props = {
	// docelowo możesz tu podać state + settery
}

export default function SystemSettingsSection({}: Props) {
	return (
		<section className='mt-5 border-t pt-4'>
			<h2 className='text-xl font-semibold text-gray-900'>Ustawienia systemowe</h2>
			<p className='mt-1 text-sm text-gray-500'>Dostosuj sposób działania aplikacji do własnych preferencji.</p>

			{/* ===== PODSTAWOWE USTAWIENIA ===== */}
			<div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
				<Select label='Język interfejsu' options={['Polski', 'English']} />

				<Select label='Jednostka masy' options={['kg', 't']} />

				<Select label='Waluta' options={['PLN', 'EUR']} />

				<Select label='Format daty' options={['RRRR-MM-DD', 'DD-MM-RRRR', 'MM-DD-RRRR']} />
			</div>

			{/* ===== DODATKOWE ===== */}
			<div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
				<Input label='Waga skrzyni z towarem (kg)' type='number' />
			</div>

			{/* ===== CHECKBOXY ===== */}
			<div className='mt-6 space-y-3'>
				<Checkbox label='Używaj separatora dziesiętnego ,' />
				<Checkbox label='Włącz powiadomienia systemowe' />
			</div>
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
			<input {...props} className='mt-1 w-full rounded-md border px-3 py-2 text-sm disabled:bg-gray-100' />
		</div>
	)
}

type SelectProps = {
	label: string
	options: string[]
}

function Select({ label, options }: SelectProps) {
	return (
		<div>
			<label className='block text-sm font-medium text-gray-700'>{label}</label>
			<select className='mt-1 w-full rounded-md border px-3 py-2 text-sm'>
				{options.map(option => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</div>
	)
}

type CheckboxProps = {
	label: string
}

function Checkbox({ label }: CheckboxProps) {
	return (
		<label className='flex items-center gap-2 text-sm text-gray-700 accent-green-600'>
			<input type='checkbox' />
			{label}
		</label>
	)
}

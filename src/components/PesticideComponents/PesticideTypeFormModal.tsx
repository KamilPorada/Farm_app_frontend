import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SystemButton from '../ui/SystemButton'
import { PESTICIDE_TYPE_ICON_MAP } from '../../constans/pesticideTypeIcons'

type FormData = {
	name: string
	icon: string | null
}

type Props = {
	initial?: {
		name: string
		icon: string | null
	}
	onSubmit: (data: FormData) => void
	onClose: () => void
}

export default function PesticideTypeFormModal({ initial, onSubmit, onClose }: Props) {
	const [form, setForm] = useState<FormData>({
		name: initial?.name ?? '',
		icon: initial?.icon ?? null,
	})

	const [touched, setTouched] = useState({
		name: false,
		icon: false,
	})

	const nameError = touched.name && form.name.trim().length === 0
	const iconError = touched.icon && form.icon === null
	const isInvalid = form.name.trim().length === 0 || form.icon === null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3'>
			<div className='w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-4 sm:p-6 shadow-lg'>
				<h3 className='text-base sm:text-lg font-semibold'>
					{initial ? 'Edytuj typ środka' : 'Dodaj typ środka ochrony roślin'}
				</h3>

				<p className='mt-1 text-xs sm:text-sm text-gray-500'>
					Utwórz typ środka, aby lepiej organizować ochronę roślin w gospodarstwie.
				</p>

				<div className='mt-4'>
					<label className='text-xs sm:text-sm font-medium'>Nazwa typu</label>
					<input
						type='text'
						value={form.name}
						onChange={e => setForm({ ...form, name: e.target.value })}
						onBlur={() => setTouched(t => ({ ...t, name: true }))}
						placeholder='np. Fungicyd'
						className={`mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none
							${nameError ? 'border-red-400 focus:ring-red-200' : 'focus:ring-mainColor/30'}`}
					/>
					{nameError && <p className='mt-1 text-xs text-red-500'>Nazwa typu jest wymagana</p>}
				</div>

				<div className='mt-5'>
					<label className='text-xs sm:text-sm font-medium'>Ikona</label>

					<div className='mt-3 grid grid-cols-3 md:grid-cols-5 gap-2'>
						{Object.entries(PESTICIDE_TYPE_ICON_MAP).map(([key, icon]) => {
							const isActive = form.icon === key

							return (
								<button
									key={key}
									type='button'
									onClick={() => {
										setForm({ ...form, icon: key })
										setTouched(t => ({ ...t, icon: true }))
									}}
									className={`flex items-center justify-center rounded-lg border transition cursor-pointer
										p-2 sm:p-3
										${
											isActive
												? 'bg-mainColor text-white border-mainColor ring-2 ring-mainColor/40'
												: 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:scale-105 hover:shadow-sm'
										}`}>
									<FontAwesomeIcon icon={icon} className='text-sm sm:text-base' />
								</button>
							)
						})}
					</div>

					{iconError && <p className='mt-2 text-xs text-red-500'>Wybierz ikonę dla typu</p>}
				</div>

				<div className='mt-6 flex flex-row justify-center items-center gap-3 sm:justify-end'>
					<SystemButton
						variant='outline'
						onClick={onClose}
						className='text-mainColor border-mainColor/40'>
						Anuluj
					</SystemButton>

					<SystemButton
						onClick={() => {
							setTouched({ name: true, icon: true })
							if (!isInvalid) {
								onSubmit(form)
							}
						}}
						disabled={isInvalid}>
						Zapisz
					</SystemButton>
				</div>
			</div>
		</div>
	)
}

import { useState } from 'react'
import Button from '../ui/Button'

type Props = {
	userEmail?: string
}

export default function SecuritySection({ userEmail }: Props) {
	const [isOpen, setIsOpen] = useState(false)
	const [email, setEmail] = useState('')

	const isValid = email === userEmail

	return (
		<section className='mt-5 border-t pt-4'>
			<h2 className='text-xl font-semibold text-red-600'>
				Konto i bezpieczeństwo
			</h2>
			<p className='mt-1 text-sm text-gray-500'>
				Operacja usnięcia konta jest zabiegiem nieodwracalnym – zachowaj ostrożność!
			</p>

			<div className='mt-6'>
				<Button
					onClick={() => setIsOpen(true)}
					className='bg-red-500 hover:bg-red-700'
				>
					Usuń konto
				</Button>
			</div>

			{/* ===== MODAL ===== */}
			{isOpen && (
				<div className='fixed inset-0 z-50 flex items-center justify-center'>
					{/* overlay */}
					<div
						className='absolute inset-0 bg-black/40'
						onClick={() => setIsOpen(false)}
					/>

					{/* modal */}
					<div className='relative z-10 w-full max-w-md rounded-md bg-white p-6'>
						<h3 className='text-lg font-semibold text-gray-900'>
							Potwierdź usunięcie konta
						</h3>

						<p className='mt-2 text-sm text-gray-600'>
							Ta operacja jest <strong>nieodwracalna</strong>.
							Aby kontynuować, wpisz swój adres e-mail:
						</p>

						<div className='mt-4'>
							<label className='block text-sm font-medium text-gray-700'>
								Adres e-mail
							</label>
							<input
								type='email'
								value={email}
								onChange={e => setEmail(e.target.value)}
								className='mt-1 w-full rounded-md border px-3 py-2 text-sm'
								placeholder={userEmail}
							/>
						</div>

						<div className='mt-6 flex justify-end gap-2'>
							<button
								onClick={() => {
									setIsOpen(false)
									setEmail('')
								}}
								className='rounded-md border px-4 py-2 text-sm hover:bg-gray-50'
							>
								Anuluj
							</button>

							<button
								disabled={!isValid}
								className={`rounded-md px-4 py-2 text-sm text-white ${
									isValid
										? 'bg-red-600 hover:bg-red-700'
										: 'bg-gray-300 cursor-not-allowed'
								}`}
								onClick={() => {
									// TODO: wywołanie API usuwania konta
									console.log('DELETE ACCOUNT')
								}}
							>
								Usuń konto
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	)
}

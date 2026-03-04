import { useState } from 'react'
import SystemButton from '../ui/SystemButton'

type Props = {
	userEmail: string
	onDeactivateAccount: () => Promise<void>
	onDownloadBackup: () => void
	onSendBackupEmail: () => void
}

export default function SecuritySection({
	userEmail,
	onDeactivateAccount,
	onDownloadBackup,
	onSendBackupEmail,
}: Props) {
	const [isOpen, setIsOpen] = useState(false)
	const [email, setEmail] = useState('')
	const [loading, setLoading] = useState(false)

	const isValid = email === userEmail

	const handleDeactivate = async () => {
		try {
			setLoading(true)
			await onDeactivateAccount()
		} catch (e) {
			console.error('Błąd dezaktywacji konta', e)
			alert('Nie udało się dezaktywować konta')
		} finally {
			setLoading(false)
		}
	}

	return (
		<section className='mt-6 border-t pt-5'>
			<h2 className='text-xl font-semibold text-black'>
				Konto i bezpieczeństwo
			</h2>

			{/* ===== BACKUP DATA ===== */}

			<p className='mt-3 text-sm text-gray-600'>
				Dla bezpieczeństwa możesz utworzyć kopię swoich danych z aplikacji.
				Pobrany plik JSON zawiera wszystkie informacje zapisane w Twoim
				gospodarstwie i może posłużyć jako kopia zapasowa na wypadek utraty
				danych lub przeniesienia ich do innego systemu.
			</p>

			<div className='mt-4 flex flex-wrap gap-2'>
				<SystemButton onClick={onDownloadBackup}>
					Pobierz kopię danych (JSON)
				</SystemButton>

				<SystemButton onClick={onSendBackupEmail}>
					Wyślij kopię danych na e-mail
				</SystemButton>
			</div>

			{/* ===== ACCOUNT DEACTIVATION ===== */}

			<p className='mt-6 text-sm text-gray-600'>
				Możesz dezaktywować swoje konto w aplikacji. Spowoduje to trwałe
				usunięcie wszystkich Twoich danych aplikacyjnych. Konto logowania
				pozostanie aktywne – w przyszłości będziesz mógł zalogować się ponownie
				tym samym adresem e-mail i hasłem.
			</p>

			<div className='mt-6'>
				<SystemButton
					onClick={() => setIsOpen(true)}
					className='bg-red-500 hover:bg-red-700'
				>
					Dezaktywuj konto
				</SystemButton>
			</div>

			{isOpen && (
				<div className='fixed inset-0 z-50 flex items-center justify-center'>
					<div
						className='absolute inset-0 bg-black/40'
						onClick={() => setIsOpen(false)}
					/>

					<div className='relative z-10 w-full max-w-md rounded-md bg-white p-6'>
						<h3 className='text-lg font-semibold text-gray-900'>
							Potwierdź dezaktywację konta
						</h3>

						<p className='mt-2 text-sm text-gray-600'>
							Aby potwierdzić, wpisz swój adres e-mail.
						</p>

						<p className='mt-2 text-xs text-gray-500'>
							Wszystkie dane aplikacyjne zostaną trwale usunięte.
							Konto logowania pozostanie aktywne.
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
								className='rounded-md border px-4 py-2 text-sm hover:cursor-pointer'
							>
								Anuluj
							</button>

							<button
								disabled={!isValid || loading}
								onClick={handleDeactivate}
								className={`rounded-md px-4 py-2 text-sm text-white ${
									isValid
										? 'bg-red-600 hover:bg-red-700 cursor-pointer'
										: 'cursor-not-allowed bg-gray-300'
								}`}
							>
								{loading ? 'Dezaktywowanie…' : 'Dezaktywuj konto'}
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	)
}
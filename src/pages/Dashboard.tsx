import Button from '../components/ui/Button'
import { useAuthUser } from '../hooks/useAuthUser'

function Dashboard() {
	const { user, isAuthenticated, isLoading, logout, getToken } = useAuthUser()

	const handleCheckSession = async () => {
		try {
			await getToken()
			alert('Sesja nadal aktywna ✅')
		} catch {
			alert('Sesja wygasła. Zostaniesz wylogowany.')
			logout()
		}
	}

	if (isLoading) {
		return <div className='flex h-screen items-center justify-center text-gray-500'>Ładowanie...</div>
	}

	if (!isAuthenticated || !user) {
		return (
			<div className='p-6 text-gray-600'>
				<h2 className='mb-2 text-xl font-semibold'>Dashboard</h2>
				<p>Musisz się zalogować.</p>
			</div>
		)
	}

	return (
		<div className='flex min-h-screen items-center justify-center bg-gray-50'>
			<div className='w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
				<h2 className='mb-6 text-2xl font-bold text-gray-800'>👤 Dane zalogowanego użytkownika</h2>

				<div className='space-y-4'>
					<UserRow label='ID (Kinde)' value={user.id} />
					<UserRow label='Email' value={user.email} />
					<UserRow label='Imię' value={user.firstName} />
					<UserRow label='Nazwisko' value={user.lastName} />

					<div>
						<p className='mb-1 text-sm font-medium text-gray-500'>Avatar</p>
						{user.picture ? (
							<img src={user.picture} alt='avatar' className='h-16 w-16 rounded-full border' />
						) : (
							<p className='text-sm text-gray-400'>Brak</p>
						)}
					</div>
				</div>

				<div className='mt-6 flex gap-3'>
					<Button onClick={handleCheckSession} className='w-1/2'>
						Sprawdź sesję
					</Button>

					<Button onClick={logout} className='w-1/2'>
						Wyloguj się
					</Button>
				</div>
			</div>
		</div>
	)
}

type UserRowProps = {
	label: string
	value?: string | null
}

function UserRow({ label, value }: UserRowProps) {
	return (
		<div>
			<p className='text-sm font-medium text-gray-500'>{label}</p>
			<p className='break-all text-gray-800'>{value || <span className='text-gray-400'>Brak</span>}</p>
		</div>
	)
}

export default Dashboard

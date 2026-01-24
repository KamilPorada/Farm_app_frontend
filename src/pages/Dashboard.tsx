import { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import { useAuthUser } from '../hooks/useAuthUser'

type Farmer = {
	id: number
	name: string | null
	surname: string | null
	email: string | null
}

function Dashboard() {
	const { user, isLoading, logout, getToken, isAuthenticated } = useAuthUser()

	const [farmer, setFarmer] = useState<Farmer | null>(null)
	const [loadingFarmer, setLoadingFarmer] = useState(false)
	const [hasLoadedFarmer, setHasLoadedFarmer] = useState(false)

	useEffect(() => {
		if (!isAuthenticated || hasLoadedFarmer) return

		const loadFarmer = async () => {
			try {
				setLoadingFarmer(true)

				const token = await getToken()
				if (!token) throw new Error('Brak tokena')

				const res = await fetch('http://localhost:8080/api/me', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})

				if (res.ok) {
					const data = await res.json()
					setFarmer(data)
					setHasLoadedFarmer(true)
					return
				}

				if (res.status === 404) {
					const createRes = await fetch('http://localhost:8080/api/me', {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${token}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							name: user?.firstName ?? '',
							surname: user?.lastName ?? '',
							email: user?.email ?? '',
						}),
					})

					if (!createRes.ok) {
						throw new Error('Failed to create farmer')
					}

					const created = await createRes.json()
					setFarmer(created)
					setHasLoadedFarmer(true)
					return
				}

				throw new Error(`Unexpected status ${res.status}`)
			} catch (e) {
				console.error('Błąd pobierania / tworzenia farmera', e)
			} finally {
				setLoadingFarmer(false)
			}
		}

		loadFarmer()
	}, [isAuthenticated, hasLoadedFarmer])

	if (isLoading || loadingFarmer) {
		return <div className='flex h-screen items-center justify-center text-gray-500'>Ładowanie...</div>
	}

	return (
		<div className='flex flex-col min-h-screen items-center justify-center bg-gray-50'>
			<div className='w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
				<h2 className='mb-6 text-2xl font-bold text-gray-800'>👤 Dashboard</h2>

				{/* ===== DANE Z KINDE ===== */}
				<section className='mb-8'>
					<h3 className='mb-4 text-lg font-semibold text-gray-700'>Dane autoryzacyjne (Kinde)</h3>

					<div className='space-y-4'>
						<UserRow label='ID (Kinde)' value={user?.id} />
						<UserRow label='Email' value={user?.email} />
						<UserRow label='Imię' value={user?.firstName} />
						<UserRow label='Nazwisko' value={user?.lastName} />

						<div>
							<p className='mb-1 text-sm font-medium text-gray-500'>Avatar</p>
							{user?.picture ? (
								<img src={user.picture} alt='avatar' className='h-16 w-16 rounded-full border' />
							) : (
								<p className='text-sm text-gray-400'>Brak</p>
							)}
						</div>
					</div>
				</section>

				{/* ===== DANE Z BACKENDU ===== */}
				<section className='mb-8'>
					<h3 className='mb-4 text-lg font-semibold text-gray-700'>Dane aplikacyjne (Backend)</h3>

					{farmer ? (
						<div className='space-y-4'>
							<UserRow label='ID Farmer' value={String(farmer.id)} />
							<UserRow label='Imię' value={farmer.name} />
							<UserRow label='Nazwisko' value={farmer.surname} />
							<UserRow label='Email' value={farmer.email} />
						</div>
					) : (
						<p className='text-sm text-gray-400'>Brak danych farmera</p>
					)}
				</section>

				<div className='flex gap-3'>
					<Button onClick={logout} className='w-full'>
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

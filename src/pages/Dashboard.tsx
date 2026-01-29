import Button from '../components/ui/Button'
import { useAuthUser } from '../hooks/useAuthUser'
import { useMeData } from '../hooks/useMeData'

function Dashboard() {
	const { user, logout } = useAuthUser()
	const data = useMeData()
	console.log(data)

	return (
		<div className='flex flex-col min-h-screen items-center justify-center'>
			<div className='w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
				<h2 className='mb-6 text-2xl font-bold text-gray-800'>👤 Dashboard</h2>

				<section className='mb-8'>
					<h3 className='mb-4 text-lg font-semibold text-gray-700'>Dane autoryzacyjne (Kinde)</h3>

					<div className='space-y-4'>
						<UserRow label='Email' value={user?.email} />
						<UserRow label='Imię' value={user?.firstName} />
						<UserRow label='Nazwisko' value={user?.lastName} />

						{/* AVATAR USERA */}
						<div className='h-28 w-28 rounded-full border-2 border-white overflow-hidden flex items-center justify-center bg-white'>
							{hasRealAvatar(user?.picture ?? undefined) ? (
								<img src={user!.picture!} alt='Avatar' className='h-full w-full object-cover' />
							) : (
								<span className='text-mainColor text-5xl font-bold select-none'>
									{getInitials(user?.firstName, user?.lastName)}
								</span>
							)}
						</div>
					</div>
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

function getInitials(firstName?: string, lastName?: string) {
	if (!firstName && !lastName) return '?'

	const first = firstName?.charAt(0) ?? ''
	const last = lastName?.charAt(0) ?? ''

	return (first + last).toUpperCase()
}

function hasRealAvatar(picture?: string) {
	if (!picture) return false

	return !picture.includes('gravatar.com') && !picture.includes('d=blank')
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

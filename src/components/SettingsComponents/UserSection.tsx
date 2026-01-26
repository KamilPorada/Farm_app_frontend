import type { AuthUser } from '../../types/AuthUser'

type Props = {
	user: AuthUser
}

export default function UserSection({ user }: Props) {
	return (
		<section className='mt-5 border-t pt-4'>
			<h2 className='text-xl font-semibold text-gray-900'>Dane użytkownika</h2>
			<p className='mt-1 text-sm text-gray-500'>
				Dane konta są zarządzane przez system autoryzacji (Kinde) i nie mogą być edytowane w aplikacji.
			</p>

			<div className='mt-6 flex items-center gap-6'>
				{/* ===== AVATAR ===== */}
				<div className='relative'>
					<div className='flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border bg-white'>
						{hasRealAvatar(user?.picture) ? (
							<img src={user!.picture} alt='Avatar użytkownika' className='h-full w-full object-cover' />
						) : (
							<span className='select-none text-3xl font-bold text-mainColor'>
								{getInitials(user?.firstName, user?.lastName)}
							</span>
						)}
					</div>
				</div>

				{/* ===== INFO ===== */}
				<div className='space-y-1'>
					<p className='text-lg font-semibold text-gray-900'>
						{user?.firstName} {user?.lastName}
					</p>
					<p className='text-sm text-gray-600'>{user?.email}</p>
					<p className='text-xs text-gray-400'>Dane synchronizowane z Kinde</p>
				</div>
			</div>
		</section>
	)
}

export function getInitials(firstName?: string, lastName?: string) {
	if (!firstName && !lastName) return '?'
	return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()
}

function hasRealAvatar(picture: string | null | undefined): picture is string {
	if (!picture) return false
	return !picture.includes('gravatar.com') && !picture.includes('d=blank')
}

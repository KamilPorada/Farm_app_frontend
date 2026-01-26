import { useKindeAuth } from '@kinde-oss/kinde-auth-react'
import { useEffect, useState } from 'react'
import type { AuthUser } from '../types/AuthUser'


export function useAuthUser() {
	const { user, isAuthenticated, isLoading, getToken, logout } = useKindeAuth()

	const [authUser, setAuthUser] = useState<AuthUser | null>()
	const [loadingUser, setLoadingUser] = useState(false)

	useEffect(() => {
		if (!isAuthenticated || !user) return

		const loadUserFromBackend = async () => {
			try {
				setLoadingUser(true)

				const token = await getToken()
				if (!token) return

				const res = await fetch('http://localhost:8080/api/me', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})

				if (!res.ok) {
					console.error('Failed to load user from backend')
					return
				}

				const data = await res.json()

				setAuthUser({
					id: data.id, 
					externalId: data.externalId,
					email: data.email,
					firstName: data.name,
					lastName: data.surname,
					picture: user.picture ?? null,
				})
			} catch (e) {
				console.error('Auth user load error', e)
			} finally {
				setLoadingUser(false)
			}
		}

		loadUserFromBackend()
	}, [isAuthenticated])

	return {
		user: authUser,
		isAuthenticated,
		isLoading: isLoading || loadingUser,
		getToken,
		logout,
	}
}

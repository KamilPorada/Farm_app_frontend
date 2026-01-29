import { useKindeAuth } from '@kinde-oss/kinde-auth-react'
import { useEffect, useState } from 'react'
import type { AuthUser } from '../types/AuthUser'

export function useAuthUser() {
  const { user, isAuthenticated, isLoading, getToken, logout } =
    useKindeAuth()

  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [loadingUser, setLoadingUser] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user) return

    const syncUser = async () => {
      try {
        setLoadingUser(true)

        const token = await getToken()
        if (!token) return

        // 1️⃣ próbujemy pobrać usera z backendu
        let res = await fetch('http://localhost:8080/api/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // 2️⃣ jeśli nie istnieje → tworzymy
        if (res.status === 404) {
          res = await fetch('http://localhost:8080/api/me', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: user.givenName,
              surname: user.familyName,
              email: user.email,
            }),
          })
        }

        if (!res.ok) {
          throw new Error(`Auth sync failed: ${res.status}`)
        }

        const data = await res.json()

        // 3️⃣ finalny user do aplikacji
        setAuthUser({
          id: data.id,
          externalId: data.externalId,
          email: data.email,
          firstName: data.name,
          lastName: data.surname,
          picture: user.picture ?? null,
        })
      } catch (err) {
        console.error('Auth user sync error', err)
        setAuthUser(null)
      } finally {
        setLoadingUser(false)
      }

      
    }

    syncUser()
  }, [isAuthenticated, user])

  return {
    user: authUser,
    isAuthenticated,
    isLoading: isLoading || loadingUser,
    getToken,
    logout,
  }
}

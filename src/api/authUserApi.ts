export type FarmerProfileDto = {
	name: string
	surname: string
	email: string
}

const API_URL = 'http://localhost:8080'

export async function getMyProfile(token: string) {
	const res = await fetch(`${API_URL}/api/me`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})

	if (res.status === 404) {
		return null
	}

	if (!res.ok) {
		throw new Error('Failed to fetch profile')
	}

	return res.json()
}

export async function createMyProfile(token: string, data: FarmerProfileDto) {
	const res = await fetch(`${API_URL}/api/me`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(data),
	})

	if (!res.ok) {
		throw new Error('Failed to create profile')
	}

	return res.json()
}

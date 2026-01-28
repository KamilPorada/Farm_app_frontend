import { useState, useEffect } from 'react'
import { useAuthUser } from '../hooks/useAuthUser'
import UserSection from '../components/SettingsComponents/UserSection'
import FarmSection from '../components/SettingsComponents/FarmSection'
import SystemSettingsSection from '../components/SettingsComponents/SystemSettingsSection'
import SecuritySection from '../components/SettingsComponents/SecuritySection'

export type TunnelYear = {
	year: string
	count: string
}

type FarmerDetailsDto = {
	farmerId: number
	voivodeship: string
	district?: string
	commune?: string
	locality?: string
	farmAreaHa?: number
	settlementType: string
	crops: string | null
}

function SettingsPage() {
	const { user, getToken, isLoading } = useAuthUser()

	const [tunnels, setTunnels] = useState<TunnelYear[]>([])
	const [cropInput, setCropInput] = useState('')
	const [crops, setCrops] = useState<string[]>([])

	const [farmerDetails, setFarmerDetails] = useState<FarmerDetailsDto | null>(null)
	const [detailsExist, setDetailsExist] = useState(false)
	const [loadingDetails, setLoadingDetails] = useState(false)
	const [form, setForm] = useState({
		voivodeship: '',
		district: '',
		commune: '',
		locality: '',
		farmAreaHa: '',
		settlementType: '',
	})

	const handleSaveFarmDetails = async () => {
		try {
			const token = await getToken()
			if (!token || !user) return

			const payload = {
				farmerId: user.id,
				voivodeship: form.voivodeship,
				district: form.district || null,
				commune: form.commune || null,
				locality: form.locality || null,
				farmAreaHa: form.farmAreaHa ? Number(form.farmAreaHa) : null,
				settlementType: form.settlementType,
				crops: crops.join(','), // 🔥 string do backendu
			}
			console.log(payload)

			const res = await fetch(`http://localhost:8080/api/farmer-details${detailsExist ? `/${user.id}` : ''}`, {
				method: detailsExist ? 'PUT' : 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			})

			if (!res.ok) {
				console.error(await res.text())
				return
			}

			setDetailsExist(true)
		} catch (e) {
			console.error('Błąd zapisu danych gospodarstwa', e)
		}
	}

	const handleSaveTunnels = async () => {
		const token = await getToken()
		if (!token || !user) return

		const payload = {
			farmerId: user.id,
			tunnels: tunnels.map(t => ({
				year: Number(t.year),
				count: Number(t.count),
			})),
		}

		const res = await fetch('http://localhost:8080/api/farmer-tunnels/sync', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		})

		if (!res.ok) {
			console.error('Błąd zapisu tuneli', await res.text())
			return
		}
	}

	const handleSaveAll = async () => {
		await handleSaveFarmDetails()
		await handleSaveTunnels()
	}

	useEffect(() => {
		if (!user?.id) return

		const fetchDetails = async () => {
			try {
				setLoadingDetails(true)

				const token = await getToken()
				if (!token) return

				const res = await fetch(`http://localhost:8080/api/farmer-details/${user.id}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})

				if (res.status === 404) {
					setFarmerDetails(null)
					setDetailsExist(false)
					return
				}

				if (!res.ok) {
					const errorText = await res.text()
					console.error(errorText)
					return
				}

				// ✅ JEDYNE MIEJSCE json()
				const data: FarmerDetailsDto = await res.json()

				setFarmerDetails(data)
				setDetailsExist(true)

				setForm({
					voivodeship: data.voivodeship ?? '',
					district: data.district ?? '',
					commune: data.commune ?? '',
					locality: data.locality ?? '',
					farmAreaHa: data.farmAreaHa?.toString() ?? '',
					settlementType: data.settlementType ?? '',
				})

				setCrops(
					data.crops
						? data.crops
								.split(',')
								.map(c => c.trim())
								.filter(Boolean)
						: []
				)
			} finally {
				setLoadingDetails(false)
			}
		}

		fetchDetails()
	}, [user?.id])

	useEffect(() => {
		if (!user?.id) return

		const fetchTunnels = async () => {
			try {
				const token = await getToken()
				if (!token) return

				const res = await fetch(`http://localhost:8080/api/farmer-tunnels/${user.id}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})

				if (!res.ok) {
					console.error('Błąd pobierania tuneli')
					return
				}

				const data: { year: number; count: number }[] = await res.json()

				setTunnels(
					data.map(t => ({
						year: String(t.year),
						count: String(t.count),
					}))
				)
			} catch (e) {
				console.error('Błąd pobierania tuneli', e)
			}
		}

		fetchTunnels()
	}, [user?.id])

	/* ===== BLOKADY RENDERU ===== */

	if (isLoading || loadingDetails) {
		return <div className='p-8'>Ładowanie…</div>
	}

	if (!user) {
		return null
	}

	return (
		<div className='max-w-5xl p-8'>
			<h1 className='text-3xl font-bold text-gray-900'>Ustawienia</h1>
			<p className='mt-1 text-sm text-gray-500'>Zarządzaj ustawieniami konta, gospodarstwa i działania systemu.</p>

			<UserSection user={user} />

			<FarmSection
				form={form}
				setForm={setForm}
				tunnels={tunnels}
				setTunnels={setTunnels}
				crops={crops}
				setCrops={setCrops}
				cropInput={cropInput}
				setCropInput={setCropInput}
				onSave={handleSaveAll}
			/>

			<SystemSettingsSection />
			<SecuritySection />
		</div>
	)
}

export default SettingsPage

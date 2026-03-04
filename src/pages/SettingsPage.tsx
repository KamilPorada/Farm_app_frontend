import { useState, useEffect } from 'react'
import { useAuthUser } from '../hooks/useAuthUser'
import UserSection from '../components/SettingsComponents/UserSection'
import FarmSection from '../components/SettingsComponents/FarmSection'
import SystemSettingsSection from '../components/SettingsComponents/SystemSettingsSection'
import SecuritySection from '../components/SettingsComponents/SecuritySection'
import { notify } from '../utils/notify'
import { useMeData } from '../hooks/useMeData'
import { MoonLoader } from 'react-spinners'

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

type AppSettingsForm = {
	language: string
	weightUnit: string
	currency: string
	dateFormat: string
	useThousandsSeparator: boolean
	boxWeightKg: string
	notificationsEnabled: boolean
}

function SettingsPage() {
	const { user, getToken, isLoading, logout } = useAuthUser()
	const { appSettings: globalSettings } = useMeData()
	const notificationsEnabled = globalSettings?.notificationsEnabled

	const [tunnels, setTunnels] = useState<TunnelYear[]>([])
	const [cropInput, setCropInput] = useState('')
	const [crops, setCrops] = useState<string[]>([])

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

	const [appSettings, setAppSettings] = useState<AppSettingsForm>({
		language: 'pl',
		weightUnit: 'kg',
		currency: 'PLN',
		dateFormat: 'DD-MM-YYYY',
		useThousandsSeparator: true,
		boxWeightKg: '',
		notificationsEnabled: true,
	})

	const [appSettingsExist, setAppSettingsExist] = useState(false)

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
				crops: crops.join(','),
			}

			const res = await fetch(`http://localhost:8080/api/farmer-details${detailsExist ? `/${user.id}` : ''}`, {
				method: detailsExist ? 'PUT' : 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			})

			if (!res.ok) {
				return
			}

			setDetailsExist(true)
		} catch {}
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
			return
		}
	}

	const handleSaveAll = async () => {
		await handleSaveFarmDetails()
		await handleSaveTunnels()

		notify(notificationsEnabled, 'success', 'Dane gospodarstwa zostały zapisane!')
	}

	const handleSaveAppSettings = async () => {
		const token = await getToken()
		if (!token || !user) return

		const payload = {
			farmerId: user.id,
			language: appSettings.language,
			weightUnit: appSettings.weightUnit,
			currency: appSettings.currency,
			dateFormat: appSettings.dateFormat,
			useThousandsSeparator: appSettings.useThousandsSeparator,
			boxWeightKg: appSettings.boxWeightKg ? Number(appSettings.boxWeightKg) : null,
			notificationsEnabled: appSettings.notificationsEnabled,
		}

		const res = await fetch(`http://localhost:8080/api/app-settings${appSettingsExist ? `/${user.id}` : ''}`, {
			method: appSettingsExist ? 'PUT' : 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		})

		if (!res.ok) {
			notify(notificationsEnabled, 'error', 'Błąd zapisu ustawień aplikacji!')
			return
		}

		setAppSettingsExist(true)
		notify(notificationsEnabled, 'success', 'Ustawienia aplikacji zostały zapisane!')
	}

	const handleDeleteAccount = async () => {
		const token = await getToken()
		if (!token) return

		const res = await fetch('http://localhost:8080/api/account', {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})

		if (!res.ok) {
			notify(notificationsEnabled, 'error', 'Nie udało się dezaktywować konta!')
			return
		}

		notify(notificationsEnabled, 'warning', 'Konto zostało dezaktywowane!')
		await logout()
		window.location.href = '/'
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
						: [],
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
					})),
				)
			} catch (e) {
				console.error('Błąd pobierania tuneli', e)
			}
		}

		fetchTunnels()
	}, [user?.id])

	useEffect(() => {
		if (!user?.id) return

		const fetchAppSettings = async () => {
			const token = await getToken()
			if (!token || !user) return

			const res = await fetch(`http://localhost:8080/api/app-settings/${user.id}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (res.status === 404) {
				// 🔥 pierwszy raz – ustaw defaulty
				setAppSettings({
					language: 'pl',
					weightUnit: 'kg',
					currency: 'PLN',
					dateFormat: 'DD-MM-YYYY',
					useThousandsSeparator: true,
					boxWeightKg: '',
					notificationsEnabled: true,
				})
				setAppSettingsExist(false)
				return
			}

			if (!res.ok) {
				console.error('Błąd pobierania ustawień')
				return
			}

			const data = await res.json()
			setAppSettings({
				language: data.language,
				weightUnit: data.weightUnit,
				currency: data.currency,
				dateFormat: data.dateFormat,
				useThousandsSeparator: data.useThousandsSeparator,
				boxWeightKg: data.boxWeightKg?.toString() ?? '',
				notificationsEnabled: data.notificationsEnabled,
			})

			setAppSettingsExist(true)
		}

		fetchAppSettings()
	}, [user?.id])

	const handleSendBackupEmail = async () => {
		try {
			const token = await getToken()
			if (!token || !user) return

			const res = await fetch(`http://localhost:8080/api/export/email/${user.id}`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!res.ok) {
				notify(notificationsEnabled, 'error', 'Nie udało się wysłać kopii danych na email')
				return
			}

			notify(notificationsEnabled, 'success', 'Kopia danych została wysłana na email!')
		} catch (e) {
			console.error('Błąd wysyłki maila', e)
			notify(notificationsEnabled, 'error', 'Błąd wysyłki maila')
		}
	}

	const handleDownloadBackup = async () => {
		try {
			const token = await getToken()
			if (!token || !user) return

			const res = await fetch(`http://localhost:8080/api/export/${user.id}`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!res.ok) {
				notify(notificationsEnabled, 'error', 'Nie udało się wygenerować kopii danych')
				return
			}

			const json = await res.text()

			const blob = new Blob([json], { type: 'application/json' })
			const url = window.URL.createObjectURL(blob)

			const a = document.createElement('a')
			a.href = url
			a.download = `farmapp-backup-${new Date().toISOString().slice(0, 10)}.json`
			document.body.appendChild(a)
			a.click()

			a.remove()
			window.URL.revokeObjectURL(url)

			notify(notificationsEnabled, 'success', 'Kopia danych została pobrana')
		} catch (e) {
			console.error(e)
			notify(notificationsEnabled, 'error', 'Błąd pobierania kopii danych')
		}
	}

	/* ===== BLOKADY RENDERU ===== */

	if (isLoading || loadingDetails) {
		return (
			<div className='absolute top-0 left-0 flex justify-center py-6'>
				<MoonLoader size={50} />
			</div>
		)
	}

	if (!user) {
		return null
	}

	return (
		<div className='p-8 container'>
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

			<SystemSettingsSection form={appSettings} setForm={setAppSettings} onSave={handleSaveAppSettings} />
			<SecuritySection
				userEmail={user.email}
				onDeactivateAccount={handleDeleteAccount}
				onDownloadBackup={handleDownloadBackup}
				onSendBackupEmail={handleSendBackupEmail}
			/>
		</div>
	)
}

export default SettingsPage

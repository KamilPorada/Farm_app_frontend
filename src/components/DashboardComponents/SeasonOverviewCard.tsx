import { useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLeaf } from '@fortawesome/free-solid-svg-icons'
import { useMeData } from '../../hooks/useMeData'
import { useAuthUser } from '../../hooks/useAuthUser'
import { notify } from '../../utils/notify'
import heroImg from '../../assets/img/hero-dashboard-1.png'

type Props = {
	seasonYear: number
	currentDate: string
}

export default function SeasonOverviewCard({ seasonYear, currentDate }: Props) {
	const { user, getToken } = useAuthUser()
	const { farmerTunnels, appSettings } = useMeData()
	const notificationsEnabled = appSettings?.notificationsEnabled

	const [calendar, setCalendar] = useState<any>(null)
	const [varieties, setVarieties] = useState<any[]>([])
	const [loading, setLoading] = useState(true)

	// ===== FETCH CALENDAR =====
	const fetchCalendar = async () => {
		if (!user) return
		try {
			const token = await getToken()

			const res = await fetch(
				`http://localhost:8080/api/cultivation-calendar?farmerId=${user.id}&seasonYear=${seasonYear}`,
				{ headers: { Authorization: `Bearer ${token}` } },
			)

			if (res.status === 404) {
				setCalendar(null)
				return
			}

			if (!res.ok) throw new Error()

			const data = await res.json()
			setCalendar(data)
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się pobrać kalendarza')
		}
	}

	// ===== FETCH VARIETIES =====
	const fetchVarieties = async () => {
		if (!user) return
		try {
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/varieties/${user.id}/${seasonYear}`, {
				headers: { Authorization: `Bearer ${token}` },
			})

			if (!res.ok) throw new Error()

			const data = await res.json()
			setVarieties(data)
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się pobrać odmian')
		}
	}

	useEffect(() => {
		const load = async () => {
			setLoading(true)
			await Promise.all([fetchCalendar(), fetchVarieties()])
			setLoading(false)
		}
		load()
	}, [seasonYear, user])

	// ===== TUNNELS =====
	const totalTunnels = useMemo(() => {
		const found = farmerTunnels?.find(t => Number(t.year) === Number(seasonYear))

		if (!found || !found.count) return null

		return Number(found.count)
	}, [farmerTunnels, seasonYear])

	// ===== SEASON LABEL =====
	const seasonLabel = useMemo(() => {
		if (!calendar?.prickingStartDate) return 'Sezon nie został rozpoczęty!'

		const start = new Date(calendar.prickingStartDate)
		const today = new Date(currentDate)

		// sezon jeszcze nie wystartował
		if (today < start) return 'Sezon nie został rozpoczęty!'

		// sezon zakończony
		if (calendar.harvestEndDate) {
			const end = new Date(calendar.harvestEndDate)

			if (today > end) {
				const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

				return `Sezon zakończony — trwał ${duration} dni!`
			}
		}

		// sezon trwa
		const diffDays = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

		return `${diffDays} dzień sezonu`
	}, [calendar, currentDate])

	// ===== POLISH PLURAL =====
	const varietyLabel = useMemo(() => {
		const n = varieties.length
		if (n === 1) return 'odmiana'
		if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'odmiany'
		return 'odmian'
	}, [varieties])

	return (
		<div className='relative w-full overflow-hidden rounded-2xl shadow-sm'>
			{/* background */}
			<img src={heroImg} className='absolute inset-0 h-full w-full object-cover' alt='' />

			{/* gradient */}
			<div className='absolute inset-0 bg-gradient-to-r from-mainColor/70 to-transparent' />

			{/* content */}
			<div className='relative z-10 px-6 py-5 md:px-8 md:py-6 text-white'>
				{loading ? (
					<div className='animate-pulse space-y-2'>
						<div className='h-4 w-40 bg-white/30 rounded' />
						<div className='h-6 w-48 bg-white/30 rounded' />
					</div>
				) : (
					<>
						{/* HEADER */}
						<div className='flex items-center gap-3 text-lg font-semibold'>
							<FontAwesomeIcon icon={faLeaf} />
							Sezon {seasonYear}
						</div>

						{/* DAY INFO */}
						<div className='text-xl font-bold mt-1'>{seasonLabel}</div>

						{/* STATS */}
						<div className='flex flex-wrap gap-x-8 gap-y-1 mt-3 text-sm text-white/90'>
							<div>
								{totalTunnels === null ? (
									<span>Nie zdefiniowano liczby tuneli w tym sezonie</span>
								) : (
									<>
										<span className='font-semibold text-white'>{totalTunnels}</span> tuneli w sezonie
									</>
								)}
							</div>

							{varieties.length > 0 && (
								<div>
									<span className='font-semibold text-white'>{varieties.length}</span> {varietyLabel}
								</div>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	)
}

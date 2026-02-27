import { useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoins, faWeightHanging, faBox, faUsers } from '@fortawesome/free-solid-svg-icons'
import { useAuthUser } from '../../hooks/useAuthUser'
import { useMeData } from '../../hooks/useMeData'
import { notify } from '../../utils/notify'
import { useCountUp } from '../../hooks/useCountUp'
import { useFormatUtils } from '../../hooks/useFormatUtils'

type Props = {
	seasonYear: number
	currentDate: string
}

export default function DashboardStats({ seasonYear, currentDate }: Props) {
	const { user, getToken } = useAuthUser()
	const { appSettings } = useMeData()
	const notificationsEnabled = appSettings?.notificationsEnabled
	const { formatCurrency, formatWeight } = useFormatUtils()

	const [employees, setEmployees] = useState<any[]>([])
	const [trades, setTrades] = useState<any[]>([])
	const [harvests, setHarvests] = useState<any[]>([])
	const [loading, setLoading] = useState(true)

	const selectedDate = new Date(currentDate)

	// ===== FETCH =====

	const fetchEmployees = async () => {
		try {
			const token = await getToken()
			const res = await fetch(
				`http://localhost:8080/api/employees?farmerId=${user?.id}&seasonYear=${seasonYear}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			)
			if (!res.ok) throw new Error()
			setEmployees(await res.json())
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się pobrać pracowników')
		}
	}

	const fetchTrades = async () => {
		try {
			const token = await getToken()
			const res = await fetch(
				`http://localhost:8080/api/trades-of-pepper/farmer/${user?.id}/year/${seasonYear}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			)
			if (!res.ok) return
			setTrades(await res.json())
		} catch {}
	}

	const fetchHarvests = async () => {
		try {
			const token = await getToken()
			const res = await fetch(
				`http://localhost:8080/api/harvests/${user?.id}/${seasonYear}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			)
			if (!res.ok) throw new Error()
			setHarvests(await res.json())
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się pobrać zbiorów')
		}
	}

	useEffect(() => {
		if (!user?.id) return

		const load = async () => {
			setLoading(true)
			await Promise.all([fetchEmployees(), fetchTrades(), fetchHarvests()])
			setLoading(false)
		}

		load()
	}, [user, seasonYear])

	// ===== FILTROWANIE DO WYBRANEJ DATY =====

	const filteredTrades = useMemo(() => {
		return trades.filter(t => new Date(t.tradeDate) <= selectedDate)
	}, [trades, selectedDate])

	const filteredHarvests = useMemo(() => {
		return harvests.filter(h => new Date(h.harvestDate) <= selectedDate)
	}, [harvests, selectedDate])

	const activeWorkers = useMemo(() => {
		return employees.filter(emp => {
			const start = new Date(emp.startDate)
			const end = emp.finishDate ? new Date(emp.finishDate) : null

			return start <= selectedDate && (!end || end >= selectedDate)
		}).length
	}, [employees, selectedDate])

	// ===== METRYKI =====

	const totalWeight = useMemo(() => {
		return filteredTrades.reduce((sum, t) => sum + (t.tradeWeight || 0), 0)
	}, [filteredTrades])

	const totalRevenue = useMemo(() => {
		return filteredTrades.reduce((sum, t) => {
			const net = t.tradePrice * t.tradeWeight
			const gross = net * (1 + (t.vatRate || 0) / 100)
			return sum + gross
		}, 0)
	}, [filteredTrades])

	const totalBoxes = useMemo(() => {
		return filteredHarvests.reduce((sum, h) => sum + (h.boxCount || 0), 0)
	}, [filteredHarvests])

	// ===== ANIMACJE =====
	const revenueAnimated = useCountUp(totalRevenue)
	const weightAnimated = useCountUp(totalWeight)
	const boxesAnimated = useCountUp(totalBoxes)
	const workersAnimated = useCountUp(activeWorkers)

	return (
		<div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
			{loading ? (
				Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className='h-[100px] rounded-xl bg-gray-100 animate-pulse' />
				))
			) : (
				<>
					<StatCard label='Przychód' value={`${formatCurrency(revenueAnimated)}`} icon={faCoins} />

					<StatCard label='Sprzedana masa' value={formatWeight(weightAnimated)} icon={faWeightHanging} />

					<StatCard label='Zebrane skrzynie' value={Math.round(boxesAnimated).toString()} icon={faBox} />

					<StatCard label='Aktywni pracownicy' value={Math.round(workersAnimated).toString()} icon={faUsers} />
				</>
			)}
		</div>
	)
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: any }) {
	return (
		<div className='group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-[2px]'>
			<div className='absolute left-0 top-0 h-full w-1 bg-mainColor/60' />

			<div className='absolute right-3 top-3 text-4xl text-mainColor/20 group-hover:text-mainColor transition-colors'>
				<FontAwesomeIcon icon={icon} />
			</div>

			<p className='text-[11px] uppercase tracking-wide text-gray-500 mb-2'>{label}</p>
			<p className='text-2xl font-semibold text-gray-900 leading-tight'>{value}</p>
		</div>
	)
}
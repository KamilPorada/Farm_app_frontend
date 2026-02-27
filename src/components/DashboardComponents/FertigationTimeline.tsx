import { useEffect, useMemo, useState } from 'react'
import { useAuthUser } from '../../hooks/useAuthUser'
import { useFormatUtils } from '../../hooks/useFormatUtils'
import { notify } from '../../utils/notify'
import { useMeData } from '../../hooks/useMeData'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDroplet } from '@fortawesome/free-solid-svg-icons'

type Props = {
	seasonYear: number
	currentDate: string
}

type Fertigation = {
	id: number
	fertigationDate: string
	fertilizerId: number
	dose: number
	tunnelCount: number
}

type Fertilizer = {
	id: number
	name: string
	form?: string
}

export default function FertigationTimeline({ seasonYear, currentDate }: Props) {
	const { user, getToken } = useAuthUser()
	const { appSettings } = useMeData()
	const notificationsEnabled = appSettings?.notificationsEnabled
	const { formatDate } = useFormatUtils()

	const [fertigations, setFertigations] = useState<Fertigation[]>([])
	const [fertilizers, setFertilizers] = useState<Fertilizer[]>([])
	const [selected, setSelected] = useState<Fertigation | null>(null)
	const [loading, setLoading] = useState(true)

	const selectedDate = new Date(currentDate)

	/* ================= FETCH ================= */

	useEffect(() => {
		if (!user?.id) return

		async function fetchData() {
			try {
				setLoading(true)
				const token = await getToken()

				const fertRes = await fetch(
					`http://localhost:8080/api/fertigations/season/${seasonYear}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
							farmerId: String(user?.id),
						},
					},
				)

				if (!fertRes.ok) throw new Error()

				const fertData: Fertigation[] = await fertRes.json()

				const fertiRes = await fetch(
					`http://localhost:8080/api/fertilizers/farmer/${user?.id}/season/${seasonYear}`,
					{ headers: { Authorization: `Bearer ${token}` } },
				)

				if (!fertiRes.ok) throw new Error()

				const fertiData: Fertilizer[] = await fertiRes.json()

				setFertigations(fertData)
				setFertilizers(fertiData)
			} catch {
				notify(notificationsEnabled, 'error', 'Nie udało się pobrać fertygacji')
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [user, seasonYear])

	/* ================= MAPA ================= */

	const fertilizerMap = useMemo(() => {
		const map: Record<number, Fertilizer> = {}
		fertilizers.forEach(f => (map[f.id] = f))
		return map
	}, [fertilizers])

	/* ================= FILTR + SORT ================= */

	const lastItems = useMemo(() => {
		return fertigations
			.filter(f => new Date(f.fertigationDate) <= selectedDate)
			.sort((a, b) => +new Date(b.fertigationDate) - +new Date(a.fertigationDate))
			.slice(0, 5)
	}, [fertigations, selectedDate])

	const MAX_ITEMS = 5

	const timelineItems = [
		...lastItems,
		...Array.from({ length: MAX_ITEMS - lastItems.length }, () => null),
	]

	/* dynamiczna długość linii */
	const percent = Math.max(0, (lastItems.length - 1) * 20)

	function getUnit(form?: string) {
		return form?.toLowerCase() === 'płynny' ? 'l/tunel' : 'kg/tunel'
	}

	if (loading) {
		return <div className='h-[380px] rounded-2xl bg-gray-100 animate-pulse' />
	}

	/* ===== BRAK DANYCH ===== */

	if (!lastItems.length) {
		return (
			<div className='rounded-2xl bg-gray-50 border border-gray-100 shadow-sm p-5 h-[465px]'>
				<div className='h-full flex flex-col items-center justify-center text-center'>
					<p className='text-base font-medium text-gray-700'>Brak fertygacji</p>
					<p className='mt-2 text-sm text-gray-500 max-w-[240px]'>
						Dodaj pierwszą fertygację, aby rozpocząć kontrolę nawożenia.
					</p>
				</div>
			</div>
		)
	}

	return (
		<>
			<div className='rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col justify-center items-center xl:items-start h-full w-full'>
				<h3 className='text-sm text-gray-500 mb-6'>
					Nawożenie papryki
				</h3>

				<div className='relative h-[380px]'>
					{/* linia timeline */}
					<div
						className='absolute left-4 top-0 w-[2px] bg-gray-200'
						style={{ height: `calc(${percent}% + 2.5rem)` }}
					/>

					<div className='h-full flex flex-col justify-between'>
						{timelineItems.map((item, i) => {
							if (!item) {
								return <div key={`empty-${i}`} className='h-9' />
							}

							const fert = fertilizerMap[item.fertilizerId]

							return (
								<div key={item.id} className='flex flex-row items-end gap-5'>
									{/* kropka */}
									<button
										onClick={() => setSelected(item)}
										className='relative z-10 w-9 h-9 flex items-center justify-center rounded-full bg-mainColor text-white shadow hover:scale-110 transition cursor-pointer'>
										<FontAwesomeIcon icon={faDroplet} />
									</button>

									{/* tekst */}
									<div className='w-2/3'>
										<p className='text-xs text-gray-400'>
											{formatDate(item.fertigationDate)}
										</p>
										<p className='text-sm font-semibold text-gray-800 leading-tight'>
											{fert?.name}
										</p>
									</div>
								</div>
							)
						})}
					</div>
				</div>
			</div>

			{/* ===== MODAL ===== */}
			{selected && (
				<div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
					<div className='bg-white rounded-2xl p-6 w-[340px] shadow-xl animate-fadeIn'>
						<h4 className='font-semibold text-lg mb-3'>Szczegóły nawożenia</h4>

						<p className='text-sm text-gray-600'>
							Data: <strong>{formatDate(selected.fertigationDate)}</strong>
						</p>

						<p className='text-sm text-gray-600 mt-3'>Nawóz:</p>
						<p className='font-semibold'>
							{fertilizerMap[selected.fertilizerId]?.name}
						</p>

						<p className='text-sm text-gray-600 mt-3'>Dawka:</p>
						<p className='font-semibold'>
							{selected.dose}{' '}
							{getUnit(fertilizerMap[selected.fertilizerId]?.form)}
						</p>

						<p className='text-sm text-gray-600 mt-3'>Tunele:</p>
						<p className='font-semibold'>{selected.tunnelCount}</p>

						<button
							onClick={() => setSelected(null)}
							className='mt-6 w-full bg-mainColor text-white py-2 rounded-lg font-semibold hover:opacity-90 cursor-pointer'>
							Zamknij
						</button>
					</div>
				</div>
			)}
		</>
	)
}
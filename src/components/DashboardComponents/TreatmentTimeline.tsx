import { useEffect, useMemo, useState } from 'react'
import { useAuthUser } from '../../hooks/useAuthUser'
import { useMeData } from '../../hooks/useMeData'
import { notify } from '../../utils/notify'
import { useFormatUtils } from '../../hooks/useFormatUtils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { PESTICIDE_TYPE_ICON_MAP } from '../../constans/pesticideTypeIcons'
import type { Treatment } from '../../types/Treatment'
import type { Pesticide } from '../../types/Pesticide'
import type { PesticideType } from '../../types/Pesticide'

type Props = {
	seasonYear: number
	currentDate: string
}

export default function TreatmentTimeline({ seasonYear, currentDate }: Props) {
	const { user, getToken } = useAuthUser()
	const { appSettings } = useMeData()
	const notificationsEnabled = appSettings?.notificationsEnabled
	const { formatDate } = useFormatUtils()

	const [treatments, setTreatments] = useState<Treatment[]>([])
	const [pesticides, setPesticides] = useState<Pesticide[]>([])
	const [types, setTypes] = useState<PesticideType[]>([])
	const [selected, setSelected] = useState<Treatment | null>(null)
	const [loading, setLoading] = useState(true)

	const selectedDate = new Date(currentDate)

	// ===== FETCH =====
	useEffect(() => {
		if (!user?.id) return

		const load = async () => {
			setLoading(true)
			try {
				const token = await getToken()

				const [treatRes, typeRes, pestRes] = await Promise.all([
					fetch(`http://localhost:8080/api/treatments/farmer/${user.id}/${seasonYear}`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
					fetch(`http://localhost:8080/api/pesticide-types?farmerId=${user.id}`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
					fetch(`http://localhost:8080/api/pesticides?farmerId=${user.id}`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
				])

				if (!treatRes.ok || !typeRes.ok || !pestRes.ok) {
					notify(notificationsEnabled, 'error', 'Nie udało się pobrać danych')
					return
				}

				const [treatData, typeData, pestData] = await Promise.all([treatRes.json(), typeRes.json(), pestRes.json()])

				setTreatments(treatData)
				setTypes(typeData)
				setPesticides(pestData)
			} finally {
				setLoading(false)
			}
		}

		load()
	}, [user, seasonYear])

	// ===== FILTER + LIMIT =====
	const lastTreatments = useMemo(() => {
		return treatments
			.filter(t => new Date(t.treatmentDate) <= selectedDate)
			.sort((a, b) => +new Date(b.treatmentDate) - +new Date(a.treatmentDate))
			.slice(0, 5)
	}, [treatments, selectedDate])

	const pesticideMap = useMemo(() => new Map(pesticides.map(p => [p.id, p])), [pesticides])
	const typeMap = useMemo(() => new Map(types.map(t => [t.id, t])), [types])

	const MAX_ITEMS = 5

	const timelineItems = [...lastTreatments, ...Array.from({ length: MAX_ITEMS - lastTreatments.length }, () => null)]
	const percent = Math.max(0, (lastTreatments.length - 1) * 20)

	if (loading) {
		return <div className='h-[320px] rounded-2xl bg-gray-100 animate-pulse' />
	}

	if (!lastTreatments.length) {
		return (
			<div className='rounded-2xl bg-gray-50 shadow-sm border border-gray-100 p-5 h-[465px] w-full'>
				<div className='h-[380px] flex flex-col items-center justify-center text-center'>
					<p className='text-base font-medium text-gray-700'>Brak zabiegów ochrony roślin</p>
					<p className='mt-2 text-sm text-gray-500 max-w-[240px]'>
						Dodaj pierwszy zabieg, aby rozpocząć historię ochrony papryki.
					</p>
				</div>
			</div>
		)
	}

	return (
		<>
			<div className='rounded-2xl bg-white shadow-sm border border-gray-100 p-5 flex flex-col justify-center items-center xl:items-start h-full w-full'>
				<h3 className='text-sm text-gray-500 mb-6 text-left'>Ochrona papryki</h3>

				<div className='relative h-[380px]'>
					{/* linia */}
					<div className='absolute left-4 top-0 w-[2px] bg-gray-200' style={{ height: `calc(${percent}% + 2.5rem)` }} />

					<div className='h-full flex flex-col justify-between'>
						{timelineItems.map((t, i) => {
							if (!t) {
								return <div key={`empty-${i}`} className='h-9' />
							}

							const pesticide = pesticideMap.get(t.pesticideId)
							const type = pesticide?.pesticideTypeId ? typeMap.get(pesticide.pesticideTypeId) : null

							const icon = PESTICIDE_TYPE_ICON_MAP[type?.icon ?? 'fa-ellipsis']

							return (
								<div key={t.id} className='flex items-end gap-4'>
									<button
										onClick={() => setSelected(t)}
										className='relative z-10 w-9 h-9 flex items-center justify-center rounded-full bg-mainColor text-white shadow hover:scale-110 transition cursor-pointer'>
										<FontAwesomeIcon icon={icon} />
									</button>

									<div>
										<p className='text-xs text-gray-400'>{formatDate(t.treatmentDate)}</p>
										<p className='text-sm font-semibold text-gray-800 leading-tight'>{pesticide?.name}</p>
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
						<h4 className='font-semibold text-lg mb-3'>Szczegóły zabiegu</h4>

						<p className='text-sm text-gray-600'>
							Data: <strong>{formatDate(selected.treatmentDate)}</strong>
						</p>

						<p className='text-sm text-gray-600 mt-1'>
							Godzina: <strong>{selected.treatmentTime?.slice(0, 5)}</strong>
						</p>

						<p className='text-sm text-gray-600 mt-3'>Środek:</p>
						<p className='font-semibold'>{pesticideMap.get(selected.pesticideId)?.name}</p>

						<p className='text-sm text-gray-600 mt-3'>Dawka:</p>
						<p className='font-semibold'>
							{selected.pesticideDose}
							{pesticideMap.get(selected.pesticideId)?.isLiquid ? ' ml' : ' g'}/100l
						</p>

						<p className='text-sm text-gray-600 mt-3'>Ilość wody:</p>
						<p className='font-semibold'>{selected.liquidVolume} l</p>

						<p className='text-sm text-gray-600 mt-3'>Tunele:</p>
						<p className='font-semibold'>{selected.tunnelCount ?? '-'}</p>

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

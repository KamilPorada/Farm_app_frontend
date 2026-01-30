import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faArrowLeft,
	faLocationDot,
	faPhone,
	faEnvelope,
	faStore,
	faMapMarkedAlt,
	faCopy,
} from '@fortawesome/free-solid-svg-icons'

import type { PointOfSale } from '../../types/PointOfSale'
import { notify } from '../../utils/notify'
import { useMeData } from '../../hooks/useMeData'

type Props = {
	point: PointOfSale
	onBack: () => void
}

export default function PointOfSaleDetails({ point, onBack }: Props) {
	const { appSettings: globalSettings } = useMeData()
	const notificationsEnabled = globalSettings?.notificationsEnabled
	const hasCoords = typeof point.latitude === 'number' && typeof point.longitude === 'number'

	const mapSrc = hasCoords
		? `https://www.google.com/maps?q=${point.latitude},${point.longitude}&z=15&output=embed`
		: null

	function copyCoords() {
		if (!hasCoords) return
		navigator.clipboard.writeText(`${point.latitude}, ${point.longitude}`)
    					notify(notificationsEnabled, 'info', 'Współrzędne geograficzne zostały skopiowane!')

	}

	return (
		<>
			<div className='mt-5'>
				<button
					onClick={onBack}
					className='inline-flex items-center gap-2 text-sm text-mainColor hover:font-bold hover:cursor-pointer 		transition-all duration-200
'>
					<FontAwesomeIcon icon={faArrowLeft} />
					Punkty sprzedaży
				</button>
			</div>
			<div className='mt-5 max-w-6xl md:h-75 flex flex-col gap-8 md:flex-row md:items-start md:gap-10 '>
				{/* ===== LEFT ===== */}
				<div className='flex-1 space-y-6'>
					{/* BACK */}

					{/* HEADER */}
					<div className='space-y-1'>
						<h1 className='text-2xl font-semibold text-gray-900'>{point.name}</h1>
						<p className='flex items-center gap-2 text-gray-600'>
							<FontAwesomeIcon icon={faLocationDot} />
							{point.address}
						</p>
					</div>

					{/* DETAILS */}
					<div className='space-y-3'>
						<DetailRow icon={faStore} label='Typ punktu' value={point.type} />
						<DetailRow icon={faPhone} label='Telefon' value={point.phone || '—'} />
						<DetailRow icon={faEnvelope} label='Email' value={point.email || '—'} />
					</div>
				</div>

				{/* ===== RIGHT / MAP ===== */}
				<div className='w-full h-4/5 md:w-[360px] lg:w-[420px] xl:w-[500px] space-y-3'>
					{/* MAP ACTIONS */}
					{hasCoords && (
						<div className='flex items-center justify-between text-sm'>
							<a
								href={`https://www.google.com/maps?q=${point.latitude},${point.longitude}`}
								target='_blank'
								rel='noopener noreferrer'
								className='inline-flex items-center gap-2 text-mainColor hover:underline'>
								<FontAwesomeIcon icon={faMapMarkedAlt} />
								Google Maps
							</a>

							<button
								onClick={copyCoords}
								className='inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 hover:cursor-pointer'>
								<FontAwesomeIcon icon={faCopy} />
								Kopiuj współrzędne
							</button>
						</div>
					)}
					<div className=' aspect-square md:aspect-auto bg-gray-100 overflow-hidden h-full'>
						{hasCoords ? (
							<iframe
								src={mapSrc!}
								className='h-full w-full'
								loading='lazy'
								referrerPolicy='no-referrer-when-downgrade'
							/>
						) : (
							<div className='flex h-full items-center justify-center text-sm text-gray-400'>Brak współrzędnych</div>
						)}
					</div>
				</div>
			</div>
		</>
	)
}

/* ===== SUB ===== */
function DetailRow({ icon, label, value }: { icon: any; label: string; value: string }) {
	return (
		<div className='flex items-center gap-4'>
			<FontAwesomeIcon icon={icon} className='text-mainColor text-lg' />
			<div>
				<p className='text-xs text-gray-500'>{label}</p>
				<p className='font-medium text-gray-900'>{value}</p>
			</div>
		</div>
	)
}

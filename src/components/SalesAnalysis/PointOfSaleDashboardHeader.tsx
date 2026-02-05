import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faLocationDot } from '@fortawesome/free-solid-svg-icons'
import type { PointOfSale } from '../../types/PointOfSale'

type Props = {
	pointsOfSale: PointOfSale[]
	selectedPointId: number
	onChangePoint: (id: number) => void
}

export default function PointOfSaleDashboardHeader({
	pointsOfSale,
	selectedPointId,
	onChangePoint,
}: Props) {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	// 👉 default: pierwszy punkt
	useEffect(() => {
		if (
			pointsOfSale.length > 0 &&
			!pointsOfSale.some(p => p.id === selectedPointId)
		) {
			onChangePoint(pointsOfSale[0].id)
		}
	}, [pointsOfSale, selectedPointId, onChangePoint])

	const selectedPoint = pointsOfSale.find(
		p => p.id === selectedPointId
	)

	// 👉 zamykanie po kliknięciu poza
	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (!ref.current) return
			if (!ref.current.contains(e.target as Node)) {
				setOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () =>
			document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	if (!selectedPoint) return null

	return (
		<div className="flex items-center justify-between pb-4 border-b border-gray-100">
			{/* LEFT */}
			<div>
				<div className="flex items-center gap-3">
					<h2 className="text-xl font-semibold text-gray-900">
						{selectedPoint.name}
					</h2>

					{/* SELECT */}
					<div ref={ref} className="relative flex items-center gap-2">
						<button
							type="button"
							onClick={() => setOpen(o => !o)}
							className="
								flex items-center gap-2
								bg-transparent
								text-gray-900
								hover:text-gray-700
								transition
							"
						>
							<span
								className="
									flex h-6 w-6 items-center justify-center
									rounded-full bg-mainColor
									cursor-pointer
									transition
									hover:brightness-110
								"
							>
								<FontAwesomeIcon
									icon={faChevronDown}
									className={`
										text-xs text-white
										transition-transform duration-200
										${open ? 'rotate-180' : ''}
									`}
								/>
							</span>
						</button>

						{open && (
							<div
								className="
									absolute left-0 top-full z-20 mt-2
									min-w-56
									rounded-lg border bg-white
									py-1 shadow-lg
								"
							>
								{pointsOfSale.map(p => (
									<button
										key={p.id}
										onClick={() => {
											onChangePoint(p.id)
											setOpen(false)
										}}
										className={`
											block w-full px-4 py-2 text-left text-sm
											hover:bg-gray-100
											transition hover:cursor-pointer
											${
												p.id === selectedPointId
													? 'font-semibold text-mainColor'
													: 'text-gray-700'
											}
										`}
									>
										{p.name}
									</button>
								))}
							</div>
						)}
					</div>
				</div>

				{/* LOCATION */}
				<div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
					<FontAwesomeIcon
						icon={faLocationDot}
						className="text-xs"
					/>
					<span>{selectedPoint.address}</span>
				</div>
			</div>
		</div>
	)
}

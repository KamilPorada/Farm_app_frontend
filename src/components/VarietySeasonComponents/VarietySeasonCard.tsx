import type { VarietySeason } from '../../types/VarietySeason'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'

import redPepperImg from '../../assets/img/image_red_pepper.png'
import yellowPepperImg from '../../assets/img/image_yellow_pepper.png'
import greenPepperImg from '../../assets/img/image_green_pepper.png'
import orangePepperImg from '../../assets/img/image_orange_pepper.png'

type Props = {
	variety: VarietySeason
	totalTunnels: number
	onEdit: (v: VarietySeason) => void
	onDelete: (v: VarietySeason) => void
}

export default function VarietySeasonCard({ variety, totalTunnels, onEdit, onDelete }: Props) {
	const percent = totalTunnels > 0 ? Math.round((Number(variety.tunnelCount) / totalTunnels) * 100) : 0

	function getBarColor(color?: string | null) {
		switch (color) {
			case 'Czerwona':
				return 'bg-red-500'
			case 'Żółta':
				return 'bg-yellow-400'
			case 'Zielona':
				return 'bg-green-500'
			case 'Pomarańczowa':
				return 'bg-orange-500'
			default:
				return 'bg-gray-400'
		}
	}

	function getPepperImage(color?: string | null) {
		switch (color) {
			case 'Czerwona':
				return redPepperImg
			case 'Żółta':
				return yellowPepperImg
			case 'Zielona':
				return greenPepperImg
			case 'Pomarańczowa':
				return orangePepperImg
			default:
				return redPepperImg
		}
	}

	return (
		<div className='rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1'>
			{/* CONTENT */}
			<div className='p-6'>
				<div className='flex items-center gap-3'>
					<img src={getPepperImage(variety.color)} alt='pepper' className='h-10 w-10 object-contain' />
					<h3 className='text-xl font-semibold tracking-tight'>{variety.name}</h3>
				</div>

				{/* PROGRESS */}
				<div className='mt-4'>
					{/* Liczba tuneli */}
					<p className='text-sm text-gray-600 '>
						Kolor:
						<span className='ml-1 font-semibold'>{variety.color}</span>
					</p>
					<p className='text-sm text-gray-600 mb-2'>
						Liczba tuneli:
						<span className='ml-1 font-semibold'>{variety.tunnelCount}</span>
					</p>

					{/* Pasek + procent po prawej */}
					<div className='flex items-center gap-3'>
						<div className='h-2 w-full rounded-full bg-gray-200'>
							<div
								className={`h-2 rounded-full transition-all duration-700 ${getBarColor(variety.color)}`}
								style={{ width: `${percent}%` }}
							/>
						</div>

						<span className='text-sm font-medium text-gray-600 min-w-[40px] text-right'>{percent}%</span>
					</div>
				</div>
			</div>

			{/* ACTIONS */}
			<div className='flex items-center justify-between border-t border-gray-100  px-6 py-4 text-sm'>
				<button
					className='flex flex-row justify-center items-center w-1/2 gap-2 text-gray-700 transition hover:text-yellow-500 cursor-pointer'
					onClick={() => onEdit(variety)}>
					<FontAwesomeIcon icon={faPen} className='' />
					Edytuj
				</button>

				<div className='h-4 w-px bg-gray-300' />

				<button
					className='flex flex-row justify-center items-center w-1/2 gap-2 text-gray-700 transition hover:text-red-600 cursor-pointer'
					onClick={() => onDelete(variety)}>
					<FontAwesomeIcon icon={faTrash} className='' />
					Usuń
				</button>
			</div>
		</div>
	)
}

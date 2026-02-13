import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSeedling, faTrowel, faCrown, faFlagCheckered } from '@fortawesome/free-solid-svg-icons'
import type { CultivationCalendar } from '../../types/CultivationCalendar'
import { useFormatUtils } from '../../hooks/useFormatUtils'

type Props = {
	item: CultivationCalendar | null
}

export default function CultivationSeasonTimeline({ item }: Props) {
	const { formatDate } = useFormatUtils()

	if (!item) {
		return null
	}

	const stages = [
		{
			title: 'Pikowanie',
			icon: faSeedling,
			date:
				item.prickingStartDate && item.prickingEndDate
					? `${formatDate(item.prickingStartDate)} – ${formatDate(item.prickingEndDate)}`
					: null,
		},
		{
			title: 'Sadzenie do tuneli',
			icon: faTrowel,
			date:
				item.plantingStartDate && item.plantingEndDate
					? `${formatDate(item.plantingStartDate)} – ${formatDate(item.plantingEndDate)}`
					: null,
		},
		{
			title: 'Pierwsze zbiory',
			icon: faCrown,
			date: item.harvestStartDate && formatDate(item.harvestStartDate),
		},
		{
			title: 'Ostatnie zbiory',
			icon: faFlagCheckered,
			date: item.harvestEndDate && formatDate(item.harvestEndDate),
		},
	]

	return (
		<div>
			<h2 className='text-xl font-semibold mb-5'>Etapy sezonu</h2>
			<div className='relative '>
				{/* Linia osi */}
				<div className='absolute left-5.5 top-0 bottom-1 w-1 bg-mainColor/20'></div>

				<div className='space-y-12'>
					{stages.map((stage, index) => {
						const isDefined = !!stage.date

						return (
							<div key={index} className='relative pl-20'>
								{/* Ikona */}
								<div
									className={`absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border-2 ${
										isDefined ? 'border-mainColor bg-white' : 'border-gray-300 bg-white'
									}`}>
									<FontAwesomeIcon
										icon={stage.icon}
										className={`text-lg ${isDefined ? 'text-mainColor' : 'text-gray-400'}`}
									/>
								</div>

								{/* Treść */}
								<h4 className='text-xl  text-gray-800'>{stage.title}</h4>

								{stage.date ? (
									<p className='mt-1 text-gray-600 text-sm'>{stage.date}</p>
								) : (
									<p className='mt-1 text-gray-400 text-sm'>Etap nie został jeszcze zdefiniowany</p>
								)}
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}

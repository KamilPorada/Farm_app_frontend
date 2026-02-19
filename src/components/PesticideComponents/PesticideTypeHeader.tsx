import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLayerGroup, faPlus, faGear } from '@fortawesome/free-solid-svg-icons'
import { PESTICIDE_TYPE_ICON_MAP } from '../../constans/pesticideTypeIcons'
import type { PesticideType } from '../../types/Pesticide'
import SystemButton from '../../components/ui/SystemButton'

type Props = {
	types: PesticideType[]
	activeTypeId: number | null
	onSelect: (typeId: number | null) => void
	onAdd: () => void
	onManage: () => void
}

export default function PesticideTypeHeader({
	types,
	activeTypeId,
	onSelect,
	onAdd,
	onManage,
}: Props) {
	return (
		<div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
			<div className='flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-3'>
				<button
					onClick={() => onSelect(null)}
					className={`flex items-center justify-center md:justify-start gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium transition hover:cursor-pointer
		${
			activeTypeId === null
				? 'bg-mainColor text-white border-mainColor'
				: 'bg-gray-50 text-gray-700 hover:bg-gray-200'
		}`}>
					<FontAwesomeIcon icon={faLayerGroup} />
					Wszystkie
				</button>

				{types.map(type => (
					<button
						key={type.id}
						onClick={() => onSelect(type.id)}
						className={`flex items-center justify-center md:justify-start gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium transition hover:cursor-pointer
		${
			activeTypeId === type.id
				? 'bg-mainColor text-white border-mainColor'
				: 'bg-gray-50 text-gray-700 hover:bg-gray-200'
		}`}>
						<FontAwesomeIcon
							icon={
								PESTICIDE_TYPE_ICON_MAP[type.icon ?? 'fa-ellipsis'] ??
								PESTICIDE_TYPE_ICON_MAP['fa-ellipsis']
							}
						/>
						{type.name}
					</button>
				))}
			</div>

			<div className='flex flex-col items-center md:items-start gap-1 md:self-start'>
				<SystemButton onClick={onAdd} className='normal-case w-full md:w-42 justify-center'>
					<FontAwesomeIcon icon={faPlus} className='hidden sm:inline' />
					Dodaj typ
				</SystemButton>

				<button
					type='button'
					onClick={onManage}
					className='flex items-center gap-1 text-xs text-gray-500 transition hover:text-mainColor hover:cursor-pointer'>
					<FontAwesomeIcon icon={faGear} className='text-[11px]' />
					Zarządzaj typami
				</button>
			</div>
		</div>
	)
}

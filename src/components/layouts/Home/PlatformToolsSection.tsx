import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faChartLine,
	faSeedling,
	faUsers,
	faCoins,
	faFlask,
	faDroplet,
	faStickyNote,
	faStore,
} from '@fortawesome/free-solid-svg-icons'

import logoImage from '../../../assets/img/logotype.png'

const tools = [
	{
		name: 'Sprzedaż papryki',
		short: 'Sprzedaż',
		icon: faStore,
		description: 'Rejestruj transakcje i analizuj ceny sprzedaży w sezonie.',
		benefits: ['historia transakcji', 'analiza cen', 'kontrola przychodów'],
	},
	{
		name: 'Kontrola zbiorów',
		short: 'Zbiory',
		icon: faSeedling,
		description: 'Monitoruj ilość, jakość i terminy zbiorów.',
		benefits: ['ilość plonu', 'jakość', 'terminy'],
	},
	{
		name: 'Wydatki',
		short: 'Koszty',
		icon: faCoins,
		description: 'Kontroluj wszystkie koszty produkcji w jednym miejscu.',
		benefits: ['paliwo', 'materiały', 'usługi'],
	},
	{
		name: 'Zarządzanie środkami',
		short: 'Środki',
		icon: faFlask,
		description: 'Planuj i kontroluj nawozy oraz środki ochrony.',
		benefits: ['zapasy', 'planowanie', 'bezpieczeństwo'],
	},
	{
		name: 'Pracownicy',
		short: 'Zespół',
		icon: faUsers,
		description: 'Zarządzaj zespołem i czasem pracy.',
		benefits: ['czas pracy', 'koszty', 'organizacja'],
	},
	{
		name: 'Pestycydy',
		short: 'Ochrona',
		icon: faChartLine,
		description: 'Ewidencja zabiegów i zgodność z normami.',
		benefits: ['rejestr zabiegów', 'kontrola', 'zgodność'],
	},
	{
		name: 'Fertygacja',
		short: 'Nawadnianie',
		icon: faDroplet,
		description: 'Kontroluj nawożenie wraz z nawadnianiem.',
		benefits: ['harmonogram', 'efektywność', 'oszczędność'],
	},
	{
		name: 'Notatki',
		short: 'Notatki',
		icon: faStickyNote,
		description: 'Zapisuj obserwacje i decyzje z sezonu.',
		benefits: ['historia', 'wnioski', 'ciągłość'],
	},
]

function PlatformToolsSection() {
	const [activeIndex, setActiveIndex] = useState(0)
	const [isHovering, setIsHovering] = useState(false)

	useEffect(() => {
		if (isHovering) return

		const interval = setInterval(() => {
			setActiveIndex(prev => (prev + 1) % tools.length)
		}, 10000)

		return () => clearInterval(interval)
	}, [isHovering])

	const activeTool = tools[activeIndex]
	const radius = 210

	return (
		<section className='w-full bg-white py-25' id='tools'>
			<div className='container'>
				{/* HEADER */}
				<div className='text-center max-w-2xl mx-auto'>
					<h2 className='text-3xl md:text-4xl font-bold text-gray-900'>Ekosystem narzędzi platformy</h2>
					<p className='mt-6 text-gray-600'>
						Zintegrowane narzędzia umożliwiają kontrolę najważniejszych procesów produkcyjnych w jednym miejscu. Dzięki
						modułowej strukturze platforma pozwala uporządkować dane, ograniczyć chaos informacyjny i lepiej planować
						działania na każdym etapie sezonu.
					</p>
				</div>

				{/* CONTENT */}
				<div className='mt-10 flex flex-col md:flex-row-reverse gap-16 items-center'>
					{/* KOŁO – 1/2 */}
					<div className='relative w-full md:w-1/2 h-130 flex items-center justify-center'>
						{/* PIERŚCIEŃ */}
						<div
							className='absolute rounded-full border border-gray-300'
							style={{ width: radius * 2, height: radius * 2 }}
						/>

						{/* LOGO */}
						<div className='absolute z-10 w-40 h-40 rounded-full bg-white shadow-lg flex items-center justify-center'>
							<img src={logoImage} alt='Logo' className='w-24 h-24' />
						</div>

						{/* IKONY */}
						{tools.map((tool, index) => {
							const angle = (index / tools.length) * 2 * Math.PI - Math.PI / 2
							const x = Math.cos(angle) * radius
							const y = Math.sin(angle) * radius
							const isActive = index === activeIndex

							return (
								<div
									key={tool.name}
									className='absolute'
									onMouseEnter={() => {
										setIsHovering(true)
										setActiveIndex(index)
									}}
									style={{
										left: '50%',
										top: '50%',
										transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
									}}>
									<div className='w-24 h-24 flex items-center justify-center'>
										<div
											onMouseEnter={() => setActiveIndex(index)}
											className={`
												w-20 h-20 rounded-full flex items-center justify-center
												transition-all duration-500 cursor-pointer
												${isActive ? 'bg-mainColor scale-125 shadow-xl' : 'bg-white scale-100 shadow-md hover:scale-110'}
											`}>
											<FontAwesomeIcon
												icon={tool.icon}
												className={`text-2xl ${isActive ? 'text-white' : 'text-gray-800'}`}
											/>
										</div>
									</div>
								</div>
							)
						})}
					</div>

					{/* KARTA – 1/2 */}
					<div className='w-full md:w-1/2'>
						<div
							key={activeTool.name}
							className='relative bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] overflow-hidden animate-fade-slide'>
							{/* GÓRNY PASEK */}
							<div className='h-1.5 bg-mainColor' />

							{/* IKONA */}
							<div className='flex justify-center pt-6'>
								<div className='w-16 h-16 rounded-full bg-mainColor flex items-center justify-center shadow-lg'>
									<FontAwesomeIcon icon={activeTool.icon} className='text-white text-2xl' />
								</div>
							</div>

							{/* CONTENT */}
							<div className='px-8 pt-6 pb-10 text-center'>
								<h3 className='text-xl font-semibold text-gray-900'>{activeTool.name}</h3>

								<p className='mt-4 text-gray-600 text-sm leading-relaxed'>{activeTool.description}</p>

								{/* DIVIDER */}
								<div className='mt-6 h-px bg-gray-200' />

								{/* BENEFITY */}
								<div className='mt-6 flex flex-wrap justify-center gap-3'>
									{activeTool.benefits.map(item => (
										<span
											key={item}
											className='px-3 py-1 text-xs font-medium rounded-full
                   bg-mainColor/10 text-mainColor'>
											{item}
										</span>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

export default PlatformToolsSection

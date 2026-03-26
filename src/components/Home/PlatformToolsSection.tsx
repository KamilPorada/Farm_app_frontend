import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faSeedling,
	faCoins,
	faWarehouse,
	faUsers,
	faFlask,
	faDroplet,
	faBook,
} from '@fortawesome/free-solid-svg-icons'

import logoImage from '../../assets/img/logotype.png'

const tools = [
	{
		name: 'Sprzedaż papryki',
		short: 'Sprzedaż',
		icon: faSeedling,
		description:
			'Zarządzaj sprzedażą papryki od rejestracji transakcji po analizę wyników i kontrolę punktów sprzedaży.',
		benefits: ['transakcje', 'punkty sprzedaży', 'analiza sprzedaży'],
	},
	{
		name: 'Kontrola finansów',
		short: 'Finanse',
		icon: faCoins,
		description:
			'Kontroluj wszystkie przepływy finansowe w gospodarstwie – od wydatków po rozliczenia i faktury.',
		benefits: ['wydatki', 'faktury', 'przepływy finansowe'],
	},
	{
		name: 'Kontrola zbiorów',
		short: 'Zbiory',
		icon: faWarehouse,
		description:
			'Monitoruj proces produkcji od odmian, przez zbiory, aż po kalendarz całego sezonu.',
		benefits: ['odmiany', 'zbiory', 'kalendarz uprawy'],
	},
	{
		name: 'Pracownicy',
		short: 'Zespół',
		icon: faUsers,
		description:
			'Zarządzaj pracownikami sezonowymi oraz kontroluj ich czas pracy i koszty.',
		benefits: ['pracownicy sezonowi', 'czas pracy', 'rozliczenia'],
	},
	{
		name: 'Ochrona roślin',
		short: 'Ochrona',
		icon: faFlask,
		description:
			'Prowadź ewidencję zabiegów ochrony roślin i zarządzaj stosowanymi pestycydami.',
		benefits: ['pestycydy', 'zabiegi', 'kontrola stosowania'],
	},
	{
		name: 'Nawożenie',
		short: 'Nawożenie',
		icon: faDroplet,
		description:
			'Kontroluj nawożenie i fertygację, optymalizując rozwój roślin i zużycie zasobów.',
		benefits: ['nawozy', 'fertygacja', 'optymalizacja zużycia'],
	},
	{
		name: 'Dziennik',
		short: 'Notatki',
		icon: faBook,
		description:
			'Zapisuj najważniejsze obserwacje i decyzje, budując wiedzę na kolejne sezony.',
		benefits: ['notatki', 'historia sezonu', 'wnioski'],
	},
]

function useResponsiveRadius() {
	const [radius, setRadius] = useState(220)

	useEffect(() => {
		const updateRadius = () => {
			const width = window.innerWidth

			if (width < 640) setRadius(140)
			else if (width < 768) setRadius(170)
			else if (width < 1024) setRadius(200)
			else setRadius(220)
		}

		updateRadius()
		window.addEventListener('resize', updateRadius)
		return () => window.removeEventListener('resize', updateRadius)
	}, [])

	return radius
}

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
	const radius = useResponsiveRadius()

	return (
		<section className='w-full bg-white py-10 lg:py-30' id='tools'>
			<div className='container'>
				{/* HEADER */}
				<div className='text-center max-w-2xl mx-auto'>
					<h2 className='text-3xl md:text-4xl font-bold text-gray-900'>Ekosystem narzędzi platformy</h2>
					<p className='mt-6 text-gray-600'>
						Zintegrowane narzędzia umożliwiają kontrolę najważniejszych procesów produkcyjnych w jednym miejscu.
						Dzięki modułowej strukturze platforma pozwala uporządkować dane i lepiej zarządzać sezonem.
					</p>
				</div>

				{/* CONTENT */}
				<div className='lg:mt-10 flex flex-col lg:flex-row-reverse sm:gap-16 items-center'>
					{/* KOŁO */}
					<div className='relative w-5 sm:w-1/2 h-130 flex items-center justify-center'>
						<div
							className='absolute rounded-full border border-gray-300'
							style={{ width: radius * 2, height: radius * 2 }}
						/>

						<div className='absolute z-10 w-30 h-30 md:w-40 md:h-40 rounded-full bg-white shadow-lg flex items-center justify-center'>
							<img src={logoImage} alt='Logo' className='w-18 h-18 md:w-24 md:h-24' />
						</div>

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
											className={`
												w-12 h-12 md:w-20 md:h-20 rounded-full flex items-center justify-center
												transition-all duration-500 cursor-pointer
												${isActive ? 'bg-mainColor scale-125 shadow-xl' : 'bg-white scale-100 shadow-md hover:scale-110'}
											`}>
											<FontAwesomeIcon
												icon={tool.icon}
												className={`text-xl md:text-2xl ${isActive ? 'text-white' : 'text-gray-800'}`}
											/>
										</div>
									</div>
								</div>
							)
						})}
					</div>

					{/* KARTA */}
					<div className='w-full md:w-1/2'>
						<div
							key={activeTool.name}
							className='relative bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] overflow-hidden animate-fade-slide'>
							<div className='h-1.5 bg-mainColor' />

							<div className='flex justify-center pt-6'>
								<div className='w-16 h-16 rounded-full bg-mainColor flex items-center justify-center shadow-lg'>
									<FontAwesomeIcon icon={activeTool.icon} className='text-white text-2xl' />
								</div>
							</div>

							<div className='px-8 pt-6 pb-10 text-center'>
								<h3 className='text-xl font-semibold text-gray-900'>{activeTool.name}</h3>

								<p className='mt-4 text-gray-600 text-sm leading-relaxed'>{activeTool.description}</p>

								<div className='mt-6 h-px bg-gray-200' />

								<div className='mt-6 flex flex-wrap justify-center gap-3'>
									{activeTool.benefits.map(item => (
										<span
											key={item}
											className='px-3 py-1 text-xs font-medium rounded-full bg-mainColor/10 text-mainColor'>
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
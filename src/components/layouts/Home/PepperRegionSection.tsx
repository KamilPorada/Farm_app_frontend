import { useEffect, useState } from 'react'
import mapImage from '../../../assets/img/map-pepper.png'
import timeLineBg from '../../../assets/img/hero-img-timeline3.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faSeedling,
	faWarehouse,
	faTent,
	faChartLine,
	faStore,
	faTrophy,
	faArrowTrendUp,
	faChartArea,
	faStar,
} from '@fortawesome/free-solid-svg-icons'

function PepperDataRegionSection() {
	const timelineData = [
		{
			label: '1982',
			text: 'Pierwsze uprawy papryki w gminie Przytyk.',
		},
		{
			label: 'Lata 80.',
			text: 'Dynamiczny rozwój tuneli i wzrost opłacalności upraw.',
		},
		{
			label: 'Lata 90.',
			text: 'Region zyskuje miano paprykowego zagłębia.',
		},
		{
			label: '1999',
			text: 'Start Ogólnopolskich Targów Papryki w Przytyku.',
		},
		{
			label: '2000–2020',
			text: 'Region radomski liderem krajowej produkcji papryki.',
		},
		{
			label: '2021',
			text: 'Przełomowy wzrost areału upraw papryki.',
		},
		{
			label: '2024',
			text: 'Rekordowy areał upraw – około 2,7 tys. ha.',
		},
		{
			label: 'Obecnie',
			text: 'Największe zagłębie papryki w Polsce.',
		},
	]
	const timelineIcons = [
		faSeedling, // początki
		faTent, // tunele
		faChartLine, // rozwój
		faStore, // targi
		faTrophy, // lider
		faArrowTrendUp, // wzrost
		faChartArea, // rekordy
		faStar, // obecnie
	]

	const [activeIndex, setActiveIndex] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => {
			setActiveIndex(prev => (prev + 1) % timelineData.length)
		}, 5000)
		return () => clearInterval(interval)
	}, [])

	return (
		<section className='w-full bg-white py-24'>
			{/* GÓRA – TEKST + MAPA */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-20 items-center text-center container' id='mission'>
				<div>
					<h2 className='text-3xl md:text-4xl font-bold text-gray-900'>Tam, gdzie rośnie polska papryka</h2>
					<p className='mt-6 text-lg text-gray-600 max-w-xl'>
						Platforma została stworzona z myślą o producentach polskiej papryki, ze szczególnym uwzględnieniem{' '}
						<strong>południowego Mazowsza</strong> – regionu uznawanego za największe zagłębie upraw papryki w Polsce.
					</p>
					<p className='mt-3 text-lg text-gray-600 max-w-xl'>
						Kluczową rolę odgrywają tu <strong>powiaty radomski i przysuski</strong>, gdzie uprawa papryki stanowi filar
						lokalnego rolnictwa i główne źródło dochodu wielu gospodarstw. Gminy takie jak{' '}
						<strong>Przytyk, Klwów, Potworów, Radzanów</strong> czy <strong>Wyśmierzyce</strong> od lat budują renomę
						regionu dzięki specjalizacji i sprzyjającym warunkom klimatycznym.
					</p>
				</div>

				<div>
					<img
						src={mapImage}
						alt='Mapa zagłębia upraw papryki'
						className='max-w-full h-auto hover:scale-105 transition-all duration-500'
					/>
				</div>
			</div>

			{/* TIMELINE – CAŁA SZEROKOŚĆ */}
			{/* TIMELINE – FULL WIDTH Z TŁEM */}
			<div className='relative mt-24 w-full overflow-hidden' id='history'>
				{/* TŁO – FULL BLEED */}
				<div className='absolute inset-0 bg-center bg-cover' style={{ backgroundImage: `url(${timeLineBg})` }} />

				{/* BIAŁY OVERLAY */}
				<div className='absolute inset-0 bg-white/75' />

				{/* CONTENT */}
				<div className='relative container py-24'>
					<h3 className='text-3xl md:text-4xl font-thin text-textColor absolute top-12 left-1/2 -translate-x-1/2'>
						Historia regionu w czasie
					</h3>
					{/* CENTRALNA LINIA + PROGRESS */}
					<div className='absolute left-1/2 top-36  h-full w-px bg-mainColor/50'></div>

					<div className='space-y-10'>
						{timelineData.map((item, index) => {
							const isActive = index === activeIndex
							const isLeft = index % 2 === 0

							return (
								<div key={index} className={`relative mt-12 flex ${isLeft ? 'justify-center' : 'justify-center'}`}>
									{/* PUNKT NA OSI */}
									<span
										className={`
                            absolute left-1/2 -translate-x-[5.5px] top-8
                            w-3 h-3 rounded-full transition-all duration-500
                            ${
															isActive
																? 'bg-mainColor scale-125 shadow-[0_0_0_6px_rgba(95,171,24,0.4)]'
																: 'bg-mainColor/60'
														}
                        `}
									/>

									{/* BOX */}
									<div
										className={`
                            relative w-1/4 p-4 rounded-md bg-white
                            transition-all duration-500
                            ${isActive ? 'scale-[1.04] shadow-lg' : 'scale-100 shadow-sm'}
                            ${isLeft ? 'text-right mr-100' : 'text-left ml-100'}
                        `}>
										{/* ROK */}
										<span
											className={`
                                block font-semibold text-sm
                                ${isActive ? 'text-mainColor' : 'text-gray-700'}
                            `}>
											{item.label}
											{item.label === 'Obecnie' && (
												<span className='ml-2 px-2 py-0.5 text-xs rounded-full bg-mainColor/10 text-mainColor font-semibold'>
													{' '}
													Teraz{' '}
												</span>
											)}
										</span>

										{/* OPIS */}
										<p
											className={`
                                mt-1 text-sm
                                ${isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}
                            `}>
											{item.text}
										</p>
									</div>
								</div>
							)
						})}
					</div>
				</div>
			</div>
		</section>
	)
}

export default PepperDataRegionSection

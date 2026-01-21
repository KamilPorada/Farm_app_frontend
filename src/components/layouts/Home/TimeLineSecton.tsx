import { useEffect, useState } from 'react'
import timeLineBg from '../../../assets/img/hero-img-timeline.png'

function TimeLineSecton() {
	const timelineData = [
		{ label: '1982', text: 'Pierwsze uprawy papryki w gminie Przytyk.' },
		{ label: 'Lata 80.', text: 'Dynamiczny rozwój tuneli i wzrost opłacalności upraw.' },
		{ label: 'Lata 90.', text: 'Region zyskuje miano paprykowego zagłębia.' },
		{ label: '1999', text: 'Start Ogólnopolskich Targów Papryki w Przytyku.' },
		{ label: '2000–2020', text: 'Region radomski liderem krajowej produkcji papryki.' },
		{ label: '2021', text: 'Przełomowy wzrost areału upraw papryki.' },
		{ label: '2024', text: 'Rekordowy areał upraw – około 2,7 tys. ha.' },
		{ label: 'Obecnie', text: 'Największe zagłębie papryki w Polsce.' },
	]

	const [activeIndex, setActiveIndex] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => {
			setActiveIndex(prev => (prev + 1) % timelineData.length)
		}, 5000)
		return () => clearInterval(interval)
	}, [])

	return (
		<section className="relative mt-10 w-full overflow-hidden" id="timeline">
			{/* TŁO */}
			<div
				className="absolute inset-0 bg-center bg-cover"
				style={{ backgroundImage: `url(${timeLineBg})` }}
			/>
			<div className="absolute inset-0 bg-white/75" />

			{/* ================= DESKTOP (md+) ================= */}
			<div className="relative container py-24 hidden md:block">
				<h3 className="text-3xl md:text-4xl font-thin text-textColor absolute top-12 left-1/2 -translate-x-1/2">
					Historia regionu w czasie
				</h3>

				{/* OŚ CZASU */}
				<div className="absolute left-1/2 top-36 h-full w-px bg-mainColor/50" />

				<div className="space-y-10 mt-32">
					{timelineData.map((item, index) => {
						const isActive = index === activeIndex
						const isLeft = index % 2 === 0

						return (
							<div key={index} className="relative flex justify-center">
								{/* KROPKA */}
								<span
									className={`
										absolute left-1/2 -translate-x-[5.5px] top-8
										w-3 h-3 rounded-full transition-all duration-500
										${isActive
											? 'bg-mainColor scale-125 shadow-[0_0_0_6px_rgba(95,171,24,0.4)]'
											: 'bg-mainColor/60'}
									`}
								/>

								{/* KARTA */}
								<div
									className={`
										relative w-1/4 p-4 rounded-md bg-white
										transition-all duration-500 
										${isActive ? 'scale-[1.04] shadow-lg' : 'shadow-sm'}
										${isLeft ? 'text-right mr-96' : 'text-left ml-96'}
									`}
								>
									<span className={`block font-semibold text-sm ${isActive ? 'text-mainColor' : 'text-gray-700'}`}>
										{item.label}
                                        {item.label === 'Obecnie' && ( <span className='ml-2 px-2 py-0.5 text-xs rounded-full bg-mainColor/10 text-mainColor font-semibold'> {' '} Teraz{' '} </span> )}
									</span>

									<p className={`mt-1 text-sm ${isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
										{item.text}
									</p>
								</div>
							</div>
						)
					})}
				</div>
			</div>

			{/* ================= MOBILE (< md) ================= */}
			<div className="relative container py-20 block md:hidden">
				<h3 className="text-2xl font-light text-textColor text-center mb-12">
					Historia regionu w czasie
				</h3>

				<div className="space-y-6">
					{timelineData.map((item, index) => (
						<div
							key={index}
							className="bg-white rounded-md p-4 shadow-sm"
						>
							<span className="block font-semibold text-mainColor text-sm">
								{item.label}
							</span>
							<p className="mt-1 text-sm text-gray-700">
								{item.text}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}

export default TimeLineSecton

import { useEffect, useRef, useState } from 'react'
import heroSeedlingSmall from '../../assets/img/seedling-small.jpg'
import heroSeedlingBig from '../../assets/img/seedling-big.jpg'

const steps = ['Sprzedaż', 'Wydatki', 'Zbiory', 'Analiza', 'Zabiegi']

const HeroSeedling = () => {
	const stepsRef = useRef<HTMLDivElement>(null)
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true)
					observer.disconnect()
				}
			},
			{ threshold: 0.3 }
		)

		if (stepsRef.current) observer.observe(stepsRef.current)
		return () => observer.disconnect()
	}, [])

	return (
		<div className='relative w-screen h-96'>
			<img
				src={heroSeedlingSmall}
				alt='Hero Seedling Image Small'
				className='md:hidden absolute inset-0 w-full h-full object-cover'
			/>
			<img
				src={heroSeedlingBig}
				alt='Hero Seedling Image Big'
				className='hidden md:block absolute inset-0 w-full h-full object-cover'
			/>

			{/* overlay */}
			<div className='absolute inset-0 bg-black/30'></div>

			{/* tekst */}
			<div className='absolute inset-0 flex items-center justify-center px-6'>
				<div className='max-w-4xl text-center text-white'>
					<h2 className='text-3xl md:text-4xl lg:text-5xl leading-tight'>
						Uprawiaj paprykę z asystentem <br /> który analizuje za Ciebie
					</h2>

					{/* ANIMOWANE ETAPY */}
					<div
						ref={stepsRef}
						className='mt-10 flex flex-wrap justify-center gap-6 text-sm'
					>
						{steps.map((step, index) => (
							<div
								key={step}
								className={`
									px-6 py-3 rounded-full
									border border-white/40 backdrop-blur-sm
									transition-all duration-500 ease-out
									${visible
										? 'opacity-100 translate-y-0'
										: 'opacity-0 translate-y-4'}
								`}
								style={{
									transitionDelay: `${index * 150}ms`,
								}}
							>
								{step}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

export default HeroSeedling

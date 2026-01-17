import { useState, useEffect } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBrain, faChartLine, faCoins } from '@fortawesome/free-solid-svg-icons'

import Button from '../../ui/Button'

import heroImg1 from '../../../assets/img/hero-img-1.png'
import heroImg2 from '../../../assets/img/hero-img-2.png'
import heroImg3 from '../../../assets/img/hero-img-3.png'
import heroImg4 from '../../../assets/img/hero-img-4.png'

const heroImages = [heroImg1, heroImg2, heroImg3, heroImg4]

function HeroSection() {
	const [currentImage, setCurrentImage] = useState(0)
	const [activeIndex, setActiveIndex] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentImage(prev => (prev === heroImages.length - 1 ? 0 : prev + 1))
		}, 10000)

		return () => clearInterval(interval)
	}, [])

	useEffect(() => {
		const durations = [5000, 500, 5000, 500, 5000]
		let timeout: ReturnType<typeof setTimeout>

		const run = (index: number) => {
			setActiveIndex(index)
			timeout = setTimeout(() => run((index + 1) % durations.length), durations[index])
		}

		run(0)

		return () => clearTimeout(timeout)
	}, [])

	return (
		<section className='relative w-full h-screen overflow-hidden'>
			{/* FLEX NA CAŁĄ SZEROKOŚĆ VIEWPORTU */}
			<div className='relative z-10 flex h-full'>
				{/* LEWA STRONA – TEKST (CONTAINER) */}
				<div className='w-full bg-white flex items-center container mt-15'>
					<div className='w-full lg:w-2/5'>
						<h2 className=' text-center text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 '>
							Asystent danych <br />
							<span className='text-mainColor'>od pierwszych decyzji aż po zbiory</span>
						</h2>

						<p className='text-center my-8 text-gray-600 text-lg'>
							Zbieraj, analizuj i porządkuj wszystkie informacje o uprawie papryki w jednym systemie – na każdym etapie
							produkcji
						</p>

						{/* PRAWA STRONA – IKONY ETAPÓW */}
						<div className='flex items-center gap-10'>
							{/* KROPKA 1  */}
							<div className='flex flex-col items-center text-center'>
								<div
									className={`
						w-16 h-16 rounded-full flex items-center justify-center text-2xl
						transition-all duration-500
						${activeIndex === 0 ? 'bg-mainColor text-white scale-125 shadow-lg' : 'bg-mainColor/10 text-mainColor'}
					`}>
									<FontAwesomeIcon icon={faBrain} />
								</div>
								<span
									className={`mt-4 text-sm font-semibold text-gray-700 transition-all duration-500 ${
										activeIndex === 0 ? 'scale-110' : 'scale-100'
									}`}>
									Strategiczne decyzje
								</span>
							</div>

							{/* KRESKA 1 */}
							<div
								className={`
					w-12 mb-12 transition-all duration-100 rounded-3xl
					${activeIndex === 1 ? 'h-0.5 bg-mainColor' : 'h-px bg-gray-300'}
				`}
							/>

							{/* KROPKA 2  */}
							<div className='flex flex-col items-center text-center'>
								<div
									className={`
						w-16 h-16 rounded-full flex items-center justify-center text-2xl
						transition-all duration-500
						${activeIndex === 2 ? 'bg-mainColor text-white scale-125 shadow-lg' : 'bg-mainColor/10 text-mainColor'}
					`}>
									<FontAwesomeIcon icon={faChartLine} />
								</div>
								<span
									className={`mt-4 text-sm font-semibold text-gray-700 transition-all duration-500 ${
										activeIndex === 2 ? 'scale-110' : 'scale-100'
									}`}>
									Trafne analizy
								</span>
							</div>

							{/* KRESKA 2 */}
							<div
								className={`
					w-12 mb-12 transition-all duration-100 rounded-3xl
					${activeIndex === 3 ? 'h-0.5 bg-mainColor' : 'h-px bg-gray-300'}
				`}
							/>

							{/* KROPKA 3 */}
							<div className='flex flex-col items-center text-center'>
								<div
									className={`
						w-16 h-16 rounded-full flex items-center justify-center text-2xl
						transition-all duration-500
						${activeIndex === 4 ? 'bg-mainColor text-white scale-125 shadow-lg' : 'bg-mainColor/10 text-mainColor'}
					`}>
									<FontAwesomeIcon icon={faCoins} />
								</div>
								<span
									className={`mt-4 text-sm font-semibold text-gray-700 transition-all duration-500 ${
										activeIndex === 4 ? 'scale-110' : 'scale-100'
									}`}>
									Opłacalna produkcja
								</span>
							</div>
						</div>

						<div className='mt-10 text-center'>
							<Button href='#mission'>Dowiedz się więcej</Button>
						</div>
					</div>
				</div>
				<div className='hidden lg:block'>
					{/* PRAWA STRONA – FULL BLEED IMAGE */}
					{heroImages.map((img, index) => {
						const positionClass = index === 0 || index === 2 ? 'bg-[center_20%]' : 'bg-[right_50%]'

						return (
							<div
								key={index}
								className={`
					absolute top-0 left-1/2 w-1/2 inset-0
					bg-cover
					${positionClass}
					hero-clip
					transition-opacity duration-2000
					${index === currentImage ? 'opacity-100' : 'opacity-0'}
				`}
								style={{ backgroundImage: `url(${img})` }}
							/>
						)
					})}
					{/* KROPKI */}
					<div className='absolute bottom-6 left-3/4 -translate-x-1/2 flex gap-3 z-20'>
						{heroImages.map((_, index) => (
							<button
								key={index}
								onClick={() => setCurrentImage(index)}
								className={`
				w-2 h-2 rounded-full
				transition-all duration-300 hover:cursor-pointer
				${index === currentImage ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white'}
			`}
								aria-label={`Slide ${index + 1}`}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

export default HeroSection

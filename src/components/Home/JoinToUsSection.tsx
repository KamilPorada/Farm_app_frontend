import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers } from '@fortawesome/free-solid-svg-icons'
import farmersImg from '../../assets/img/hero-farmers.png'

function JoinToUsSection() {
	return (
		<section className="w-full bg-white pt-10 md:pt-20">
			<div className="w-full bg-mainColor">
				<div
					className="
						container
						flex flex-col md:flex-col lg:flex-row
						items-center justify-center
						gap-10 lg:gap-25
						py-16 md:py-0
					"
				>
					{/* OBRAZ */}
					<div
						className="
							w-full max-w-sm md:max-w-md
							aspect-square
							rounded-xl overflow-hidden
							shadow-[0_30px_60px_rgba(0,0,0,0.15)]
							bg-gray-100
							lg:scale-120
						"
					>
						<img
							src={farmersImg}
							alt="Dołącz do platformy"
							className="w-full h-full object-cover object-center"
						/>
					</div>

					{/* CTA */}
					<div className="flex flex-col items-center text-center px-4 md:px-6 max-w-xl">
						{/* TYTUŁ */}
						<h2 className="
							text-xl sm:text-2xl md:text-3xl lg:text-3xl
							font-bold text-white
						">
							Nie masz jeszcze konta?
						</h2>

						{/* IKONA */}
						<div className="relative mt-6 flex justify-center">
							<FontAwesomeIcon
								icon={faUsers}
								className="text-white text-5xl sm:text-6xl md:text-7xl"
							/>
						</div>

						{/* OPIS */}
						<p className="
							mt-6
							text-white
							text-sm sm:text-base md:text-base lg:text-lg
							leading-relaxed
							max-w-md
						">
							Poznaj możliwości <strong>asystenta producenta papryki</strong>.
							Gromadź dane z upraw, porządkuj informacje i miej pełną kontrolę nad sezonem.
						</p>

						{/* CTA BUTTON */}
						<button
							className="
								w-full sm:w-3/4
								mt-8
								rounded-2xl
								bg-white
								text-mainColor
								text-base sm:text-lg
								font-semibold uppercase
								py-4
								animate-pulse-soft
								transition-all duration-300
								hover:-translate-y-1 hover:shadow-xl
								cursor-pointer
							"
						>
							Załóż konto →
						</button>
					</div>
				</div>
			</div>
		</section>
	)
}

export default JoinToUsSection

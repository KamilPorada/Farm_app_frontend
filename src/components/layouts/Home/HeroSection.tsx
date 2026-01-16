import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSeedling } from '@fortawesome/free-solid-svg-icons'
import Button from '../../ui/Button'
import heroImg from '../../../assets/img/hero-img.png'

function HeroSection() {
	return (
		<section className="relative w-full min-h-[80vh] flex items-stretch overflow-hidden">
			{/* LEWA STRONA */}
			<div className="relative z-10 w-full lg:w-3/5 bg-white flex flex-col justify-center px-8 lg:px-20">
				{/* IKONKA */}
				<div className="mb-6">
					<div
						className="
							inline-flex items-center justify-center
							w-14 h-14 rounded-full
							bg-mainColor/10
							text-mainColor
							text-2xl
							hover:rotate-12
							transition-transform
						"
					>
						<FontAwesomeIcon icon={faSeedling} />
					</div>
				</div>

				{/* TEKST */}
				<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
					Decyzje oparte na danych. <br />
					<span className="text-mainColor">
						Lepsze plony. Większa kontrola.
					</span>
				</h1>

				<p className="mt-6 max-w-xl text-gray-600 text-lg">
					Analizuj sezon, ceny i warunki upraw papryki
					w jednym inteligentnym systemie wspierającym producentów.
				</p>

				{/* CTA */}
				<div className="mt-10 flex gap-4">
					<Button>
						Zobacz możliwości
					</Button>

					<button className="text-gray-600 font-semibold hover:text-mainColor transition">
						Poznaj system →
					</button>
				</div>
			</div>

			{/* PRAWA STRONA – OBRAZ */}
			<div className="hidden lg:block relative w-2/5">
				<div
					className="
						absolute inset-0
						bg-cover bg-center
						hero-clip
					"
					style={{ backgroundImage: `url(${heroImg})` }}
				/>
			</div>
		</section>
	)
}

export default HeroSection

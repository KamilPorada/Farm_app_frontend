import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faBrain,
	faChartSimple,
	faLayerGroup,
	faSliders,
} from '@fortawesome/free-solid-svg-icons'

const features = [
	{
		icon: faBrain,
		title: 'Asystent danych',
		description:
			'Systematyczne zbieranie danych o sprzedaży, zbiorach i kosztach w jednym miejscu.',
	},
	{
		icon: faSliders,
		title: 'Pełna kontrola sezonu',
		description:
			'Zarządzaj sprzedażą, zbiorami, kosztami i zabiegami w jednym spójnym systemie.',
	},
	{
		icon: faChartSimple,
		title: 'Automatyczne analizy',
		description:
			'Wykresy, trendy i podsumowania generowane na podstawie Twoich danych.',
	},
	{
		icon: faLayerGroup,
		title: 'Jedno centrum zarządzania',
		description:
			'Wszystkie informacje o uprawie w jednym miejscu — bez chaosu i notatek.',
	},
]

function KeyFeatures() {
	return (
		<section className="w-full bg-white py-20 md:py-32" id='keyFeatures'>
			<div className="container">
				{/* HEADER */}
				<div className="text-center max-w-3xl mx-auto">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900">
						Kluczowe możliwości platformy
					</h2>
					<p className="mt-4 text-gray-600 text-lg">
						System zaprojektowany specjalnie dla producentów papryki —
						prosty w obsłudze, zaawansowany w działaniu.
					</p>
				</div>

				{/* GRID */}
				<div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
					{features.map((feature, index) => (
						<div
							key={index}
							className="
								group relative bg-white rounded-2xl p-10
								flex flex-col items-center text-center
								shadow-[0_20px_40px_rgba(0,0,0,0.06)]
								transition-all duration-500
								hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)]
							"
						>
							{/* GÓRNY AKCENT */}
							<div className="absolute inset-x-0 top-0 h-1.5 bg-mainColor rounded-t-2xl" />

							{/* IKONA */}
							<div className="
								w-16 h-16 rounded-2xl
								bg-mainColor/10
								flex items-center justify-center
								text-mainColor text-2xl
								transition-all duration-500
								group-hover:bg-mainColor group-hover:text-white
								group-hover:scale-110
							">
								<FontAwesomeIcon icon={feature.icon} />
							</div>

							{/* TYTUŁ */}
							<h3 className="mt-6 text-lg font-semibold text-gray-900">
								{feature.title}
							</h3>

							{/* OPIS */}
							<p className="mt-4 text-gray-600 leading-relaxed text-sm">
								{feature.description}
							</p>

							{/* SUBTLE GLOW */}
							<div className="
								pointer-events-none absolute inset-0 rounded-2xl
								opacity-0 group-hover:opacity-100
								transition duration-500
								bg-[radial-gradient(circle_at_top,rgba(95,171,24,0.12),transparent_70%)]
							" />
						</div>
					))}
				</div>
			</div>
		</section>
	)
}

export default KeyFeatures

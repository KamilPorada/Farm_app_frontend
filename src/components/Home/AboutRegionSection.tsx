import mapImage from '../../assets/img/map-pepper.png'
function PepperDataRegionSection() {
	return (
		<section
			className='w-full bg-white  md:py-20 flex flex-col lg:flex-row justify-between items-center gap-5 text-center container'
			id='aboutRegion'>
			{/* GÓRA – TEKST + MAPA */}
			<div className=''>
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

			<div className='w-full lg:w-2/3'>
				<img
					src={mapImage}
					alt='Mapa zagłębia upraw papryki'
					className='hover:scale-105 transition-all duration-500'
				/>
			</div>
		</section>
	)
}

export default PepperDataRegionSection

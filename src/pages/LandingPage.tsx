import React from 'react'
import HeroSection from '../components/layouts/Home/HeroSection'
import AboutRegionSection from '../components/layouts/Home/AboutRegionSection'
import TimeLineSecton from '../components/layouts/Home/TimeLineSecton'

function LandingPage() {
	return (
		<>
			<main >
				<HeroSection />
        <AboutRegionSection/>
        <TimeLineSecton/>
			</main>
		</>
	)
}

export default LandingPage

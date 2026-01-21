import React from 'react'
import HeroSection from '../components/layouts/Home/HeroSection'
import AboutRegionSection from '../components/layouts/Home/AboutRegionSection'
import TimeLineSecton from '../components/layouts/Home/TimeLineSecton'
import PlatformToolsSection from '../components/layouts/Home/PlatformToolsSection'
import HeroSeedling from '../components/layouts/Home/HeroSeedling'

function LandingPage() {
	return (
		<>
			<main >
				<HeroSection />
        <AboutRegionSection/>
        <TimeLineSecton/>
        <PlatformToolsSection/>
        <HeroSeedling/>
			</main>
		</>
	)
}

export default LandingPage

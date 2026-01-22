import React from 'react'
import HeroSection from '../components/layouts/Home/HeroSection'
import AboutRegionSection from '../components/layouts/Home/AboutRegionSection'
import TimeLineSecton from '../components/layouts/Home/TimeLineSecton'
import PlatformToolsSection from '../components/layouts/Home/PlatformToolsSection'
import HeroSeedling from '../components/layouts/Home/HeroSeedling'
import KeyFeatures from '../components/layouts/Home/KeyFeatures'
import JoinToUsSection from '../components/layouts/Home/JoinToUsSection'

function LandingPage() {
	return (
		<>
			<main >
				<HeroSection />
        <AboutRegionSection/>
        <TimeLineSecton/>
        <PlatformToolsSection/>
        <HeroSeedling/>
        <KeyFeatures/>
        <JoinToUsSection/>
			</main>
		</>
	)
}

export default LandingPage

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKindeAuth } from '@kinde-oss/kinde-auth-react'

import Navbar from '../components/navigation/Navbar'
import HeroSection from '../components/layouts/Home/HeroSection'
import AboutRegionSection from '../components/layouts/Home/AboutRegionSection'
import TimeLineSecton from '../components/layouts/Home/TimeLineSecton'
import PlatformToolsSection from '../components/layouts/Home/PlatformToolsSection'
import HeroSeedling from '../components/layouts/Home/HeroSeedling'
import KeyFeatures from '../components/layouts/Home/KeyFeatures'
import JoinToUsSection from '../components/layouts/Home/JoinToUsSection'
import Footer from '../components/layouts/Home/Footer'

function LandingPage() {
	const { isAuthenticated, isLoading } = useKindeAuth()
	const navigate = useNavigate()

	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			navigate('/dashboard')
		}
	}, [isAuthenticated, isLoading, navigate])

	return (
		<main>
			<Navbar />
			<HeroSection />
			<AboutRegionSection />
			<TimeLineSecton />
			<PlatformToolsSection />
			<HeroSeedling />
			<KeyFeatures />
			<JoinToUsSection />
			<Footer />
		</main>
	)
}

export default LandingPage

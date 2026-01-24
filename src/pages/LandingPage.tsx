import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKindeAuth } from '@kinde-oss/kinde-auth-react'

import Navbar from '../components/navigation/Navbar'
import HeroSection from '../components/Home/HeroSection'
import AboutRegionSection from '../components/Home/AboutRegionSection'
import TimeLineSecton from '../components/Home/TimeLineSecton'
import PlatformToolsSection from '../components/Home/PlatformToolsSection'
import HeroSeedling from '../components/Home/HeroSeedling'
import KeyFeatures from '../components/Home/KeyFeatures'
import JoinToUsSection from '../components/Home/JoinToUsSection'
import Footer from '../components/Home/Footer'

function LandingPage() {
	const { isAuthenticated, isLoading } = useKindeAuth()
	const navigate = useNavigate()

	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			console.log('auth:', isAuthenticated, 'loading:', isLoading)

			navigate('/app')
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

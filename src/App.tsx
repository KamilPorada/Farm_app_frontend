import { BrowserRouter } from 'react-router'
import { Routes, Route } from 'react-router'

import LandingPage from './pages/LandingPage.tsx'
import Navbar from './components/navigation/Navbar.tsx'

function App() {
	return (
		<BrowserRouter>
			<Navbar />
			<Routes>
				<Route path='/' element={<LandingPage />}></Route>
			</Routes>
		</BrowserRouter>
	)
}

export default App

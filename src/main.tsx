import React from 'react'
import ReactDOM from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import { KindeProvider } from '@kinde-oss/kinde-auth-react'

import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<KindeProvider
			domain={import.meta.env.VITE_KINDE_DOMAIN}
			clientId={import.meta.env.VITE_KINDE_CLIENT_ID}
			redirectUri={window.location.origin}
			logoutUri={window.location.origin}>
			<App />
		</KindeProvider>
	</React.StrictMode>
)

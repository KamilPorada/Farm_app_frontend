import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
	faBug,
	faViruses,
	faLeaf,
	faFlask,
	faSkullCrossbones,
	faBacteria,
	faDroplet,
	faSprayCan,
	faShieldHalved,
	faMicroscope,
	faBiohazard,
	faWheatAwn,
	faClover,
	faSunPlantWilt,
} from '@fortawesome/free-solid-svg-icons'
import { faPagelines } from '@fortawesome/free-brands-svg-icons'

export const PESTICIDE_TYPE_ICON_MAP: Record<string, IconDefinition> = {
	// szkodniki
	'fa-bug': faBug,

	// choroby i patogeny
	'fa-viruses': faViruses,
	'fa-bacteria': faBacteria,
	'fa-biohazard': faBiohazard,
	'fa-microscope': faMicroscope,
	'fa-clover': faClover,

	// fungicydy / choroby roślin
	'fa-wheat-awn': faWheatAwn,

	// ochrona roślin / biologiczna
	'fa-leaf': faLeaf,
	'fa-pagelines': faPagelines,
	'fa-shield-halved': faShieldHalved,

	// chemia / środki
	'fa-flask': faFlask,

	// silne środki
	'fa-skull-crossbones': faSkullCrossbones,

	// opryski cieczy
	'fa-droplet': faDroplet,
	'fa-spray-can': faSprayCan,

	// stres roślin / uszkodzenia
	'fa-sun-plant-wilt': faSunPlantWilt,
}

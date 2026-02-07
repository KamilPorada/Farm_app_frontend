import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
	// uprawy / nawozy
	faSeedling,
	faLeaf,
	faTree,
	faFlask,
	faVial,
	faMortarPestle,

	// paliwo / energia
	faGasPump,
	faBolt,
	faSolarPanel,
	faBatteryFull,
	faOilCan,
	faFire,

	// maszyny / narzędzia
	faTractor,
	faWrench,
	faScrewdriverWrench,
	faHammer,
	faGears,
	faToolbox,

	// praca / ludzie
	faUsers,
	faUserGear,
	faUserClock,
	faPeopleCarryBox,

	// magazyn / logistyka
	faWarehouse,
	faBox,
	faBoxesStacked,
	faTruck,
	faTruckFast,
	faPallet,

	// finanse / koszty
	faCoins,
	faMoneyBillWave,
	faReceipt,
	faFileInvoice,
	faScaleBalanced,

	// woda / energia / powietrze
	faWater,
	faPlug,
	faChartLine,

	// inne / pomocnicze
	faDroplet,
	faBug,
	faShieldVirus,
	faEllipsis,
} from '@fortawesome/free-solid-svg-icons'

export const EXPENSE_CATEGORY_ICON_MAP: Record<string, IconDefinition> = {
	// uprawy / nawozy
	'fa-seedling': faSeedling,
	'fa-leaf': faLeaf,
	'fa-tree': faTree,
	'fa-flask': faFlask,
	'fa-vial': faVial,
	'fa-mortar-pestle': faMortarPestle,

	// paliwo / energia
	'fa-gas-pump': faGasPump,
	'fa-bolt': faBolt,
	'fa-solar-panel': faSolarPanel,
	'fa-battery-full': faBatteryFull,
	'fa-oil-can': faOilCan,
	'fa-fire': faFire,

	// maszyny / narzędzia
	'fa-tractor': faTractor,
	'fa-wrench': faWrench,
	'fa-screwdriver-wrench': faScrewdriverWrench,
	'fa-hammer': faHammer,
	'fa-gears': faGears,
	'fa-toolbox': faToolbox,

	// praca / ludzie
	'fa-users': faUsers,
	'fa-user-gear': faUserGear,
	'fa-user-clock': faUserClock,
	'fa-people-carry-box': faPeopleCarryBox,

	// magazyn / logistyka
	'fa-warehouse': faWarehouse,
	'fa-box': faBox,
	'fa-boxes-stacked': faBoxesStacked,
	'fa-truck': faTruck,
	'fa-truck-fast': faTruckFast,
	'fa-pallet': faPallet,

	// finanse / koszty
	'fa-coins': faCoins,
	'fa-money-bill-wave': faMoneyBillWave,
	'fa-receipt': faReceipt,
	'fa-file-invoice': faFileInvoice,
	'fa-scale-balanced': faScaleBalanced,

	// woda / energia / analiza
	'fa-water': faWater,
	'fa-plug': faPlug,
	'fa-chart-line': faChartLine,

	// inne / pomocnicze
	'fa-droplet': faDroplet,
	'fa-bug': faBug,
	'fa-shield-virus': faShieldVirus,
	'fa-ellipsis': faEllipsis,
}

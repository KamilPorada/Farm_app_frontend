import { useMemo, useState } from 'react'
import ChartCard from '../ui/ChartCard'
import PointOfSaleDashboardHeader from './PointOfSaleDashboardHeader'
import PointOfSaleKpiCards from './PointOfSaleKpiCards'
import PointOfSalePriceTrendChart from './PointOfSalePriceTrendChart'
import PointOfSaleMonthlyTransactionsChart from './PointOfSaleMonthlyTransactionsChart'
import PointOfSaleMonthlyRevenueBarChart from './PointOfSaleMonthlyRevenueBarChart'
import PointOfSaleMonthlyWeightBarChart from './PointOfSaleMonthlyWeightBarChart'
import type { PointOfSale } from '../../types/PointOfSale'
import type { TradeOfPepper } from '../../types/TradeOfPepper'

type Props = {
	points: PointOfSale[]
	actualTrades: TradeOfPepper[]
}

export default function PointOfSaleDashboardCard({ points, actualTrades }: Props) {
	// ✅ lokalny stan wybranego punktu
	const [selectedPointId, setSelectedPointId] = useState<number>(points[0]?.id ?? 0)


	// ✅ transakcje tylko dla wybranego punktu
	const tradesForPoint = useMemo(
		() => actualTrades.filter(t => t.pointOfSaleId === selectedPointId),
		[actualTrades, selectedPointId],
	)

	return (
		<ChartCard>
			<div className='p-4'>
				{/* HEADER */}
				<PointOfSaleDashboardHeader
					pointsOfSale={points}
					selectedPointId={selectedPointId}
					onChangePoint={setSelectedPointId}
				/>

				{/* CONTENT PLACEHOLDER */}
				<div className=' my-4 flex flex-col justify-center items-start gap-6'>
					<PointOfSaleKpiCards actualTrades={tradesForPoint} />

					<div className='flex flex-col md:flex-row gap-6 w-full'>
						<PointOfSalePriceTrendChart actualTrades={tradesForPoint} />
						<PointOfSaleMonthlyTransactionsChart actualTrades={tradesForPoint} />
					</div>
					<div className='flex flex-col md:flex-row gap-6 w-full'>
						<PointOfSaleMonthlyRevenueBarChart actualTrades={tradesForPoint} />
						<PointOfSaleMonthlyWeightBarChart actualTrades={tradesForPoint} />
					</div>
					
				</div>
			</div>
		</ChartCard>
	)
}

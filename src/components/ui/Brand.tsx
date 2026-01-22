import logotype from '../../assets/img/logotype.png'

function Brand() {
	return (
		<div className='flex flex-row justify-center items-center gap-2'>
			<img src={logotype} alt='Logo' className='h-14 md:h-15 w-auto cursor-pointer' />
            <p className='text-sm sm:text-base leading-4 font-bold'>Asystent producenta <br/>papryki</p>
		</div>
	)
}

export default Brand

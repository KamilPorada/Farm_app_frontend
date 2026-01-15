import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLeaf } from '@fortawesome/free-solid-svg-icons'

function App() {
	return (
		<div className='flex flex-col justify-between items-center gap-5 bg-surfaceColor container p-5 text-center font-3'>
			<h1 className='text-5xl text-textColor'>FarmApp</h1>
			<button className='bg-mainColor py-2 px-4 rounded-sm text-white '>Naciśnij mnie!</button>
			<FontAwesomeIcon icon={faLeaf} className='text-mainColor mr-2' />
      <p className='px-20'>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ea unde, temporibus voluptatibus asperiores vitae earum repudiandae fugit porro et, placeat veritatis facilis facere! Dolores aut facilis corporis ipsum accusamus quia, sed, dicta temporibus cumque magni ad? Adipisci, facere! Ipsam, assumenda? Nulla ad aliquam dicta cumque optio magnam maxime, iure totam explicabo accusantium omnis exercitationem est assumenda debitis minus ea. Excepturi aliquid animi fugiat, amet illum, soluta debitis omnis ipsam eligendi, harum blanditiis. Fuga perspiciatis voluptas corporis, saepe, quisquam quasi minus debitis officia amet aspernatur placeat eligendi veniam possimus dolore, repudiandae laborum rerum maiores. Et adipisci consequuntur perferendis ab ratione. Iure?</p>
		</div>
	)
}

export default App

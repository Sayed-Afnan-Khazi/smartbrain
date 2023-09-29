import React from 'react';
import './FaceRecognition.css'

const FaceRecognition = ({ url, boxes }) => {
	return (
		<div className='center ma'>
			<div className='absolute mt2'>
				<img id='inputimage' className='detected-face-img' alt='' src={url} />
				{ boxes.map(box => 
				<div className='bounding-box'
					style={{top:box.topRow,right:box.rightCol,bottom:box.bottomRow,left: box.leftCol}}></div>
				)}
			</div>
		</div>
	)
}

export default FaceRecognition;
import * as React from 'react'
import './style.css'

export interface BackgroundProps{}
const Background: React.FC<BackgroundProps> = () => {
 return(
   <svg className={'flowchart-editor_background'} width={'100%'} height={'100%'}>
     <pattern id={'flowchart-editor_background'} x={0} y={0} width={10} height={10} patternUnits={'userSpaceOnUse'}>
       <circle cx={5} cy={5} r={1}/>
     </pattern>
     <rect x={0} y={0} width={'100%'} height={'100%'} fill={'url(#flowchart-editor_background)'}/>
   </svg>
 )
}

Background.displayName = 'FlowchartBackground'
export default Background
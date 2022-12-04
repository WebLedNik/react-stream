import * as React from 'react'
import {v4 as uuidv4} from 'uuid';
import {Directions, Handle, HandleTypeNames, NodeState} from "../../../../src";

interface ProcessProps extends NodeState{}
const Process: React.FC<ProcessProps> = (props) => {
  const {
    id
  } = props

  return(
    <div>
      Process
      <div style={{position: 'relative', width: '100%', height: 60}}>
        <Handle id={'handle-' + uuidv4()} type={HandleTypeNames.Output} direction={Directions.Right}/>
        <Handle id={'handle-' + uuidv4()} type={HandleTypeNames.Input} direction={Directions.Left}/>
      </div>
      <div style={{position: 'relative', width: '100%', height: 60}}>
        <Handle id={'handle-' + uuidv4()} type={HandleTypeNames.Output} direction={Directions.Right}/>
        <Handle id={'handle-' + uuidv4()} type={HandleTypeNames.Input} direction={Directions.Left}/>
      </div>

    </div>
  )
}

export default Process
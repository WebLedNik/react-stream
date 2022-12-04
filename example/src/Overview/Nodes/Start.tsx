import * as React from 'react'
import {v4 as uuidv4} from 'uuid';
import {Directions, Handle, HandleTypeNames, NodeState} from "../../../../src";

interface StartProps extends NodeState{}
const Start: React.FC<StartProps> = (props) => {
  const {
    id
  } = props

  return(
    <div>
      Start
      <Handle id={'handle-' + uuidv4()} type={HandleTypeNames.Output} direction={Directions.Right}/>
    </div>
  )
}

export default Start
import * as React from 'react'
import {v4 as uuidv4} from 'uuid';
import {
  Directions, getLinesFromDOM,
  getNodesUseDepthFirstSearch,
  Handle,
  HandleTypeNames,
  NodeState
} from "../../../../src";

interface StartProps extends NodeState{}
const Start: React.FC<StartProps> = (props) => {
  const {
    id
  } = props

  const handleClick = () => {
    console.log(getNodesUseDepthFirstSearch(id, getLinesFromDOM()))
  }

  return(
    <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <button onClick={handleClick}>Start</button>
      <Handle id={'handle-' + uuidv4()} type={HandleTypeNames.Output} direction={Directions.Right}/>
    </div>
  )
}

export default Start
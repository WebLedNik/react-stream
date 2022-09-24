import * as React from "react";
import Path from "./Path";
import {Part} from "./types";

interface UpdatingPathProps{
 parts: Part[]
}
const UpdatingPath: React.FC<UpdatingPathProps> = (props) => {
  const {parts} = props

  return(
    <Path parts={parts} updating/>
  )
}

export default UpdatingPath
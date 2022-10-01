import * as React from "react";
import Path, {PathProps} from "./Path";

interface UpdatingPathProps extends PathProps{}
const UpdatingPath: React.FC<UpdatingPathProps> = (props) => {
  const {parts} = props

  return(
    <Path parts={parts} updating/>
  )
}

export default UpdatingPath
import * as React from 'react'
import {ElementTypeNames} from "../../types";

interface TextPathProps{
  href: string
  text: string
}
const TextPath: React.FC<TextPathProps> = (props) => {
  const {href, text} = props

  return(
    <text dy={'-4px'}>
      <textPath data-element-type={ElementTypeNames.LineText} href={href} startOffset="50%" textAnchor="middle">{text}</textPath>
    </text>
  )
}

export default TextPath
import {LineCreator, LineDTO, LineState} from "../components";
import {useState} from "react";

function useLinesState(init: LineDTO[]): [LineState[], (payload: LineDTO[]) => void, (payload: LineState[], isCreate?: boolean) => void] {
  const [values, setValues] = useState<LineState[]>(init.map(l => new LineCreator(l)))
  const setLines = (payload: LineDTO[]) => setValues(payload.map(l => new LineCreator(l)))
  const onChangeLines = (updatedLines: LineState[], isCreate?: boolean) => {
    if (isCreate) return setValues( prevState => [...prevState, ...updatedLines])

    setValues(prevState => prevState.map(line => {
      const updatedLine = updatedLines.find(item => item.id === line.id)

      if (updatedLine){
        return {...line, ...updatedLine}
      }

      return line
    }))
  }

  return [
    values,
    setLines,
    onChangeLines
  ]
}

export default useLinesState
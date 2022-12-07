import {v4 as uuidv4} from 'uuid';
import {
  GetLineDTOProps,
  LineDTO,
  LineState,
  LineStateNames,
  LineValues,
  MAX_DRAWN_PARTS,
  Part,
  PartStateNames,
  SetLinePartProps,
  SetLineSourcePositionProps,
  SetLineSourceProps,
  SetLineStatePartProps,
  SetLineStateProps,
  SetLineTargetPositionProps,
  SetLineTargetProps,
  SetLineTransformProps,
} from "./types";
import {Directions, ElementTypeNames, Orientation, Position} from "../../types";
import {getOrientationFromDirection} from "../Handle";
import {MarkerTypeNames} from "../LineRenderer";
import {getInvertedOrientation, getRootElement} from "../../utils";
import {NodeValues} from "../Node";

const removeRudimentsParts = (parts: Part[]) => {
  return parts.reduce((result: Part[], targetPart: Part, targetPartIndex: number, array) => {
    if ((targetPart.start.x === targetPart.end.x) && (targetPart.start.y === targetPart.end.y)) {
      const prevPart: Part | undefined = result[targetPartIndex - 1]
      const nextPart: Part | undefined = array[targetPartIndex + 1]

      if (prevPart?.orientation !== nextPart?.orientation) return [...result, targetPart]
      const payload = result.slice()
      payload.splice(targetPartIndex - 1, 2, {...nextPart, start: prevPart.start})

      return payload
    }
    //@ts-ignore
    return result.map(p => p.id).includes(targetPart.id) ? result : [...result, targetPart]
  }, [])
}

export function getLineDTO(props: GetLineDTOProps): LineDTO {
  const {handle, position} = props
  return {
    source: {handle, position},
    target: {position},
    state: LineStateNames.Created,
    drawnParts: 0
  }
}

export function getMarkerType(line: LineState): MarkerTypeNames {
  if (line.target.line) return MarkerTypeNames.Circle
  if (line.target.handle) return MarkerTypeNames.Hidden

  return MarkerTypeNames.Arrow
}

export function getIsLineModified(state: LineStateNames): boolean {
  switch (state) {
    case LineStateNames.Created:
      return true
    case LineStateNames.Updated:
      return true
    default:
      return false
  }
}

export function getLineTargetPosition(parts: Part[]): Position {
  const part = parts.slice().pop()

  return part ? part.end : {x: 0, y: 0}
}

export function setLineState({line, state}: SetLineStateProps): LineState {
  switch (state) {
    case LineStateNames.Created:
      return {
        ...line,
        state: LineStateNames.Created,
        target: {...line.target, handle: undefined, line: undefined, position: undefined}
      }
    default:
      return {...line, state}
  }
}

export function setLineSource(props: SetLineSourceProps): LineState {
  const {handle, line, currentLine} = props
  return {...currentLine, source: {...currentLine.source, handle, line}}
}

export function setLineTransform(props: SetLineTransformProps): LineState {
  const {position, line} = props

  return {
    ...line,
    drawnParts: 0,
    parts: removeRudimentsParts(line.parts).map(p => ({...p, state: PartStateNames.Fixed})),
    state: LineStateNames.Fixed
  }
}

export function getStartPart(parts: Part[]): Part | undefined {
  return parts.slice().shift()
}

export function getEndPart(parts: Part[]): Part | undefined {
  return parts.slice().pop()
}

export function setLineStatePart(props: SetLineStatePartProps): Part[] {
  const {parts, part, state} = props

  return parts.map(el => {
    if (el.id === part.id) return {...el, state}
    return el
  })
}

export function setLineTarget(props: SetLineTargetProps): LineState | undefined {
  const {currentLine, handle, line, position} = props

  const payloadTarget = {...currentLine.target, handle, line}

  if (!handle || !position) return

  const part = getEndPart(currentLine.parts)
  if (!part) return;

  const handleOrientation = getOrientationFromDirection({direction: handle.direction})
  if (part.orientation === handleOrientation) {
    const updatingPart = part

    if (currentLine.parts.length === 1){
      if (!currentLine.source.handle) return

      const diffPos: Position = {
        x: position.x - currentLine.source.position.x,
        y: position.y - currentLine.source.position.y,
      }

      const oneOrientation = getOrientationFromDirection({direction: currentLine.source.handle.direction})
      const one: Part = {
        id: uuidv4(),
        lineId: currentLine.id,
        orientation: oneOrientation,
        state: PartStateNames.Fixed,
        start: currentLine.source.position,
        end: {
          x: (oneOrientation === Orientation.Horizontal) ? updatingPart.start.x + getMiddleLine({
            direction: currentLine.source.handle.direction,
            sourcePosition: updatingPart.start,
            targetPosition: updatingPart.end
          }) : updatingPart.end.x,
          y: (oneOrientation === Orientation.Vertical) ? updatingPart.start.y + getMiddleLine({
            direction: currentLine.source.handle.direction,
            sourcePosition: updatingPart.start,
            targetPosition: updatingPart.end
          }) : updatingPart.end.y,
        }}

      const twoOrientation = getInvertedOrientation(oneOrientation)
      const two: Part = {
        id: uuidv4(),
        lineId: currentLine.id,
        orientation: oneOrientation,
        state: PartStateNames.Fixed,
        start: one.end,
        end: {
          x: (twoOrientation === Orientation.Horizontal) ? one.end.x + diffPos.x : one.end.x,
          y: (twoOrientation === Orientation.Vertical) ? one.end.y + diffPos.y : one.end.y,
        }
      }

      const threeOrientation = getInvertedOrientation(twoOrientation)
      const three: Part = {
        ...updatingPart,
        start: two.end,
        end: position
      }

      return {...currentLine, state: LineStateNames.Fixed, target: payloadTarget, parts: [...currentLine.parts.slice(0, -1), one,two,three]}
    }

    const prevPart = getPrevPart({parts: currentLine.parts, part: updatingPart})
    if (!prevPart) return

    const diffPos: Position = {
      x: position.x - updatingPart.start.x,
      y: position.y - updatingPart.start.y,
    }

    const oneOrientation = prevPart.orientation
    const one: Part = {
     ...prevPart,
      end: {
        x: (oneOrientation === Orientation.Horizontal) ? updatingPart.start.x + diffPos.x : updatingPart.start.x,
        y: (oneOrientation === Orientation.Vertical) ? updatingPart.start.y + diffPos.y : updatingPart.start.y,
      }}

    const two: Part = {
      ...updatingPart,
      start: one.end,
      end: position
    }

    return {...currentLine, state: LineStateNames.Fixed, target: payloadTarget, parts: [...currentLine.parts.slice(0, -2), one,two]}
  }

  if (part.orientation === Orientation.Horizontal) {
    const oneOrientation = getInvertedOrientation(part.orientation)
    const one: Part = {
      id: uuidv4(),
      lineId: currentLine.id,
      orientation: oneOrientation,
      state: PartStateNames.Fixed,
      start: {
        x: (oneOrientation === Orientation.Horizontal) ? position.x + setLengthLine({
          direction: handle.direction,
          length: 20
        }) : position.x,
        y: (oneOrientation === Orientation.Vertical) ? position.y + setLengthLine({
          direction: handle.direction,
          length: 20
        }) : position.y,
      },
      end: position
    }

    const twoOrientation = part.orientation
    const two: Part = {
      ...part,
      start: {
        x: part.start.x,
        y: one.start.y
      },
      end: one.start
    }

    const prevPart = getPrevPart({parts: currentLine.parts, part: two})
    if (!prevPart) return;

    const threeOrientation = prevPart.orientation
    const three: Part = {
      ...prevPart,
      start: {
        x: (prevPart.orientation === Orientation.Horizontal) ? prevPart.start.x : two.start.x,
        y: (prevPart.orientation === Orientation.Vertical) ? prevPart.start.y : two.start.y
      },
      end: two.start
    }

    return {...currentLine, state: LineStateNames.Fixed, target: payloadTarget, parts: [...currentLine.parts.slice(0, -2), three, two, one]}
  }
  if (part.orientation === Orientation.Vertical) {
    const oneOrientation = getInvertedOrientation(part.orientation)
    const one: Part = {
      id: uuidv4(),
      lineId: currentLine.id,
      orientation: oneOrientation,
      state: PartStateNames.Fixed,
      start: {
        x: (oneOrientation === Orientation.Horizontal) ? position.x + setLengthLine({
          direction: handle.direction,
          length: 20
        }) : position.x,
        y: (oneOrientation === Orientation.Vertical) ? position.y + setLengthLine({
          direction: handle.direction,
          length: 20
        }) : position.y,
      },
      end: position
    }

    const twoOrientation = part.orientation
    const two: Part = {
      ...part,
      start: {
        x: one.start.x,
        y: part.start.y
      },
      end: one.start
    }

    const prevPart = getPrevPart({parts: currentLine.parts, part: two})
    if (!prevPart) return;

    const threeOrientation = prevPart.orientation
    const three: Part = {
      ...prevPart,
      start: {
        x: (prevPart.orientation === Orientation.Horizontal) ? prevPart.start.x : two.start.x,
        y: (prevPart.orientation === Orientation.Vertical) ? prevPart.start.y : two.start.y
      },
      end: two.start
    }

    return {...currentLine, state: LineStateNames.Fixed, target: payloadTarget, parts: [...currentLine.parts.slice(0, -2), three, two, one]}
  }
  return
}

export function setLinePart(props: SetLinePartProps): LineState | undefined {
  const {currentLine, position} = props

  if (currentLine.state === LineStateNames.Created) {
    const lastPart = getEndPart(currentLine.parts)
    if (!lastPart) {
      if (!currentLine.source.handle) return;

      const part: Part = {
        id: uuidv4(),
        lineId: currentLine.id,
        state: PartStateNames.Fixed,
        orientation: getOrientationFromDirection({direction: currentLine.source.handle.direction}),
        start: currentLine.source.position,
        end: currentLine.source.position,
      }

      return {...currentLine, drawnParts: currentLine.drawnParts + 1, parts: [part]}
    }

    if (!position) return;

    const isWithinInterval = validateAcceptableInterval({
      target: position,
      root: lastPart.end,
      orientation: lastPart.orientation
    })

    if (isWithinInterval) {
      const validateIntervalPart = getPrevPart({parts: currentLine.parts, part: lastPart})
      if (validateIntervalPart) {
        const isWithinLocalInterval = validateAcceptableInterval({
          target: position,
          root: validateIntervalPart.end,
          orientation: validateIntervalPart.orientation
        })

        if (isWithinLocalInterval) {
          const part: Part = {
            ...validateIntervalPart,
            end: lastPart.start
          }

          return {
            ...currentLine,
            drawnParts: currentLine.drawnParts - 1,
            parts: [...currentLine.parts.slice(0, -2), part]
          }
        }
      }

      const part: Part = {
        ...lastPart,
        end: {
          x: (lastPart.orientation === Orientation.Horizontal) ? position.x : lastPart.end.x,
          y: (lastPart.orientation === Orientation.Vertical) ? position.y : lastPart.end.y
        }
      }

      const parts = currentLine.parts.map(el => {
        if (el.id === part.id) return part
        return el
      })

      return {...currentLine, parts}
    }

    if (currentLine.drawnParts >= MAX_DRAWN_PARTS) {
      const prevLastPart = getPrevPart({parts: currentLine.parts, part: lastPart})
      if (!prevLastPart) return;

      const validateIntervalPart = getPrevPart({parts: currentLine.parts, part: prevLastPart})
      if (validateIntervalPart) {
        const isWithinLocalInterval = validateAcceptableInterval({
          target: position,
          root: validateIntervalPart.end,
          orientation: validateIntervalPart.orientation
        })

        if (isWithinLocalInterval) {
          const part: Part = {
            ...validateIntervalPart,
            end: {
              x: (validateIntervalPart.orientation === Orientation.Horizontal) ? position.x : validateIntervalPart.end.x,
              y: (validateIntervalPart.orientation === Orientation.Vertical) ? position.y : validateIntervalPart.end.y
            }
          }

          return {
            ...currentLine,
            parts: [...currentLine.parts.slice(0, -3), part],
            drawnParts: currentLine.drawnParts - 1
          }
        }
      }

      const prevPart = {
        ...prevLastPart,
        end: {
          x: (prevLastPart.orientation === Orientation.Horizontal) ? position.x : prevLastPart.end.x,
          y: (prevLastPart.orientation === Orientation.Vertical) ? position.y : prevLastPart.end.y
        }
      }

      const part = {
        ...lastPart,
        start: prevPart.end,
        end: {
          x: (lastPart.orientation === Orientation.Horizontal) ? position.x : prevPart.end.x,
          y: (lastPart.orientation === Orientation.Vertical) ? position.y : prevPart.end.y
        }
      }

      const parts = currentLine.parts.map(el => {
        if (el.id === prevPart.id) return prevPart
        if (el.id === part.id) return part
        return el
      })

      return {...currentLine, parts}
    }

    const orientation = getInvertedOrientation(lastPart.orientation)
    const part: Part = {
      id: uuidv4(),
      lineId: currentLine.id,
      state: PartStateNames.Fixed,
      orientation,
      start: lastPart.end,
      end: {
        x: (orientation === Orientation.Horizontal) ? position.x : lastPart.end.x,
        y: (orientation === Orientation.Vertical) ? position.y : lastPart.end.y
      }
    }

    return {...currentLine, parts: [...currentLine.parts, part], drawnParts: currentLine.drawnParts + 1}
  }
  if (currentLine.state === LineStateNames.Updated) {
    const updatingPart = currentLine.parts.find(part => part.state === PartStateNames.Updated)
    if (!updatingPart) return;

    const prevPart: Part | undefined = getPrevPart({parts: currentLine.parts, part: updatingPart})
    const nextPart: Part | undefined = getNextPart({parts: currentLine.parts, part: updatingPart})

    if (!prevPart && !nextPart) {
      if (!currentLine.source.handle || !currentLine.target.handle) return;

      const oneOrientation = updatingPart.orientation
      const one: Part = {
        id: uuidv4(),
        lineId: currentLine.id,
        state: PartStateNames.Fixed,
        orientation: oneOrientation,
        start: updatingPart.start,
        end: {
          x: (oneOrientation === Orientation.Horizontal) ? (updatingPart.start.x + setLengthLine({
            direction: currentLine.source.handle.direction,
            length: 15
          })) : updatingPart.end.x,
          y: (oneOrientation === Orientation.Vertical) ? (updatingPart.start.y + setLengthLine({
            direction: currentLine.source.handle.direction,
            length: 15
          })) : updatingPart.end.y,
        }
      }

      const twoOrientation = getInvertedOrientation(oneOrientation)
      const two: Part = {
        id: uuidv4(),
        lineId: currentLine.id,
        state: PartStateNames.Fixed,
        orientation: twoOrientation,
        start: one.end,
        end: {
          x: (twoOrientation === Orientation.Horizontal) ? one.end.x + setLengthLine({direction: currentLine.source.handle.direction}) : one.end.x,
          y: (twoOrientation === Orientation.Vertical) ? one.end.y + setLengthLine({direction: currentLine.source.handle.direction}) : one.end.y,
        }
      }

      const threeOrientation = updatingPart.orientation
      const three: Part = {
        ...updatingPart,
        start: two.end,
        end: {
          x: (threeOrientation === Orientation.Horizontal) ? updatingPart.end.x + setLengthLine({
            direction: currentLine.target.handle.direction,
            length: 15
          }) : two.end.x,
          y: (threeOrientation === Orientation.Vertical) ? updatingPart.end.y + setLengthLine({
            direction: currentLine.target.handle.direction,
            length: 15
          }) : two.end.y,
        }
      }

      const fourOrientation = getInvertedOrientation(threeOrientation)
      const four: Part = {
        id: uuidv4(),
        lineId: currentLine.id,
        state: PartStateNames.Fixed,
        orientation: fourOrientation,
        start: three.end,
        end: {
          x: (fourOrientation === Orientation.Horizontal) ? updatingPart.end.x : three.end.x,
          y: (fourOrientation === Orientation.Vertical) ? updatingPart.end.y : three.end.y,
        }
      }

      const fiveOrientation = updatingPart.orientation
      const five: Part = {
        id: uuidv4(),
        lineId: currentLine.id,
        state: PartStateNames.Fixed,
        orientation: fiveOrientation,
        start: four.end,
        end: updatingPart.end
      }

      return {...currentLine, parts: [one, two, three, four, five]}
    }
    if (!prevPart && nextPart) {
      if (!currentLine.source.handle) return;

      // const validateIntervalPart = updatingPart
      //
      // if (validateIntervalPart) {
      //   const isWithinLocalInterval = validateAcceptableInterval({
      //     target: position,
      //     root: validateIntervalPart.end,
      //     orientation: validateIntervalPart.orientation
      //   })
      //
      //   if (isWithinLocalInterval) return;
      // }

      const oneOrientation = updatingPart.orientation
      const one: Part = {
        id: uuidv4(),
        lineId: currentLine.id,
        state: PartStateNames.Fixed,
        orientation: oneOrientation,
        start: updatingPart.start,
        end: {
          x: (oneOrientation === Orientation.Horizontal) ? updatingPart.start.x + getMiddleLine({
            direction: currentLine.source.handle.direction,
            sourcePosition: updatingPart.start,
            targetPosition: updatingPart.end
          }) : updatingPart.end.x,
          y: (oneOrientation === Orientation.Vertical) ? updatingPart.start.y + getMiddleLine({
            direction: currentLine.source.handle.direction,
            sourcePosition: updatingPart.start,
            targetPosition: updatingPart.end
          }) : updatingPart.end.y,
        }
      }

      const twoOrientation = getInvertedOrientation(oneOrientation)
      const two: Part = {
        id: uuidv4(),
        lineId: currentLine.id,
        state: PartStateNames.Fixed,
        orientation: twoOrientation,
        start: one.end,
        end: {
          x: (twoOrientation === Orientation.Horizontal) ? one.end.x + setLengthLine({direction: currentLine.source.handle.direction}) : one.end.x,
          y: (twoOrientation === Orientation.Vertical) ? one.end.y + setLengthLine({direction: currentLine.source.handle.direction}) : one.end.y,
        }
      }

      const threeOrientation = updatingPart.orientation
      const three: Part = {
        ...updatingPart,
        start: two.end,
        end: {
          x: (threeOrientation === Orientation.Horizontal) ? updatingPart.end.x : two.end.x,
          y: (threeOrientation === Orientation.Vertical) ? updatingPart.end.y : two.end.y
        }
      }

      const four: Part = {
        ...nextPart,
        start: three.end
      }

      return {...currentLine, parts: [one, two, three, four, ...currentLine.parts.slice(2)]}
    }
    if (prevPart && !nextPart) {
      if (currentLine.target.handle) {

        const one: Part = {
          ...prevPart,
          end: {
            x: (prevPart.orientation === Orientation.Horizontal) ? prevPart.end.x + setLengthLine({}) : prevPart.end.x,
            y: (prevPart.orientation === Orientation.Vertical) ? prevPart.end.y + setLengthLine({}) : prevPart.end.y
          }
        }

        const two: Part = {
          ...updatingPart,
          start: one.end,
          end: {
            x: (updatingPart.orientation === Orientation.Horizontal) ? updatingPart.start.x + getMiddleLine({
              direction: currentLine.target.handle.direction,
              sourcePosition: updatingPart.start,
              targetPosition: updatingPart.end
            }) : one.end.x,
            y: (updatingPart.orientation === Orientation.Vertical) ? updatingPart.start.y + getMiddleLine({
              direction: currentLine.target.handle.direction,
              sourcePosition: updatingPart.start,
              targetPosition: updatingPart.end
            }) : one.end.y,
          }
        }

        const threeOrientation = getInvertedOrientation(two.orientation)
        const three: Part = {
          id: uuidv4(),
          lineId: currentLine.id,
          state: PartStateNames.Fixed,
          orientation: threeOrientation,
          start: two.end,
          end: {
            x: (threeOrientation === Orientation.Horizontal) ? updatingPart.start.x : two.end.x,
            y: (threeOrientation === Orientation.Vertical) ? updatingPart.start.y : two.end.y
          }
        }

        const fourOrientation = getInvertedOrientation(threeOrientation)
        const four: Part = {
          id: uuidv4(),
          lineId: currentLine.id,
          state: PartStateNames.Fixed,
          orientation: fourOrientation,
          start: three.end,
          end: updatingPart.end
        }

        return {
          ...currentLine,
          parts: [...currentLine.parts.slice(0, currentLine.parts.length - 2), one, two, three, four]
        }
      }

      const validateIntervalPart = getPrevPart({parts: currentLine.parts, part: prevPart})
      if (validateIntervalPart) {
        const isWithinLocalInterval = validateAcceptableInterval({
          target: position,
          root: validateIntervalPart.end,
          orientation: validateIntervalPart.orientation
        })

        if (isWithinLocalInterval) {
          const part: Part = {
            ...updatingPart,
            start: validateIntervalPart.start,
            end: {
              x: (updatingPart.orientation === Orientation.Horizontal) ? updatingPart.end.x : validateIntervalPart.end.x,
              y: (updatingPart.orientation === Orientation.Vertical) ? updatingPart.end.y : validateIntervalPart.end.y,
            }
          }

          return {...currentLine, parts: [...currentLine.parts.slice(0, -3), part]}
        }
        ;
      }

      const one: Part = {
        ...prevPart,
        end: {
          x: (prevPart.orientation === Orientation.Horizontal) ? position.x : prevPart.end.x,
          y: (prevPart.orientation === Orientation.Vertical) ? position.y : prevPart.end.y
        }
      }

      const two: Part = {
        ...updatingPart,
        start: one.end,
        end: {
          x: (updatingPart.orientation === Orientation.Horizontal) ? updatingPart.end.x : position.x,
          y: (updatingPart.orientation === Orientation.Vertical) ? updatingPart.end.y : position.y
        }
      }

      const parts = currentLine.parts.map(part => {
        if (part.id === one.id) return one
        if (part.id === two.id) return two

        return part
      })

      return {...currentLine, parts}
    }
    if (prevPart && nextPart) {
      const prev = getPrevPart({parts: currentLine.parts, part: prevPart})
      const next = getNextPart({parts: currentLine.parts, part: nextPart})

      if (prev) {
        if (prev.orientation === updatingPart.orientation) {
          const validateIntervalPart = prev
          if (validateIntervalPart) {
            const isWithinLocalInterval = validateAcceptableInterval({
              target: position,
              root: validateIntervalPart.end,
              orientation: validateIntervalPart.orientation
            })

            if (isWithinLocalInterval) {
              const part: Part = {
                ...updatingPart,
                start: validateIntervalPart.start,
                end: {
                  x: (validateIntervalPart.orientation === Orientation.Horizontal) ? updatingPart.end.x : validateIntervalPart.end.x,
                  y: (validateIntervalPart.orientation === Orientation.Vertical) ? updatingPart.end.y : validateIntervalPart.end.y
                }
              }

              const next = getNextPart({parts: currentLine.parts, part: updatingPart})
              if (!next) return;

              const newNextPart: Part = {
                ...next,
                start: {
                  x: (next.orientation === Orientation.Horizontal) ? part.start.x : next.start.x,
                  y: (next.orientation === Orientation.Vertical) ? part.start.y : next.start.y
                }
              }

              const validateIntervalPartIndex = currentLine.parts.findIndex(part => part.id === validateIntervalPart.id)
              const payload = currentLine.parts.slice()

              //@ts-ignore
              payload.splice(validateIntervalPartIndex, 4, [part, newNextPart])

              return {...currentLine, parts: payload.flat()}
            }
          }
        }
      }

      if (next) {
        if (next.orientation === updatingPart.orientation) {
          const validateIntervalPart = next
          if (validateIntervalPart) {
            const isWithinLocalInterval = validateAcceptableInterval({
              target: position,
              root: validateIntervalPart.end,
              orientation: validateIntervalPart.orientation
            })

            if (isWithinLocalInterval) {
              const part: Part = {
                ...updatingPart,
                start: {
                  x: (validateIntervalPart.orientation === Orientation.Horizontal) ? updatingPart.start.x : validateIntervalPart.start.x,
                  y: (validateIntervalPart.orientation === Orientation.Vertical) ? updatingPart.start.y : validateIntervalPart.start.y
                },
                end: validateIntervalPart.end,
              }

              const prev = getPrevPart({parts: currentLine.parts, part: updatingPart})
              if (!prev) return;

              const newPrevPart: Part = {
                ...prev,
                end: {
                  x: (prev.orientation === Orientation.Horizontal) ? part.start.x : prev.end.x,
                  y: (prev.orientation === Orientation.Vertical) ? part.start.y : prev.end.y
                }
              }

              const validateIntervalPartIndex = currentLine.parts.findIndex(part => part.id === validateIntervalPart.id)
              const payload = currentLine.parts.slice()

              //@ts-ignore
              payload.splice(validateIntervalPartIndex - 3, 4, [newPrevPart, part])

              return {...currentLine, parts: payload.flat()}
            }
          }
        }
      }

      const one: Part = {
        ...prevPart,
        end: {
          x: (prevPart.orientation === Orientation.Horizontal) ? position.x : prevPart.end.x,
          y: (prevPart.orientation === Orientation.Vertical) ? position.y : prevPart.end.y
        }
      }

      const two: Part = {
        ...updatingPart,
        start: one.end,
        end: {
          x: (updatingPart.orientation === Orientation.Horizontal) ? nextPart.end.x : position.x,
          y: (updatingPart.orientation === Orientation.Vertical) ? nextPart.end.y : position.y
        }
      }

      const three: Part = {
        ...nextPart,
        start: two.end
      }

      const parts = currentLine.parts.map(part => {
        if (part.id === one.id) return one
        if (part.id === two.id) return two
        if (part.id === three.id) return three

        return part
      })

      return {...currentLine, parts}
    }
  }
  if (currentLine.state === LineStateNames.UpdatedByNode) {
    return
  }
  return
}

export function setLineTargetPosition(props: SetLineTargetPositionProps): LineState | undefined {
  const {currentLine, position} = props
  currentLine.target.position = position

  const updatingPart = getEndPart(currentLine.parts)
  if (!updatingPart) return

  const prevPart: Part | undefined = getPrevPart({parts: currentLine.parts, part: updatingPart})

  const one: Part = {
    ...updatingPart,
    start: {
      x: (updatingPart.orientation === Orientation.Horizontal) ? updatingPart.start.x : position.x,
      y: (updatingPart.orientation === Orientation.Vertical) ? updatingPart.start.y : position.y,
    },
    end: position
  }

  if (!prevPart && currentLine.target.handle && currentLine.source.handle) {
    const one: Part = {
      ...updatingPart,
      start: {
        x: (updatingPart.orientation === Orientation.Horizontal) ? updatingPart.start.x + getMiddleLine({
          direction: currentLine.target.handle.direction,
          sourcePosition: updatingPart.start,
          targetPosition: updatingPart.end
        }) : position.x,
        y: (updatingPart.orientation === Orientation.Vertical) ? updatingPart.start.y + getMiddleLine({
          direction: currentLine.target.handle.direction,
          sourcePosition: updatingPart.start,
          targetPosition: updatingPart.end
        }) : position.y,
      },
      end: position
    }

    const twoOrientation = getInvertedOrientation(one.orientation)
    const two: Part = {
      id: uuidv4(),
      lineId: currentLine.id,
      state: PartStateNames.Fixed,
      orientation: twoOrientation,
      start: {
        x: (twoOrientation === Orientation.Horizontal) ? one.start.x + setLengthLine({}) : one.start.x,
        y: (twoOrientation === Orientation.Vertical) ? one.start.y + setLengthLine({}) : one.start.y
      },
      end: one.start
    }

    const threeOrientation = getInvertedOrientation(twoOrientation)
    const three: Part = {
      id: uuidv4(),
      lineId: currentLine.id,
      state: PartStateNames.Fixed,
      orientation: threeOrientation,
      start: updatingPart.start,
      end: two.start
    }

    return {...currentLine, parts: [three, two, one]}
  }
  if (!prevPart) {
    return {...currentLine, parts: [...currentLine.parts.slice(0, currentLine.parts.length - 1), one]}
  }

  const two: Part = {
    ...prevPart,
    end: one.start
  }

  return {...currentLine, parts: [...currentLine.parts.slice(0, currentLine.parts.length - 2), two, one]}
}

export function setLineSourcePosition(props: SetLineSourcePositionProps): LineState | undefined {
  const {currentLine, position} = props
  currentLine.source.position = position

  const updatingPart = getStartPart(currentLine.parts)
  if (!updatingPart) return

  const one: Part = {
    ...updatingPart,
    start: position,
    end: {
      x: (updatingPart.orientation === Orientation.Horizontal) ? updatingPart.end.x : position.x,
      y: (updatingPart.orientation === Orientation.Vertical) ? updatingPart.end.y : position.y,
    }
  }

  const nextPart: Part | undefined = getNextPart({parts: currentLine.parts, part: updatingPart})

  if (!nextPart && currentLine.target.handle && currentLine.source.handle) {

    const one: Part = {
      ...updatingPart,
      start: position,
      end: {
        x: (updatingPart.orientation === Orientation.Horizontal) ? updatingPart.start.x + getMiddleLine({
          direction: currentLine.source.handle.direction,
          sourcePosition: updatingPart.start,
          targetPosition: updatingPart.end
        }) : position.x,
        y: (updatingPart.orientation === Orientation.Vertical) ? updatingPart.start.y + getMiddleLine({
          direction: currentLine.source.handle.direction,
          sourcePosition: updatingPart.start,
          targetPosition: updatingPart.end
        }) : position.y,
      }
    }

    const twoOrientation = getInvertedOrientation(one.orientation)
    const two: Part = {
      id: uuidv4(),
      lineId: currentLine.id,
      state: PartStateNames.Fixed,
      orientation: twoOrientation,
      start: one.end,
      end: {
        x: (twoOrientation === Orientation.Horizontal) ? one.end.x + setLengthLine({}) : one.end.x,
        y: (twoOrientation === Orientation.Vertical) ? one.end.y + setLengthLine({}) : one.end.y
      }
    }

    const threeOrientation = getInvertedOrientation(twoOrientation)
    const three: Part = {
      id: uuidv4(),
      lineId: currentLine.id,
      state: PartStateNames.Fixed,
      orientation: threeOrientation,
      start: two.end,
      end: updatingPart.end
    }

    return {...currentLine, parts: [one, two, three]}
  }

  if (!nextPart) {
    return {...currentLine, parts: [one, ...currentLine.parts.slice(1)]}
  }

  const two: Part = {
    ...nextPart,
    start: one.end
  }

  return {...currentLine, parts: [one, two, ...currentLine.parts.slice(2)]}
}

function getPrevPart({parts, part}: { parts: Part[], part: Part }): Part | undefined {
  const partIndex = parts.findIndex(p => p.id === part.id)

  return parts[partIndex - 1]
}

function getNextPart({parts, part}: { parts: Part[], part: Part }): Part | undefined {
  const partIndex = parts.findIndex(p => p.id === part.id)

  return parts[partIndex + 1]
}


export class LineCreator implements LineState {
  id: string;
  source: LineValues['source']
  target: LineValues['target']
  parts: Part[];
  state: LineStateNames;
  drawnParts: number

  constructor(payload: LineDTO) {
    this.id = uuidv4()
    this.source = payload.source
    this.target = payload.target
    this.parts = payload.parts ?? []
    this.state = payload.state ?? LineStateNames.Created
    this.drawnParts = payload.drawnParts ?? 0
  }
}

interface ValidateAcceptableIntervalProps {
  target: Position,
  root: Position,
  orientation: Orientation
  interval?: number
}

export function validateAcceptableInterval({
                                             target,
                                             root,
                                             orientation,
                                             interval = 20
                                           }: ValidateAcceptableIntervalProps) {
  switch (orientation) {
    case Orientation.Horizontal:
      return Math.abs(Math.abs(root.y) - (Math.abs(target.y))) < interval
    default:
      return Math.abs(Math.abs(root.x) - (Math.abs(target.x))) < interval
  }
}

interface GetMiddleLineProps {
  direction: Directions,
  sourcePosition: Position,
  targetPosition: Position
}

export function getMiddleLine(props: GetMiddleLineProps): number {
  const {direction, sourcePosition, targetPosition} = props

  const middleX = Math.floor((Math.abs(targetPosition.x) - Math.abs(sourcePosition.x)) / 2)
  const middleY = Math.floor((Math.abs(targetPosition.y) - Math.abs(sourcePosition.y)) / 2)

  switch (direction) {
    case Directions.Top:
      return middleY
    case Directions.Bottom:
      return middleY
    case Directions.Left:
      return middleX
    case Directions.Right:
      return middleX
  }
}

interface SetLengthLineProps {
  direction?: Directions,
  orientation?: Orientation
  length?: number
}

export function setLengthLine(props: SetLengthLineProps) {
  const {direction, length} = props
  const defaultLength = 0.1

  if (!direction) return (length ?? defaultLength)

  switch (direction) {
    case Directions.Top:
      return -(length ?? defaultLength)
    case Directions.Bottom:
      return (length ?? defaultLength)
    case Directions.Left:
      return -(length ?? defaultLength)
    case Directions.Right:
      return (length ?? defaultLength)
  }
}

export function getLineElement(id: string): HTMLDivElement | undefined | null {
  const rootElement = getRootElement()
  if (!rootElement) return

  return rootElement.querySelector(`[data-id='${id}']`) as HTMLDivElement
}

export function getLineProps(id: string): Pick<LineState, 'id'> | undefined {
  const rootElement = getRootElement()
  if (!rootElement) return

  const line = rootElement.querySelector(`[data-id='${id}']`) as HTMLDivElement
  if (!line) return

  return {id}
}

export function getLinesFromDOM(): Array<Pick<LineState, 'id'> & {source: string, target: string}>{
  const rootElement = getRootElement()
  if (!rootElement) return []

  let result: Array<Pick<LineState, 'id'> & {source: string, target: string}> = []

  document.body.querySelectorAll(`[data-element-type=${ElementTypeNames.Path}]`).forEach((el: HTMLElement) => {
    result.push({id: el.dataset.id ?? '', source: el.dataset.source ?? '', target: el.dataset.target ?? ''})
  })

  return result
}
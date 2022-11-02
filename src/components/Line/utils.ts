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
  SetPartProps,
  SetSourceProps,
  SetStatePartProps,
  SetTargetProps,
  SetTransformProps
} from "./types";
import {Directions, Orientation, Position} from "../../types";
import {getOrientationFromDirection} from "../Handle";
import {MarkerTypeNames} from "../LineRenderer";

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

export class Line implements LineState {
  id: string;
  source: LineValues['source']
  target: LineValues['target']
  parts: Part[];
  state: LineStateNames;
  selected: boolean
  private drawnParts: number = 0

  constructor(payload: LineDTO) {
    this.id = uuidv4()
    this.source = payload.source
    this.target = payload.target
    this.parts = payload.parts ?? []
    this.state = payload.state ?? LineStateNames.Created
    this.selected = payload.selected ?? false
  }

  public static getDTO(props: GetLineDTOProps): LineDTO {
    const {handle, position} = props
    return {
      source: {handle, position},
      target: {position},
      state: LineStateNames.Created
    }
  }

  getMarkerType(): MarkerTypeNames {
    if (this.target.line) return MarkerTypeNames.Circle
    if (this.target.handle) return MarkerTypeNames.Hidden

    return MarkerTypeNames.Arrow
  }

  getIsModified(): boolean {
    switch (this.state) {
      case LineStateNames.Created:
        return true
      case LineStateNames.Updated:
        return true
      default:
        return false
    }
  }

  getTargetPosition(): Position {
    const part = this.parts.slice().pop()

    return part ? part.end : {x: 0, y: 0}
  }

  setState(state: LineStateNames): void {
    switch (state) {
      case LineStateNames.Created:
        this.state = LineStateNames.Created
        this.target = {...this.target, handle: undefined, line: undefined, position: undefined}
        return;
      default:
        this.state = state
        return;
    }

  }

  setSource(props: SetSourceProps): void {
    const {handle, line} = props
    this.source = {...this.source, handle, line}
  }


  setTarget(props: SetTargetProps): void {
    const {handle, line, position} = props

    this.target = {...this.target, handle, line}

    if (!handle || !position) return

    const handleOrientation = getOrientationFromDirection({direction: handle.direction})
    const part = this.getEndPart()

    if (!part) return;
    if (part.orientation === handleOrientation) return;

    if (part.orientation === Orientation.Horizontal) {
      const oneOrientation = this.getInvertedOrientation(part.orientation)
      const one: Part = {
        id: uuidv4(),
        lineId: this.id,
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

      const prevPart = this.getPrevPart(two)
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

      this.parts = [...this.parts.slice(0, -2), three, two, one]
      return;
    }
    if (part.orientation === Orientation.Vertical) {
      const oneOrientation = this.getInvertedOrientation(part.orientation)
      const one: Part = {
        id: uuidv4(),
        lineId: this.id,
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

      const prevPart = this.getPrevPart(two)
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

      this.parts = [...this.parts.slice(0, -2), three, two, one]
      return;
    }
  }

  setTransform(props: SetTransformProps): void {
    const {position} = props

    this.drawnParts = 0
    this.parts = removeRudimentsParts(this.parts)
    this.state = LineStateNames.Fixed
    this.setFixedAllParts()
    this.target = {...this.target, position}
  }

  private setFixedAllParts() {
    this.parts = this.parts.map(part => ({...part, state: PartStateNames.Fixed}))
  }

  private getInvertedOrientation(orientation: Orientation): Orientation {
    return (orientation === Orientation.Horizontal) ? Orientation.Vertical : Orientation.Horizontal
  }

  private getPrevPart(part: Part): Part | undefined {
    const partIndex = this.parts.findIndex(p => p.id === part.id)

    return this.parts[partIndex - 1]
  }

  private getNextPart(part: Part): Part | undefined {
    const partIndex = this.parts.findIndex(p => p.id === part.id)

    return this.parts[partIndex + 1]
  }

  getStartPart(): Part | undefined {
    return this.parts.slice().shift()
  }

  getEndPart(): Part | undefined {
    return this.parts.slice().pop()
  }

  setStatePart(props: SetStatePartProps): void {
    const {part, state} = props

    this.parts = this.parts.map(el => {
      if (el.id === part.id) return {...el, state}
      return el
    })
  }

  setPart(props: SetPartProps): void {
    const {position} = props

    if (this.state === LineStateNames.Created) {
      const lastPart = this.getEndPart()
      if (!lastPart) {
        if (!this.source.handle) return;

        const part: Part = {
          id: uuidv4(),
          lineId: this.id,
          state: PartStateNames.Fixed,
          orientation: getOrientationFromDirection({direction: this.source.handle.direction}),
          start: this.source.position,
          end: this.source.position,
        }

        this.parts = [part]
        this.drawnParts = this.drawnParts + 1
        return
      }

      if (!position) return;

      const isWithinInterval = validateAcceptableInterval({
        target: position,
        root: lastPart.end,
        orientation: lastPart.orientation
      })

      if (isWithinInterval) {
        const validateIntervalPart = this.getPrevPart(lastPart)
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

            this.parts = [...this.parts.slice(0, -2), part]
            this.drawnParts = this.drawnParts - 1;
            return;
          }
        }

        const part: Part = {
          ...lastPart,
          end: {
            x: (lastPart.orientation === Orientation.Horizontal) ? position.x : lastPart.end.x,
            y: (lastPart.orientation === Orientation.Vertical) ? position.y : lastPart.end.y
          }
        }

        const parts = this.parts.map(el => {
          if (el.id === part.id) return part
          return el
        })

        this.parts = [...parts]
        return;
      }

      if (this.drawnParts >= MAX_DRAWN_PARTS) {
        const prevLastPart = this.getPrevPart(lastPart)
        if (!prevLastPart) return;

        const validateIntervalPart = this.getPrevPart(prevLastPart)
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

            this.parts = [...this.parts.slice(0, -3), part]
            this.drawnParts = this.drawnParts - 1;
            return;
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

        const parts = this.parts.map(el => {
          if (el.id === prevPart.id) return prevPart
          if (el.id === part.id) return part
          return el
        })

        this.parts = [...parts]
        return;
      }

      const orientation = this.getInvertedOrientation(lastPart.orientation)
      const part: Part = {
        id: uuidv4(),
        lineId: this.id,
        state: PartStateNames.Fixed,
        orientation,
        start: lastPart.end,
        end: {
          x: (orientation === Orientation.Horizontal) ? position.x : lastPart.end.x,
          y: (orientation === Orientation.Vertical) ? position.y : lastPart.end.y
        }
      }

      this.parts = [...this.parts, part]
      this.drawnParts = this.drawnParts + 1
    }
    if (this.state === LineStateNames.Updated) {
      const updatingPart = this.parts.find(part => part.state === PartStateNames.Updated)
      if (!updatingPart) return;

      const prevPart: Part | undefined = this.getPrevPart(updatingPart)
      const nextPart: Part | undefined = this.getNextPart(updatingPart)

      if (!prevPart && !nextPart) {
        if (!this.source.handle || !this.target.handle) return;
        console.log('Пред нет След нет Источник есть Таргет есть')
        const oneOrientation = updatingPart.orientation
        const one: Part = {
          id: uuidv4(),
          lineId: this.id,
          state: PartStateNames.Fixed,
          orientation: oneOrientation,
          start: updatingPart.start,
          end: {
            x: (oneOrientation === Orientation.Horizontal) ? (updatingPart.start.x + setLengthLine({
              direction: this.source.handle.direction,
              length: 15
            })) : updatingPart.end.x,
            y: (oneOrientation === Orientation.Vertical) ? (updatingPart.start.y + setLengthLine({
              direction: this.source.handle.direction,
              length: 15
            })) : updatingPart.end.y,
          }
        }

        const twoOrientation = this.getInvertedOrientation(oneOrientation)
        const two: Part = {
          id: uuidv4(),
          lineId: this.id,
          state: PartStateNames.Fixed,
          orientation: twoOrientation,
          start: one.end,
          end: {
            x: (twoOrientation === Orientation.Horizontal) ? one.end.x + setLengthLine({direction: this.source.handle.direction}) : one.end.x,
            y: (twoOrientation === Orientation.Vertical) ? one.end.y + setLengthLine({direction: this.source.handle.direction}) : one.end.y,
          }
        }

        const threeOrientation = updatingPart.orientation
        const three: Part = {
          ...updatingPart,
          start: two.end,
          end: {
            x: (threeOrientation === Orientation.Horizontal) ? updatingPart.end.x + setLengthLine({
              direction: this.target.handle.direction,
              length: 15
            }) : two.end.x,
            y: (threeOrientation === Orientation.Vertical) ? updatingPart.end.y + setLengthLine({
              direction: this.target.handle.direction,
              length: 15
            }) : two.end.y,
          }
        }

        const fourOrientation = this.getInvertedOrientation(threeOrientation)
        const four: Part = {
          id: uuidv4(),
          lineId: this.id,
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
          lineId: this.id,
          state: PartStateNames.Fixed,
          orientation: fiveOrientation,
          start: four.end,
          end: updatingPart.end
        }

        this.parts = [one, two, three, four, five]
        return;
      }
      if (!prevPart && nextPart) {
        if (!this.source.handle) return;
        console.log('Пред нет След есть Источник есть', {updatingPart})

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
          lineId: this.id,
          state: PartStateNames.Fixed,
          orientation: oneOrientation,
          start: updatingPart.start,
          end: {
            x: (oneOrientation === Orientation.Horizontal) ? updatingPart.start.x + getMiddleLine({
              direction: this.source.handle.direction,
              sourcePosition: updatingPart.start,
              targetPosition: updatingPart.end
            }) : updatingPart.end.x,
            y: (oneOrientation === Orientation.Vertical) ? updatingPart.start.y + getMiddleLine({
              direction: this.source.handle.direction,
              sourcePosition: updatingPart.start,
              targetPosition: updatingPart.end
            }) : updatingPart.end.y,
          }
        }

        const twoOrientation = this.getInvertedOrientation(oneOrientation)
        const two: Part = {
          id: uuidv4(),
          lineId: this.id,
          state: PartStateNames.Fixed,
          orientation: twoOrientation,
          start: one.end,
          end: {
            x: (twoOrientation === Orientation.Horizontal) ? one.end.x + setLengthLine({direction: this.source.handle.direction}) : one.end.x,
            y: (twoOrientation === Orientation.Vertical) ? one.end.y + setLengthLine({direction: this.source.handle.direction}) : one.end.y,
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

        this.parts = [one, two, three, four, ...this.parts.slice(2)]
        return;
      }
      if (prevPart && !nextPart) {
        if (this.target.handle) {
          console.log('Пред есть След нет Таргета есть')
          // const validateIntervalPart = this.getPrevPart(prevPart)
          //
          // if (validateIntervalPart) {
          //   const isWithinLocalInterval = validateAcceptableInterval({
          //     target: position,
          //     root: validateIntervalPart.end,
          //     orientation: validateIntervalPart.orientation
          //   })
          //   console.log('Пред есть След нет Таргета есть isWithinLocalInterval', {isWithinLocalInterval})
          //   if (isWithinLocalInterval) return;
          // }

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
                direction: this.target.handle.direction,
                sourcePosition: updatingPart.start,
                targetPosition: updatingPart.end
              }) : one.end.x,
              y: (updatingPart.orientation === Orientation.Vertical) ? updatingPart.start.y + getMiddleLine({
                direction: this.target.handle.direction,
                sourcePosition: updatingPart.start,
                targetPosition: updatingPart.end
              }) : one.end.y,
            }
          }

          const threeOrientation = this.getInvertedOrientation(two.orientation)
          const three: Part = {
            id: uuidv4(),
            lineId: this.id,
            state: PartStateNames.Fixed,
            orientation: threeOrientation,
            start: two.end,
            end: {
              x: (threeOrientation === Orientation.Horizontal) ? updatingPart.start.x : two.end.x,
              y: (threeOrientation === Orientation.Vertical) ? updatingPart.start.y : two.end.y
            }
          }

          const fourOrientation = this.getInvertedOrientation(threeOrientation)
          const four: Part = {
            id: uuidv4(),
            lineId: this.id,
            state: PartStateNames.Fixed,
            orientation: fourOrientation,
            start: three.end,
            end: updatingPart.end
          }

          this.parts = [...this.parts.slice(0, this.parts.length - 2), one, two, three, four]
          return;
        }
        console.log('Пред есть След нет Таргета нет')

        const validateIntervalPart = this.getPrevPart(prevPart)
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

            this.parts = [...this.parts.slice(0, -3), part]
            return;
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

        const parts = this.parts.map(part => {
          if (part.id === one.id) return one
          if (part.id === two.id) return two

          return part
        })

        this.parts = [...parts]
        return;
      }
      if (prevPart && nextPart) {
        console.log('Пред есть След есть')
        const prev = this.getPrevPart(prevPart)
        const next = this.getNextPart(nextPart)

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

                const next = this.getNextPart(updatingPart)
                if (!next) return;

                const newNextPart: Part = {
                  ...next,
                  start: {
                    x: (next.orientation === Orientation.Horizontal) ? part.start.x : next.start.x,
                    y: (next.orientation === Orientation.Vertical) ? part.start.y : next.start.y
                  }
                }

                const validateIntervalPartIndex = this.parts.findIndex(part => part.id === validateIntervalPart.id)
                const payload = this.parts.slice()

                //@ts-ignore
                payload.splice(validateIntervalPartIndex, 4, [part, newNextPart])
                this.parts = payload.flat()
                return;
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

                const prev = this.getPrevPart(updatingPart)
                if (!prev) return;

                const newPrevPart: Part = {
                  ...prev,
                  end: {
                    x: (prev.orientation === Orientation.Horizontal) ? part.start.x : prev.end.x,
                    y: (prev.orientation === Orientation.Vertical) ? part.start.y : prev.end.y
                  }
                }

                const validateIntervalPartIndex = this.parts.findIndex(part => part.id === validateIntervalPart.id)
                const payload = this.parts.slice()

                //@ts-ignore
                payload.splice(validateIntervalPartIndex - 3, 4, [newPrevPart, part])
                this.parts = payload.flat()
                return;
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

        const parts = this.parts.map(part => {
          if (part.id === one.id) return one
          if (part.id === two.id) return two
          if (part.id === three.id) return three

          return part
        })

        this.parts = [...parts]
        return;
      }
    }
    if (this.state === LineStateNames.UpdatedByNode) {

    }
  }

  setTargetPosition(position: Position): void {
    this.target.position = position

    const updatingPart = this.getEndPart()
    if (!updatingPart) return

    const prevPart: Part | undefined = this.getPrevPart(updatingPart)

    const one: Part = {
      ...updatingPart,
      start: {
        x: (updatingPart.orientation === Orientation.Horizontal) ? updatingPart.start.x : position.x,
        y: (updatingPart.orientation === Orientation.Vertical) ? updatingPart.start.y : position.y,
      },
      end: position
    }

    if (!prevPart && this.target.handle && this.source.handle) {
      const one: Part = {
        ...updatingPart,
        start: {
          x: (updatingPart.orientation === Orientation.Horizontal) ? updatingPart.start.x + getMiddleLine({
            direction: this.target.handle.direction,
            sourcePosition: updatingPart.start,
            targetPosition: updatingPart.end
          }) : position.x,
          y: (updatingPart.orientation === Orientation.Vertical) ? updatingPart.start.y + getMiddleLine({
            direction: this.target.handle.direction,
            sourcePosition: updatingPart.start,
            targetPosition: updatingPart.end
          }) : position.y,
        },
        end: position
      }

      const twoOrientation = this.getInvertedOrientation(one.orientation)
      const two: Part = {
        id: uuidv4(),
        lineId: this.id,
        state: PartStateNames.Fixed,
        orientation: twoOrientation,
        start: {
          x: (twoOrientation === Orientation.Horizontal) ? one.start.x + setLengthLine({}) : one.start.x,
          y: (twoOrientation === Orientation.Vertical) ? one.start.y + setLengthLine({}) : one.start.y
        },
        end: one.start
      }

      const threeOrientation = this.getInvertedOrientation(twoOrientation)
      const three: Part = {
        id: uuidv4(),
        lineId: this.id,
        state: PartStateNames.Fixed,
        orientation: threeOrientation,
        start: updatingPart.start,
        end: two.start
      }

      this.parts = [three, two, one]
      return;
    }
    if (!prevPart) {
      this.parts = [...this.parts.slice(0, this.parts.length - 1), one]
      return;
    }

    const two: Part = {
      ...prevPart,
      end: one.start
    }

    this.parts = [...this.parts.slice(0, this.parts.length - 2), two, one]
    return;
  }

  setSourcePosition(position: Position): void {
    this.source.position = position

    const updatingPart = this.getStartPart()
    if (!updatingPart) return

    const one: Part = {
      ...updatingPart,
      start: position,
      end: {
        x: (updatingPart.orientation === Orientation.Horizontal) ? updatingPart.end.x : position.x,
        y: (updatingPart.orientation === Orientation.Vertical) ? updatingPart.end.y : position.y,
      }
    }

    const nextPart: Part | undefined = this.getNextPart(updatingPart)

    if (!nextPart && this.target.handle && this.source.handle) {

      const one: Part = {
        ...updatingPart,
        start: position,
        end: {
          x: (updatingPart.orientation === Orientation.Horizontal) ? updatingPart.start.x + getMiddleLine({
            direction: this.source.handle.direction,
            sourcePosition: updatingPart.start,
            targetPosition: updatingPart.end
          }) : position.x,
          y: (updatingPart.orientation === Orientation.Vertical) ? updatingPart.start.y + getMiddleLine({
            direction: this.source.handle.direction,
            sourcePosition: updatingPart.start,
            targetPosition: updatingPart.end
          }) : position.y,
        }
      }

      const twoOrientation = this.getInvertedOrientation(one.orientation)
      const two: Part = {
        id: uuidv4(),
        lineId: this.id,
        state: PartStateNames.Fixed,
        orientation: twoOrientation,
        start: one.end,
        end: {
          x: (twoOrientation === Orientation.Horizontal) ? one.end.x + setLengthLine({}) : one.end.x,
          y: (twoOrientation === Orientation.Vertical) ? one.end.y + setLengthLine({}) : one.end.y
        }
      }

      const threeOrientation = this.getInvertedOrientation(twoOrientation)
      const three: Part = {
        id: uuidv4(),
        lineId: this.id,
        state: PartStateNames.Fixed,
        orientation: threeOrientation,
        start: two.end,
        end: updatingPart.end
      }

      this.parts = [one, two, three]
      return;
    }

    if (!nextPart) {
      this.parts = [one, ...this.parts.slice(1)]
      return;
    }

    const two: Part = {
      ...nextPart,
      start: one.end
    }

    this.parts = [one, two, ...this.parts.slice(2)]
    return;
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

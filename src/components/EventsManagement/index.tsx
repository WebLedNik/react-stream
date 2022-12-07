import * as React from 'react'
import {useEffect, useState} from 'react'
import useEventListener from "../../hooks/useEventListener";
import {ElementTypeNames, Position} from "../../types";
import {getHandleProps, HandleTypeNames} from "../Handle";
import {getNodeProps, NodeState, NodeStateNames} from "../Node";
import {getRelativePosition, isValidTargetElement} from "../../utils";
import {FlowchartEditorState, useStore} from "../../store";
import shallow from "zustand/shallow";
import {
  getIsLineModified,
  getLineDTO,
  LineCreator,
  LineState,
  LineStateNames,
  setLinePart,
  setLineState,
  setLineTarget,
  setLineTransform
} from "../Line";

interface EventsManagementProps {
  onConnect?: (line: LineState) => void
  onLinesChange?: (lines: LineState[], isCreate?: boolean) => void
  onNodesChange?:(nodes: NodeState[]) => void
}

const EventsManagement: React.FC<EventsManagementProps> = (props) => {
  const {
    onConnect,
    onLinesChange,
    onNodesChange,
  } = props
  const {
    zoomTransformState,
    lines,
    nodes
  } = useStore((state: FlowchartEditorState) => ({
    zoomTransformState: state.zoomTransformState,
    lines: state.lines,
    nodes: state.nodes
  }), shallow)

  const [container, setContainer] = useState<HTMLElement>(document.body)

  const handleMouseDown = (event: MouseEvent) => {
    event.preventDefault()

    const target = event.target as HTMLElement
    if (!target) return;
    //Проверяем тип элемента
    if (
      (target.dataset.elementType === ElementTypeNames.Handle && target.dataset.handleType === HandleTypeNames.Output)
    ){
      //Останавливаем событие
      event.stopPropagation()

      const handleElement = target
      //Получаем свойства элемента
      const handleProps = getHandleProps(handleElement.dataset.id ?? '')
      if (handleProps?.type !== HandleTypeNames.Output) return;
      //Получаем node элемент
      const nodeElement = handleElement.closest(`[data-element-type=${ElementTypeNames.Node}]`) as HTMLElement
      if (!nodeElement) return;
      //Получаем свойства элемента
      const nodeProps = getNodeProps(nodeElement.dataset.id ?? '')
      if (!nodeProps) return;
      //Получаем позицию handle относительно node
      const relativePosition = getRelativePosition({parent: nodeElement, child: handleElement})
      //Получаем позицию line относительно рабочего пространства
      const positionLine: Position = {
        x: nodeProps.position.x + (handleElement.clientWidth / 2) + (relativePosition.x / zoomTransformState.k),
        y: nodeProps.position.y + (handleElement.clientHeight / 2) + (relativePosition.y / zoomTransformState.k)
      }
      //Создаем line
      const payload = new LineCreator(getLineDTO({handle: {...handleProps, node: nodeProps.id}, position: positionLine}))

      onLinesChange && onLinesChange([payload], true)
      return;
    }
    if (target.dataset.elementType === ElementTypeNames.LineHandle){
      //Останавливаем событие
      event.stopPropagation()

      const line = lines.find(l => l.id === (target.dataset.id ?? ''))
      if (!line) return;

      const payload = setLineState({line, state: LineStateNames.Created})
      onLinesChange && onLinesChange([payload])
    }
  }
  const handleMouseUp = (event: MouseEvent) => {
    event.preventDefault()

    const target = event.target as HTMLElement
    if (!target) return
    //Проверяем тип элемента
    if (
      target.dataset.elementType === ElementTypeNames.LineHandle ||
      target.dataset.elementType === ElementTypeNames.Path
    ) {
      //Останавливаем событие
      event.stopPropagation()
      //Находим line
      const line = lines.find(l => getIsLineModified(l.state))
      if (!line) return
      //Получаем позицию line
      const position: Position = {
        x: event.offsetX,
        y: event.offsetY
      }
      //Обновляем line
      const payload = setLineTransform({line: line, position})
      if (!payload) return;

      onLinesChange && onLinesChange([payload])
      return;
    }
    //Проверяем тип элемента
    if (
      target.dataset.elementType === ElementTypeNames.Handle && target.dataset.handleType === HandleTypeNames.Input
    ) {
      //Останавливаем событие
      event.stopPropagation()

      const handleElement = target
      //Получаем свойства элемента
      const handleProps = getHandleProps(handleElement.dataset.id ?? '')
      if (handleProps?.type !== HandleTypeNames.Input) return;
      //Получаем node элемент
      const nodeElement = handleElement.closest(`[data-element-type=${ElementTypeNames.Node}]`) as HTMLElement
      if (!nodeElement) return;
      //Получаем свойства элемента
      const nodeProps = getNodeProps(nodeElement.dataset.id ?? '')
      if (!nodeProps) return;
      //Получаем позицию handle относительно node
      const relativePosition = getRelativePosition({parent: nodeElement, child: handleElement})
      //Получаем позицию line относительно рабочего пространства
      const positionLine: Position = {
        x: nodeProps.position.x + (handleElement.clientWidth / 2) + (relativePosition.x / zoomTransformState.k),
        y: nodeProps.position.y + (handleElement.clientHeight / 2) + (relativePosition.y / zoomTransformState.k)
      }
      //Находим line
      const line = lines.find(l => getIsLineModified(l.state))
      if (!line) return;
      //Обновляем line
      const payload = setLineTarget({
        currentLine: line,
        handle: {...handleProps, node: nodeProps.id},
        position: positionLine
      })
      if (!payload) return;

      onConnect && onConnect(payload)
      return;
    }
  }
  const handleMouseMove = (event: MouseEvent) => {
    event.preventDefault()

    const target = event.target as HTMLElement
    if (!target) return
    //Проверяем тип элемента
    if (
      target.dataset.elementType === ElementTypeNames.LineHandle ||
      target.dataset.elementType === ElementTypeNames.EditorLines ||
      target.dataset.elementType === ElementTypeNames.Path ||
      target.dataset.elementType === ElementTypeNames.LineText ||
      (target.dataset.elementType === ElementTypeNames.Handle && target.dataset.handleType === HandleTypeNames.Output)
    ) {
      //Находим line
      const line = lines.find(l => getIsLineModified(l.state))
      if (!line) return
      //Получаем позицию line
      const position: Position = {
        x: event.offsetX,
        y: event.offsetY
      }
      //Обновляем line
      const payload = setLinePart({currentLine: line, position})
      if (!payload) return;

      onLinesChange && onLinesChange([payload])
      return;
    }
  }
  const handleMouseDoubleClick = (event: MouseEvent) => {
    event.preventDefault()

    const target = event.target as HTMLElement
    if (!target) return
    if (!isValidTargetElement(target)) return;

    const nodeElement = (target.dataset.elementType === ElementTypeNames.Node) ? target : target.closest(`[data-element-type=${ElementTypeNames.Node}]`) as HTMLElement

    if (nodeElement){
      //Останавливаем событие
      event.stopPropagation()
      //Находим node
      const node = nodes.find(n => n.id === (nodeElement.dataset.id ?? ''))
      if (!node) return;
      //Обновляем node
      const payload = {...node, state: NodeStateNames.Selected}

      onNodesChange && onNodesChange([payload])
      return;
    }

    if (target.dataset.elementType === ElementTypeNames.Path){
      //Останавливаем событие
      event.stopPropagation()
      //Находим line
      const line = lines.find(l => l.id === (target.dataset.id ?? ''))
      if (!line) return;
      //Обновляем line
      const payload = setLineState({line, state: LineStateNames.Selected})

      onLinesChange && onLinesChange([payload])
      return;
    }
  }

  useEventListener("mousedown", handleMouseDown, container, {capture: true})
  useEventListener("mouseup", handleMouseUp, container)
  useEventListener("mousemove", handleMouseMove, container)
  useEventListener("dblclick", handleMouseDoubleClick, container, {capture: true})

  useEffect(() => {
    setContainer(document.querySelector(".flowchart-editor_zoom-pane") as HTMLElement ?? document.body)
  }, [])

  return (
    <></>
  )
}

EventsManagement.displayName = 'FlowchartEventsManagement'
export default EventsManagement

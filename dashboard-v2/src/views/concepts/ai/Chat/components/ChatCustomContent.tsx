/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, createElement, useEffect, ReactNode } from 'react'
import useInterval from '@/utils/hooks/useInterval '
import { getCurrentNodeOverflow, getStringPosition } from '../utils'
import ReactHtmlParser from 'html-react-parser'
import { marked } from 'marked'
import type { CommonProps } from '@/@types/common'

type ChatCustomContentProps = {
    content: string
    triggerTyping: boolean
    onFinish?: () => void
}

const AIWriter = ({
    children,
    delay = 25,
    onFinish = () => {},
}: CommonProps & { delay?: number; onFinish?: () => void }) => {
    const [pos, setPos] = useState(0)

    const tokenLengths = useMemo(() => {
        const arr: number[] = []

        const traverseNodesAndCountTokens = (reactNode: any) => {
            const nodeChildren = reactNode?.props?.children

            if (Array.isArray(reactNode)) {
                reactNode.forEach((node) => {
                    if (typeof node === 'object') {
                        traverseNodesAndCountTokens(node)
                    } else if (typeof node === 'string') {
                        arr.push(node.split(' ').length)
                    }
                })
            }

            if (nodeChildren === undefined) {
                if (typeof reactNode === 'string') {
                    arr.push(reactNode.split(' ').length)
                }
            }

            // TODO mb try checking if it's a react element
            if (typeof nodeChildren === 'object') {
                traverseNodesAndCountTokens(nodeChildren)
            }
            if (typeof nodeChildren === 'string') {
                arr.push(nodeChildren.split(' ').length)
            }

            return arr
        }

        return traverseNodesAndCountTokens(children)
    }, [children])

    const totalTokens = useMemo(
        () => tokenLengths.reduce((acc, curr) => acc + curr, 0),
        [tokenLengths],
    )

    const nodex = useMemo(() => {
        let tmpCurrentLoopTokenPos = 0
        let tmpCurrentLoopNodePos = 0

        const traverseNodesAndInjectAIWriter: any = (reactNode: any) => {
            if (tmpCurrentLoopTokenPos > pos) {
                return null
            }

            const nodeChildren = reactNode?.props?.children

            if (Array.isArray(reactNode)) {
                const joinedNodes: ReactNode[] = []
                reactNode.forEach((node) => {
                    if (typeof node === 'object') {
                        joinedNodes.push(traverseNodesAndInjectAIWriter(node))
                    } else if (typeof node === 'string') {
                        tmpCurrentLoopTokenPos += node.split(' ').length
                        tmpCurrentLoopNodePos++
                        const [nodeIndex, currentNodePos] =
                            getCurrentNodeOverflow(tokenLengths, pos)

                        if (nodeIndex < tmpCurrentLoopNodePos) {
                            joinedNodes.push(
                                node.slice(
                                    0,
                                    getStringPosition(
                                        node,
                                        ' ',
                                        currentNodePos,
                                    ),
                                ),
                            )
                        }

                        joinedNodes.push(node)
                    }
                })

                return joinedNodes
            }

            if (nodeChildren === undefined) {
                if (typeof reactNode === 'string') {
                    tmpCurrentLoopTokenPos += reactNode.split(' ').length
                    tmpCurrentLoopNodePos++

                    const [nodeIndex, currentNodePos] = getCurrentNodeOverflow(
                        tokenLengths,
                        pos,
                    )

                    if (nodeIndex < tmpCurrentLoopNodePos) {
                        return reactNode.slice(
                            0,
                            getStringPosition(reactNode, ' ', currentNodePos),
                        )
                    }

                    return reactNode
                }
            }

            if (typeof nodeChildren === 'object') {
                return createElement(
                    reactNode.type,
                    reactNode?.props,
                    traverseNodesAndInjectAIWriter(nodeChildren),
                )
            }

            if (typeof nodeChildren === 'string') {
                tmpCurrentLoopTokenPos += nodeChildren.split(' ').length
                tmpCurrentLoopNodePos++
                const [nodeIndex, currentNodePos] = getCurrentNodeOverflow(
                    tokenLengths,
                    pos,
                )

                if (nodeIndex < tmpCurrentLoopNodePos) {
                    return createElement(
                        reactNode.type,
                        reactNode?.props,
                        nodeChildren.slice(
                            0,
                            getStringPosition(
                                nodeChildren,
                                ' ',
                                currentNodePos,
                            ),
                        ),
                    )
                }

                return reactNode
            }
        }

        return traverseNodesAndInjectAIWriter(children)
    }, [children, pos, tokenLengths])

    useInterval(
        () => {
            setPos((prevPos) => {
                if (prevPos + 1 >= totalTokens) {
                    onFinish()
                }

                return prevPos + 1
            })
        },
        totalTokens > pos ? delay : null,
    )

    useEffect(() => {
        setPos(0)
    }, [children])

    return nodex
}

const ChatCustomContent = ({
    content = '',
    triggerTyping,
    onFinish,
}: ChatCustomContentProps) => {
    const finalContent = ReactHtmlParser(marked(content) as string)

    return (
        <>
            {triggerTyping ? (
                <AIWriter onFinish={onFinish}>{finalContent}</AIWriter>
            ) : (
                finalContent
            )}
        </>
    )
}

export default ChatCustomContent

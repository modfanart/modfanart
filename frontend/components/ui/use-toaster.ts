"use client"

import * as React from "react"

type ToastProps = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
}

type Toast = Omit<ToastProps, "id">

interface State {
  toasts: ToastProps[]
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: any) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

function reducer(state: State, action: any): State {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts],
      }
    default:
      return state
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  const toast = ({ ...props }: Toast) => {
    const id = Math.random().toString(36).substring(2)

    dispatch({
      type: "ADD_TOAST",
      toast: {
        ...props,
        id,
      },
    })
  }

  return {
    ...state,
    toast,
  }
}

export { useToast }


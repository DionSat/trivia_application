import React from "react"
import { reducer, initialState } from "./reducer"

export const SocketContext = React.createContext({
  state: initialState,
  dispatch: () => null
})

export const SocketProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)

  return (
      <SocketContext.Provider value={[ state, dispatch ]}>
          { children }
      </SocketContext.Provider>
  )
}

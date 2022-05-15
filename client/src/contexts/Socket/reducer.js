import socketIOClient from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:4001";

export const reducer = (state, action) => {
  return state;
}

export const initialState = socketIOClient(ENDPOINT);

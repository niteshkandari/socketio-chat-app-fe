import io from "socket.io-client";
import { createContext, useContext } from "react"; 

const { REACT_APP_SOCKET_API } = process.env;

const socket = io.connect(REACT_APP_SOCKET_API);

const connection = socket;
const SocketContext = createContext(connection);

export const SocketFacadeProvider = (props) => {
  return(
      <SocketContext.Provider value={connection}>
          {props.children}
      </SocketContext.Provider>
  )
}

export const useSocketFacade = () => {
    return useContext(SocketContext);
}



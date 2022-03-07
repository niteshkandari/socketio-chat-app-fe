import "./App.css";
import { useState, useEffect } from "react";
import io from "socket.io-client";
import ScrollToBottom from "react-scroll-to-bottom";


const socket = io.connect("http://localhost:6060");

const App = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [name, setName] = useState("");
  const [modal, setModal] = useState(true);
  const [toaster, setToaster] = useState({ show: false, message:"" });

  useEffect(() => {
    socket.on("recieve", payload => {
      setChat(prev => prev = [...prev,payload]);
    });
    socket.on('left', name => {
      setToaster({ show: true, message:`${name} left the chat 🦊`})
    });
  },[socket]);
  
  useEffect(() => {
    socket.on("user-joined", (name) => {
      setToaster({ show: true, message:`${name} joined the chat 🦊 `});
    });
  }, [toaster.name,socket]);

  useEffect(() => {
    let timer;
    if (toaster.show) {
      timer = setTimeout(() => {
        setToaster({ show: false, message: "" });
      }, 6000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [toaster]);

  const handleSumbit = async () => {
    if(!message) return;
    const payload = {
      message:message,
      time:new Date(Date.now()).getHours() + ':' + new Date(Date.now()).getMinutes(),
    }
    await socket.emit("send", payload);
    setMessage("");
  };
  
  const handleSaveUser = () => {
    if(name === ""){ 
      setToaster({ show:true, message:'please enter your user name'});
      return;
    }
    setModal(false); 
    socket.emit("new-user-joined", name);
  }

  const renderChat = () => {
    return (
      <>
      {chat &&
      chat.map((payload, index) => {
        return (
          <div key={index} className={`message ${name === payload.name ? 'right' : 'left'}`}>
            <span className={'message-author'}>{payload.time}  {payload.name}</span>
            {payload.message}
          </div>
        );
      })}
      </>
      );
    };
    
    const renderModal = () => {
      return (
        <>
        <div className="modal">
          <h3>Foxy ✨✨</h3>
          <div className="modal-inbox">
            <input
              placeholder="your name...."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              onClick={handleSaveUser}
              >
              🦊
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {toaster.show && (
        <div className="toaster">{`${toaster.message}`}</div>
      )}
      {modal && renderModal()}
      <div className={`App ${modal && "modal-active"}`}>
        <div className="app-wrapper">
          <header>
            <span>FOXY💬   🦊 </span>
            <div className="ring-container">
              <div className="ringring"></div>
              <div className="circle"></div>
            </div>
          </header>
          <form
            onSubmit={(e) => {
              e.preventDefault(), handleSumbit();
            }}
          ><ScrollToBottom className="scroll">
            <div className="mt"/>
              {renderChat()}
            </ScrollToBottom>
            <div className="send-box">
              <input
                type="text"
                name="chat"
                placeholder="type...."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button type="submit">🐦</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default App;

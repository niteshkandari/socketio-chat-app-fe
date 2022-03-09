import "./App.css";
import { useState, useEffect, useRef } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import { useSocketFacade } from "./Socket-Service";

const App = () => {
  const socketFacade = useSocketFacade();
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [name, setName] = useState("");
  const [modal, setModal] = useState(true);
  const [toaster, setToaster] = useState({ show: false, message: "" });
  const inputRef = useRef();
  const inputChatRef = useRef();

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (modal) return;
    if (inputChatRef && inputChatRef.current) {
      inputChatRef.current.focus();
    }
  }, [modal]);

  useEffect(() => {
    let mount = true;
    if (mount) {
      socketFacade.on("recieve", (payload) => {
        setChat((prev) => (prev = [...prev, payload]));
      });
      socketFacade.on("left", (name) => {
        setToaster({ show: true, message: `${name} left the chat 🦊` });
      });
    }
    return () => {
      mount = false;
    };
  }, [socketFacade]);

  useEffect(() => {
    let mount = true;
    if (mount) {
      socketFacade.on("user-joined", (name) => {
        setToaster({ show: true, message: `${name} joined the chat 🦊 ` });
      });
    }
    return () => {
      mount = false;
    };
  }, [toaster.name, socketFacade]);

  useEffect(() => {
    let timer;
    if (toaster.show) {
      timer = setTimeout(() => {
        setToaster({ show: false, message: "" });
      }, 10000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [toaster]);

  const handleSumbit = async () => {
    if (!message) return;
    const payload = {
      message: message,
      time:
        new Date(Date.now()).getHours() +
        ":" +
        new Date(Date.now()).getMinutes(),
    };
    await socketFacade.emit("send", payload);
    setMessage("");
  };

  const handleSaveUser = () => {
    if (name === "") {
      setToaster({ show: true, message: "please enter your user name" });
      return;
    }
    setModal(false);
    socketFacade.emit("new-user-joined", name);
  };

  const renderChat = () => {
    return (
      <>
        {chat &&
          chat.map((payload, index) => {
            return (
              <div
                key={index}
                className={`message ${
                  name === payload.name ? "right" : "left"
                }`}
              >
                <span className={"message-author"}>
                  {payload.time} {payload.name}
                </span>
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
              ref={inputRef}
              placeholder="your name...."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSaveUser()}
            />
            <button onClick={handleSaveUser}>🦊</button>
          </div>
        </div>
      </>
    );
  };

  return (
      <>
      {toaster.show && <div className="toaster">{`${toaster.message}`}</div>}
      {modal && renderModal()}
      <div className={`App ${modal && "modal-active"}`}>
        <div className="app-wrapper">
          <header>
            <span>FOXY💬 🦊 </span>
            <div className="ring-container">
              <div className="ringring"></div>
              <div className="circle"></div>
            </div>
          </header>
          <form
            onSubmit={(e) => {
              e.preventDefault(), handleSumbit();
            }}
          >
            <ScrollToBottom className="scroll">
              <div className="mt" />
              {renderChat()}
            </ScrollToBottom>
            <div className="send-box">
              <input
                ref={inputChatRef}
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

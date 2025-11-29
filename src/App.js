import React from "react";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
// const connectionUrl = "http://localhost:4000";
const connectionUrl = "https://azure-ai-chat-backend.onrender.com/";
const socket = io.connect(connectionUrl);
const App = () => {
  const [receiveMessage, setReceiveMessage] = React.useState("");
  const [receiveMessageGemini, setReceiveMessageGemini] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [clientId, setClientId] = React.useState(uuidv4());

  React.useEffect(() => {
    setClientId(clientId || uuidv4());
    socket.on(`receive_message_${clientId}`, (data) => {
      console.log("recerve msg -->",data);
      if (data.clientId === clientId) {
        setReceiveMessage(data);
      }
    });

    return () => {
      socket.off(`receive_message_${clientId}`);
    };
  }, []);
  const sendToAzure = async () => {
    socket.emit("send_message", {
      messages: [{ role: "user", content: query }],
      clientId: clientId,
    });
    console.log("send msg -->",query);
  };
  const onEnterPressAzure = (e) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
      sendToAzure();
    }
  };


  return (
    <div className="App">
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "49%",
            height: "80vh",
            overflow: "auto",
          }}
        >
          <h1>AI Search</h1>
          <form action={sendToAzure}>
            <textarea
              value={query}
              rows="4"
              cols="30"
              style={{ width: "450px", marginLeft: "25px" }}
              onKeyDown={onEnterPressAzure}
              onChange={(e) => setQuery(e.target.value)}
            />
            <br />
            <button
              style={{ width: "450px", marginLeft: "25px", marginTop: "15px" }}
              type="submit"
            >
              Search
            </button>
          </form>
          <p>{receiveMessage?.response}</p>
        </div>
      </div>
    </div>
  );
};

export default App;

import React from "react";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
const socket = io.connect("http://localhost:4000");
const App = () => {
  const [receiveMessage, setReceiveMessage] = React.useState("");
  const [query, setQuery] = React.useState("");
  const clientId = uuidv4();
  React.useEffect(() => {
    socket.on("receive_message", (data) => {
      if (data.clientId === clientId) {
        console.log(data);
        setReceiveMessage(data);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);
  const sendMessage = async () => {
    socket.emit("send_message", {
      messages: [{ role: "user", content: query }],
      clientId: clientId,
    });
  };
  return (
    <div className="App">
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <button onClick={sendMessage}>send message</button>
      {JSON.stringify(receiveMessage)}
    </div>
  );
};

export default App;
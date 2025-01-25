import React from "react";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
// const socket = io.connect("http://localhost:4000");
const socket = io.connect("https://surajit-ai.azurewebsites.net/");
const App = () => {
  const [receiveMessage, setReceiveMessage] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [clientId, setClientId] = React.useState(uuidv4());

  React.useEffect(() => {
    setClientId(clientId || uuidv4());
    socket.on("receive_message", (data) => {
      if (data.clientId === clientId) {
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
  const onEnterPress = (e) => {
    if (e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault();
      sendMessage();
    }
  };
  return (
    <div className="App">
      <form action={sendMessage}>
        <textarea
          value={query}
          rows="4"
          cols="30"
          style="width: 450px; margin-left: 25px;"
          onKeyDown={onEnterPress}
          onChange={(e) => setQuery(e.target.value)}
        />
        <br />
        <button type="submit">Search</button>
      </form>
      <p>{receiveMessage?.response}</p>
    </div>
  );
};

export default App;

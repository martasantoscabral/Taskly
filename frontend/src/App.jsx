import { useState } from "react";
import Login from "./pages/Login";
import Tasks from "./pages/Home";

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return <Tasks user={user} onLogout={() => setUser(null)} />;   //Home.jsx
}

export default App;
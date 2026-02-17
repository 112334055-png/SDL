import { useEffect, useState } from "react";

function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.log(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome to Library</h1>
      <p>{message}</p>
    </div>
  );
}

export default Home;

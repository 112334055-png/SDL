import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import BookUpload from "./pages/BookUpload";

function App() {
  const [activePage, setActivePage] = useState("Home"); // default page

  return (
    <div className="app-container">
      {/* Pass activePage and setter to Navbar */}
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        user={{ name: "Sabari", initials: "SB" }} 
      />

      {/* Render component based on activePage */}
      {activePage === "Home" && <Home />}
      {activePage === "BookUpload" && <BookUpload />}
    </div>
  );
}

export default App;

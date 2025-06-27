import ApodPage from "./components/ApodPage";
import MarsRoverPage from "./components/MarsRoverPage";
import NeoWsPage from "./components/NeoWsPage";
import EpicPage from "./components/EpicPage";
import ImageLibraryPage from "./components/ImageLibraryPage";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
function App() {
  return (
      <div className="flex flex-col min-h-screen">
       <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<ApodPage />} />
            <Route path="/mars-rover" element={<MarsRoverPage />} />
            <Route path="/neo-ws" element={<NeoWsPage />} />
            <Route path="/epic" element={<EpicPage />} />
            <Route path="/images" element={<ImageLibraryPage />} />
          </Routes>
        </main>
      </div>
  );
}

export default App;

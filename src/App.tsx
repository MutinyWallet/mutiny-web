import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Home from "./Home";
import Receive from "./Receive";
import Join from "./Join";
function App() {
  return (
    <div className="App">

      {/* globals such as header will go here  */}

      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/" element={<Join />} />
      </Routes>
    </div>
  );
}

export default App;
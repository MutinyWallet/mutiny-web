import { Routes, Route } from "react-router-dom";

import Join from "./Join";
import Layout from "./components/Layout";

function App() {
  return (
    <div className="App">

      {/* globals such as header will go here  */}

      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Join />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
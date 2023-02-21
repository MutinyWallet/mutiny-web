import { Routes, Route } from "react-router-dom";

import Join from "@/routes/Join";
import Layout from "@/components/Layout";
import SecretWaitlistSkipper from "@/routes/SecretWaitlistSkipper";
import Home from "@/routes/Home";

function App() {
  let active = localStorage.getItem('active') || "";
  return (
    <div className="App">

      {/* globals such as header will go here  */}

      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/" element={<Layout />}>
          <Route index element={active === "true" ? <Home /> : <Join />} />
          <Route path="secretwaitlistskipper" element={<SecretWaitlistSkipper />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
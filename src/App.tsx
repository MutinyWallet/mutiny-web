import { useLoaderData } from "react-router-dom";

import Join from "@/routes/Join";
import Home from "@/routes/Home";
import { WaitlistItem } from "./types";

function App() {
  const data = useLoaderData() as WaitlistItem | null;

  return (
    <>
      {data?.approval_date ? <Home /> : <Join />}
    </>
  )
}

export default App;
import { createSignal } from "solid-js";
import { Button } from "./Button";
import "./Counter.css";

export default function Counter() {
  const [count, setCount] = createSignal(0);
  return (
    <Button onClick={() => setCount(count() + 1)}>
      Clicks: {count()}
    </Button>
  );
}

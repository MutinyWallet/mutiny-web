import { render } from "solid-js/web";

import "./root.css";

import { Router } from "./router";

const root = document.getElementById("root");

render(() => <Router />, root!);

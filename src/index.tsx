/* @refresh reload */
import { render } from "solid-js/web";

import "./root.css";

import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";

import App from "./App";

const root = document.getElementById("root");

render(
    () => (
        <Router>
            {/* important that there's only one of these. hardcoded meta elements in index.html can be decorated with data-sm to be mutatable */}
            <MetaProvider>
                <App />
            </MetaProvider>
        </Router>
    ),
    root!
);

/* @refresh reload */
import "./index.css";
import { render } from "solid-js/web";

import App from "./App.tsx";

const root = document.getElementById("root");

if (!(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Cannot render the application.",
  );
}

render(() => <App />, root);

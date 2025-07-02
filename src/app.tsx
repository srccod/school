import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import Nav from "~/components/Nav";

import "./app.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <div class="h-screen grid grid-rows-[auto_1fr]">
          <Nav />
          <main class="h-full">
            <Suspense>{props.children}</Suspense>
          </main>
        </div>
      )}
    >
      <FileRoutes />
    </Router>
  );
}

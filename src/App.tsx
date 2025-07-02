import type { Component } from "solid-js";
import Nav from "./components/Nav.tsx";
import Main from "./components/Main.tsx";

const App: Component = () => {
  return (
    <div class="h-screen grid grid-rows-[auto_1fr]">
      <Nav />
      <main class="h-full">
        <Main />
      </main>
    </div>
  );
};

export default App;

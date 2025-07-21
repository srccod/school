import { Route, Router } from "@solidjs/router";
import type { Component } from "solid-js";
import Layout from "./components/Layout.tsx";
import Login from "./components/Login.tsx";
import Main from "./components/Main.tsx";
import { UserProvider } from "./stores/user.tsx";

const App: Component = () => {
  return (
    <UserProvider>
      <Router root={Layout}>
        <Route path="/" component={Main} />
        <Route path="/login" component={Login} />
      </Router>
    </UserProvider>
  );
};

export default App;

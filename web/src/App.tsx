import { Route, Router } from "@solidjs/router";
import type { Component } from "solid-js";
import CreateAccount from "./components/CreateAccount.tsx";
import Layout from "./components/Layout.tsx";
import Login from "./components/Login.tsx";
import Main from "./components/Main.tsx";
import Protected from "./components/Protected.tsx";
import { UserProvider } from "./stores/user.tsx";

const App: Component = () => {
  return (
    <UserProvider>
      <Router root={Layout}>
        <Route path="/login" component={Login} />
        <Route path="/create-account" component={CreateAccount} />
        <Route path="/" component={Protected}>
          <Route path="/:slug?" component={Main} />
        </Route>
      </Router>
    </UserProvider>
  );
};

export default App;

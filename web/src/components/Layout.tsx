import type { RouteSectionProps } from "@solidjs/router";
import { useNavigate } from "@solidjs/router";
import { createResource } from "solid-js";
import { useUser } from "../stores/user.tsx";
import Nav from "./Nav.tsx";

export default function Layout(props: RouteSectionProps) {
  const { initialize } = useUser();
  const navigate = useNavigate();

  createResource(() => initialize(navigate));

  return (
    <div class="h-screen grid grid-rows-[auto_1fr]">
      <Nav />
      <main class="h-full">
        {props.children}
      </main>
    </div>
  );
}

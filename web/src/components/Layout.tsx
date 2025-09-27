import type { RouteSectionProps } from "@solidjs/router";
import Nav from "./Nav.tsx";

export default function Layout(props: RouteSectionProps) {
  return (
    <div class="h-screen grid grid-rows-[auto_1fr]">
      <Nav />
      <main class="h-full">
        {props.children}
      </main>
    </div>
  );
}

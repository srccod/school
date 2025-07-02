// import { useLocation } from "@solidjs/router";

export default function Nav() {
  const location = { pathname: "/" };
  const active = (path: string) =>
    path == location.pathname
      ? "border-sky-600"
      : "border-transparent hover:border-sky-600";
  return (
    <div class="flex justify-between items-center p-3">
      <nav>
        <ul class="flex items-center p-3 light:text-foreground">
          <li class={`border-b-2 ${active("/")} mx-1.5 sm:mx-6`}>
            <a href="/">Home</a>
          </li>
          <li class={`border-b-2 ${active("/about")} mx-1.5 sm:mx-6`}>
            <a href="/about">About</a>
          </li>
        </ul>
      </nav>
      <div class="flex flex-col items-center gap-1">
        <span class="text-2xl font-bold">source cod</span>
      </div>
      <div>
        <span>username</span>
      </div>
    </div>
  );
}

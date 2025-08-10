import { Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useUser } from "../stores/user.tsx";
import { Button } from "./ui/Button.tsx";

export default function Nav() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  return (
    <div class="flex justify-between items-center p-3">
      <div class="flex flex-col items-center gap-1">
        <span class="text-2xl font-bold">source cod</span>
      </div>
      <div>
        <Show when={user.isLoggedIn}>
          <div class="flex items-center gap-2">
            <span>{user.username}</span>
            <Button variant="ghost" onClick={() => logout(navigate)}>
              log out
            </Button>
          </div>
        </Show>
      </div>
    </div>
  );
}

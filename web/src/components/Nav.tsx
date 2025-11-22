import { useNavigate } from "@solidjs/router";
import { createResource, For, Show } from "solid-js";
import type { ModuleResponse } from "../../../server/src/shared-types.ts";
import logo from "../../assets/srccod-logo-sm.webp";
import { getModules } from "../lib/apiClient.ts";
import { useUser } from "../stores/user.tsx";
import { HamburgerMenuIcon } from "./icons.tsx";
import { Button } from "./ui/Button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/DropdownMenu.tsx";

export default function Nav() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const [modules] = createResource<ModuleResponse[]>(getModules);

  return (
    <div class="flex justify-between items-center p-3">
      <div class="flex items-center gap-1">
        <img src={logo} alt="srccod Logo" class="h-12" />
      </div>
      <div class="flex align-content-center items-center gap-4">
        <Show when={user.isLoggedIn}>
          <span>{user.username}</span>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost">
                <HamburgerMenuIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-56">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  modules
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent class="max-h-96 overflow-y-auto">
                    <For
                      each={modules()?.sort((a, b) =>
                        a.name.localeCompare(b.name)
                      )}
                    >
                      {(module) => (
                        <DropdownMenuItem
                          class="text-sm"
                          onClick={() => navigate(`/${module.slug}`)}
                        >
                          {module.name}
                        </DropdownMenuItem>
                      )}
                    </For>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout(navigate)}>
                log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Show>
      </div>
    </div>
  );
}

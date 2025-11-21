import { createResource, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useUser } from "../stores/user.tsx";
import { Button } from "./ui/Button.tsx";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "./ui/NavigationMenu.tsx";
import logo from "../../assets/srccod-logo-sm.webp";
import { getModules } from "../lib/apiClient.ts";
import { HamburgerMenuIcon } from "./icons.tsx";
import type { ModuleResponse } from "../../../server/src/shared-types.ts";

export default function Nav() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const [modules] = createResource<ModuleResponse[]>(getModules);

  return (
    <div class="flex justify-between items-center p-3">
      <div class="flex items-center gap-1">
        <img src={logo} alt="srccod Logo" class="h-12" />
      </div>
      <div class="flex">
        <Show when={user.isLoggedIn}>
          <NavigationMenu>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <HamburgerMenuIcon />
              </NavigationMenuTrigger>
              <NavigationMenuContent class="w-56 overflow-y-auto max-h-96">
                <For
                  each={modules()?.sort((a, b) => a.name.localeCompare(b.name))}
                >
                  {(module) => (
                    <NavigationMenuLink
                      class="text-sm"
                      onClick={() => navigate(`/${module.slug}`)}
                    >
                      {module.name}
                    </NavigationMenuLink>
                  )}
                </For>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Button variant="ghost" onClick={() => logout(navigate)}>
                log out
              </Button>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <span>{user.username}</span>
            </NavigationMenuItem>
          </NavigationMenu>
        </Show>
      </div>
    </div>
  );
}

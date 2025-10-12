import { For, Show } from "solid-js";
import { Button } from "./ui/Button.tsx";
import { RunIcon, SaveIcon, StopIcon } from "./icons.tsx";

type CommandBarProps = {
  onRun: () => void;
  onSave?: () => void;
  onInterrupt?: () => void;
  isExecuting?: boolean;
  files: { name: string; content: string }[];
  activeFile: string;
  setActiveFile: (name: string) => void;
};

export default function CommandBar(props: CommandBarProps) {
  return (
    <div class="flex place-content-between items-center m-3">
      <div class="flex gap-2">
        <For each={props.files}>
          {(file) => (
            <Button
              variant={props.activeFile === file.name ? "secondary" : "ghost"}
              size="sm"
              onClick={() => props.setActiveFile(file.name)}
            >
              {file.name}
            </Button>
          )}
        </For>
      </div>
      <ul class="flex gap-2">
        <li>
          <Show
            when={props.onSave}
            fallback={<div />}
          >
            <Button onclick={props.onSave} variant="ghost" size="sm">
              <SaveIcon class="" />
            </Button>
          </Show>
        </li>
        <li>
          <Show
            when={props.isExecuting}
            fallback={
              <Button onclick={props.onRun} variant="ghost" size="sm">
                <RunIcon class="" />
              </Button>
            }
          >
            <Button onclick={props.onInterrupt} variant="ghost" size="sm">
              <StopIcon class="" />
            </Button>
          </Show>
        </li>
      </ul>
    </div>
  );
}

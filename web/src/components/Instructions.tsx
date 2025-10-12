import { createEffect, createSignal, Show } from "solid-js";
import { SolidMarkdown } from "solid-markdown";
import { Button } from "./ui/Button.tsx";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons.tsx";
import type { ModuleResponse } from "../../../shared-types.ts";

export default function Instructions(
  props: { module: ModuleResponse | null | undefined },
) {
  const [instructionStep, setInstructionStep] = createSignal(0);

  // reset instruction step when module changes
  createEffect(() => {
    props.module?.slug;
    setInstructionStep(0);
  });

  const instructions = () => props.module?.instructions;
  const currentInstruction = () => instructions()?.[instructionStep()];
  const instructionCount = () => instructions()?.length || 0;

  return (
    <div class="prose dark:prose-invert h-full p-6 flex flex-col">
      <div class="flex-1 overflow-y-auto">
        <SolidMarkdown class="prose dark:prose-invert">
          {currentInstruction()?.text || ""}
        </SolidMarkdown>
      </div>
      <Show when={instructionCount() > 1}>
        <div class="flex justify-between items-center mt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setInstructionStep(instructionStep() - 1)}
            disabled={instructionStep() === 0}
          >
            <ChevronLeftIcon />
          </Button>
          <span>
            {instructionStep() + 1} / {instructionCount()}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setInstructionStep(instructionStep() + 1)}
            disabled={instructionStep() === instructionCount() - 1}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </Show>
    </div>
  );
}

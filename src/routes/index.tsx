import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "~/components/ui/resizable";

export default function Home() {
  return (
    <Resizable class="flex-1 h-full">
      <ResizablePanel initialSize={0.5} class="overflow-hidden">
        <div class="flex h-[200px] items-center justify-center p-6">
          <span class="font-semibold">One</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel initialSize={0.5} class="overflow-hidden">
        <div class="flex h-full items-center justify-center p-6">
          <span class="font-semibold">Two</span>
        </div>
      </ResizablePanel>
    </Resizable>
  );
}

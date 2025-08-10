import { createSignal } from "solid-js";
import CommandBar from "./CommandBar.tsx";
import Editor from "./Editor.tsx";
import { Resizable, ResizableHandle, ResizablePanel } from "./ui/resizable.tsx";
import { usePyodide } from "../hooks/usePyodide.ts";

export default function Home() {
  const [files, setFiles] = createSignal([
    {
      name: "main.py",
      content: `from utils import say_hello

say_hello("World")`,
    },
    {
      name: "utils.py",
      content: `def say_hello(name):
   print(f"Hello, {name}!")`,
    },
  ]);
  const [activeFile, setActiveFile] = createSignal(files()[0].name);
  const [output, setOutput] = createSignal("");

  const {
    isPyodideLoading,
    isExecuting,
    executePython,
  } = usePyodide();

  const handleRunCode = async () => {
    if (isPyodideLoading() || isExecuting()) {
      return;
    }
    try {
      const result = await executePython(files(), activeFile());
      let outputUpdate = "";
      if (result) {
        outputUpdate += result.output !== "undefined" ? result.output : "";
        outputUpdate += result.returnValue !== "undefined"
          ? result.returnValue
          : "";
      }
      setOutput(outputUpdate);
      console.log("Python execution result:", result);
      console.log("Output:", output());
    } catch (err) {
      console.error("Python execution failed:", err);
    }
  };

  const activeFileContent = () =>
    files().find((f) => f.name === activeFile())?.content ?? "";

  return (
    <Resizable class="">
      <ResizablePanel
        initialSize={0.35}
        class="overflow-hidden"
      >
        <div class="flex h-full p-6">
          <span class="font-semibold">Lesson Text</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel initialSize={0.65} class="overflow-hidden">
        <Resizable orientation="vertical">
          <ResizablePanel
            initialSize={0.5}
            class="overflow-hidden"
          >
            <div class="h-full flex flex-col">
              <CommandBar
                onRun={handleRunCode}
                files={files()}
                activeFile={activeFile()}
                setActiveFile={setActiveFile}
              />
              <div class="flex-1 overflow-hidden">
                <Editor
                  controlled
                  value={activeFileContent()}
                  language="python"
                  theme="vs-dark"
                  uri={activeFile()}
                  onChange={(value) => {
                    const newFiles = files().map((f) =>
                      f.name === activeFile() ? { ...f, content: value } : f
                    );
                    setFiles(newFiles);
                  }}
                  onMount={(editor, monaco) => {
                    editor.addAction({
                      id: "run-code",
                      label: "Run Code",
                      keybindings: [
                        monaco.KeyMod.CtrlCmd |
                        monaco.KeyCode.F9,
                      ],
                      run: () => {
                        handleRunCode();
                      },
                    });
                    console.log("code editor mounted");
                  }}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            initialSize={0.5}
            class="overflow-hidden"
          >
            <div class="h-full flex flex-col">
              <div class="flex-1 overflow-hidden">
                <Editor
                  controlled
                  value={output()}
                  language="python"
                  theme="vs-dark"
                  uri="output"
                  onMount={(_editor, _monaco) => {
                    console.log("output editor mounted");
                  }}
                  options={{
                    readOnly: true,
                    lineNumbers: "off",
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </div>
          </ResizablePanel>
        </Resizable>
      </ResizablePanel>
    </Resizable>
  );
}

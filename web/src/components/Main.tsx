import { useParams } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";
import { type CodeMod, codeMods } from "../lib/modules_temp.ts";
import CommandBar from "./CommandBar.tsx";
import Editor from "./Editor.tsx";
import { Resizable, ResizableHandle, ResizablePanel } from "./ui/resizable.tsx";
import { usePyodide } from "../hooks/usePyodide.ts";
import { SolidMarkdown } from "solid-markdown";

export default function Main() {
  const params = useParams();
  const [module, setModule] = createSignal<CodeMod | null>(null);
  const [files, setFiles] = createSignal<{ name: string; content: string }[]>(
    [],
  );
  const [activeFile, setActiveFile] = createSignal("");
  const [output, setOutput] = createSignal("");

  const {
    isPyodideLoading,
    isExecuting,
    executePython,
  } = usePyodide();

  onMount(() => {
    const slug = params.slug;

    if (slug) {
      const currentModule = codeMods[slug];
      if (currentModule) {
        setModule(currentModule);
        setFiles(currentModule.files);
        setActiveFile(currentModule.files[0].name);
      }
    } else {
      setFiles(codeMods["getting-started"].files);
      setActiveFile(codeMods["getting-started"].files[0].name);
    }
  });

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
        <div class="prose dark:prose-invert h-full p-6">
          <SolidMarkdown class="prose dark:prose-invert h-full p-6">
            {module()?.instructions || ""}
          </SolidMarkdown>
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
                  onMount={(editor, _monaco) => {
                    editor.addAction({
                      id: "run-code",
                      label: "Run Code",
                      keybindings: [],
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

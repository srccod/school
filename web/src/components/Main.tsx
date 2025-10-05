import { useParams } from "@solidjs/router";
import { createEffect, createSignal, onMount } from "solid-js";
import { type CodeMod, codeMods } from "../lib/modules_temp.ts";
import CommandBar from "./CommandBar.tsx";
import Editor from "./Editor.tsx";
import { Resizable, ResizableHandle, ResizablePanel } from "./ui/resizable.tsx";
import { usePyodide } from "../hooks/usePyodide.ts";
import * as monaco from "monaco-editor";
import Instructions from "./Instructions.tsx";

export default function Main() {
  const params = useParams();
  const [module, setModule] = createSignal<CodeMod | null>(null);
  const [files, setFiles] = createSignal<{ name: string; content: string }[]>(
    [],
  );
  const [activeFile, setActiveFile] = createSignal("");

  let codeEditor: monaco.editor.IStandaloneCodeEditor | undefined;
  let outputEditor: monaco.editor.IStandaloneCodeEditor | undefined;
  let inputStartColumn = 0;

  const {
    isPyodideLoading,
    isExecuting,
    pyodideStream,
    setPyodideStream,
    isAwaitingInput,
    sendInput,
    executePython,
  } = usePyodide();

  // auto-scroll output editor to bottom on new output or input prompt
  createEffect(() => {
    // subscribe to changes
    pyodideStream();
    isAwaitingInput();

    if (outputEditor) {
      const model = outputEditor.getModel();
      if (model) {
        const lineCount = model.getLineCount();
        const lastLineLength = model.getLineContent(lineCount).length;
        const newPosition = {
          lineNumber: lineCount,
          column: lastLineLength + 1,
        };
        outputEditor.setPosition(newPosition);
        outputEditor.revealPosition(newPosition);
      }
    }
  });

  // track when input is requested & set cursor position
  createEffect(() => {
    if (isAwaitingInput()) {
      if (outputEditor) {
        const model = outputEditor.getModel();
        if (model) {
          const lineCount = model.getLineCount();
          inputStartColumn = model.getLineContent(lineCount).length + 1;
        }
      }
    }
  });

  // refocus code editor when execution completes
  createEffect((prevIsExecuting) => {
    const currentIsExecuting = isExecuting();
    if (prevIsExecuting && !currentIsExecuting) {
      if (codeEditor) {
        codeEditor.focus();
      }
    }
    return currentIsExecuting;
  }, isExecuting());

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
      await executePython(files(), activeFile());
    } catch (err) {
      console.error("Python execution failed:", err);
    }
  };

  const activeFileContent = () =>
    files().find((f) => f.name === activeFile())?.content ?? "";

  return (
    <Resizable class="">
      <ResizablePanel initialSize={0.35} class="overflow-hidden">
        <Instructions module={module()} />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel initialSize={0.65} class="overflow-hidden">
        <Resizable orientation="vertical">
          <ResizablePanel initialSize={0.5} class="overflow-hidden">
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
                    codeEditor = editor;
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
          <ResizablePanel initialSize={0.5} class="overflow-hidden">
            <div class="h-full flex flex-col">
              <div class="flex-1 overflow-hidden">
                <Editor
                  controlled
                  value={pyodideStream()}
                  language="plaintext"
                  theme="vs-dark"
                  uri="output"
                  onMount={(editor, _monaco) => {
                    outputEditor = editor;
                    createEffect(() => {
                      const isReadOnly = !isAwaitingInput();
                      editor.updateOptions({ readOnly: isReadOnly });
                      if (!isReadOnly) {
                        editor.focus();
                      }
                      const domNode = editor.getDomNode();
                      if (domNode) {
                        if (isReadOnly) {
                          domNode.classList.add("editor-readonly");
                        } else {
                          domNode.classList.remove("editor-readonly");
                        }
                      }
                    });
                    editor.onKeyDown((e) => {
                      if (isAwaitingInput() && e.code === "Enter") {
                        e.preventDefault();
                        const model = editor.getModel();
                        if (model) {
                          const lineCount = model.getLineCount();
                          const currentLine = model.getLineContent(lineCount);
                          const input = currentLine.substring(
                            inputStartColumn - 1,
                          );
                          sendInput(input);
                          setPyodideStream((prev) => prev + input + "\n");
                        }
                      }
                    });
                    console.log("output editor mounted");
                  }}
                  options={{
                    fontSize: 14,
                    lineNumbers: "off",
                    minimap: { enabled: false },
                    renderLineHighlight: "none",
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

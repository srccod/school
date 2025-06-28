import { createSignal } from "solid-js";
import Editor from "~/components/Editor";
import {
    Resizable,
    ResizableHandle,
    ResizablePanel,
} from "~/components/ui/resizable";
import { usePyodide } from "~/hooks/usePyodide";

export default function Home() {
    const [code, setCode] = createSignal(
        `def say_hello(name):\n   print(f"Hello, {name}!")\n\nsay_hello("World")`,
    );
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
            const result = await executePython(code());
            console.log("Python execution result:", result);
        } catch (err) {
            console.error("Python execution failed:", err);
        }
    };

    return (
        <Resizable class="flex-1 h-full">
            <ResizablePanel initialSize={0.5} class="overflow-hidden">
                <Editor
                    value={code()}
                    language="python"
                    theme="vs-dark"
                    height="100%"
                    width="100%"
                    uri="main.py"
                    onChange={(value) => setCode(value)}
                    onMount={(editor, monaco) => {
                        editor.addAction({
                            id: "run-code",
                            label: "Run Code",
                            keybindings: [
                                monaco.KeyMod.CtrlCmd | monaco.KeyCode.F9,
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
                        automaticLayout: true,
                    }}
                />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel initialSize={0.5} class="overflow-hidden">
                <Editor
                    value={"Hello, World!"}
                    language="python"
                    theme="vs-dark"
                    height="100%"
                    width="100%"
                    uri="output"
                    onChange={() => {}}
                    onMount={(editor, monaco) => {
                        console.log("output editor mounted");
                    }}
                    options={{
                        readOnly: true,
                        lineNumbers: "off",
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                    }}
                />
            </ResizablePanel>
        </Resizable>
    );
}

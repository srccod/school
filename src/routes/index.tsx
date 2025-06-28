import { createSignal } from "solid-js";
import {
    Resizable,
    ResizableHandle,
    ResizablePanel,
} from "~/components/ui/resizable";
import Editor from "~/components/Editor";

export default function Home() {
    const [code, setCode] = createSignal(
        `def say_hello(name):\n   print(f"Hello, {name}!")\n\nsay_hello("World")`,
    );

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
                        console.log("editor mounted");
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
                        console.log("editor mounted");
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

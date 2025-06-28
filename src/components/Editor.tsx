import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import type * as Monaco from "monaco-editor";

interface EditorProps {
    value?: string;
    language?: string;
    theme?: string;
    height?: string;
    width?: string;
    options?: Monaco.editor.IStandaloneEditorConstructionOptions;
    uri?: string;
    onChange?: (value: string) => void;
    onMount?: (
        editor: Monaco.editor.IStandaloneCodeEditor,
        monaco: typeof Monaco,
    ) => void;
}

export default function Editor(props: EditorProps) {
    const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();
    const [editor, setEditor] = createSignal<
        Monaco.editor.IStandaloneCodeEditor
    >();
    const [monaco, setMonaco] = createSignal<typeof Monaco>();
    const [models, setModels] = createSignal<
        Monaco.editor.ITextModel[] | undefined
    >();

    onMount(async () => {
        const container = containerRef();
        if (!container) return;

        try {
            const monacoModule = await import("monaco-editor");

            self.MonacoEnvironment = {
                getWorker: function (workerId: string, label: string) {
                    const createWorker = (url: string) => {
                        return new Worker(url, {
                            name: label,
                            type: "module",
                        });
                    };

                    switch (label) {
                        case "json":
                            return createWorker(
                                "/node_modules/monaco-editor/esm/vs/language/json/json.worker.js",
                            );
                        case "css":
                        case "scss":
                        case "less":
                            return createWorker(
                                "/node_modules/monaco-editor/esm/vs/language/css/css.worker.js",
                            );
                        case "html":
                            return createWorker(
                                "/node_modules/monaco-editor/esm/vs/language/html/html.worker.js",
                            );
                        case "typescript":
                        case "javascript":
                            return createWorker(
                                "/node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js",
                            );
                        default:
                            return createWorker(
                                "/node_modules/monaco-editor/esm/vs/editor/editor.worker.js",
                            );
                    }
                },
            };

            const model = monacoModule.editor.createModel(
                props.value || "",
                props.language || "javascript",
                monacoModule.Uri.parse(props.uri || "inmemory://file1"),
            );

            const editorInstance = monacoModule.editor.create(container, {
                model,
                theme: props.theme || "vs-dark",
                automaticLayout: true,
                scrollbar: {
                    verticalScrollbarSize: 5,
                    verticalSliderSize: 5,
                },
                ...props.options,
            });

            setModels([model]);
            setEditor(editorInstance);
            setMonaco(monacoModule);

            if (props.onChange) {
                editorInstance.onDidChangeModelContent(() => {
                    props.onChange?.(editorInstance.getValue());
                });
            }

            props.onMount?.(editorInstance, monacoModule);
        } catch (error) {
            console.error("Failed to load Monaco Editor:", error);
        }
    });

    // Update editor theme when props change
    createEffect(() => {
        const monacoModule = monaco();
        if (monacoModule && props.theme) {
            monacoModule.editor.setTheme(props.theme);
        }
    });

    onCleanup(() => {
        const editorInstance = editor();
        if (editorInstance) {
            editorInstance.dispose();
        }

        const modelsList = models();
        if (modelsList) {
            modelsList.forEach((model) => {
                model.dispose();
            });
        }
        setEditor(undefined);
        setModels(undefined);
    });

    return (
        <div
            ref={setContainerRef}
            style={{
                width: props.width || "100%",
                height: props.height || "400px",
            }}
        />
    );
}

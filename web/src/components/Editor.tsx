import type * as Monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import {
  createEffect,
  createSignal,
  mergeProps,
  onCleanup,
  onMount,
} from "solid-js";

interface EditorProps {
  controlled?: boolean;
  language?: string;
  onChange?: (value: string) => void;
  onMount?: (
    editor: Monaco.editor.IStandaloneCodeEditor,
    monaco: typeof Monaco,
  ) => void;
  options?: Monaco.editor.IStandaloneEditorConstructionOptions;
  theme?: string;
  uri?: string;
  value?: string;
}

export default function Editor(rawProps: EditorProps) {
  const props = mergeProps({ controlled: false }, rawProps);

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
      const monaco = await import("monaco-editor");

      self.MonacoEnvironment = {
        getWorker(_workerId: string, _label: string) {
          return new editorWorker();
        },
      };

      const model = monaco.editor.createModel(
        props.value || "",
        props.language || "javascript",
        monaco.Uri.parse(props.uri || "inmemory://file1"),
      );

      const editorInstance = monaco.editor.create(container, {
        model,
        theme: props.theme || "vs-dark",
        scrollbar: {
          verticalScrollbarSize: 5,
          verticalSliderSize: 5,
        },
        automaticLayout: true,
        ...props.options,
      });

      setModels([model]);
      setEditor(editorInstance);
      setMonaco(monaco);

      if (props.onChange) {
        editorInstance.onDidChangeModelContent(() => {
          props.onChange?.(editorInstance.getValue());
        });
      }

      const resizeObserver = new ResizeObserver(() => {
        editorInstance.layout();
      });
      resizeObserver.observe(container);

      // Store the observer for cleanup
      (container as HTMLDivElement & { __resizeObserver?: ResizeObserver })
        .__resizeObserver = resizeObserver;

      props.onMount?.(editorInstance, monaco);
    } catch (error) {
      console.error("Failed to load Monaco Editor:", error);
    }
  });

  createEffect(() => {
    const shouldSync = props.controlled;

    if (shouldSync) {
      const editorInstance = editor();
      const currentValue = props.value;

      if (editorInstance && currentValue !== undefined) {
        const model = editorInstance.getModel();
        if (model && model.getValue() !== currentValue) {
          model.setValue(currentValue);
        }
      }
    }
  });

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

    // Clean up ResizeObserver
    const container = containerRef();
    if (container) {
      const resizeObserver =
        (container as HTMLDivElement & { __resizeObserver?: ResizeObserver })
          .__resizeObserver;
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    }

    setEditor(undefined);
    setModels(undefined);
  });

  return (
    <div
      ref={setContainerRef}
      class="w-full h-full"
    />
  );
}

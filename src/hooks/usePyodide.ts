import { createSignal, onCleanup, onMount } from "solid-js";
import { generateID } from "~/lib/generateID";

import PyodideWorker from "../workers/pyodide.worker?worker";

type WorkerMessage = {
  id: string;
  type: string;
  payload?: any;
  output?: string;
  error?: string;
  returnValue?: string;
};

const pendingPromises = new Map<
  string,
  { resolve: (value: any) => void; reject: (reason?: any) => void }
>();

export function usePyodide() {
  const [isPyodideLoading, setIsPyodideLoading] = createSignal(true);
  const [pyodideOutput, setPyodideOutput] = createSignal("");
  const [pyodideError, setPyodideError] = createSignal<string | null>(null);
  const [isExecuting, setIsExecuting] = createSignal(false);

  let worker: Worker | undefined;

  onMount(() => {
    worker = new PyodideWorker();

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const { id, type, output, error, returnValue } = event.data;

      switch (type) {
        case "init-success":
          setIsPyodideLoading(false);
          const initPromise = pendingPromises.get(id);
          if (initPromise) {
            initPromise.resolve(true);
            pendingPromises.delete(id);
          }
          break;
        case "init-error":
          setIsPyodideLoading(false);
          setPyodideError(error || "Unknown Pyodide initialization error.");
          const initErrorPromise = pendingPromises.get(id);
          if (initErrorPromise) {
            initErrorPromise.reject(error);
            pendingPromises.delete(id);
          }
          break;
        case "execute-success":
          setIsExecuting(false);
          setPyodideOutput(output || "");
          setPyodideError(null);
          const execPromise = pendingPromises.get(id);
          if (execPromise) {
            execPromise.resolve({ output: output, returnValue: returnValue });
            pendingPromises.delete(id);
          }
          break;
        case "execute-error":
          setIsExecuting(false);
          setPyodideOutput(output || "");
          setPyodideError(error || "Unknown Python execution error.");
          const execErrorPromise = pendingPromises.get(id);
          if (execErrorPromise) {
            execErrorPromise.resolve({ output: output, returnValue: error });
            pendingPromises.delete(id);
          }
          break;
      }
    };

    worker.onerror = (err) => {
      console.error("Pyodide Worker error:", err);
      setPyodideError("A critical error occurred in the Pyodide worker.");
      setIsPyodideLoading(false);
      setIsExecuting(false);
    };

    const initId = generateID();

    worker.postMessage({ id: initId, type: "init" });
    return new Promise((resolve, reject) => {
      pendingPromises.set(initId, { resolve, reject });
    });
  });

  onCleanup(() => {
    if (worker) {
      worker.terminate();
      worker = undefined;
    }
  });

  const executePython = async (code: string) => {
    if (!worker || isPyodideLoading()) {
      setPyodideError("Pyodide is not ready yet.");
      return;
    }
    setIsExecuting(true);
    setPyodideOutput("");
    setPyodideError(null);

    const id = generateID();

    return new Promise<{ output: string; returnValue: string } | null>(
      (resolve, reject) => {
        pendingPromises.set(id, { resolve, reject });

        worker!.postMessage({
          id,
          type: "execute",
          payload: { code },
        });
      }
    );
  };

  return {
    isPyodideLoading,
    isExecuting,
    pyodideOutput,
    pyodideError,
    executePython,
  };
}

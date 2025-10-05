import { createSignal, onCleanup, onMount } from "solid-js";
import { generateID } from "../lib/generateID.ts";

import PyodideWorker from "../workers/pyodide.worker.ts?worker";

type WorkerMessage = {
  id: string;
  type: string;
  payload?: unknown;
  output?: string;
  error?: string;
  returnValue?: string;
};

type PendingPromiseValue =
  | boolean
  | WorkerMessage
  | { output: string; returnValue: string }
  | unknown;

const pendingPromises = new Map<
  string,
  {
    resolve: (value: PendingPromiseValue) => void;
    reject: (reason?: unknown) => void;
  }
>();

const CONTROL_BYTE_LENGTH = 8;
const SHARED_MEM_SIZE = 10 * 1024; // 10 KB
const textEncoder = new TextEncoder();

/**
 * Write a string into the shared memory buffer for stdin.
 * @param sab The SharedArrayBuffer shared between main thread and worker
 * @param input The string to write (newline appended if missing)
 */
function writeInput(sab: SharedArrayBuffer, input: string) {
  const withNewLine = input.endsWith("\n") ? input : input + "\n";

  const bytes = textEncoder.encode(withNewLine);

  const control = new Int32Array(sab, 0, 2);
  const dataView = new Uint8Array(sab, CONTROL_BYTE_LENGTH);

  if (bytes.length > dataView.byteLength) {
    throw new Error("Input too large for shared memory buffer.");
  }

  // copy into shared buffer
  dataView.fill(0);
  dataView.set(bytes, 0);

  // record length & flag
  Atomics.store(control, 1, bytes.length); // length of data
  Atomics.store(control, 0, 1); // flag = 1 (data ready)

  // wake up the worker
  Atomics.notify(control, 0, 1);
}

export function usePyodide() {
  const [isPyodideLoading, setIsPyodideLoading] = createSignal(true);
  const [pyodideOutput, setPyodideOutput] = createSignal("");
  const [pyodideError, setPyodideError] = createSignal<string | null>(null);
  const [isExecuting, setIsExecuting] = createSignal(false);

  let worker: Worker | undefined;

  onMount(() => {
    worker = new PyodideWorker();

    if (!worker || !(worker instanceof Worker)) {
      console.error("Failed to create Pyodide worker.");
      return;
    }

    const sharedMem = new SharedArrayBuffer(SHARED_MEM_SIZE);

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const { id, type, output, error, returnValue } = event.data;

      if (type === "init-success") {
        setIsPyodideLoading(false);
        const initPromise = pendingPromises.get(id);
        if (initPromise) {
          initPromise.resolve(true);
          pendingPromises.delete(id);
        }
        return;
      }
      if (type === "init-error") {
        setIsPyodideLoading(false);
        setPyodideError(error || "Unknown Pyodide initialization error.");
        const initErrorPromise = pendingPromises.get(id);
        if (initErrorPromise) {
          initErrorPromise.reject(error);
          pendingPromises.delete(id);
        }
        return;
      }
      if (type === "input-request") {
        const answer = prompt("Pyodide is requesting input:");
        writeInput(sharedMem, answer || "");
        return;
      }
      if (type === "execute-success") {
        setIsExecuting(false);
        setPyodideOutput(output || "");
        setPyodideError(null);
        const execPromise = pendingPromises.get(id);
        if (execPromise) {
          execPromise.resolve({ output: output, returnValue: returnValue });
          pendingPromises.delete(id);
        }
        return;
      }
      if (type === "execute-error") {
        setIsExecuting(false);
        setPyodideOutput(output || "");
        setPyodideError(error || "Unknown Python execution error.");
        const execErrorPromise = pendingPromises.get(id);
        if (execErrorPromise) {
          execErrorPromise.resolve({ output: output, returnValue: error });
          pendingPromises.delete(id);
        }
        return;
      }
    };

    worker.onerror = (err) => {
      console.error("Pyodide Worker error:", err);
      setPyodideError("A critical error occurred in the Pyodide worker.");
      setIsPyodideLoading(false);
      setIsExecuting(false);
    };

    const initId = generateID();

    worker.postMessage({ id: initId, type: "init", payload: sharedMem });
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

  const executePython = (
    files: { name: string; content: string }[],
    entrypoint: string
  ) => {
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
          payload: { files, entrypoint },
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

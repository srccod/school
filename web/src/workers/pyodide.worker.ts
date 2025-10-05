/// <reference lib="webworker" />

import { loadPyodide, type PyodideInterface } from "pyodide";

let pyodide: PyodideInterface | null = null;
let captureOutput = "";
let sharedMem: SharedArrayBuffer | null = null;
let control: Int32Array | null = null;
let dataView: Uint8Array | null = null;
const CONTROL_BYTE_LENGTH = 8;
const textDecoder = new TextDecoder();

function initSharedMem(sab: SharedArrayBuffer) {
  sharedMem = sab;
  control = new Int32Array(sab, 0, 2);
  dataView = new Uint8Array(sab, CONTROL_BYTE_LENGTH);

  Atomics.store(control, 0, 0); // flag = 0
  Atomics.store(control, 1, 0); // length = 0
}

function stdinSync() {
  if (!sharedMem || !control) {
    throw new Error("Shared memory not initialized in pyodide worker.");
  }

  let flag = Atomics.load(control, 0);
  if (flag === 1) {
    const len = Atomics.load(control, 1);
    const bytes = dataView!.subarray(0, len);
    const copy = new Uint8Array(len);
    copy.set(bytes);
    const s = textDecoder.decode(copy);

    // Reset flag to 0 to indicate data has been read
    Atomics.store(control, 0, 0);
    Atomics.store(control, 1, 0);
    return s;
  }

  if (flag === 2) {
    // EOF signal
    return null;
  }

  self.postMessage({ type: "input-request" });

  // Wait until main thread writes input
  Atomics.wait(control, 0, 0);

  flag = Atomics.load(control, 0);
  if (flag === 1) {
    const len = Atomics.load(control, 1);
    const bytes = dataView!.subarray(0, len);
    const copy = new Uint8Array(len);
    copy.set(bytes);
    const s = textDecoder.decode(copy);

    Atomics.store(control, 0, 0);
    Atomics.store(control, 1, 0);
    return s;
  }

  return null;
}

function write(buffer: Uint8Array): number {
  const chunk = textDecoder.decode(buffer, { stream: true });
  captureOutput += chunk;
  return buffer.length;
}

function setupOutputCapture() {
  captureOutput = "";

  if (pyodide) {
    pyodide.setStdout({
      // isatty: true,
      write,
    });
    pyodide.setStderr({
      // isatty: true,
      write,
    });
  }
}

self.onmessage = async (event: MessageEvent) => {
  const { id, type, payload } = event.data;

  if (type === "init") {
    try {
      if (!pyodide) {
        initSharedMem(payload);
        pyodide = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/",
        });
        pyodide.setStdin({ stdin: () => stdinSync() });
        setupOutputCapture();
        console.log("Pyodide initialized in worker.");
      }

      self.postMessage({ id, type: "init-success" });
      return;
    } catch (error) {
      console.error("Failed to initialize Pyodide in worker:", error);
      self.postMessage({
        id,
        type: "init-error",
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return;
  }

  if (type === "execute") {
    if (!pyodide) {
      self.postMessage({
        id,
        type: "execute-error",
        error: "Pyodide not initialized.",
      });
      return;
    }
    const { files, entrypoint } = payload;
    for (const file of files) {
      pyodide.FS.writeFile(file.name, file.content);
    }
    setupOutputCapture();

    try {
      // reset globals
      const globals = pyodide.globals.get("dict")();
      const entrypointContent = files.find(
        (f: { name: string; content: string }) => f.name === entrypoint
      )?.content;
      if (!entrypointContent) {
        throw new Error(`Entrypoint file "${entrypoint}" not found.`);
      }
      const result = await pyodide.runPythonAsync(entrypointContent, {
        globals,
      });

      globals.destroy();

      self.postMessage({
        id,
        type: "execute-success",
        output: captureOutput,
        returnValue: String(result),
      });
    } catch (error) {
      console.error("Python execution error:", error);
      self.postMessage({
        id,
        type: "execute-error",
        output: captureOutput,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return;
  }
};

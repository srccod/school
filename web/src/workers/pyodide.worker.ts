/// <reference lib="webworker" />

import { loadPyodide, type PyodideInterface } from "pyodide";

let pyodide: PyodideInterface | null = null;
let captureOutput = "";
const textDecoder = new TextDecoder("utf-8");

function write(buffer: Uint8Array): number {
  const chunk = textDecoder.decode(buffer, { stream: true });
  captureOutput += chunk;
  return buffer.length;
}

function setupOutputCapture() {
  captureOutput = "";

  if (pyodide) {
    pyodide.setStdout({
      isatty: true,
      write,
    });
    pyodide.setStderr({
      isatty: true,
      write,
    });
  }
}

self.onmessage = async (event: MessageEvent) => {
  const { id, type, payload } = event.data;

  switch (type) {
    case "init":
      try {
        if (!pyodide) {
          pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/",
          });
          console.log("Pyodide initialized in worker.");
        }
        setupOutputCapture();

        self.postMessage({ id, type: "init-success" });
      } catch (error) {
        console.error("Failed to initialize Pyodide in worker:", error);
        self.postMessage({
          id,
          type: "init-error",
          error: error instanceof Error ? error.message : String(error),
        });
      }
      break;

    case "execute": {
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
      break;
    }

    default:
      console.warn("Unknown message type:", type);
  }
};

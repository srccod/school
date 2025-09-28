export type CodeMod = {
  files: { id: string; name: string; content: string }[];
  instructions: string;
};

const calculator = `
def add(a, b):
  return a + b

def subtract(a, b):
  return a - b

def multiply(a, b):
  return a * b

def divide(a, b):
  return a / b
`;

export const codeMods: Record<string, CodeMod> = {
  calculator: {
    files: [
      {
        id: "FAKE_ID_1",
        name: "calculator.py",
        content: calculator,
      },
    ],
    instructions: `# Calculator
      
      This module provides basic arithmetic functions: 
        - addition
        - subtraction
        - multiplication
        - division
      `,
  },
  "hello-world": {
    files: [
      {
        id: "FAKE_ID_2",
        name: "main.py",
        content: `from utils import say_hello\n\nsay_hello("World")`,
      },
      {
        id: "FAKE_ID_3",
        name: "utils.py",
        content: `def say_hello(name):\n   print(f"Hello, {name}!")`,
      },
    ],
    instructions: "This is a simple hello world program.",
  },
  "getting-started": {
    files: [
      {
        id: "FAKE_ID_4",
        name: "main.py",
        content: `print("Welcome to the Python coding environment!")\n\n# Try modifying this print statement and run the code.`,
      },
    ],
    instructions:
      "This is a simple Python coding environment. You can write and execute Python code here. Try modifying the existing code or adding new code to get started!",
  },
};

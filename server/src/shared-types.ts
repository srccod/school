// Shared types between server and web
export type Instruction = {
  text: string;
};

export type Module = {
  id: string;
  slug: string;
  name: string;
  instructions: Instruction[];
  createdAt: Date;
  updatedAt: Date;
};

export type FileResponse = {
  id: string;
  name: string;
  content: string;
  isEntryPoint: boolean;
  sortOrder: number;
};

export type ModuleResponse = Module & { files: FileResponse[] };

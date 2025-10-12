export type {
  ModuleResponse,
  Instruction,
  Module,
  FileResponse,
} from "../../server/src/shared-types.ts";

export type LoginForm = {
  username: string;
  password: string;
};

export type CreateAccountForm = {
  username: string;
  email: string;
  name: string;
  password: string;
};

import * as authSchema from "./auth-schema.ts";
import * as moduleSchema from "./module-schema.ts";

export const schema = { ...authSchema, ...moduleSchema };

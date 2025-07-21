import { createForm } from "@modular-forms/solid";
import { useNavigate } from "@solidjs/router";
import { useUser } from "../stores/user.tsx";
import type { LoginForm } from "../types.ts";
import { Button } from "./ui/button.tsx";
import { Grid } from "./ui/Grid.tsx";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/TextField.tsx";

export default function Login() {
  const [_loginForm, { Form, Field }] = createForm<LoginForm>();
  const { login } = useUser();
  const navigate = useNavigate();

  async function handleSubmit(form: LoginForm) {
    await login(form, navigate);
  }

  return (
    <div class="mx-auto mt-20 flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div class="flex flex-col space-y-2 text-center">
        <h1 class="text-2xl font-semibold tracking-tight">login</h1>
        <div class="grid gap-6">
          <Form onSubmit={handleSubmit}>
            <Grid class="gap-4">
              <Field name="username">
                {(_, props) => (
                  <TextField class="gap-1">
                    <TextFieldLabel class="sr-only">username</TextFieldLabel>
                    <TextFieldInput placeholder="username" {...props} />
                  </TextField>
                )}
              </Field>
              <Field name="password">
                {(_, props) => (
                  <TextField class="gap-1">
                    <TextFieldLabel class="sr-only">password</TextFieldLabel>
                    <TextFieldInput
                      type="password"
                      placeholder="password"
                      {...props}
                    />
                  </TextField>
                )}
              </Field>
              <Button type="submit" variant="default" class="font-bold">
                let me in
              </Button>
            </Grid>
          </Form>
        </div>
      </div>
    </div>
  );
}

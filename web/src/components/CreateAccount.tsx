
import { createForm } from "@modular-forms/solid";
import { useNavigate } from "@solidjs/router";
import { useUser } from "../stores/user.tsx";
import type { CreateAccountForm } from "../types.ts";
import { Button } from "./ui/Button.tsx";
import { Grid } from "./ui/Grid.tsx";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/TextField.tsx";

export default function CreateAccount() {
  const [_createAccountForm, { Form, Field }] = createForm<CreateAccountForm>();
  const { createAccount } = useUser();
  const navigate = useNavigate();

  async function handleSubmit(form: CreateAccountForm) {
    await createAccount(form, navigate);
  }

  return (
    <div class="mx-auto mt-20 flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div class="flex flex-col space-y-2 text-center">
        <h1 class="text-2xl font-semibold tracking-tight">create account</h1>
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
              <Field name="email">
                {(_, props) => (
                  <TextField class="gap-1">
                    <TextFieldLabel class="sr-only">email</TextFieldLabel>
                    <TextFieldInput placeholder="email" {...props} />
                  </TextField>
                )}
              </Field>
              <Field name="name">
                {(_, props) => (
                  <TextField class="gap-1">
                    <TextFieldLabel class="sr-only">name</TextFieldLabel>
                    <TextFieldInput placeholder="name" {...props} />
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
                create account
              </Button>
            </Grid>
          </Form>
        </div>
      </div>
    </div>
  );
}

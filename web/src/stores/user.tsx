import type { Navigator } from "@solidjs/router";
import type { ParentProps } from "solid-js";
import { createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { authClient } from "../lib/authClient.ts";
import type { CreateAccountForm, LoginForm } from "../types.ts";

type User = {
  banExpires: Date | null;
  banReason: string | null;
  banned: boolean | null;
  createdAt: Date | null;
  displayUsername: string | null;
  email: string | null;
  emailVerified: boolean | null;
  id: string | null;
  image: string | null;
  isLoggedIn: boolean;
  name: string | null;
  role: string | null;
  updatedAt: Date | null;
  username: string | null;
};

const createInitialUserState = (): User => ({
  banExpires: null,
  banReason: null,
  banned: null,
  createdAt: null,
  displayUsername: null,
  email: null,
  emailVerified: null,
  id: null,
  image: null,
  isLoggedIn: false,
  name: null,
  role: "user",
  updatedAt: null,
  username: null,
});

function createUserStore() {
  const [user, setUser] = createStore<User>(createInitialUserState());

  const initialize = async (navigate: Navigator) => {
    const { data: session } = await authClient.getSession();
    if (session?.user) {
      setUser(
        { ...session.user, isLoggedIn: true },
      );
    } else {
      setUser(createInitialUserState());
      navigate("/login", { replace: true });
    }
  };

  const login = async (form: LoginForm, navigate: Navigator) => {
    const { data } = await authClient.signIn.username({
      username: form.username,
      password: form.password,
    });

    if (data) {
      setUser({
        ...data.user,
        isLoggedIn: true,
      });

      navigate("/");
    }
  };

  const createAccount = async (
    form: CreateAccountForm,
    navigate: Navigator,
  ) => {
    const { data } = await authClient.signUp.email({
      username: form.username,
      password: form.password,
      email: form.email,
      name: form.name,
    });

    if (data) {
      setUser({
        ...data.user,
        isLoggedIn: true,
      });

      navigate("/");
    }
  };

  const logout = async (navigate: Navigator) => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setUser(createInitialUserState());
          navigate("/login");
        },
      },
    });
  };

  return {
    createAccount,
    initialize,
    login,
    logout,
    user,
  };
}

type UserStore = ReturnType<typeof createUserStore>;
const UserContext = createContext<UserStore>(createUserStore());

export function UserProvider(props: ParentProps) {
  const userStore = createUserStore();

  return (
    <UserContext.Provider value={userStore}>
      {props.children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

import { useNavigate, type RouteSectionProps } from "@solidjs/router";
import { createResource } from "solid-js";
import { useUser } from "../stores/user.tsx";

export default function Protected(props: RouteSectionProps) {
  const { initialize } = useUser();
  const navigate = useNavigate();

  createResource(() => initialize(navigate));

  return <>{props.children}</>;
}

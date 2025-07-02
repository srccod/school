import { type ComponentProps, splitProps } from "solid-js";

import { cn } from "../lib/utils.ts";

type IconProps = ComponentProps<"svg">;

const Icon = (props: IconProps) => {
  const [, rest] = splitProps(props, ["class"]);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class={cn("size-4", props.class)}
      {...rest}
    />
  );
};

export const RunIcon = (props: IconProps) => {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" />
    </Icon>
  );
};

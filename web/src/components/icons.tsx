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

export const ChevronLeftIcon = (props: IconProps) => {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M15 6l-6 6l6 6" />
    </Icon>
  );
};

export const ChevronRightIcon = (props: IconProps) => {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M9 6l6 6l-6 6" />
    </Icon>
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

export const StopIcon = (props: IconProps) => {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M5 5m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z" />
    </Icon>
  );
};

export const SaveIcon = (props: IconProps) => {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2" />
      <path d="M12 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <path d="M14 4l0 4l-6 0l0 -4" />
    </Icon>
  );
};

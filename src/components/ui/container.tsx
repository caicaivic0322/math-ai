import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "../../lib/theme";

type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

type ContainerProps<T extends ElementType = "div"> = {
  as?: T;
  size?: ContainerSize;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "size">;

const sizeClasses: Record<ContainerSize, string> = {
  sm: "max-w-[var(--container-sm)]",
  md: "max-w-[var(--container-md)]",
  lg: "max-w-[var(--container-lg)]",
  xl: "max-w-[var(--container-xl)]",
  full: "max-w-none",
};

export function Container<T extends ElementType = "div">({
  as,
  size = "xl",
  className,
  ...props
}: ContainerProps<T>) {
  const Component = (as ?? "div") as ElementType;

  return (
    <Component
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}

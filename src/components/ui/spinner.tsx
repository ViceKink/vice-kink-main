
import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Spinner = ({ className, ...props }: SpinnerProps) => {
  return (
    <div
      className={cn("animate-spin h-6 w-6 rounded-full border-2 border-primary border-t-transparent", className)}
      {...props}
    />
  );
};

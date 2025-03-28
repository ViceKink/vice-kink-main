
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

export interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode;
  label?: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, icon, label, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn("p-2", className)}
        {...props}
      >
        {icon}
        {label && <span className="sr-only">{label}</span>}
        {children}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";

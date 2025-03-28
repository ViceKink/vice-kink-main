
import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface FileInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  accept?: string
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, accept, ...props }, ref) => {
    return (
      <Input
        type="file"
        className={cn(
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "file:mr-4 file:py-2 file:px-4",
          "file:bg-primary/10 file:text-primary hover:file:bg-primary/5",
          "file:rounded-md file:cursor-pointer",
          className
        )}
        ref={ref}
        accept={accept}
        {...props}
      />
    )
  }
)
FileInput.displayName = "FileInput"

export { FileInput }

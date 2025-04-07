
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const chatVariants = cva(
  "relative flex w-full flex-col gap-2 p-4",
  {
    variants: {
      variant: {
        default: "bg-background",
        secondary: "bg-secondary/10",
      },
      size: {
        default: "",
        sm: "p-2",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ChatProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatVariants> {}

const Chat = React.forwardRef<HTMLDivElement, ChatProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(chatVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Chat.displayName = "Chat"

export { Chat }

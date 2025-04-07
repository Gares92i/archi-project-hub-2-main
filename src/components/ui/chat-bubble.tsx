
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const chatBubbleVariants = cva(
  "relative rounded-lg px-3 py-2 text-sm w-max max-w-[calc(100%-5rem)]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        ghost: "border border-border",
        muted: "bg-muted text-muted-foreground",
      },
      position: {
        start: "rounded-bl-none",
        middle: "",
        end: "rounded-br-none",
      },
      align: {
        start: "self-start",
        center: "self-center",
        end: "self-end",
      },
    },
    defaultVariants: {
      variant: "default",
      position: "middle",
      align: "start",
    },
  }
)

export interface ChatBubbleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatBubbleVariants> {}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ className, variant, position, align, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(chatBubbleVariants({ variant, position, align, className }))}
        {...props}
      />
    )
  }
)
ChatBubble.displayName = "ChatBubble"

const ChatBubbleHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs text-foreground/50 mb-1", className)}
    {...props}
  />
))
ChatBubbleHeader.displayName = "ChatBubbleHeader"

const ChatBubbleFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs text-foreground/50 mt-1", className)}
    {...props}
  />
))
ChatBubbleFooter.displayName = "ChatBubbleFooter"

export { ChatBubble, ChatBubbleHeader, ChatBubbleFooter }

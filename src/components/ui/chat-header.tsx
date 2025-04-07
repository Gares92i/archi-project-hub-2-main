
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ChatHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const ChatHeader = React.forwardRef<HTMLDivElement, ChatHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between border-b p-4",
          className
        )}
        {...props}
      />
    )
  }
)
ChatHeader.displayName = "ChatHeader"

export { ChatHeader }

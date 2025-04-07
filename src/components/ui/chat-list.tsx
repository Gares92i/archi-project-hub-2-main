
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ChatListProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const ChatList = React.forwardRef<HTMLDivElement, ChatListProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-4 overflow-y-auto p-4",
          className
        )}
        {...props}
      />
    )
  }
)
ChatList.displayName = "ChatList"

export { ChatList }

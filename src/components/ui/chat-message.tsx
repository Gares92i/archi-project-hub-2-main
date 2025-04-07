
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ChatMessageProps
  extends React.HTMLAttributes<HTMLDivElement> {
  name?: string
  avatar?: string
  message: string
  timestamp?: string
  side?: "left" | "right"
}

const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  (
    {
      className,
      name,
      avatar,
      message,
      timestamp,
      side = "left",
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-start gap-2.5",
          side === "right" && "flex-row-reverse",
          className
        )}
        {...props}
      >
        {avatar && (
          <img
            src={avatar}
            alt={`Avatar de ${name}`}
            className="h-8 w-8 rounded-full"
          />
        )}
        <div
          className={cn(
            "flex flex-col gap-1.5",
            side === "right" ? "items-end" : "items-start"
          )}
        >
          {name && (
            <span className="text-xs text-muted-foreground">{name}</span>
          )}
          <p
            className={cn(
              "rounded-lg px-3 py-2 text-sm",
              side === "left"
                ? "bg-secondary text-secondary-foreground"
                : "bg-primary text-primary-foreground"
            )}
          >
            {message}
          </p>
          {timestamp && (
            <span className="text-xs text-muted-foreground">
              {timestamp}
            </span>
          )}
        </div>
      </div>
    )
  }
)
ChatMessage.displayName = "ChatMessage"

export { ChatMessage }

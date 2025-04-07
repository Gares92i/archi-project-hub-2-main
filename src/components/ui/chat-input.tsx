
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

export interface ChatInputProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onSend?: (message: string) => void
  disabled?: boolean
}

const ChatInput = React.forwardRef<HTMLDivElement, ChatInputProps>(
  ({ className, onSend, disabled = false, ...props }, ref) => {
    const [message, setMessage] = React.useState("")

    const handleSend = () => {
      if (message.trim() !== "" && !disabled) {
        onSend?.(message)
        setMessage("")
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 border-t p-4",
          className
        )}
        {...props}
      >
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !disabled) {
              handleSend()
            }
          }}
          placeholder="Type your message..."
          className="flex-1"
          disabled={disabled}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSend}
          disabled={message.trim() === "" || disabled}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    )
  }
)
ChatInput.displayName = "ChatInput"

export { ChatInput }

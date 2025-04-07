
import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface ExpandableChatProps
  extends React.HTMLAttributes<HTMLDivElement> {
  initiallyExpanded?: boolean
}

const ExpandableChat = React.forwardRef<HTMLDivElement, ExpandableChatProps>(
  ({ className, children, initiallyExpanded = false, ...props }, ref) => {
    const [isExpanded, setIsExpanded] = React.useState(initiallyExpanded)

    const toggleExpand = () => {
      setIsExpanded(!isExpanded)
    }

    return (
      <div 
        ref={ref}
        className={cn(
          "relative flex flex-col border rounded-lg",
          isExpanded ? "h-[500px]" : "h-16",
          "transition-all duration-300 ease-in-out overflow-hidden",
          className
        )}
        {...props}
      >
        <div className="absolute top-0 left-0 right-0 flex justify-center items-center h-16 border-b">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleExpand}
            className="absolute right-4"
          >
            {isExpanded ? <ChevronDown /> : <ChevronUp />}
          </Button>
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>
        
        <div className={cn(
          "flex-1 overflow-y-auto mt-16 p-4",
          !isExpanded && "hidden"
        )}>
          {children}
        </div>
      </div>
    )
  }
)

ExpandableChat.displayName = "ExpandableChat"

export { ExpandableChat }

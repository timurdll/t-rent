import * as React from "react"
import { cn } from "@/src/shared/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  asChild?: boolean
}

type ButtonRef = HTMLButtonElement

const Button = React.forwardRef<ButtonRef, ButtonProps>(
  ({ className, variant = "primary", size = "default", asChild = false, children, ...props }, ref) => {
    const mergedClassName = cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
      {
        "bg-primary text-dark hover:bg-primary-hover shadow-sm": variant === "primary",
        "bg-dark text-white hover:bg-dark/90 shadow-sm": variant === "secondary",
        "border border-gray-200 bg-transparent hover:bg-gray-100 text-dark": variant === "outline",
        "hover:bg-gray-100 text-dark": variant === "ghost",
        "h-9 px-4 py-2": size === "default",
        "h-8 rounded-md px-3 text-xs": size === "sm",
        "h-12 rounded-md px-8 text-base": size === "lg",
      },
      className
    )

    if (asChild) {
      if (!React.isValidElement(children)) return null

      const child = children as React.ReactElement<{ className?: string }>
      return React.cloneElement(child, {
        className: cn(child.props.className, mergedClassName),
      })
    }

    return (
      <button ref={ref} className={mergedClassName} {...props}>
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }

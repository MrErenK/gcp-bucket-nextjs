import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const tooltipVariants = cva(
  [
    "z-50 overflow-hidden rounded-md",
    "border",
    "bg-background",
    "px-3 py-1.5 text-sm text-foreground",
    "shadow-md animate-in fade-in-0",
    "zoom-in-95 data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
    "data-[side=bottom]:slide-in-from-top-2",
    "data-[side=left]:slide-in-from-right-2",
    "data-[side=right]:slide-in-from-left-2",
    "data-[side=top]:slide-in-from-bottom-2",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "shadow-md",
        error:
          "bg-destructive/90 text-destructive-foreground border-destructive/20",
        success: "bg-green-500/90 text-white border-green-600/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface TooltipProps extends TooltipPrimitive.TooltipContentProps {
  variant?: "default" | "error" | "success";
  delayDuration?: number;
  text: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  showArrow?: boolean;
}

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipTrigger = TooltipPrimitive.Trigger;

const Tooltip = ({
  children,
  text,
  delayDuration = 200,
  variant,
  side = "top",
  align = "center",
  showArrow = true,
  className,
  ...props
}: {
  children: React.ReactNode;
} & TooltipProps) => {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            className={cn(tooltipVariants({ variant }), className)}
            {...props}
          >
            {text}
            {showArrow && (
              <TooltipPrimitive.Arrow
                className={cn(
                  "fill-background/95",
                  "border-border",
                  variant === "error" && "fill-destructive/90",
                  variant === "success" && "fill-green-500/90",
                )}
                width={11}
                height={5}
              />
            )}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipProvider>
  );
};

export { Tooltip, TooltipTrigger, TooltipProvider };

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "text-foreground",
        error: "text-destructive",
        success: "text-green-500",
      },
      size: {
        default: "text-sm",
        sm: "text-xs",
        lg: "text-base",
      },
      required: {
        true: "after:content-['*'] after:ml-0.5 after:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  optional?: boolean;
}

const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  LabelProps
>(
  (
    { className, variant, size, required, optional, children, ...props },
    ref,
  ) => (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        labelVariants({ variant, size, required }),
        "select-none",
        className,
      )}
      {...props}
    >
      {children}
      {optional && (
        <span className="ml-1 text-xs text-muted-foreground">(Optional)</span>
      )}
    </LabelPrimitive.Root>
  ),
);
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };

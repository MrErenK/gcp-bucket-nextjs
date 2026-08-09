import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Label } from "./label";
import { LoadingIcon } from "./Icons";

const inputVariants = cva(
  "flex w-full transition-all duration-200 bg-transparent",
  {
    variants: {
      variant: {
        default:
          "border-2 border-input hover:border-foreground/40 focus:border-primary",
        ghost:
          "border-none shadow-none focus:border-none placeholder:text-muted-foreground/50",
        error:
          "border-2 border-destructive hover:border-destructive focus:border-destructive",
      },
      size: {
        default: "h-10 px-3 py-2 text-sm",
        sm: "h-8 px-2 py-1 text-xs",
        lg: "h-12 px-4 py-3 text-base",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  },
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  error?: string;
  label?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      variant,
      size,
      rounded,
      type,
      error,
      label,
      helperText,
      leftIcon,
      rightIcon,
      loading,
      disabled,
      ...props
    },
    ref,
  ) => {
    const inputClassName = cn(
      inputVariants({ variant, size, rounded }),
      "file:border-0 file:bg-transparent file:text-sm file:font-medium",
      "placeholder:text-muted-foreground/60",
      "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20",
      "disabled:cursor-not-allowed disabled:opacity-50",
      leftIcon && "pl-10",
      rightIcon && "pr-10",
      className,
    );

    return (
      <div className={cn("w-full", wrapperClassName)}>
        {label && (
          <Label htmlFor={props.id} className={cn(error && "text-destructive")}>
            {label}
          </Label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          <input
            type={type}
            className={inputClassName}
            ref={ref}
            disabled={disabled || loading}
            aria-describedby={
              error
                ? `${props.id}-error`
                : helperText
                  ? `${props.id}-description`
                  : undefined
            }
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}

          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <LoadingIcon className="h-4 w-4 animate-spin" />
            </div>
          )}
        </div>

        {helperText && !error && (
          <p
            id={`${props.id}-description`}
            className="mt-1.5 text-xs text-muted-foreground"
          >
            {helperText}
          </p>
        )}

        {error && (
          <p
            id={`${props.id}-error`}
            className="mt-1.5 text-xs text-destructive"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };

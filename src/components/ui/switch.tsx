import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  label?: string;
  description?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, label, description, size = "md", ...props }, ref) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          root: "w-[34px] h-[18px]",
          thumb: "w-[14px] h-[14px] data-[state=checked]:translate-x-[18px]",
        };
      case "lg":
        return {
          root: "w-[54px] h-[28px]",
          thumb: "w-[22px] h-[22px] data-[state=checked]:translate-x-[28px]",
        };
      default:
        return {
          root: "w-[44px] h-[24px]",
          thumb: "w-[18px] h-[18px] data-[state=checked]:translate-x-[22px]",
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className="flex items-center gap-x-4">
      <SwitchPrimitives.Root
        className={cn(
          "peer relative shrink-0",
          sizeClasses.root,
          "cursor-pointer rounded-full transition-colors",
          "border-2 border-transparent",
          "focus-visible:outline-hidden focus-visible:ring-2",
          "focus-visible:ring-primary/20 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
          "hover:data-[state=checked]:bg-primary/90 hover:data-[state=unchecked]:bg-input/80",
          className,
        )}
        {...props}
        ref={ref}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            "pointer-events-none block rounded-full",
            "bg-background shadow-lg ring-0",
            "transition-transform duration-200",
            "data-[state=unchecked]:translate-x-0",
            sizeClasses.thumb,
          )}
        />
      </SwitchPrimitives.Root>
      {(label || description) && (
        <div className="flex flex-col gap-y-0.5">
          {label && (
            <Label className="cursor-pointer text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {label}
            </Label>
          )}
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
        </div>
      )}
    </div>
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };

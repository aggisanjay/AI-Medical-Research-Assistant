import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#2563EB] text-white shadow-none hover:bg-blue-600",
        destructive: "bg-destructive text-destructive-foreground shadow-none hover:bg-destructive/90",
        outline:
          "border border-white/20 bg-transparent text-white shadow-none hover:bg-white/5 hover:border-white/40",
        secondary: "bg-[#18181b] text-white border border-white/10 shadow-none hover:bg-[#27272a]",
        white: "bg-white text-black hover:bg-slate-100 font-semibold shadow-none",
        ghost: "hover:bg-white/5 text-slate-300 hover:text-white shadow-none",
        link: "text-[#2563EB] underline-offset-4 hover:underline shadow-none hover:scale-100",
      },
      size: {
        default: "h-9 px-5 py-2",
        sm: "h-8 rounded-full px-3.5 text-[11px]",
        lg: "h-11 rounded-full px-7 text-sm",
        icon: "h-9 w-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

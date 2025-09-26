import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-2",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white border-transparent hover:bg-white hover:text-blue-600 hover:border-blue-600",
        success:
          "bg-green-600 text-white border-transparent hover:bg-white hover:text-green-600 hover:border-green-600",
        destructive:
          "bg-red-600 text-white border-transparent hover:bg-white hover:text-red-600 hover:border-red-600",
        outline:
          "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-white text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white",
        gradient:
          "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent  hover:scale-105 hover:shadow-lg transition-all duration-300",
        ghost:
          "bg-transparent text-foreground border-transparent hover:bg-accent hover:text-accent-foreground",
        link: "bg-transparent text-primary border-transparent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10 p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

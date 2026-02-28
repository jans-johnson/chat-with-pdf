import * as React from "react";
import { Icon, type IconProps } from "../ui/icon";
import { cn } from "@/lib/utils";

// PdfWizard Icon component (wizard hat)
export const AskPdfIcon = React.forwardRef<
  SVGSVGElement,
  Omit<IconProps, "children">
>(({ className, size, viewBox = "0 0 36 36", ...props }, ref) => {
  return (
    <Icon
      ref={ref}
      viewBox={viewBox}
      className={cn("text-emerald-500", className)}
      size={size}
      {...props}
    >
      <path
        d="M18 4L8 30H28L18 4Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M18 4L14 15L22 15L18 4Z"
        fill="currentColor"
        opacity="0.6"
      />
      <circle cx="18" cy="10" r="1.2" fill="white" opacity="0.8" />
      <path
        d="M5 30H31"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </Icon>
  );
});

AskPdfIcon.displayName = "AskPdfIcon";

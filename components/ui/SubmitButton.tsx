"use client";

import { useFormStatus } from "react-dom";
import { Button, ButtonProps } from "./Button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps extends Omit<ButtonProps, "type"> {
  loadingText?: string;
}

export function SubmitButton({ children, loadingText, className, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className={className} {...props}>
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin mr-2" />
          {loadingText ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

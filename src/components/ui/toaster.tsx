
"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useCookieConsent } from "@/context/cookie-context"
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts } = useToast()
  const { consent } = useCookieConsent();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isBannerVisible = isClient && !consent.necessary;

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className={cn(isBannerVisible && "bottom-16 sm:bottom-12 transition-all duration-300")} />
    </ToastProvider>
  )
}

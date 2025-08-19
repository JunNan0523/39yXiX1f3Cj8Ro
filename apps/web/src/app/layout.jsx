"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-gray-900 text-white">{children}</div>
          <Toaster
            theme="dark"
            position="top-right"
            richColors
            closeButton
            expand
            toastOptions={{
              style: {
                background: "var(--gray-800)",
                border: "1px solid var(--gray-700)",
              },
            }}
            offset="16px"
            visibleToasts={3}
          />
        </QueryClientProvider>
      </body>
    </html>
  );
}

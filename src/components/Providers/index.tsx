'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";

export type ProvidersProps = {
    children: React.ReactNode;
}

const client =  new QueryClient();
export function Providers({ children }: ProvidersProps) {
    return (
        <>
        <ToastContainer position="top-right" autoClose={2500} role="alert" />
             <QueryClientProvider client={client}>
               {children}
            </QueryClientProvider>
        </>
    )
}

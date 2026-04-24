/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    startAuth: () => Promise<{ status: string; url?: string; success?: boolean; error?: string }>;
    submitAuthCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  };
}

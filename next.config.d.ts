// next.config.d.ts
/// <reference types="next" />
/// <reference types="next/types/global" />

declare module 'next/config' {
    type Config = {
      env: {
        DEEPSEEK_API_ENDPOINT?: string;
        NEXT_PUBLIC_SUPABASE_URL?: string;
        NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
        DEEPSEEK_API_KEY?: string;
        SUPABASE_SERVICE_KEY?: string;
      };
      publicRuntimeConfig: Config['env'];
      serverRuntimeConfig: Config['env'];
    };
    export declare function getConfig(): Config;
  }
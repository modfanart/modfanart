declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    AWS_REGION: string;
    AWS_ACCESS_KEY_ID?: string;
    AWS_SECRET_ACCESS_KEY?: string;

    JWT_SECRET?: string;
    BYPASS_AUTH?: string;

    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;

    BLOB_STORAGE_KEY?: string;
    DUCKDB_CONNECTION_STRING?: string;

    EDGE_CONFIG?: string;
    EDGE_CONFIG_KEY?: string;

    OPENAI_API_KEY?: string;
    AIORNOT_API_KEY?: string;
    GROK_API_KEY?: string;

    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;

    NEXT_PUBLIC_APP_URL?: string;
    NEXT_PUBLIC_DEBUG?: string;

    DEBUG?: string;
  }
}

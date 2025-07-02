export type Locale = "en" | "ko";

export interface Message {
  message: string;
  description?: string;
  placeholders?: {
    [k: string]: {
      content: string;
      example?: string;
    };
  };
}

export type Messages = Record<string, Record<Locale, Message>>;

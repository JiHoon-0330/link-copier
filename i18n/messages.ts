type Locale = "en" | "ko";

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

type Messages = Record<string, Record<Locale, Message>>;

export const messages: Messages = {
  manifestDescription: {
    en: {
      message:
        "It's very easy to copy a link from the webpage you're viewing to another location.",
    },
    ko: {
      message:
        "웹페이지에서 클릭하면 다른 곳으로 이동하는 링크들을 아주 쉽게 복사할 수 있도록 도와줘요",
    },
  },
  enabled: {
    en: {
      message: "Enabled",
    },
    ko: {
      message: "기능 활성화",
    },
  },
};

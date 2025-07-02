import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import type { Message, Messages } from "./messages/type";
import { normalizePath } from "./util";

type LocaleMessagesRecord = Record<string, Record<string, Message>>;

/**
 * 다국어 메시지 소스를 로케일별 JSON 파일로 변환하여 지정된 출력 디렉토리에 생성합니다.
 * @param sourceMessages 입력될 원본 메시지 데이터 (메시지 이름 -> 로케일 -> 메시지 객체 구조)
 * @param outputDirectory 생성될 로케일 파일들이 저장될 디렉토리 (기본값: "./__locales__/")
 */
export function generateI18nLocales(
  sourceMessages: Messages,
  outputDirectory: string = "./__locales__/",
) {
  const normalizedOutputDirectory = normalizePath(outputDirectory);

  // 1. 원본 메시지 데이터를 로케일별 레코드로 재구성합니다.
  const localeMessagesRecord = restructureMessagesByLocale(sourceMessages);

  // 2. 재구성된 로케일 메시지들을 파일 시스템에 씁니다.
  writeLocaleMessagesToFiles(localeMessagesRecord, normalizedOutputDirectory);
}

/**
 * 원본 메시지 데이터를 로케일 기준으로 재구성합니다.
 * 즉, { [messageName]: { [locale]: Message } } -> { [locale]: { [messageName]: Message } } 형태로 변환합니다.
 * @param sourceMessages 재구성할 원본 메시지 데이터
 * @returns 로케일 기준으로 재구성된 메시지 레코드
 */
function restructureMessagesByLocale(
  sourceMessages: Messages,
): LocaleMessagesRecord {
  const localeMessagesRecord: LocaleMessagesRecord = {};

  for (const [messageName, localeMessages] of Object.entries(sourceMessages)) {
    for (const [locale, message] of Object.entries(localeMessages)) {
      localeMessagesRecord[locale] ??= {}; // 해당 로케일이 없으면 초기화
      localeMessagesRecord[locale][messageName] = message; // 메시지 할당
    }
  }

  return localeMessagesRecord;
}

/**
 * 로케일별로 재구성된 메시지 레코드를 지정된 출력 디렉토리 내에 JSON 파일로 작성합니다.
 * 각 로케일별로 하위 디렉토리가 생성되고 그 안에 'messages.json' 파일이 생성됩니다.
 * @param localeMessagesRecord 로케일별로 재구성된 메시지 레코드
 * @param outputDirectory 파일이 작성될 최상위 출력 디렉토리
 */
function writeLocaleMessagesToFiles(
  localeMessagesRecord: LocaleMessagesRecord,
  outputDirectory: string,
) {
  for (const [locale, messages] of Object.entries(localeMessagesRecord)) {
    const localeDirectory = `${outputDirectory}${locale}`;

    // 로케일 디렉토리가 없으면 생성합니다.
    if (!existsSync(localeDirectory)) {
      mkdirSync(localeDirectory, { recursive: true });
    }

    // 해당 로케일의 메시지를 JSON 파일로 작성합니다.
    writeFileSync(
      `${localeDirectory}/messages.json`,
      JSON.stringify(messages, null, 2), // 가독성을 위해 들여쓰기 적용
    );
  }
}

import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmdirSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import glob from "fast-glob";
import type { Message } from "./messages/type";
import { normalizePath } from "./util";

type MergedMessages = Record<string, Record<string, Message>>;
type LocaleMessage = [locale: string, messages: Record<string, Message>];

export async function generateI18nSrc(
  sourceDirectory: string,
  outputDirectory: string,
  fileName: string,
) {
  const normalizedSourceDirectory = normalizePath(sourceDirectory);
  const normalizedOutputDirectory = normalizePath(outputDirectory);

  // 1. 소스 디렉토리에서 JSON 파일 경로 목록을 가져옵니다.
  const jsonPathList = await glob(`${normalizedSourceDirectory}/**/*.json`);

  // 2. 경로 목록에서 로케일 메시지 데이터를 로드합니다.
  const localeMessagesList = loadLocaleMessagesFromPathList(jsonPathList);

  // 3. 출력 디렉토리를 정리하고 새로 생성합니다.
  cleanAndCreateOutputDirectory(normalizedOutputDirectory);

  // 4. 로드된 메시지 데이터를 기반으로 i18n 번역 파일을 생성합니다.
  generateI18nTranslate(
    localeMessagesList,
    normalizedOutputDirectory,
    fileName,
  );
}

/**
 * 주어진 경로 목록에서 로케일 메시지 데이터를 로드하고 파싱합니다.
 * @param pathList 로케일 메시지 JSON 파일 경로 배열
 * @returns 로케일과 해당 메시지 객체의 튜플 배열
 */
function loadLocaleMessagesFromPathList(pathList: string[]): LocaleMessage[] {
  return pathList.map((path) => {
    const locale = path.split("/").at(-2)?.trim();

    if (!locale) {
      // 로케일을 찾을 수 없으면 오류 발생
      throw new Error("locale is not found");
    }

    // 파일 내용을 읽어 JSON으로 파싱하여 [로케일, 메시지 객체] 형태로 반환
    return [locale, JSON.parse(readFileSync(path, "utf-8"))];
  });
}

/**
 * 출력 디렉토리가 존재하면 삭제하고 새로 생성하여 비어있는 상태로 만듭니다.
 * @param outputDirectory 정리하고 생성할 출력 디렉토리 경로
 */
function cleanAndCreateOutputDirectory(outputDirectory: string) {
  if (existsSync(outputDirectory)) {
    // 디렉토리가 존재하면 재귀적으로 삭제
    rmdirSync(outputDirectory, { recursive: true });
  }
  // 디렉토리를 재귀적으로 생성 (이미 존재하면 아무것도 하지 않음)
  mkdirSync(outputDirectory, { recursive: true });
}

/**
 * 로드된 로케일 메시지 목록을 기반으로 i18n 번역 파일을 생성합니다.
 * @param localeMessageList 로케일 메시지 튜플 배열
 * @param outputDirectory 번역 파일을 출력할 디렉토리
 * @param fileName 생성될 번역 파일의 이름 (예: 'i18n.ts')
 */
function generateI18nTranslate(
  localeMessageList: LocaleMessage[],
  outputDirectory: string,
  fileName: string,
) {
  // 로케일별 메시지를 단일 레코드로 병합합니다.
  const mergedRecord = mergeMessageList(localeMessageList);

  // 최종 t() 함수 정의 내용
  const functionContent = [
    "export function t(messageName: string, ...args: string[]) {",
    "return chrome.i18n.getMessage(messageName, args);",
    "}",
  ];

  // 함수 오버로드 및 JSDoc 주석을 생성하고 최종 함수 내용과 결합합니다.
  const content =
    functionOverloadAndJSDoc(mergedRecord).concat(functionContent);

  // 최종 내용을 파일에 씁니다.
  writeFileSync(resolve(outputDirectory, fileName), content.join("\n"));
}

// --- 유틸리티/헬퍼 함수 (다른 함수에 의해 호출되지만 독립적인 역할) ---

/**
 * 여러 로케일 메시지 목록을 단일 메시지 이름 기반의 병합된 레코드로 변환합니다.
 * 'manifest'로 시작하는 메시지는 제외합니다.
 * @param localeMessageList 로케일 메시지 튜플 배열
 * @returns 메시지 이름, 로케일, 메시지 객체로 구성된 병합된 레코드
 */
function mergeMessageList(localeMessageList: LocaleMessage[]): MergedMessages {
  const mergedRecord: MergedMessages = {};

  for (const [locale, messages] of localeMessageList) {
    for (const [messageName, messageObject] of Object.entries(messages)) {
      if (messageName.startsWith("manifest")) {
        // 'manifest'로 시작하는 메시지는 건너뜁니다.
        continue;
      }
      // 해당 메시지 이름의 레코드가 없으면 초기화하고 로케일별 메시지를 할당합니다.
      mergedRecord[messageName] ??= {};
      mergedRecord[messageName][locale] = messageObject;
    }
  }

  return mergedRecord;
}

/**
 * 병합된 메시지 레코드를 기반으로 t() 함수의 오버로드 시그니처와 JSDoc 주석을 생성합니다.
 * @param mergedRecord 병합된 메시지 레코드
 * @returns 생성된 오버로드 및 JSDoc 문자열 배열
 */
function functionOverloadAndJSDoc(mergedRecord: MergedMessages): string[] {
  return Object.entries(mergedRecord).flatMap(
    ([messageName, mergedMessage]) => {
      // JSDoc @example 섹션을 위한 예시 내용 생성
      const exampleContent = JSON.stringify(mergedMessage, null, 2)
        .split("\n")
        .map((line) => `* ${line}`)
        .join("\n");

      // JSDoc 주석 내용 구성
      const jsDocContent = ["/**", "* @example", exampleContent, "*/"];

      // 함수 오버로드 시그니처 구성
      const functionOverloadContent = `export function t(messageName: "${messageName}", ...args: string[]): string;`;

      // JSDoc과 오버로드를 결합하여 반환
      return jsDocContent.concat(functionOverloadContent);
    },
  );
}

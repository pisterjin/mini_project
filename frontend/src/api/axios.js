import axios from "axios";
import { URL } from "../constants/data";

/**
 * 공통 API 인스턴스 생성
 *
 * - baseURL: 서버 기본 주소 설정
 *   → 환경 변수에 SERVER_URL이 있으면 그 값 사용
 *   → 없으면 기본값 http://localhost:5000 사용
 *
 * - timeout: 요청 제한 시간 (5초)
 *   → 5초 초과 시 요청 실패 처리
 *
 * - headers:
 *   Accept: 서버로부터 JSON 응답을 기대
 *   Content-Type: 요청 바디를 JSON 형식으로 전송
 */
export const api = axios.create({
  baseURL: URL.SERVER_URL || "http://localhost:5000",
  timeout: 5000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

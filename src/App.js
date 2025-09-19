import React, { useEffect, useState } from "react";

/** ===================== 설정 ===================== */
// 실서비스 시, 본인 Vercel 프록시 도메인으로 변경하세요.
// 빈 문자열("")이면 Mock Only 모드로 동작합니다.
const API_BASE = ""; // 예: "https://your-vercel-project.vercel.app/api"

/** ===================== 유틸 ===================== */
const KRW = (n) => (Number.isFinite(n) ? n.toLocaleString("ko-KR") : "-");
const minutesToHM = (mins) => {
  if (!Number.isFinite(mins)) return "-";
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${h}시간 ${m}분`;
};
const fmt = (d) => new Date(d).toISOString().slice(0,10);
const cityForAirport = (code) => ({ HND:"TYO", NRT:"TYO", GMP:"SEL", ICN:"SEL" }[code] || code);

/** ===================== 자연어 파서 ===================== */
function parseKoreanDate(str){
  if(!str) return null;
  const y = new Date().getFullYear();
  const a = str.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  const b = str.match(/(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
  const c = str.match(/(\d{1,2})[./-](\d{1,2})/);
  if(a) return new Date(+a[1], +a[2]-1, +a[3]);
  if(b) return new Date(y, +b[1]-1, +b[2]);
  if(c) return new Date(y, +c[1]-1, +c[2]);
  return null;
}

function parseNatural(textRaw){
  const text = (textRaw||"").trim();
  const origin = /김포/.test(text) ? "GMP" : "ICN";
  const destination = /나리타/.test(text) ? "NRT" : /하네다|도쿄/.test(text) ? "HND" : "HND";
  const adults = (()=>{ const m = text.match(/(성인|어른|adults?)\s*(\d+)/i); return m? +m[2] : 1; })();
  const nights = (()=>{ const m = text.match(/(\d+)\s*박/); return m? +m[1] : 2; })();

  // 날짜 파싱: "10월 3일 출발 10월 5일

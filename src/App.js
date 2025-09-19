import React, { useEffect, useState } from "react";

/** ===================== 설정 ===================== */
// 실서비스 시, 본인 Vercel 프록시 도메인으로 변경하세요.
// 빈 문자열("")이면 Mock Only 모드로 동작합니다.
const API_BASE = "travel-proxy-7efpuzjks-5751s-projects.vercel.app"; // 예: "https://your-vercel-project.vercel.app/api"

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

  // 날짜 파싱: "10월 3일 출발 10월 5일 귀국" 같은 패턴 우선
  let departDate=null, returnDate=null;
  const pair = text.match(/(\d{1,2}\s*월\s*\d{1,2}\s*일|\d{4}-\d{2}-\d{2}|\d{1,2}[./-]\d{1,2}).{0,8}?(귀국|리턴|돌아|~|부터|출발).{0,12}?(\d{1,2}\s*월\s*\d{1,2}\s*일|\d{4}-\d{2}-\d{2}|\d{1,2}[./-]\d{1,2})/);
  if(pair){ departDate = parseKoreanDate(pair[1]); returnDate = parseKoreanDate(pair[3]); }
  if(!departDate){
    const dep = text.match(/(\d{1,2}\s*월\s*\d{1,2}\s*일|\d{4}-\d{2}-\d{2}|\d{1,2}[./-]\d{1,2}).{0,3}출발/);
    if(dep) departDate = parseKoreanDate(dep[1]);
  }
  if(!returnDate && departDate){
    const ret = text.match(/(\d{1,2}\s*월\s*\d{1,2}\s*일|\d{4}-\d{2}-\d{2}|\d{1,2}[./-]\d{1,2}).{0,3}(귀국|복귀|리턴|돌아)/);
    if(ret) returnDate = parseKoreanDate(ret[1]);
  }

  // 기본값: 다음 금요일 출발 + n박
  if(!departDate || !returnDate){
    const now = new Date(); const dow = now.getDay();
    const add = ((5 - dow + 7) % 7) || 7; // 다음 금요일
    departDate = new Date(now); departDate.setDate(now.getDate()+add);
    returnDate = new Date(departDate); returnDate.setDate(departDate.getDate()+nights);
  }

  return { origin, destination, departDate, returnDate, nights, adults, destinationCity: cityForAirport(destination) };
}

/** ===================== 안전 fetch + 폴백 ===================== */
async function safeGet(url){
  try{
    const res = await fetch(url, { mode:"cors" });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ok:true, json: await res.json() };
  }catch(e){
    return { ok:false, error:String(e?.message||e) };
  }
}

/** ===================== Mock 데이터 ===================== */
function mockFlights(p){
  return [
    { id:"F1", airline:{code:"KE", name:"대한항공"}, origin:p.origin, destination:p.destination,
      departDate:p.departDate, returnDate:p.returnDate, departTime:"08:10", returnTime:"19:25",
      duration:140, stops:0, ontime:95, baggageIncluded:1, price:220000*p.adults, adults:p.adults },
    { id:"F2", airline:{code:"JL", name:"JAL"}, origin:p.origin, destination:p.destination,
      departDate:p.departDate, returnDate:p.returnDate, departTime:"11:40", returnTime:"21:05",
      duration:155, stops:0, ontime:93, baggageIncluded:1, price:205000*p.adults, adults:p.adults },
    { id:"F3", airline:{code:"NH", name:"ANA"}, origin:p.origin, destination:p.destination,
      departDate:p.departDate, returnDate:p.returnDate, departTime:"07:25", returnTime:"18:40",
      duration:310, stops:1, ontime:90, baggageIncluded:0, price:170000*p.adults, adults:p.adults },
    { id:"F4", airline:{code:"7C", name:"제주항공"}, origin:p.origin, destination:p.destination,
      departDate:p.departDate, returnDate:p.returnDate, departTime:"15:00", returnTime:"20:30",
      duration:150, stops:0, ontime:88, baggageIncluded:0, price:160000*p.adults, adults:p.adults },
    { id:"F5", airline:{code:"TW", name:"티웨이"}, origin:p.origin, destination:p.destination,
      departDate:p.departDate, returnDate:p.returnDate, departTime:"18:10", returnTime:"22:05",
      duration:145, stops:0, ontime:91, baggageIncluded:0, price:150000*p.adults, adults:p.adults },
  ];
}
function mockHotels(p){
  return [
    { id:"H1", name:"신주쿠 스테이", area:"신주쿠", stars:4.5, rating:4.6, reviews:1320, refundable:true,  checkIn:p.departDate, nights:p.nights, pricePerNight:120000, taxesPerNight:15000, adults:p.adults },
    { id:"H2", name:"긴자 프리미어", area:"긴자", stars:5.0, rating:4.8, reviews:980,  refundable:false, checkIn:p.departDate, nights:p.nights, pricePerNight:190000, taxesPerNight:22000, adults:p.adults },
    { id:"H3", name:"아사쿠사 리버사이드", area:"아사쿠사", stars:3.8, rating:4.3, reviews:740,  refundable:true,  checkIn:p.departDate, nights:p.nights, pricePerNight:90000,  taxesPerNight:12000, adults:p.adults },
    { id:"H4", name:"하네다 공항 호텔", area:"오타구", stars:3.6, rating:4.1, reviews:510,  refundable:true,  checkIn:p.departDate, nights:p.nights, pricePerNight:80000,  taxesPerNight:10000, adults:p.adults },
  ];
}

/** ===================== 외부 응답 → 내부 포맷(간단) ===================== */
function adaptFlights(json, p){
  const items = (json?.data || []).slice(0,20);
  return items.map((it, idx)=>{
    const itins = it.itineraries || [];
    const out = itins[0], ret = itins[1];
    const odur = (()=>{ const m=out?.duration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?/); return (+(m?.[1]||0))*60 + +(m?.[2]||0); })();
    const rdur = (()=>{ const m=ret?.duration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?/); return (+(m?.[1]||0))*60 + +(m?.[2]||0); })();
    const firstSeg = out?.segments?.[0]; const lastSegR = ret?.segments?.slice(-1)[0];
    return {
      id:`AF_${idx}`,
      airline:{ code:firstSeg?.carrierCode || it?.validatingAirlineCodes?.[0] || "XX", name:firstSeg?.carrierCode || "항공" },
      origin:p.origin, destination:p.destination,
      departDate:p.departDate, returnDate:p.returnDate,
      departTime:firstSeg?.departure?.at?.slice(11,16)||"--:--",
      returnTime:lastSegR?.arrival?.at?.slice(11,16)||"--:--",
      duration:(odur||0)+(rdur||0),
      stops: Math.max(0,(out?.segments?.length||1)-1)+Math.max(0,(ret?.segments?.length||1)-1),
      ontime:90, baggageIncluded:false,
      price: Math.round((+it?.price?.grandTotal||0) * p.adults),
      adults:p.adults
    };
  });
}
function adaptHotels(json, p){
  const arr = json?.hotels || json?.hotels?.hotels || json?.data || [];
  const list = Array.isArray(arr) ? arr : arr?.hotels || [];
  return list.slice(0,20).map((h,i)=>({
    id:`HB_${i}`,
    name: h.name || h.hotel?.name || `호텔 ${i+1}`,
    area: h.zoneName || h.hotel?.zoneName || "도쿄",
    stars: Math.min(5, Math.max(3, Number(h.categoryName?.match(/\d+/)?.[0] || 4))),
    rating: Number(h.rating || 4.4).toFixed(1),
    reviews: 200 + i*17,
    refundable: !(h.rooms?.[0]?.rates?.[0]?.rateCommentsId),
    checkIn: p.departDate,
    nights: p.nights,
    pricePerNight: Math.round(Number(h.minRate || h.rooms?.[0]?.rates?.[0]?.net || 90000)),
    taxesPerNight: function(x){ return Math.round(x*0.12); }(Math.round(Number(h.minRate || h.rooms?.[0]?.rates?.[0]?.net || 90000))),
    adults: p.adults
  }));
}

/** ===================== 추천 로직 ===================== */
function riskScore(f,h){
  // 환승 가중↑, 지연위험(정시율 낮으면↑), 환불불가↑
  return (Math.max(0,f.stops)*2) + ((100-(f.ontime||90))/10) + (h.refundable?0:1.5);
}
function chooseBundles({flights,hotels}){
  const combos=[];
  for(const f of flights){
    for(const h of hotels.slice(0,8)){
      const hotelCost=(h.pricePerNight+h.taxesPerNight)*h.nights;
      combos.push({ flight:f, hotel:h, total:(f.price||0)+hotelCost, risk:riskScore(f,h) });
    }
  }
  if(!combos.length) return {lowest:null, fastest:null, safest:null};
  const lowest  = [...combos].sort((a,b)=>a.total-b.total)[0];
  const fastest = [...combos].sort((a,b)=>a.flight.duration-b.flight.duration || a.total-b.total)[0];
  const safest  = [...combos].sort((a,b)=>a.risk-b.risk || a.total-b.total)[0];
  return {lowest, fastest, safest};
}

/** ===================== 메인 컴포넌트 ===================== */
export default function App(){
  const [query,setQuery] = useState("인천에서 도쿄 왕복, 10월 3일 출발 10월 5일 귀국, 도쿄 2박, 성인 2명");
  const [parsed,setParsed] = useState(null);
  const [flights,setFlights] = useState([]);
  const [hotels,setHotels] = useState([]);
  const [reco,setReco] = useState(null);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const [mode,setMode] = useState(API_BASE ? "auto":"mock"); // auto: 실시간 시도→실패시 mock, mock: 무조건 모의

  async function runSearch(){
    setLoading(true); setError("");
    const p=parseNatural(query); setParsed(p);

    // 기본 mock
    let flightList = mockFlights(p);
    let hotelList  = mockHotels(p);

    if(API_BASE && mode!=="mock"){
      const fURL = `${API_BASE}/flights?origin=${p.origin}&destination=${p.destination}&departDate=${fmt(p.departDate)}&returnDate=${fmt(p.returnDate)}&adults=${p.adults}&currencyCode=KRW`;
      const hURL = `${API_BASE}/hotels?destination=${p.destinationCity}&checkIn=${fmt(p.departDate)}&checkOut=${fmt(p.returnDate)}&adults=${p.adults}`;
      const [fr,hr] = await Promise.all([safeGet(fURL), safeGet(hURL)]);
      if(fr.ok) flightList = adaptFlights(fr.json, p);
      else setError((e)=> e? e + ` | flights: ${fr.error}` : `flights: ${fr.error}`);
      if(hr.ok) hotelList  = adaptHotels(hr.json, p);
      else setError((e)=> e? e + ` | hotels: ${hr.error}` : `hotels: ${hr.error}`);
    }

    setFlights(flightList);
    setHotels(hotelList);
    setReco(chooseBundles({flights:flightList, hotels:hotelList}));
    setLoading(false);
  }

  useEffect(()=>{ runSearch(); /* 첫 로드시 자동 검색 */ }, []);

  const ChoiceCard = ({title,tone,combo})=>{
    if(!combo) return <div className="card">데이터 없음</div>;
    const hotelCost=(combo.hotel.pricePerNight+combo.hotel.taxesPerNight)*combo.hotel.nights;
    const total = (combo.flight.price||0) + hotelCost;
    return (
      <div className="card">
        <div className="row between">
          <div className="hl">{title}</div>
          <span className={`badge ${tone}`}>{title}</span>
        </div>

        <div className="mt12 pill">
          <div className="row between">
            <div className="hl">항공 ({combo.flight.airline.name})</div>
            <span className="badge gray">{combo.flight.stops?`환승 ${combo.flight.stops}회`:"직항"}</span>
          </div>
          <div className="muted mt8">
            {combo.flight.origin} → {combo.flight.destination} · {fmt(combo.flight.departDate)} {combo.flight.departTime}
          </div>
          <div className="muted">
            귀국 {combo.flight.destination} → {combo.flight.origin} · {fmt(combo.flight.returnDate)} {combo.flight.returnTime}
          </div>
          <div className="muted">소요 {minutesToHM(combo.flight.duration)} · 수하물 {combo.flight.baggageIncluded?"포함":"미포함"}</div>
          <div className="hl mt8">항공가 ₩{KRW(combo.flight.price)}</div>
        </div>

        <div className="mt12 pill">
          <div className="row between">
            <div className="hl">호텔 ({combo.hotel.area})</div>
            <span className={`badge ${combo.hotel.refundable?"green":"amber"}`}>{combo.hotel.refundable?"무료취소":"환불불가"}</span>
          </div>
          <div className="muted mt8">{combo.hotel.name} · ★{Number(combo.hotel.stars).toFixed(1)} · 평점 {combo.hotel.rating} ({KRW(combo.hotel.reviews)} 리뷰)</div>
          <div className="hl mt8">1박 ₩{KRW(combo.hotel.pricePerNight)} + 세금 ₩{KRW(combo.hotel.taxesPerNight)}</div>
        </div>

        <div className="mt12" style={{borderTop:"1px solid #e5e7eb", paddingTop:12}}>
          <div className="row between"><span className="muted">항공 합계</span><span>₩{KRW(combo.flight.price)}</span></div>
          <div className="row between"><span className="muted">호텔 {combo.hotel.nights}박</span><span>₩{KRW(hotelCost)}</span></div>
          <div className="row between hl"><span>총액</span><span>₩{KRW(total)}</span></div>
          <div className="muted mt8">리스크 점수: {combo.risk.toFixed(1)} (낮을수록 안전)</div>
        </div>
      </div>
    );
  };

  // 자가 테스트
  const [tests,setTests] = useState([]);
  function runTests(){
    const r=[];
    const t1 = parseNatural("인천에서 도쿄 왕복, 10월 3일 출발 10월 5일 귀국, 도쿄 2박, 성인 2명");
    r.push({name:"Parser 기본", pass: t1.origin==="ICN" && t1.destination==="HND" && t1.nights===2 && t1.adults===2});
    const p = { origin:"ICN", destination:"HND", departDate:new Date(), returnDate:new Date(), nights:2, adults:1 };
    const mf = mockFlights(p), mh = mockHotels(p);
    const rec = chooseBundles({flights:mf, hotels:mh});
    r.push({name:"추천 3종 생성", pass: !!(rec.lowest && rec.fastest && rec.safest)});
    r.push({name:"최단시간 ≤ 다른 조합", pass: rec.fastest.flight.duration <= Math.min(rec.lowest.flight.duration, rec.safest.flight.duration)});
    setTests(r);
  }

  useEffect(()=>{ runTests(); },[]);

  return (
    <div className="container">
      <div className="row between">
        <div>
          <h1 style={{margin:0}}>여행 AI 에이전트</h1>
          <div className="muted">자연어로 요청하고, <b>최저가 · 최단시간 · 최소리스크</b> 3가지를 추천</div>
        </div>
        <div className="row">
          <label className="muted">모드</label>
          <select value={mode} onChange={(e)=>setMode(e.target.value)}>
            <option value="auto">Auto(API 시도→실패 시 Mock)</option>
            <option value="mock">Mock Only</option>
          </select>
          <button className="btn" onClick={runSearch} disabled={loading}>{loading?"검색 중...":"검색 실행"}</button>
        </div>
      </div>

      <div className="card mt16">
        <div className="hl">자연어 요청</div>
        <div className="row mt12" style={{alignItems:"stretch"}}>
          <textarea rows={3} value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="예) 인천에서 도쿄 왕복, 11월 2일 출발 11월 4일 귀국, 2박, 성인 2명" />
          <div style={{minWidth:260}} className="pill">
            <div className="hl">파싱 결과</div>
            <div className="mt8 mono">
              출발지: {parsed?.origin||"-"}<br/>
              도착지: {parsed?.destination||"-"} (도시:{parsed?.destinationCity||"-"})<br/>
              출발일: {parsed?fmt(parsed.departDate):"-"}<br/>
              귀국일: {parsed?fmt(parsed.returnDate):"-"}<br/>
              숙박: {parsed?.nights||"-"}박 · 성인 {parsed?.adults||"-"}명
            </div>
          </div>
        </div>
        {error && <div className="mt12" style={{color:"#b91c1c"}}>⚠️ {error}</div>}
      </div>

      {reco && (
        <div className="grid cols-3 mt16">
          <ChoiceCard title="최저가"   tone="green" combo={reco.lowest} />
          <ChoiceCard title="최단시간" tone="blue"  combo={reco.fastest} />
          <ChoiceCard title="최소리스크" tone="amber" combo={reco.safest} />
        </div>
      )}

      {(flights.length || hotels.length) ? (
        <div className="card mt16">
          <details>
            <summary className="hl">후보 리스트(검증용)</summary>
            <div className="grid cols-2 mt16">
              <div>
                <div className="hl">항공 {flights.length}건</div>
                <div className="mt8" style={{maxHeight:320, overflow:"auto"}}>
                  {flights.map(f=>(
                    <div key={f.id} className="pill mt8">
                      <div className="row between">
                        <div className="hl">{f.airline.name}</div>
                        <span className="badge gray">{f.stops?`환승 ${f.stops}회`:"직항"}</span>
                      </div>
                      <div className="muted">{f.origin}→{f.destination} {fmt(f.departDate)} {f.departTime}</div>
                      <div className="muted">복귀 {f.destination}→{f.origin} {fmt(f.returnDate)} {f.returnTime}</div>
                      <div className="muted">소요 {minutesToHM(f.duration)} · 수하물 {f.baggageIncluded?"포함":"미포함"}</div>
                      <div className="hl">₩{KRW(f.price)}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="hl">호텔 {hotels.length}건</div>
                <div className="mt8" style={{maxHeight:320, overflow:"auto"}}>
                  {hotels.map(h=>(
                    <div key={h.id} className="pill mt8">
                      <div className="row between">
                        <div className="hl">{h.name} ({h.area})</div>
                        <span className={`badge ${h.refundable?"green":"amber"}`}>{h.refundable?"무료취소":"환불불가"}</span>
                      </div>
                      <div className="muted">★{Number(h.stars).toFixed(1)} · 평점 {h.rating} ({KRW(h.reviews)} 리뷰)</div>
                      <div className="muted">체크인 {fmt(h.checkIn)} · {h.nights}박</div>
                      <div className="hl">1박 ₩{KRW(h.pricePerNight)} + 세금 ₩{KRW(h.taxesPerNight)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </details>
        </div>
      ):null}

      <div className="card mt16">
        <div className="hl">자가 테스트</div>
        <div className="mt8 mono">
          {tests.map(t=> <div key={t.name}>{t.pass? "✅":"❌"} {t.name}</div>)}
        </div>
      </div>

      <div className="muted mt24">© 2025 Travel AI Demo · 결제는 모의 단계까지만 지원</div>
    </div>
  );
}

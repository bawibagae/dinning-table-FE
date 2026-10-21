import React, { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { ArrowRight, CalendarDays, Check, ChevronDown, Clock3, Compass, MapPin, Search, Sparkles, Utensils, Users, X } from 'lucide-react';
import { evaluateTableClient } from '../data/mockDatabase';
import { getOpenTablesForDiscovery } from '../data/tableMatchingFlow';

const Shell = styled.main`background:radial-gradient(ellipse at 8% 0%,rgba(202,177,137,.16),transparent 35%),#f3ece0;color:#39291d;min-height:calc(100vh - 82px);padding:38px clamp(18px,5vw,74px) 88px;`;
const Content = styled.div`max-width:1360px;margin:0 auto;`;
const Intro = styled.section`
  display:grid;grid-template-columns:1.1fr .9fr;gap:30px;align-items:stretch;padding:30px 0 34px;border-bottom:1px solid #c9b69d;
  .eyebrow{color:#977852;font-size:.68rem;font-weight:800;letter-spacing:.2em;display:flex;align-items:center;gap:10px;}
  .eyebrow::before{content:'';width:26px;height:1px;background:#977852;}
  h1{margin:18px 0 13px;font:500 clamp(2.8rem,5.8vw,5.7rem)/1.14 'Noto Serif KR',serif;letter-spacing:-.09em;color:#39291d;}
  h1 em{font-style:normal;color:#a1855f;}
  p{max-width:510px;margin:0;color:#806f5d;line-height:1.85;font-size:.92rem;}
  @media(max-width:800px){grid-template-columns:1fr;gap:25px;padding-top:14px;}
`;
const IntroAside = styled.div`
  position:relative;isolation:isolate;min-height:285px;display:flex;flex-direction:column;justify-content:space-between;gap:28px;padding:clamp(23px,3vw,34px);border:1px solid #a68b62;box-shadow:0 24px 48px rgba(48,32,17,.13);
  background:linear-gradient(145deg,rgba(22,26,19,.82),rgba(51,34,21,.38)),url('${import.meta.env.BASE_URL}assets/dining-group.webp') center 47%/cover;
  .quote{font:500 clamp(1.15rem,1.7vw,1.55rem)/1.6 'Noto Serif KR',serif;letter-spacing:-.05em;color:#fff4e3;text-shadow:0 2px 14px rgba(0,0,0,.3);max-width:420px;}
  .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
  .stat{border-top:1px solid rgba(245,221,187,.62);padding-top:11px;}
  strong{display:block;font:500 1.65rem 'Noto Serif KR',serif;color:#fff4e3;}
  small{display:block;margin-top:5px;font-size:.66rem;color:#e8d7be;line-height:1.4;}
  @media(max-width:800px){min-height:245px;padding:22px;.quote{font-size:1.1rem}.stats{max-width:520px;}}
`;
const ControlWrap = styled.section`padding:30px 0 27px;display:flex;flex-direction:column;gap:22px;`;
const CategoryRow = styled.div`display:flex;align-items:center;gap:8px;overflow:auto;padding-bottom:4px;`;
const Category = styled.button`
  flex-shrink:0;border:1px solid ${p=>p.active?'#4a3423':'#d7c7b2'};background:${p=>p.active?'#4a3423':'transparent'};color:${p=>p.active?'#fff5e7':'#78634d'};
  padding:10px 15px;border-radius:2px;font-size:.75rem;font-weight:750;cursor:pointer;transition:.18s;
  &:hover{border-color:#8e704b;}
`;
const FilterGrid = styled.div`display:grid;grid-template-columns:minmax(220px,1.5fr) repeat(2,minmax(150px,.7fr)) auto;gap:10px;align-items:center;@media(max-width:780px){grid-template-columns:1fr 1fr}.search{grid-column:span 1}@media(max-width:480px){grid-template-columns:1fr;}`;
const SearchBox = styled.label`
  display:flex;align-items:center;gap:9px;min-height:44px;padding:0 13px;border:1px solid #d8c9b5;background:#fcf8f0;color:#907b63;
  input{min-width:0;width:100%;border:0;outline:0;background:transparent;color:#3d2c1e;font-size:.79rem;}
`;
const SelectBox = styled.label`
  display:flex;align-items:center;gap:8px;min-height:44px;padding:0 12px;border:1px solid #d8c9b5;background:#fcf8f0;color:#907b63;font-size:.72rem;
  select{width:100%;min-width:0;border:0;outline:0;background:transparent;color:#6f5943;font-size:.77rem;appearance:none;}
`;
const Reset = styled.button`display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:44px;padding:0 12px;border:1px solid #d8c9b5;color:#876f54;background:transparent;font-size:.73rem;cursor:pointer;white-space:nowrap;`;
const GridHeading = styled.div`
  display:flex;align-items:end;justify-content:space-between;gap:16px;margin:24px 0 18px;
  h2{margin:0;font:500 clamp(1.75rem,3vw,2.4rem)/1.3 'Noto Serif KR',serif;letter-spacing:-.06em;}
  p{margin:7px 0 0;color:#8c7966;font-size:.75rem;line-height:1.6;}
  .count{color:#92754f;font-size:.74rem;font-weight:800;white-space:nowrap;}
`;
const Cards = styled.div`display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;@media(max-width:1000px){grid-template-columns:repeat(2,minmax(0,1fr));}@media(max-width:660px){grid-template-columns:1fr;}`;
const Card = styled.article`
  min-width:0;border:1px solid #d6c5ac;background:linear-gradient(180deg,#fffaf2,#f8f0e3);box-shadow:0 6px 20px rgba(53,35,19,.035);transition:transform .25s,box-shadow .25s,border .25s;display:flex;flex-direction:column;
  &:hover{transform:translateY(-5px);border-color:#a98b63;box-shadow:0 24px 42px rgba(45,30,17,.13);}
`;
const Cover = styled.div`
  min-height:226px;position:relative;isolation:isolate;overflow:hidden;background:${p=>p.index%3===0?'#58422e':p.index%3===1?'#414b3d':'#6a4b36'};background-size:cover;background-position:center;padding:21px 22px;display:flex;flex-direction:column;justify-content:space-between;
  &::before{content:'';position:absolute;inset:0;z-index:0;background:linear-gradient(90deg,rgba(25,21,16,.82) 0%,rgba(31,25,17,.51) 55%,rgba(31,25,17,.13) 100%),linear-gradient(0deg,rgba(25,20,15,.5),transparent 55%);}
  &::after{content:'';position:absolute;right:-82px;bottom:-130px;z-index:0;width:290px;height:290px;border:1px solid rgba(244,218,177,.48);border-radius:50%;box-shadow:0 0 0 13px rgba(244,218,177,.03),0 0 0 28px rgba(244,218,177,.025);}
  .top{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:center;gap:12px;}
  .category{font-size:.62rem;color:#f7e6cc;font-weight:800;letter-spacing:.13em;border:1px solid rgba(247,230,204,.48);padding:7px 9px;background:rgba(24,20,15,.35);backdrop-filter:blur(8px);}
  .seat{display:flex;align-items:center;gap:5px;font-size:.69rem;color:#fff0dc;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,.35);}
  .cover-title{position:relative;z-index:1;max-width:82%;font:500 clamp(1.4rem,2vw,1.95rem)/1.42 'Noto Serif KR',serif;letter-spacing:-.065em;color:#fff4e4;text-shadow:0 2px 15px rgba(0,0,0,.22);}
  .shape{position:absolute;right:15%;bottom:21px;z-index:1;width:60px;height:60px;border-radius:50%;border:1px solid rgba(248,222,181,.7);display:grid;place-items:center;color:rgba(248,222,181,.9);background:rgba(21,23,17,.22);backdrop-filter:blur(5px);}
  .shape::before,.shape::after{content:'';position:absolute;inset:8px;border:1px solid rgba(248,222,181,.4);border-radius:50%;}
  .shape::after{inset:17px;}
`;
const Body = styled.div`padding:22px 22px 20px;display:flex;flex-direction:column;gap:17px;flex:1;`;
const MetaLine = styled.div`display:flex;flex-wrap:wrap;gap:12px;color:#8b7864;font-size:.71rem;span{display:inline-flex;align-items:center;gap:5px;}svg{color:#a08562;}`;
const Tags = styled.div`display:flex;flex-wrap:wrap;gap:6px;min-height:28px;span{padding:6px 8px;background:#f0e7d9;color:#7b664d;font-size:.65rem;font-weight:650;}`;
const MatchNote = styled.div`border-top:1px solid #e1d4c1;padding-top:13px;color:#7e6c5a;font-size:.72rem;line-height:1.65;display:flex;gap:8px;svg{flex-shrink:0;color:#a1845c;margin-top:1px;}`;
const CardFoot = styled.div`display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:auto;padding-top:15px;border-top:1px solid #e1d4c1;
  .price{color:#8b7255;font-size:.7rem;}.price strong{display:block;color:#483323;font:600 1.08rem 'Noto Serif KR',serif;margin-top:2px;}
  button{display:inline-flex;align-items:center;gap:7px;background:#493423;color:#fff4e4;border:1px solid #493423;padding:11px 12px;font-size:.72rem;font-weight:800;cursor:pointer;transition:.18s;}
  button:hover{background:#6a4c30;}button:disabled{opacity:.4;cursor:not-allowed;}
`;
const Empty = styled.div`border:1px dashed #cbb99f;background:rgba(255,250,242,.48);padding:60px 24px;text-align:center;color:#8b7761;grid-column:1/-1;svg{margin-bottom:12px;color:#a38a68;}h3{margin:0 0 8px;font:500 1.65rem 'Noto Serif KR',serif;color:#4a3523;}p{margin:0;font-size:.82rem;line-height:1.7;}`;
const Overlay = styled.div`position:fixed;inset:0;z-index:70;background:rgba(43,29,18,.48);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:18px;`;
const Modal = styled.div`width:min(560px,100%);max-height:90vh;overflow:auto;background:#f9f3e8;border:1px solid #c9b69d;padding:clamp(22px,4vw,38px);box-shadow:0 25px 80px rgba(28,18,10,.22);
  .close-row{display:flex;justify-content:space-between;align-items:center;gap:12px}.eyebrow{font-size:.67rem;letter-spacing:.18em;font-weight:800;color:#9b7e58}.close{width:33px;height:33px;border:1px solid #d6c4ab;background:transparent;color:#71573c;cursor:pointer;}
  h3{margin:17px 0 10px;font:500 clamp(1.8rem,4vw,2.5rem)/1.3 'Noto Serif KR',serif;letter-spacing:-.07em;color:#3e2c1d;}p{color:#85715b;font-size:.82rem;line-height:1.8;}
  .plans{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:20px 0;} .plan{position:relative;min-width:0;min-height:132px;padding:15px;border:1px solid #d9c7ae;background:#fffaf2;text-align:left;cursor:pointer;color:#5f4932;transition:background .18s,border-color .18s;} .plan.active{border-color:#5d432c;background:#eee2d0;box-shadow:inset 0 0 0 1px #5d432c;}.plan strong{display:block;font:600 1.02rem 'Noto Serif KR',serif;margin:8px 0}.plan small{color:#8d7964;font-size:.68rem;line-height:1.6;display:block}.plan .flag{position:absolute;right:9px;top:9px;padding:4px 6px;background:#6f5035;color:#fff4e4;font-size:.58rem;font-weight:800;letter-spacing:.03em}.match-score{display:inline-flex;align-items:center;gap:6px;padding:7px 10px;background:#e9decd;border:1px solid #d5c1a2;color:#674a2b;font-weight:800;font-size:.72rem}.table-details{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:16px 0}.table-details div{background:#f0e6d7;border:1px solid #e0d0bb;padding:11px;min-width:0}.table-details small{display:block;color:#967d5d;font-size:.62rem;margin-bottom:5px}.table-details strong{font-size:.75rem;color:#4a3624;overflow-wrap:anywhere}.steps{display:flex;gap:6px;margin:15px 0 19px}.steps span{flex:1;text-align:center;padding:8px 4px;background:#eee5d8;color:#9b8569;font-size:.66rem;font-weight:800;border-bottom:2px solid #d9c7af}.steps span.active{background:#e6d4bc;color:#4c3520;border-color:#6b4a2d}.payment-summary{padding:16px;background:#f0e6d7;border:1px solid #dfceb5;margin:16px 0}.payment-summary .row{display:flex;justify-content:space-between;gap:12px;padding:7px 0;color:#806950;font-size:.75rem}.payment-summary .total{border-top:1px solid #d2bea2;margin-top:7px;padding-top:14px;font-weight:800;color:#493423}.payment-summary .total strong{font:600 1.25rem 'Noto Serif KR',serif}
  .policy{background:#f0e6d7;border:1px solid #e0d0bb;padding:13px 14px;font-size:.71rem;line-height:1.7;color:#78624a;margin-bottom:15px;}.notice{font-size:.7rem;color:#977953;margin:8px 0 16px;}.actions{display:flex;gap:8px}.actions button{flex:1;min-height:45px;padding:11px 14px;border:1px solid #493423;background:#493423;color:#fff5e8;font-weight:800;cursor:pointer}.actions .secondary{background:transparent;color:#6c5237;}@media(max-width:560px){.plans{grid-template-columns:1fr}.table-details{grid-template-columns:1fr}.actions{flex-direction:column}.steps span{font-size:.59rem;padding:8px 2px;}}
`;
const categories = ['전체','미식 & 취향','크리에이터 & 예술','커리어 & 인사이트','북토크 & 영화','액티비티 & 러닝'];
const purchasePlans = [
  {id:'ONE_TIME',name:'하루권 · 1회권',price:9900,desc:'원하는 식탁 한 번 참여',term:'1회'},
  {id:'MEMBERSHIP_1M',name:'1개월 멤버십',price:35000,desc:'기간 내 횟수 제한 없이 참여',term:'1개월'},
  {id:'MEMBERSHIP_3M',name:'3개월 멤버십',price:75000,desc:'실패한 매칭 1회당 이용 기한 1일 연장',term:'3개월',recommended:true},
  {id:'MEMBERSHIP_6M',name:'6개월 멤버십',price:120000,desc:'장기 이용 · 기간 내 무제한 참여',term:'6개월'},
];
const displayText = (value='') => String(value).replace(/미식\s*&\s*와인/g,'미식 & 취향').replace(/미식\/와인/g,'맛집·식문화').replace(/와인/g,'취향');
const formatDate = value => { if(!value)return '일정 조율 중';const d=new Date(`${value}T00:00:00`);return Number.isNaN(d.getTime())?value:d.toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'short'}); };

export default function HomeView({ currentUser, store, onSubmitTableApplication, onJoinTableAndChat, onGoToChatRoom, onGoToMyPage, onStartJourney, onConsumeRecommendationRequest, preferMembershipChoice = false, recommendationRequest = 0, resumeCheckout = null }) {
  const [category,setCategory]=useState('전체');
  const [region,setRegion]=useState('전체 지역');
  const [query,setQuery]=useState('');
  const [recommended,setRecommended]=useState(false);
  const [selectedTable,setSelectedTable]=useState(null);
  const [recommendationNotice,setRecommendationNotice]=useState('');
  const [modalStep,setModalStep]=useState('DETAIL');
  const [selectedPlan,setSelectedPlan]=useState(purchasePlans[0]);
  const [checkoutApplicationId,setCheckoutApplicationId]=useState(null);
  const [policyAccepted,setPolicyAccepted]=useState(false);
  const activeMembership = (store.memberships || []).find((m) => m.user_id === currentUser.id && m.status === 'ACTIVE' && new Date(m.expires_at) > new Date());
  const activeTicketCredits = (store.ticketCredits || []).filter((credit) => credit.user_id === currentUser.id && credit.status === 'ACTIVE');
  const plans = [
    ...(activeMembership ? [{ id: 'MEMBERSHIP_ACTIVE', name: '보유 멤버십으로 참여', price: 0, desc: `이용 기한 내 무제한 참여 · ${new Date(activeMembership.expires_at).toLocaleDateString('ko-KR')}까지`, term: '보유권', membershipId: activeMembership.id, membershipType: activeMembership.plan_type }] : []),
    ...activeTicketCredits.slice(0, 1).map((credit) => ({ id: 'STORED_TICKET', name: '보관 이용권 사용', price: 0, desc: '이전에 보관한 1회권 · 추가 결제 없음', term: '보관권', creditId: credit.id, creditAmount: credit.amount })),
    ...purchasePlans,
  ];

  const evaluated = useMemo(()=> getOpenTablesForDiscovery(store,currentUser)
    .map((table,index)=>{
      const venue=(store.venues||[]).find(v=>v.id===table.venue_id)||null;
      const visibleMemberIds=(table.member_ids||[]).filter(id=>id!==currentUser.id);
      const members=visibleMemberIds.map(id=>(store.users||[]).find(u=>u.id===id)).filter(Boolean);
      const evaluation=evaluateTableClient(currentUser,{...table,member_ids:visibleMemberIds},store);
      const alreadyApplied=(store.applications||[]).some(a=>a.user_id===currentUser.id && a.table_id===table.id && a.application_status!=='CANCELED');
      return {...table,venue,members,currentCount:members.length,remainingSeats:Math.max(0,(table.max_members||6)-members.length),evaluation,alreadyApplied,_index:index};
    }),[store,currentUser]);

  const filtered = useMemo(()=>evaluated.filter(t=>{
    if(category!=='전체' && displayText(t.category)!==category && !(category==='미식 & 취향' && t.category==='미식 & 와인'))return false;
    if(region!=='전체 지역' && t.region!==region)return false;
    if(query.trim()){
      const q=query.trim().toLowerCase();
      const hay=[displayText(t.title),t.region,displayText(t.category),...(t.tags||[]).map(displayText),t.venue?.name||''].join(' ').toLowerCase();
      if(!hay.includes(q))return false;
    }
    return true;
  }).sort((a,b)=>{
    if(recommended){
      if(a.evaluation.passedHardConstraints!==b.evaluation.passedHardConstraints)return a.evaluation.passedHardConstraints?-1:1;
      if(a.evaluation.regionMatched!==b.evaluation.regionMatched)return a.evaluation.regionMatched?-1:1;
      return b.evaluation.totalScore-a.evaluation.totalScore;
    }
    return a._index-b._index;
  }),[evaluated,category,region,query,recommended]);

  const appliedCount=(store.applications||[]).filter(a=>a.user_id===currentUser.id && a.application_status!=='CANCELED').length;
  const regionOptions = [...new Set(evaluated.map((t) => t.region))].sort((a,b)=>a.localeCompare(b,'ko'));
  const openJoin=table=>{if(table.match_status==='CONFIRMED'&&(table.member_ids||[]).includes(currentUser.id)){onGoToChatRoom(table.id);return;}if(table.alreadyApplied){onGoToMyPage?.();return;}setSelectedTable(table);setModalStep('DETAIL');setSelectedPlan(plans[0]);setCheckoutApplicationId(null);setPolicyAccepted(false);};
  const startRecommendation=()=>{
    setRecommended(true);
    const candidates = evaluated.filter((t) => !t.evaluation.alreadyMember && !t.alreadyApplied && t.remainingSeats > 0)
      .sort((a,b) => Number(!b.evaluation.hasSafetyConflict)-Number(!a.evaluation.hasSafetyConflict) || Number(b.evaluation.passedHardConstraints)-Number(a.evaluation.passedHardConstraints) || Number(b.evaluation.regionMatched)-Number(a.evaluation.regionMatched) || Number(b.evaluation.ageConstraintPassed)-Number(a.evaluation.ageConstraintPassed) || b.evaluation.totalScore-a.evaluation.totalScore);
    const candidate = candidates[0];
    if (!candidate) { setRecommendationNotice('현재 선택 가능한 미완성 식탁이 없습니다. 검색이나 지역 필터를 바꾸거나 나중에 다시 확인해주세요.'); return; }
    setRecommendationNotice(candidate.evaluation.passedHardConstraints ? '' : '프로필과 완전히 일치하는 식탁이 없어도 신청할 수 있어요. 선택한 식탁에서 자동 매칭이 어려우면 다른 모집 중인 식탁까지 다시 탐색합니다.');setSelectedTable(candidate);setModalStep('RECOMMENDATION');
    const initialPlan = preferMembershipChoice
      ? (plans.find((p) => p.id === 'MEMBERSHIP_ACTIVE') || plans.find((p) => p.id === 'MEMBERSHIP_1M') || plans[0])
      : plans[0];
    setSelectedPlan(initialPlan);
  };
  const submitApplication=()=>{
    if(!selectedTable||!policyAccepted)return;
    const applicationId=onSubmitTableApplication?.(selectedTable,selectedPlan);
    if(!applicationId)return;
    setCheckoutApplicationId(applicationId);
    if (onStartJourney) {
      setSelectedTable(null);
      setModalStep('DETAIL');
      setCheckoutApplicationId(null);
      onStartJourney(applicationId);
      return;
    }
    setModalStep('PAYMENT');
  };
  const confirmJoin=()=>{
    if(!selectedTable||!checkoutApplicationId)return;
    const completed=onJoinTableAndChat(selectedTable,selectedPlan,checkoutApplicationId);
    if(completed===false)return;
    setSelectedTable(null);setModalStep('DETAIL');setCheckoutApplicationId(null);setPolicyAccepted(false);
  };
  useEffect(() => {
    if (recommendationRequest > 0) {
      startRecommendation();
      onConsumeRecommendationRequest?.();
    }
  }, [recommendationRequest]);
  useEffect(() => {
    if(!resumeCheckout?.nonce)return;
    const application=(store.applications||[]).find(a=>a.id===resumeCheckout.applicationId&&a.user_id===currentUser.id&&a.payment_status==='PENDING');
    const rawTable=application&&(store.diningTables||[]).find(t=>t.id===application.table_id);
    if(!application||!rawTable){setRecommendationNotice('이어 결제할 신청서를 찾지 못했습니다. 마이페이지에서 상태를 확인해주세요.');return;}
    const tableView=evaluated.find(t=>t.id===rawTable.id);
    if(!tableView||!['WAITING','REALLOCATING'].includes(rawTable.match_status||'WAITING')||tableView.remainingSeats<=0){
      setRecommendationNotice('신청한 식탁이 더 이상 모집 중이 아닙니다. 미결제 신청은 매칭에 참여하지 않았으므로 다른 식탁을 자유롭게 선택해주세요.');
      return;
    }
    const plan=application.ticket_credit_id ? plans.find(p=>p.id==='STORED_TICKET'&&p.creditId===application.ticket_credit_id) : plans.find(p=>p.id===application.ticket_type);
    if(!plan){setRecommendationNotice('해당 신청서의 이용권을 확인할 수 없습니다. 이용권을 다시 선택해주세요.');return;}
    setSelectedTable(tableView);setSelectedPlan(plan);setCheckoutApplicationId(application.id);setModalStep('PAYMENT');setPolicyAccepted(true);
  // Resume only when the request nonce changes; its contents are a snapshot of the selected pending application.
  }, [resumeCheckout?.nonce]);

  const reset=()=>{setCategory('전체');setRegion('전체 지역');setQuery('');setRecommended(false);};

  return <Shell><Content>
    <Intro>
      <div><div className="eyebrow">YOUR NEXT TABLE · CURATED CONNECTIONS</div><h1>좋은 저녁을<br/><em>함께할 사람들.</em></h1><p>관심사와 대화의 결이 닮은 사람들을 위한 식탁. 지금 모집 중인 자리에서 다음 이야기를 찾아보세요.</p></div>
      <IntroAside><div className="quote">“새로운 사람을 만나는 일에<br/>좋은 이유를 더합니다.”</div><div className="stats"><div className="stat"><strong>4–6</strong><small>한 식탁의 인원</small></div><div className="stat"><strong>8년</strong><small>최대 연령 차이</small></div><div className="stat"><strong>{appliedCount.toString().padStart(2,'0')}</strong><small>나의 신청</small></div></div></IntroAside>
    </Intro>
    <ControlWrap>
      <CategoryRow aria-label="식탁 카테고리">{categories.map(c=><Category type="button" key={c} active={category===c} onClick={()=>setCategory(c)}>{c}</Category>)}</CategoryRow>
      <FilterGrid>
        <SearchBox className="search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="관심사, 지역, 식탁 이름 검색" aria-label="식탁 검색"/></SearchBox>
        <SelectBox><MapPin size={15}/><select value={region} onChange={e=>setRegion(e.target.value)} aria-label="지역 필터"><option>전체 지역</option>{regionOptions.map(r=><option key={r}>{r}</option>)}</select><ChevronDown size={13}/></SelectBox>
        <Category type="button" active={recommended} onClick={()=>setRecommended(v=>!v)}><Sparkles size={13} style={{verticalAlign:'middle',marginRight:5}}/>{recommended?'추천순 정렬':'모집순 정렬'}</Category>
        <Reset type="button" onClick={reset}><X size={13}/> 초기화</Reset>
      </FilterGrid>
    </ControlWrap>

    {recommendationNotice&&<div role="status" style={{padding:'13px 15px',margin:'0 0 18px',background:'#f4e6d8',border:'1px solid #dec5ac',color:'#7a5136',fontSize:'.78rem',lineHeight:1.65}}>{recommendationNotice}</div>}
    <GridHeading><div><h2>{recommended?'나와 잘 어울리는 식탁':'지금 열려 있는 식탁'}</h2><p>{recommended?'안전 조건, 선택 지역, 연령대, 관심사와 과거 피드백을 종합해 추천 순으로 보여드립니다.':'모집 중이고 자리가 남아 있는 모든 식탁을 보여드려요. 추천 점수와 필수 조건이 달라도 상세 정보를 보고 자유롭게 선택할 수 있습니다.'}</p></div><span className="count">{filtered.length} TABLES</span></GridHeading>
    <Cards>
      {filtered.length===0?<Empty><Compass size={26}/><h3>조건에 맞는 식탁이 없어요.</h3><p>검색어 또는 지역 필터를 조정해 다시 둘러보세요.</p></Empty>:filtered.map((t,i)=>{
        const isConfirmedMember=t.match_status==='CONFIRMED'&&(t.member_ids||[]).includes(currentUser.id);
        const canJoin=!isConfirmedMember && !t.alreadyApplied;
        const title=displayText(t.title).replace(/미식·?취향/g,'미식과 취향');
        return <Card key={t.id}>
          <Cover index={i} style={{backgroundImage:`linear-gradient(90deg,rgba(25,21,16,.82) 0%,rgba(31,25,17,.5) 55%,rgba(31,25,17,.13) 100%),linear-gradient(0deg,rgba(25,20,15,.45),transparent 58%),url('${import.meta.env.BASE_URL}assets/${i%2===0?'dining-group.webp':'dining-table.webp'}')`}}>
            <div className="top"><span className="category">{displayText(t.category)}</span><span className="seat"><Users size={14}/>{t.currentCount}/{t.max_members||6}명</span></div>
            <div className="cover-title">{title}</div><div className="shape"><Sparkles size={18}/></div>
          </Cover>
          <Body>
            <MetaLine><span><MapPin size={14}/>{t.region}</span><span><CalendarDays size={14}/>{formatDate(t.event_date)}</span><span><Clock3 size={14}/>{t.event_time||'19:00'}</span></MetaLine>
            <Tags>{(t.tags||[]).slice(0,3).map(tag=><span key={tag}>{displayText(tag)}</span>)}{t.remainingSeats>0&&<span>잔여 {t.remainingSeats}석</span>}</Tags>
            <MatchNote><Sparkles size={14}/><span>{t.evaluation.explanation||t.curation_reason||'관심사와 참석 가능 일정을 기반으로 추천했습니다.'}</span></MatchNote>
            <CardFoot><div className="price">참가권부터 확인하세요<strong>{(plans[0].price).toLocaleString('ko-KR')}원~</strong></div><button type="button" disabled={!canJoin} onClick={()=>openJoin(t)}>{isConfirmedMember?'채팅방 보기':t.alreadyApplied?'신청 상태 보기':'식탁 자세히 보기'}<ArrowRight size={14}/></button></CardFoot>
            {!t.evaluation.passedHardConstraints&&!t.evaluation.alreadyMember&&!t.alreadyApplied&&<div style={{fontSize:'.68rem',color:'#88745d',marginTop:0,lineHeight:1.6}}>추천 조건과 차이가 있어도 상세 정보를 확인하고 신청할 수 있어요. 최종 배치 전 필수 조건을 검증합니다.</div>}
          </Body>
        </Card>;
      })}
    </Cards>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:20,flexWrap:'wrap',borderTop:'1px solid #dacbb6',marginTop:48,paddingTop:21}}>
      <div><div style={{fontSize:'.68rem',letterSpacing:'.15em',fontWeight:800,color:'#9b7c55'}}>PERSONAL TABLE MATCH</div><p style={{fontSize:'.8rem',color:'#81705f',lineHeight:1.7,margin:'7px 0 0'}}>관심사와 이전 피드백을 바탕으로 추천하되, 사용자는 모집 중인 모든 식탁을 자유롭게 둘러보고 선택할 수 있습니다. 최종 확정 시에만 필수 조건을 검증합니다.</p></div>
      <button type="button" onClick={startRecommendation} style={{display:'inline-flex',alignItems:'center',gap:9,border:'1px solid #4a3423',background:'#4a3423',color:'#fff4e4',padding:'14px 19px',fontSize:'.78rem',fontWeight:800,cursor:'pointer',whiteSpace:'nowrap'}}><Sparkles size={15}/>AI 맞춤 식탁 추천받기<ArrowRight size={14}/></button>
    </div>
  </Content>
  {selectedTable&&<Overlay onMouseDown={e=>{if(e.target===e.currentTarget){setSelectedTable(null);setModalStep('DETAIL');setCheckoutApplicationId(null);}}}><Modal role="dialog" aria-modal="true" aria-labelledby="join-title">
    <div className="close-row"><span className="eyebrow">{modalStep==='PAYMENT'?'SECURE CHECKOUT · DEMO':modalStep==='APPLICATION'?'APPLICATION REVIEW':modalStep==='PLAN'?'CHOOSE YOUR PASS':modalStep==='RECOMMENDATION'?'PERSONAL TABLE CURATION':'TABLE DETAILS'}</span><button className="close" type="button" onClick={()=>{setSelectedTable(null);setModalStep('DETAIL');setCheckoutApplicationId(null);}} aria-label="신청 닫기"><X size={16}/></button></div>
    <div className="steps"><span className={modalStep==='RECOMMENDATION'||modalStep==='DETAIL'?'active':''}>01 추천</span><span className={modalStep==='PLAN'?'active':''}>02 이용권</span><span className={modalStep==='APPLICATION'?'active':''}>03 신청</span><span className={modalStep==='PAYMENT'?'active':''}>04 결제</span></div>
    {(modalStep==='RECOMMENDATION'||modalStep==='DETAIL')&&<>
      <h3 id="join-title">{displayText(selectedTable.title)}</h3>
      {modalStep==='RECOMMENDATION'&&<div className="match-score"><Sparkles size={14}/> 나와의 추천 적합도 {selectedTable.evaluation.totalScore}점</div>}
      <p>{selectedTable.region} · {formatDate(selectedTable.event_date)} · {selectedTable.event_time||'19:00'}<br/>{selectedTable.venue?.name||'식당 안내 예정'}{selectedTable.venue?.price_range?` · ${selectedTable.venue.price_range}`:''}</p>
      <div className="table-details"><div><small>현재 인원</small><strong>{selectedTable.currentCount}/{selectedTable.max_members||6}명</strong></div><div><small>남은 자리</small><strong>{selectedTable.remainingSeats}석</strong></div><div><small>카테고리</small><strong>{displayText(selectedTable.category)}</strong></div></div>
      <div className="tags" style={{display:'flex',flexWrap:'wrap',gap:6,margin:'10px 0 15px'}}>{(selectedTable.tags||[]).slice(0,5).map(tag=><span key={tag} style={{padding:'6px 8px',background:'#eee3d2',color:'#7b664d',fontSize:'.65rem'}}>{displayText(tag)}</span>)}</div>
      <div className="policy"><strong>{modalStep==='RECOMMENDATION'?'추천한 이유':'이 식탁에 대해'}</strong><br/>{selectedTable.evaluation.explanation||selectedTable.curation_reason||'관심사, 희망 지역과 참석 가능 일정을 바탕으로 추천했습니다.'}<br/><br/><span style={{fontSize:'.7rem',fontWeight:800,color:'#60462b'}}>{selectedTable.evaluation.passedHardConstraints?'현재 프로필과 잘 맞는 후보입니다.':'추천 점수와 차이가 있어도 선택할 수 있습니다. 자동 매칭에서 필수 조건을 확인하고 필요하면 다른 식탁으로 재배치합니다.'}</span><br/><br/><span style={{fontSize:'.66rem'}}>추천은 현재 프로필 기반 점수 엔진을 사용하는 데모이며, 실제 AI 모델 연결 전까지는 점수 기반 추천입니다.</span></div>
      <div className="actions"><button className="secondary" type="button" onClick={()=>{setSelectedTable(null);setModalStep('DETAIL');}}>다른 식탁 보기</button><button type="button" onClick={()=>setModalStep('PLAN')}>시작하기 <ArrowRight size={14} style={{verticalAlign:'middle',marginLeft:5}}/></button></div>
    </>}
    {modalStep==='PLAN'&&<>
      <h3 id="join-title">어떤 이용권으로 시작할까요?</h3><p>참가할 식탁을 선택했어요. 이용권을 고르고 신청·결제 단계로 이동하세요.</p>
      <div className="plans">{plans.map(p=><button key={p.id} type="button" className={`plan ${selectedPlan.id===p.id?'active':''}`} onClick={()=>setSelectedPlan(p)}><span style={{fontSize:'.62rem',letterSpacing:'.08em'}}>{p.id==='ONE_TIME'?'ONE TABLE':p.id==='MEMBERSHIP_ACTIVE'?'ACTIVE MEMBERSHIP':p.id==='STORED_TICKET'?'STORED TICKET':'UNLIMITED TABLES'}</span>{p.recommended&&<span className="flag">인기</span>}<strong>{p.name}</strong><span style={{fontWeight:800,fontSize:'1rem'}}>{p.price===0?'추가 결제 없음':`${p.price.toLocaleString('ko-KR')}원`}</span><small>{p.desc}</small></button>)}</div>
      <div className="policy"><strong>이용권 안내</strong><br/>하루권(1회권) 9,900원 · 1개월 35,000원 · 3개월 75,000원 · 6개월 120,000원. 멤버십은 기간 내 참여 횟수 제한이 없으며, 매칭 실패 1회당 이용 기한을 1일 연장하는 정책으로 시연합니다.</div>
      <div className="actions"><button className="secondary" type="button" onClick={()=>setModalStep('DETAIL')}>이전</button><button type="button" onClick={()=>{setPolicyAccepted(false);setModalStep('APPLICATION');}}>신청서 작성 <ArrowRight size={14} style={{verticalAlign:'middle',marginLeft:5}}/></button></div>
    </>}
    {modalStep==='APPLICATION'&&<>
      <h3 id="join-title">신청 내용을 확인해 주세요.</h3>
      <p>이 단계에서 참가 신청을 먼저 등록하고, 다음 단계에서 결제 또는 보유 멤버십 사용을 확인합니다.</p>
      <div className="payment-summary"><div className="row"><span>식탁</span><strong>{displayText(selectedTable.title)}</strong></div><div className="row"><span>일정 · 지역</span><strong>{formatDate(selectedTable.event_date)} · {selectedTable.region}</strong></div><div className="row"><span>이용권</span><strong>{selectedPlan.name}</strong></div><div className="row total"><span>결제 예정 금액</span><strong>{selectedPlan.price.toLocaleString('ko-KR')}원</strong></div></div>
      <div className="policy"><strong>신청 및 취소 정책</strong><br/>신청 후 결제 완료 전에는 좌석을 예약하지 않습니다. 결제 완료 후 희망 지역·일정, 4~6인 구성, 8세 이내 연령 차이와 비선호·안전 조건을 다시 검사합니다. 적합한 식탁을 찾지 못하면 자동 재배치 또는 대체 일정 선택을 안내합니다. 화요일 24:00 이후 환불이 제한되고 행사 당일 앱 취소는 제한됩니다.</div>
      <label style={{display:'flex',alignItems:'flex-start',gap:10,margin:'14px 0 18px',fontSize:'.74rem',lineHeight:1.6,color:'#614a33',cursor:'pointer'}}><input type="checkbox" checked={policyAccepted} onChange={e=>setPolicyAccepted(e.target.checked)} style={{marginTop:3,accentColor:'#63472d',flexShrink:0}}/> 위 신청 내용과 환불·취소 정책을 확인했습니다.</label>
      <div className="actions"><button className="secondary" type="button" onClick={()=>setModalStep('PLAN')}>이용권 변경</button><button type="button" disabled={!policyAccepted} style={!policyAccepted?{opacity:.45,cursor:'not-allowed'}:{}} onClick={submitApplication}>신청서 제출 · 결제 단계 <ArrowRight size={14} style={{verticalAlign:'middle',marginLeft:5}}/></button></div>
    </>}
    {modalStep==='PAYMENT'&&<>
      <h3 id="join-title">{selectedPlan.id==='MEMBERSHIP_ACTIVE'?'멤버십 사용을 확인해 주세요.':'결제를 진행해 주세요.'}</h3><p>{displayText(selectedTable.title)}<br/>{selectedTable.region} · {formatDate(selectedTable.event_date)} · {selectedTable.event_time||'19:00'}</p>
      <div className="payment-summary"><div className="row"><span>이용권</span><strong>{selectedPlan.name}</strong></div><div className="row"><span>식당</span><strong>{selectedTable.venue?.name||'매칭 확정 후 안내'}</strong></div><div className="row"><span>결제 방식</span><strong>{selectedPlan.price===0?'보유 멤버십':'모의 결제'}</strong></div><div className="row total"><span>결제 예정 금액</span><strong>{selectedPlan.price.toLocaleString('ko-KR')}원</strong></div></div>
      <div className="policy"><strong>개발 데모 안내</strong><br/>{selectedPlan.id==='MEMBERSHIP_ACTIVE'?'보유 중인 멤버십을 사용합니다. 추가 결제는 발생하지 않습니다.':selectedPlan.id==='STORED_TICKET'?'보관된 1회권을 사용합니다. 추가 결제는 발생하지 않습니다.':'아래 버튼은 테스트용 모의 결제이며 실제 카드 승인이나 청구는 발생하지 않습니다.'} 결제가 완료되면 매칭 필수 조건을 재검증하고 자동 매칭·재배치를 진행합니다. 조건을 충족한 4~6인 식탁은 자동 확정 후 식당·단체 채팅방 안내가 이어집니다.</div>
      <div className="actions"><button className="secondary" type="button" onClick={()=>setModalStep('APPLICATION')}>신청 정보</button><button type="button" onClick={confirmJoin}>{selectedPlan.id==='MEMBERSHIP_ACTIVE'?'멤버십 사용 · 자동 매칭 시작':selectedPlan.id==='STORED_TICKET'?'보관 이용권 사용 · 자동 매칭 시작':'모의 결제 완료 · 자동 매칭 시작'} <ArrowRight size={14} style={{verticalAlign:'middle',marginLeft:5}}/></button></div>
    </>}
  </Modal></Overlay>}
  </Shell>;
}

import React, { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { ArrowRight, CalendarDays, Check, CheckCircle2, Circle, Clock3, CreditCard, Heart, LoaderCircle, LockKeyhole, MapPin, MessageCircle, RotateCcw, ShieldCheck, Sparkles, Star, Ticket, Utensils, Users } from 'lucide-react';
import { evaluateTableClient } from '../data/mockDatabase';

const STEPS = [
  { key: 'APPLICATION', label: '신청', title: '신청 내용을 확인했어요', description: '선택한 식탁과 이용권, 일정 및 환불 정책을 확인하고 신청서를 제출했습니다.' },
  { key: 'PAYMENT', label: '결제', title: '이용권 결제', description: '금액과 이용권 종류를 확인하고 결제를 진행합니다.' },
  { key: 'MATCHING', label: '자동 매칭', title: '조건에 맞는 식탁 찾기', description: '결제 완료자 중 희망 지역·날짜, 연령 및 안전 조건을 확인합니다.' },
  { key: 'REALLOCATION', label: '자동 재배치', title: '필요하면 다른 식탁 검토', description: '선택한 일정에서 먼저 탐색하고, 부족하면 다른 날짜·지역의 열린 식탁을 직접 선택할 수 있습니다.' },
  { key: 'CONFIRMATION', label: '자동 확정', title: '4~6인 및 필수 조건 검증', description: '필수 조건과 최소 인원을 충족한 경우 운영자 사전 승인 없이 자동 확정합니다.' },
  { key: 'VENUE_CHAT', label: '식당·단체방 안내', title: '식당과 단체방 안내', description: '확정된 식탁의 식당, 모임 시간, 참가 안내와 단체 채팅방을 확인합니다.' },
  { key: 'ATTENDANCE', label: '참석', title: '모임 당일 체크인', description: '안내받은 시간과 장소를 확인한 후 모임 당일 참석을 기록합니다.' },
  { key: 'FEEDBACK', label: '피드백', title: '식탁 경험 남기기', description: '분위기·대화·식당 만족도를 평가해 다음 매칭에 반영합니다.' },
  { key: 'NEXT_MATCH', label: '다음 매칭', title: '다음 식탁 추천받기', description: '참가 경험과 피드백을 바탕으로 다음에 어울릴 새로운 식탁을 찾아봅니다.' },
];

const Shell = styled.main`background:radial-gradient(ellipse at 8% 0%,rgba(191,158,111,.15),transparent 34%),#f4ede2;color:#39291d;min-height:calc(100vh - 130px);padding:clamp(22px,4vw,52px) clamp(16px,4vw,64px) 80px;`;
const Content = styled.div`max-width:1320px;margin:0 auto;`;
const Hero = styled.header`
  position:relative;isolation:isolate;overflow:hidden;display:flex;justify-content:space-between;align-items:flex-end;gap:24px;
  min-height:280px;padding:clamp(24px,4vw,48px);border:1px solid #9d815c;
  background:linear-gradient(90deg,rgba(28,28,22,.96) 0%,rgba(38,31,24,.88) 49%,rgba(43,31,22,.44) 100%),url('${import.meta.env.BASE_URL}assets/dining-table.webp') center 54%/cover;
  box-shadow:0 25px 55px rgba(49,34,20,.14);
  &:after{content:'';position:absolute;z-index:-1;right:-90px;top:-120px;width:360px;height:360px;border:1px solid rgba(227,195,147,.38);border-radius:50%;box-shadow:0 0 0 18px rgba(227,195,147,.035),0 0 0 42px rgba(227,195,147,.025);}
  >div:first-child{max-width:720px;}
  @media(max-width:850px){align-items:flex-start;flex-direction:column;min-height:0;}
  .kicker{font-size:.66rem;font-weight:800;letter-spacing:.18em;color:#d9bd8e;}
  h1{font:500 clamp(2.25rem,4.8vw,4.4rem)/1.16 'Noto Serif KR',serif;letter-spacing:-.08em;margin:12px 0 12px;color:#fff2df;}
  h1 em{font-style:normal;color:#d9bd8e;}
  p{margin:0;max-width:630px;font-size:.83rem;line-height:1.85;color:#eadbc5;}
`;
const ExitActions = styled.div`position:relative;z-index:1;display:flex;gap:8px;flex-wrap:wrap;button{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:43px;padding:11px 15px;border:1px solid rgba(235,214,183,.55);background:rgba(255,248,236,.08);backdrop-filter:blur(8px);color:#fff1df;font-size:.72rem;font-weight:800;cursor:pointer;transition:.18s;}button:hover{background:rgba(255,248,236,.17);}button.primary{background:#d9bd8e;border-color:#d9bd8e;color:#342719;}`;
const Summary = styled.section`display:grid;grid-template-columns:1.4fr repeat(3,minmax(105px,.55fr));gap:10px;margin:20px 0 26px;@media(max-width:760px){grid-template-columns:repeat(2,minmax(0,1fr));}`;
const SummaryCard = styled.div`min-width:0;padding:16px 17px;background:linear-gradient(155deg,#fffaf2,#f0e4d2);border:1px solid #dac7ad;box-shadow:0 8px 19px rgba(62,42,23,.045);.label{font-size:.63rem;letter-spacing:.09em;color:#957b59;font-weight:800;}.value{display:block;margin-top:7px;color:#493423;font-size:.82rem;font-weight:800;line-height:1.5;overflow-wrap:anywhere;}.sub{display:block;margin-top:4px;color:#8f7b64;font-size:.67rem;line-height:1.5;}`;
const Layout = styled.div`display:grid;grid-template-columns:minmax(0,.9fr) minmax(360px,1.1fr);gap:22px;align-items:start;@media(max-width:940px){grid-template-columns:1fr;}`;
const Timeline = styled.section`padding:clamp(18px,2.3vw,28px);background:linear-gradient(160deg,#fffaf3,#f3e9da);border:1px solid #ddcbb1;box-shadow:0 15px 35px rgba(58,38,20,.06);.title{font:500 1.25rem 'Noto Serif KR',serif;color:#493423;margin:0 0 5px;}.sub{margin:0 0 18px;color:#8b7762;font-size:.72rem;line-height:1.7;}`;
const StepRow = styled.div`
  position:relative;display:grid;grid-template-columns:38px minmax(0,1fr) auto;gap:10px;align-items:start;padding:12px 0;min-width:0;
  &:not(:last-child):after{content:'';position:absolute;left:18px;top:48px;bottom:-10px;width:1px;background:${p=>p.done?'#9eae91':'#e0d2bf'};}
  .icon{z-index:1;width:36px;height:36px;display:grid;place-items:center;border-radius:50%;border:1px solid ${p=>p.done?'#9db092':p.current?'#a58960':'#dfd0bb'};background:${p=>p.done?'#e2e9dd':p.current?'#eee1cd':'#f2eade'};color:${p=>p.done?'#526c49':p.current?'#6c4d2d':'#b4a189'};}
  .label{font-size:.78rem;font-weight:850;color:${p=>p.done?'#5a714f':p.current?'#493423':'#9a8873'};line-height:1.45;}.desc{font-size:.66rem;line-height:1.6;color:#9b8974;margin-top:4px;}.state{font-size:.59rem;font-weight:850;letter-spacing:.04em;color:${p=>p.done?'#5d764f':p.current?'#8b693c':'#ad9a84'};white-space:nowrap;margin-top:3px;}
`;
const Panel = styled.section`min-width:0;padding:clamp(20px,3vw,34px);background:linear-gradient(155deg,#f4e8d7,#eaddc9);border:1px solid #cdb594;box-shadow:0 20px 45px rgba(63,42,24,.09);.eyebrow{color:#9a7c54;font-size:.64rem;letter-spacing:.17em;font-weight:850;}.step-count{display:flex;justify-content:space-between;gap:12px;align-items:center;}h2{font:500 clamp(1.75rem,3vw,2.45rem)/1.3 'Noto Serif KR',serif;letter-spacing:-.07em;margin:13px 0 9px;color:#493423;}p{font-size:.78rem;line-height:1.8;color:#806950;margin:0 0 16px;}.callout{padding:13px 14px;background:rgba(255,250,242,.62);border:1px solid #ddccb4;color:#786147;font-size:.71rem;line-height:1.75;margin:14px 0 18px;}`;
const PrimaryButton = styled.button`width:100%;display:flex;align-items:center;justify-content:center;gap:9px;min-height:48px;padding:13px 16px;border:1px solid #493423;background:#493423;color:#fff5e8;font-size:.76rem;font-weight:850;cursor:pointer;transition:opacity .2s,transform .2s;&:hover:not(:disabled){transform:translateY(-1px);}&:disabled{opacity:.4;cursor:not-allowed;}`;
const SecondaryButton = styled.button`display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:42px;padding:10px 13px;border:1px solid #cbb596;background:transparent;color:#6c5237;font-size:.7rem;font-weight:800;cursor:pointer;`;
const LoaderPanel = styled.div`display:flex;align-items:center;gap:12px;padding:13px 14px;background:#493423;color:#fff5e8;font-size:.73rem;line-height:1.6;margin:15px 0;svg{flex-shrink:0;animation:spin 1.1s linear infinite;}@keyframes spin{to{transform:rotate(360deg)}}`;
const Notice = styled.div`padding:12px 14px;margin:14px 0;background:${p=>p.error?'#f8e4df':'#e3eadc'};border:1px solid ${p=>p.error?'#e1bbb1':'#c4d2b9'};color:${p=>p.error?'#9b4b3d':'#4d6847'};font-size:.72rem;line-height:1.7;`;
const Ratings = styled.div`display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:16px 0;@media(max-width:520px){grid-template-columns:1fr;}`;
const Rating = styled.label`display:flex;flex-direction:column;gap:7px;padding:10px;background:#fbf7ef;border:1px solid #dfcfb8;color:#775a3a;font-size:.68rem;font-weight:800;select{min-width:0;width:100%;padding:9px;border:1px solid #d8c7b1;background:#fffaf2;color:#493423;font-size:.73rem;}`;
const AlternativeGrid = styled.div`display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 0 18px;@media(max-width:620px){grid-template-columns:1fr;}`;
const AlternativeCard = styled.article`
  min-width:0;overflow:hidden;padding:0;background:#fffaf2;border:1px solid #d4bea0;box-shadow:0 10px 25px rgba(57,37,19,.07);display:flex;flex-direction:column;transition:transform .2s,box-shadow .2s,border-color .2s;
  &:hover{transform:translateY(-3px);box-shadow:0 20px 36px rgba(57,37,19,.13);border-color:#a6885f;}
  .visual{position:relative;min-height:148px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;padding:14px;background-size:cover;background-position:center;color:#fff3df;isolation:isolate;}
  .visual:before{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(100deg,rgba(23,19,13,.78),rgba(27,21,14,.12)),linear-gradient(0deg,rgba(22,18,12,.62),transparent 60%);}
  .visual-top{display:flex;align-items:center;justify-content:space-between;gap:10px;}
  .pill{display:inline-flex;align-items:center;align-self:flex-start;max-width:72%;background:rgba(36,27,18,.5);color:#fff1d9;border:1px solid rgba(241,216,177,.52);backdrop-filter:blur(7px);padding:6px 8px;font-size:.59rem;line-height:1.4;font-weight:850;}
  .capacity{display:inline-flex;align-items:center;gap:5px;padding:6px 8px;background:rgba(36,27,18,.48);border:1px solid rgba(241,216,177,.36);color:#fff3df;font-size:.64rem;font-weight:850;white-space:nowrap;}
  .visual-title{font:500 1.18rem/1.45 'Noto Serif KR',serif;letter-spacing:-.045em;text-shadow:0 2px 12px rgba(0,0,0,.32);max-width:95%;}
  .copy{display:flex;flex:1;flex-direction:column;gap:10px;padding:15px 16px 16px;}
  .title{font:600 .9rem/1.55 'Noto Serif KR',serif;color:#493423;overflow-wrap:anywhere;}
  .meta{font-size:.68rem;color:#88745d;line-height:1.75;}
  .why{font-size:.67rem;color:#8a765e;line-height:1.7;flex:1;border-top:1px solid #eadcc8;padding-top:10px;}
  button{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;min-height:43px;padding:11px;border:1px solid #6b4b2d;background:#6b4b2d;color:#fff5e8;font-size:.7rem;font-weight:850;cursor:pointer;transition:background .18s;}
  button:hover:not(:disabled){background:#8b6842;}button:disabled{opacity:.4;cursor:not-allowed;}
`;
const ResolutionActions = styled.div`display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px;@media(max-width:620px){grid-template-columns:1fr;}`;
const ResolutionButton = styled.button`display:flex;align-items:center;gap:10px;text-align:left;min-width:0;padding:14px;border:1px solid #d2bea3;background:#fbf7ef;color:#5e452d;cursor:pointer;svg{flex-shrink:0;}strong{display:block;font-size:.75rem;color:#493423;margin-bottom:4px;}small{display:block;font-size:.66rem;line-height:1.6;color:#89735a;} &:hover:not(:disabled){border-color:#90714a;background:#f4e8d7;} &:disabled{opacity:.4;cursor:not-allowed;}`;
const FeedbackText = styled.textarea`width:100%;min-height:78px;resize:vertical;padding:11px;border:1px solid #d8c7b1;background:#fffaf2;color:#493423;font:inherit;font-size:.75rem;box-sizing:border-box;`;
const FooterHint = styled.div`margin-top:16px;color:#99856d;font-size:.65rem;line-height:1.7;`;

function buildStepStatus(application, feedbackExists) {
  const history = application.workflow_history || [];
  const paid = ['PAID','REFUND_AVAILABLE','REFUND_REQUESTED','REFUND_PROCESSING','REFUNDED'].includes(application.payment_status);
  const hasAlternativeResolution = ['ALTERNATIVE_OFFERED', 'NO_MATCH'].includes(application.match_status);
  const done = [
    application.application_status === 'SUBMITTED' && application.payment_status !== 'PENDING' || application.application_status === 'SUBMITTED',
    paid,
    history.includes('AUTO_MATCHING_COMPLETED') || hasAlternativeResolution,
    history.includes('REALLOCATION_CHECKED') || history.includes('AUTO_REALLOCATED') || hasAlternativeResolution,
    application.match_status === 'CONFIRMED',
    history.includes('VENUE_CHAT_READY'),
    application.attendance_status === 'ATTENDED',
    feedbackExists,
    history.includes('NEXT_MATCH_STARTED'),
  ];
  return done;
}

export default function ParticipationJourneyView({ currentUser, store, applicationId, onAdvanceStage, onGoHome, onGoMyPage, onOpenChat, onCheckInAttendance, onSubmitFeedback, onStartNextMatch, onTransferAlternativeSlot, onResolveMatchFailure }) {
  const application = (store.applications || []).find((a) => a.id === applicationId && a.user_id === currentUser?.id);
  const table = application && (store.diningTables || []).find((t) => t.id === application.table_id);
  const venue = table && (store.venues || []).find((v) => v.id === table.venue_id);
  const feedbackExists = (store.feedbacks || []).some((f) => f.application_id === applicationId && f.user_id === currentUser?.id);
  const done = useMemo(() => application ? buildStepStatus(application, feedbackExists) : Array(9).fill(false), [application, feedbackExists]);
  const firstPending = done.findIndex((x) => !x);
  const currentIndex = firstPending < 0 ? 9 : firstPending;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState({ atmosphere_rating: 5, conversation_rating: 5, venue_rating: 5, rejoin_intent: true, nps_score: 9, comment: '', liked_user_ids: [], disliked_user_ids: [] });

  useEffect(() => { setMessage(''); }, [applicationId, application?.workflow_stage, application?.payment_status, application?.match_status, application?.attendance_status, application?.resolution_choice, feedbackExists]);

  const currentStep = STEPS[currentIndex];
  const isAlternative = application && ['ALTERNATIVE_OFFERED','NO_MATCH'].includes(application.match_status);
  const isTransferredWaiting = application?.last_resolution_choice === 'TRANSFER' && application?.match_status === 'WAITING';
  const previewMemberCount = Number(application?.matching_preview_member_count || 0);
  const previewMergedCount = (application?.matching_preview_merged_table_ids || []).length;
  const confirmed = application?.match_status === 'CONFIRMED';
  const today = new Date().toLocaleDateString('sv-SE');
  const eventDate = String(table?.event_date || '').slice(0, 10);
  const eventStart = table && eventDate ? new Date(`${eventDate}T${table.event_time || '19:00'}:00`) : null;
  const canCheckInDate = Boolean(confirmed && application?.attendance_status === 'SCHEDULED' && today === eventDate && eventStart && new Date() >= new Date(eventStart.getTime() - 2 * 60 * 60 * 1000) && new Date() <= new Date(eventStart.getTime() + 3 * 60 * 60 * 1000));
  const tableMembers = (table?.member_ids || []).map((id) => (store.users || []).find((u) => u.id === id)).filter((u) => u && u.id !== currentUser?.id);

  const normalizeRegion = (region) => region === '종로/을지로' ? '을지로/종로' : region;
  const requestedRegions = [...new Set([...(application?.desired_regions?.length ? application.desired_regions : (currentUser?.preferred_regions || []))].map(normalizeRegion))];
  const requestedDates = (application?.desired_dates || []).map((date) => String(date).slice(0, 10)).filter(Boolean);
  const alternativeTables = useMemo(() => {
    if (!application || !currentUser || confirmed || application.resolution_choice) return [];
    return (store.diningTables || []).filter((candidate) => {
      if (candidate.id === application.table_id || !['WAITING', 'REALLOCATING'].includes(candidate.match_status || 'WAITING')) return false;
      // Ignore stale pending membership from a previous matching attempt. It must not
      // hide an otherwise open table or make a full table look full incorrectly.
      const membersWithoutCurrentUser = (candidate.member_ids || []).filter((id) => id !== currentUser.id);
      if (membersWithoutCurrentUser.length >= (candidate.max_members || 6)) return false;
      return Boolean(candidate.event_date);
    }).map((candidate) => {
      const normalizedRegion = normalizeRegion(candidate.region);
      const date = String(candidate.event_date || '').slice(0, 10);
      const sameRegion = requestedRegions.includes(normalizedRegion);
      const sameDate = requestedDates.includes(date);
      const inSelectedScope = sameRegion && sameDate;
      const membersWithoutCurrentUser = [...new Set((candidate.member_ids || []).filter((id) => id !== currentUser.id))];
      const sanitizedCandidate = { ...candidate, member_ids: membersWithoutCurrentUser };
      const evaluationUser = { ...currentUser, preferred_regions: [...new Set([...(currentUser.preferred_regions || []), candidate.region, normalizedRegion])] };
      const evaluation = evaluateTableClient(evaluationUser, sanitizedCandidate, store);
      const otherMembers = membersWithoutCurrentUser.length;
      const canMeetHardConditions = evaluation.ageConstraintPassed && !evaluation.hasSafetyConflict && !evaluation.isFull;
      const canReachMinimumWithOne = otherMembers + 1 >= (candidate.min_members || 4);
      return { ...sanitizedCandidate, normalizedRegion, date, sameRegion, sameDate, inSelectedScope, evaluation, canMeetHardConditions, canReachMinimumWithOne };
    }).sort((a, b) => {
      const bucket = (table) => table.sameDate && table.sameRegion ? 0 : table.sameDate ? 1 : table.sameRegion ? 2 : 3;
      if (bucket(a) !== bucket(b)) return bucket(a) - bucket(b);
      if (a.canMeetHardConditions !== b.canMeetHardConditions) return a.canMeetHardConditions ? -1 : 1;
      if (a.canReachMinimumWithOne !== b.canReachMinimumWithOne) return a.canReachMinimumWithOne ? -1 : 1;
      return b.evaluation.totalScore - a.evaluation.totalScore || String(a.event_date).localeCompare(String(b.event_date));
    }).slice(0, 12);
  }, [application, currentUser, store, confirmed, requestedRegions.join('|'), requestedDates.join('|')]);

  const resolveFailure = async (choice, targetTable = null) => {
    if (busy) return;
    setBusy(true);
    setMessage(choice === 'TRANSFER' ? '선택한 일정·지역을 기준으로 다른 열린 식탁까지 다시 검색합니다.' : choice === 'STORE_TICKET' ? '이용권 보관 상태를 기록하고 있어요.' : '원결제수단 환불 요청 상태를 기록하고 있어요.');
    await new Promise((resolve) => setTimeout(resolve, 700));
    let result;
    if (choice === 'TRANSFER') result = onTransferAlternativeSlot?.(application.id, targetTable.id);
    else result = onResolveMatchFailure?.(application.id, choice);
    setBusy(false);
    setMessage(result?.message || (result?.ok === false ? '선택을 처리하지 못했습니다.' : '선택 결과를 저장했습니다.'));
  };

  if (!application) {
    return <Shell><Content><Hero><div><span className="kicker">YOUR TABLE JOURNEY</span><h1>진행 중인 신청을<br/>찾을 수 없어요.</h1><p>마이페이지에서 신청 상태를 확인하거나 새 식탁을 추천받아 주세요.</p></div><ExitActions><button className="primary" onClick={onGoHome}>식탁 둘러보기</button><button onClick={onGoMyPage}>마이페이지</button></ExitActions></Hero></Content></Shell>;
  }
  if (application.application_status === 'CANCELED') {
    return <Shell><Content><Hero><div><span className="kicker">APPLICATION CANCELLED</span><h1>신청이<br/><em>취소되었어요.</em></h1><p>이 신청은 더 이상 진행되지 않습니다. 결제 전 취소라면 과금이나 환불은 발생하지 않습니다. 다른 식탁을 둘러보거나 마이페이지에서 이전 내역을 확인할 수 있어요.</p></div><ExitActions><button className="primary" onClick={onGoHome}>다른 식탁 둘러보기</button><button onClick={onGoMyPage}>마이페이지</button></ExitActions></Hero></Content></Shell>;
  }

  const performAdvance = async (stageKey) => {
    if (busy) return;
    setBusy(true); setMessage('단계 진행을 요청하고 있어요.');
    await new Promise((resolve) => setTimeout(resolve, 850));
    const result = onAdvanceStage?.(application.id, stageKey);
    setBusy(false);
    if (result && result.message) setMessage(result.message);
    if (result && result.ok === false) setMessage(result.message || '조건을 충족하지 못해 다음 단계로 넘어가지 않았어요.');
  };

  const completeAttendance = async () => {
    if (busy) return;
    setBusy(true); setMessage('모임 일정과 체크인 조건을 확인하고 있어요.');
    await new Promise((resolve) => setTimeout(resolve, 600));
    const ok = onCheckInAttendance?.(application.id);
    setBusy(false);
    setMessage(ok ? '체크인이 완료되었어요. 다음 단계에서 경험을 남겨주세요.' : '체크인 조건을 충족하지 않았어요. 모임 날짜와 시간을 확인해주세요.');
  };

  const submitFeedback = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setMessage('피드백을 저장하고 있어요.');
    await new Promise((resolve) => setTimeout(resolve, 500));
    const ok = onSubmitFeedback?.({ ...feedback, application_id: application.id, table_id: application.table_id });
    setBusy(false);
    setMessage(ok ? '피드백이 저장되었어요. 다음 매칭 추천에 활용할 수 있어요.' : '피드백을 저장하지 못했어요. 참석 완료 상태인지 확인해주세요.');
  };

  const startNextMatch = async () => {
    if (busy) return;
    setBusy(true); setMessage('저장된 피드백과 이전 만남 기록을 반영해 다음 식탁을 준비하고 있어요.');
    await new Promise((resolve) => setTimeout(resolve, 700));
    onStartNextMatch?.(application.id);
    setBusy(false);
  };

  const stepButton = (label, key, Icon = ArrowRight) => <PrimaryButton type="button" disabled={busy} onClick={() => performAdvance(key)}>{busy ? <LoaderCircle size={16}/> : <Icon size={16}/>} {busy ? '처리 중…' : label}</PrimaryButton>;
  const currentMeta = currentStep || { key: 'DONE', label: '완료', title: '모든 단계를 확인했어요', description: '다음 식탁을 추천받거나 현재 신청 내역을 확인할 수 있습니다.' };

  return <Shell><Content>
    <Hero>
      <div><span className="kicker">PARTICIPATION JOURNEY · STEP BY STEP</span><h1>좋은 만남까지,<br/><em>모든 과정을 함께.</em></h1><p>전체 진행 상태를 투명하게 보여드려요. 개인정보·필수 정책처럼 반드시 필요한 동의만 받고, 매칭·재배치·안내 같은 일반 단계는 버튼 한 번으로 진행합니다. 처리 중에는 로딩 상태와 결과를 안내합니다.</p></div>
      <ExitActions><button onClick={onGoHome}><Sparkles size={14}/> 식탁 둘러보기</button><button onClick={onGoMyPage}>마이페이지</button>{confirmed && <button className="primary" onClick={() => onOpenChat?.(table?.id)}><MessageCircle size={14}/> 단체방 열기</button>}</ExitActions>
    </Hero>
    <Summary>
      <SummaryCard><span className="label">MY TABLE</span><span className="value">{table?.title || '대체 일정 안내'}</span><span className="sub">신청 번호 · {application.id}</span></SummaryCard>
      <SummaryCard><span className="label">일정</span><span className="value"><CalendarDays size={14} style={{verticalAlign:'-2px',marginRight:4}}/>{eventDate || '조율 중'}</span><span className="sub">{table?.event_time || '시간 안내 예정'}</span></SummaryCard>
      <SummaryCard><span className="label">지역</span><span className="value"><MapPin size={14} style={{verticalAlign:'-2px',marginRight:4}}/>{table?.region || (application.desired_regions || []).join(', ')}</span><span className="sub">{venue?.name || '확정 후 식당 안내'}</span></SummaryCard>
      <SummaryCard><span className="label">결제 상태</span><span className="value">{application.payment_status === 'PENDING' ? '결제 대기' : application.resolution_choice === 'STORE_TICKET' ? '이용권 보관 완료' : application.resolution_choice === 'REFUND' ? '환불 요청 접수' : application.payment_mode === 'DEMO' && application.payment_status === 'PAID' ? '모의 결제 완료' : application.payment_mode === 'MEMBERSHIP' && !application.amount ? '멤버십 사용' : application.payment_mode === 'TICKET_CREDIT' ? '보관 이용권 사용' : application.payment_status === 'REFUND_AVAILABLE' ? '환불 선택 가능' : application.payment_status}</span><span className="sub">{Number(application.amount || 0).toLocaleString('ko-KR')}원</span></SummaryCard>
    </Summary>
    {message && <Notice error={/못했|찾지|없어요|실패|충족하지/.test(message)}>{message}</Notice>}
    <Layout>
      <Timeline><h2 className="title">진행 단계 전체 보기</h2><p className="sub">총 9단계 · 현재 상태를 실시간으로 반영합니다.</p>
        {STEPS.map((step, index) => {
          const isDone = done[index]; const isCurrent = index === currentIndex; const locked = !isDone && !isCurrent;
          return <StepRow key={step.key} done={isDone} current={isCurrent}>
            <span className="icon">{isDone ? <Check size={17}/> : locked ? <LockKeyhole size={15}/> : busy ? <LoaderCircle size={16}/> : <Circle size={13}/>}</span>
            <div><div className="label">{String(index + 1).padStart(2,'0')} · {step.label}</div><div className="desc">{isDone ? (step.key === 'REALLOCATION' && !application.workflow_history?.includes('AUTO_REALLOCATED') ? '재배치가 필요한지 확인했고 기존 식탁을 유지했어요.' : '완료') : isCurrent ? step.description : '이전 단계가 완료되면 진행할 수 있어요.'}</div></div>
            <span className="state">{isDone ? '완료' : isCurrent ? (busy ? '진행 중' : '현재 단계') : '대기'}</span>
          </StepRow>;
        })}
      </Timeline>
      <Panel>
        <div className="step-count"><span className="eyebrow">CURRENT STEP</span><span style={{fontSize:'.68rem',fontWeight:850,color:'#8c6a40'}}>{currentIndex >= 9 ? '09 / 09 COMPLETE' : `${String(currentIndex + 1).padStart(2,'0')} / 09`}</span></div>
        {currentIndex >= 9 ? <>
          <h2>모든 단계를 확인했어요.</h2><p>참가와 피드백이 기록되었습니다. 다음 식탁을 추천받아 새로운 인연을 이어가 보세요.</p>
          <PrimaryButton onClick={() => onStartNextMatch?.(application.id)}><Heart size={16}/> 다음 식탁 추천받기</PrimaryButton>
        </> : <>
          <h2>{currentMeta.title}</h2><p>{currentMeta.description}</p>
          <div className="callout">
            <strong>지금 확인할 내용</strong><br/>
            {currentIndex === 1 && (application.ticket_credit_id ? '보관된 1회권을 사용합니다. 별도의 결제나 실제 과금은 발생하지 않습니다.' : application.payment_mode === 'MEMBERSHIP' ? '보유 중인 멤버십을 사용합니다. 추가 결제는 발생하지 않습니다.' : '모의 결제입니다. 실제 카드 승인이나 계좌 출금은 발생하지 않습니다. 아래 버튼을 누르면 데모 결제가 처리됩니다.')}
            {currentIndex === 2 && '결제 완료 신청만 대상으로 하며, 희망 지역·날짜·연령 차이(최대 8세)·차단 및 비선호 관계를 확인합니다.'}
            {currentIndex === 3 && '먼저 신청한 날짜와 지역의 조합을 탐색합니다. 맞는 식탁이 없다면 아래에서 다른 날짜나 지역을 직접 선택해 새 범위로 다시 매칭할 수 있습니다. 연령·안전 조건은 확정 전에 검증합니다.'}
            {currentIndex === 4 && (isAlternative ? '현재 조건에 맞는 식탁을 찾지 못했어요. 대체 일정 선택, 이용권 보관 또는 환불 옵션을 확인해 주세요.' : '4명 미만인 테이블은 확정하지 않습니다. 아직 인원이 부족하면 자동 확정 단계에서 대기 상태로 남습니다.')}
            {currentIndex === 5 && `식당: ${venue?.name || '식당 안내 예정'} · ${table?.region || ''} · ${eventDate || ''} ${table?.event_time || ''}. 단체방은 확정된 참가자에게만 열려요.`}
            {currentIndex === 6 && (canCheckInDate ? '모임 시간과 장소를 확인한 뒤 체크인을 진행할 수 있어요.' : `체크인은 모임 당일 시작 2시간 전부터 시작 후 3시간까지 가능합니다. 예정일은 ${eventDate || '아직 미정'}입니다.`)}
            {currentIndex === 7 && '피드백은 비공개로 기록되며, 분위기·대화·장소 점수와 다음 만남 의향을 입력합니다.'}
            {currentIndex === 8 && '다음 추천을 누르면 지금까지의 프로필과 저장된 피드백을 참고해 새로운 식탁을 제안합니다.'}
          </div>
          {isAlternative && currentIndex >= 4 && <Notice error>현재 신청은 대체 일정 선택이 필요합니다. 매칭 실패 상태에서 자동 확정을 진행하지 않아요.</Notice>}

          {currentIndex === 1 && <>
            <div className="callout"><strong>이용권</strong><br/>{application.ticket_type === 'ONE_TIME' ? '하루권 · 1회권 / 9,900원' : application.ticket_type === 'MEMBERSHIP_1M' ? '1개월 멤버십 / 35,000원' : application.ticket_type === 'MEMBERSHIP_3M' ? '3개월 멤버십 / 75,000원' : application.ticket_type === 'MEMBERSHIP_6M' ? '6개월 멤버십 / 120,000원' : '보유 멤버십 사용 / 추가 결제 없음'}</div>
            {stepButton(application.ticket_credit_id ? '보관 이용권 사용' : application.payment_mode === 'MEMBERSHIP' ? '보유 멤버십 사용' : '모의 결제 진행', 'PAYMENT', CreditCard)}
          </>}
          {currentIndex === 2 && <>
            {stepButton('자동 매칭 시작', 'MATCHING', Sparkles)}
          </>}
          {currentIndex === 3 && <>
            {stepButton('다른 식탁 재탐색', 'REALLOCATION', RotateCcw)}
          </>}
          {currentIndex === 4 && application.resolution_choice && <>
            <Notice>이번 매칭은 참가자가 선택한 대안에 따라 처리되었습니다. 자동 확정되지 않은 신청을 확정된 것으로 표시하지 않습니다.</Notice>
            <div className="callout"><strong>선택한 대안</strong><br/>{application.resolution_choice === 'TRANSFER' ? `대체 일정 이동 · ${table?.region || ''} · ${eventDate || ''}` : application.resolution_choice === 'STORE_TICKET' ? (application.ticket_type === 'ONE_TIME' ? '1회권 보관 · 마이페이지에서 다시 사용할 수 있습니다.' : '멤버십 유지 · 매칭 실패 1회 연장이 반영되었습니다.') : '환불 선택 접수 · 결제대행사 연동 전이라 실제 환불 완료는 아닙니다.'}<br/>{application.refund_reason || application.match_reason || ''}</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><SecondaryButton onClick={onGoHome}>다른 식탁 둘러보기</SecondaryButton><SecondaryButton onClick={onGoMyPage}>마이페이지에서 상태 확인</SecondaryButton></div>
          </>}
          {currentIndex === 4 && !application.resolution_choice && isTransferredWaiting && <>
            <Notice>대체 일정으로 이동했어요. 기존 결제는 유지되며, 새 식탁의 참가 인원이 충족되면 필수 조건을 다시 검증해 확정합니다. 현재 {Math.min(6, (table?.member_ids || []).length)}/{table?.max_members || 6}명입니다. 아직 인원이 부족하므로 이 단계에서 확정을 임의로 진행하지 않습니다.</Notice>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><SecondaryButton onClick={onGoHome}>다른 식탁 둘러보기</SecondaryButton><SecondaryButton onClick={onGoMyPage}>마이페이지에서 진행 상태 확인</SecondaryButton></div>
          </>}
          {currentIndex === 4 && !application.resolution_choice && !isAlternative && !isTransferredWaiting && <>
            {previewMemberCount >= 4 ? <Notice>
              병합 가능한 그룹을 확인했습니다. 최종 예상 인원은 <strong>{previewMemberCount}/{table?.max_members || 6}명</strong>
              {previewMergedCount > 0 ? `이며, 같은 지역·일정의 미완성 식탁 ${previewMergedCount}개를 함께 병합합니다.` : '입니다.'}
              {' '}다음 버튼에서 정원·연령·안전 조건을 마지막으로 검증합니다.
            </Notice> : <Notice>
              현재 식탁에는 {(table?.member_ids || []).filter((id) => id !== currentUser?.id).length}명이 있습니다. 같은 지역·날짜·시간의 미완성 식탁까지 함께 찾아 4~6명 구성을 시도합니다. 가능한 조합이 없으면 사용자를 이 식탁에 묶어두지 않고 다른 식탁 선택 화면을 제공합니다.
            </Notice>}
            {stepButton('4~6인 구성 및 필수 조건 확인', 'CONFIRMATION', ShieldCheck)}
          </>}
          {[2, 3, 4].includes(currentIndex) && !application.resolution_choice && !confirmed && alternativeTables.length > 0 && <>
            <h3 style={{fontSize:'1.02rem',fontWeight:850,color:'#493423',margin:'24px 0 8px',fontFamily:"'Noto Serif KR',serif"}}>다른 식탁도 직접 선택할 수 있어요.</h3>
            <p style={{fontSize:'.73rem',lineHeight:1.8,color:'#806950'}}>추천 조건이 다르다는 이유로 선택을 막지 않습니다. 카드를 고르면 해당 일정·지역으로 범위를 바꾸고 매칭을 다시 시작해요. 최종 확정 전에만 연령·안전·정원 등 필수 조건을 확인합니다.</p>
            <AlternativeGrid>{alternativeTables.map((candidate, index) => <AlternativeCard key={candidate.id} expanded={!candidate.inSelectedScope || !candidate.canMeetHardConditions}>
              <div className="visual" style={{backgroundImage:`url('${import.meta.env.BASE_URL}assets/${index % 2 === 0 ? 'dining-group.webp' : 'dining-table.webp'}')`}}>
                <div className="visual-top"><span className="pill">{candidate.inSelectedScope ? '현재 선택 범위' : candidate.sameDate ? '다른 지역 선택' : candidate.sameRegion ? '다른 날짜 선택' : '새 일정·지역 선택'}</span><span className="capacity"><Users size={13}/>{(candidate.member_ids || []).length}/{candidate.max_members || 6}</span></div>
                <div className="visual-title">{candidate.title}</div>
              </div>
              <div className="copy">
                <div className="meta"><CalendarDays size={13} style={{verticalAlign:'-2px',marginRight:4}}/>{candidate.date || '일정 협의'} · {candidate.event_time || '시간 미정'}<br/><MapPin size={13} style={{verticalAlign:'-2px',marginRight:4}}/>{candidate.normalizedRegion} · 남은 자리 {Math.max(0,(candidate.max_members || 6)-(candidate.member_ids || []).length)}석</div>
                <div className="why">{candidate.canReachMinimumWithOne ? '한 명이 더 합류하면 최소 인원에 도달할 수 있어요.' : '현재 모집 중인 식탁입니다.'} {candidate.canMeetHardConditions ? '현재 프로필 기준으로 필수 조건을 충족할 가능성이 높아요.' : '선택은 가능해요. 확정 조건이 맞지 않으면 다른 열린 식탁을 이어서 탐색합니다.'} · 추천 적합도 {candidate.evaluation.totalScore}점</div>
                <button type="button" disabled={busy} onClick={() => resolveFailure('TRANSFER', candidate)}>{busy ? <LoaderCircle size={15}/> : <CalendarDays size={15}/>} 이 식탁 선택하고 매칭</button>
              </div>
            </AlternativeCard>)}</AlternativeGrid>
            {busy && <LoaderPanel><LoaderCircle size={17}/>선택한 일정·지역에서 참여 가능한 다른 식탁을 다시 검색하고 있습니다.</LoaderPanel>}
          </>}
          {currentIndex === 4 && isAlternative && !application.resolution_choice && <>
            <Notice error>현재 일정에서 자동 매칭과 재배치가 성공하지 않았어요. 다른 식탁을 선택하거나, 아래에서 이용권 보관 또는 환불을 선택할 수 있습니다.</Notice>
            {alternativeTables.length === 0 && <Notice>현재 바로 선택할 수 있는 열린 식탁이 없어요. 새 모집 일정이 열리면 다시 신청할 수 있고, 이용권 보관 또는 환불 선택도 가능합니다.</Notice>}
            <h3 style={{fontSize:'.95rem',fontWeight:850,color:'#493423',margin:'22px 0 8px',fontFamily:"'Noto Serif KR',serif"}}>다른 해결 방법</h3>
            <ResolutionActions>
              <ResolutionButton type="button" disabled={busy} onClick={() => resolveFailure('STORE_TICKET')}><Ticket size={19}/><span><strong>이용권 보관</strong><small>{application.ticket_type === 'ONE_TIME' ? '결제한 1회권을 보관해 다음 신청 때 사용할 수 있습니다.' : '멤버십을 유지하고 매칭 실패 1회 연장을 적용합니다.'}</small></span></ResolutionButton>
              <ResolutionButton type="button" disabled={busy || !['PAID','REFUND_AVAILABLE','REFUND_FAILED'].includes(application.payment_status)} onClick={() => resolveFailure('REFUND')}><RotateCcw size={19}/><span><strong>환불 선택</strong><small>원결제수단 환불 요청을 기록합니다. PG 연동 전 실제 환불은 완료되지 않습니다.</small></span></ResolutionButton>
            </ResolutionActions>
            {busy && <LoaderPanel><LoaderCircle size={17}/>선택한 대안을 처리하고 있습니다. 잠시만 기다려 주세요.</LoaderPanel>}
          </>}
          {currentIndex === 5 && <>
            <div style={{display:'flex',gap:9,flexWrap:'wrap'}}>{stepButton('안내 확인 완료', 'VENUE_CHAT', Utensils)}<SecondaryButton onClick={()=>onOpenChat?.(table?.id)}><MessageCircle size={14}/> 단체방 열기</SecondaryButton></div>
          </>}
          {currentIndex === 6 && <>
            {!canCheckInDate && <Notice error>아직 체크인 가능 시간이 아닙니다. 예정된 날짜에 다시 방문하면 이 단계에서 체크인할 수 있어요.</Notice>}
            <PrimaryButton type="button" disabled={!canCheckInDate || busy} onClick={completeAttendance}>{busy ? <LoaderCircle size={16}/> : <CheckCircle2 size={16}/>} {busy ? '체크인 확인 중…' : '참석 체크인'}</PrimaryButton>
          </>}
          {currentIndex === 7 && <form onSubmit={submitFeedback}>
            <Ratings>{[['atmosphere_rating','분위기'],['conversation_rating','대화'],['venue_rating','식당']].map(([key,label])=><Rating key={key}>{label}<select value={feedback[key]} onChange={e=>setFeedback(p=>({...p,[key]:Number(e.target.value)}))}>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}점</option>)}</select></Rating>)}</Ratings>
            <label style={{display:'block',fontSize:'.72rem',fontWeight:800,color:'#775a3a',margin:'10px 0 7px'}}>한 줄 후기 (선택)</label><FeedbackText value={feedback.comment} onChange={e=>setFeedback(p=>({...p,comment:e.target.value}))} placeholder="기억에 남는 대화나 순간을 남겨주세요."/>
            <PrimaryButton type="submit" disabled={busy}>{busy ? <LoaderCircle size={16}/> : <Star size={16}/>} {busy ? '피드백 저장 중…' : '피드백 제출'}</PrimaryButton>
          </form>}
          {currentIndex === 8 && <>
            <PrimaryButton type="button" disabled={busy} onClick={startNextMatch}>{busy ? <LoaderCircle size={16}/> : <Heart size={16}/>} {busy ? '다음 식탁 준비 중…' : '다음 식탁 추천받기'}</PrimaryButton>
          </>}
        </>}
        <FooterHint><ShieldCheck size={13} style={{verticalAlign:'-2px',marginRight:5}}/>자동 처리 결과와 단계별 이유를 기록합니다. 매칭 조건을 완화하거나 실제 결제 성공을 임의로 표시하지 않습니다.</FooterHint>
      </Panel>
    </Layout>
  </Content></Shell>;
}

import React from 'react';
import styled from '@emotion/styled';
import { ArrowRight, Compass, CreditCard, HeartHandshake, ShieldCheck, Sparkles, Ticket } from 'lucide-react';

const Shell = styled.main`
  min-height: calc(100vh - 150px);
  background: #f5efe4;
  color: #39291d;
  padding: clamp(28px, 5vw, 72px) clamp(18px, 5vw, 74px) 80px;
`;
const Content = styled.div`max-width: 1160px; margin: 0 auto;`;
const Kicker = styled.div`display:flex;align-items:center;gap:10px;color:#987a53;font-size:.68rem;font-weight:800;letter-spacing:.2em;&:before{content:'';height:1px;width:28px;background:#987a53;}`;
const Heading = styled.div`
  padding: 28px 0 34px; border-bottom: 1px solid #dacbb6;
  h1{margin:0 0 16px;font:500 clamp(2.7rem,6vw,5.5rem)/1.13 'Noto Serif KR',serif;letter-spacing:-.085em;color:#39291d;}
  h1 em{font-style:normal;color:#9d805a;}
  p{max-width:620px;margin:0;color:#806f5d;font-size:.92rem;line-height:1.9;}
`;
const ChoiceGrid = styled.section`display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:28px;@media(max-width:720px){grid-template-columns:1fr;}`;
const Choice = styled.button`
  position:relative;display:flex;flex-direction:column;align-items:flex-start;text-align:left;min-height:280px;padding:clamp(22px,3vw,34px);
  border:1px solid ${p=>p.primary?'#4b3522':'#d7c6ae'};background:${p=>p.primary?'#493423':'#fbf7ef'};color:${p=>p.primary?'#fff5e8':'#493423'};cursor:pointer;transition:transform .2s,box-shadow .2s,border-color .2s;
  &:hover{transform:translateY(-3px);box-shadow:0 16px 38px rgba(63,42,24,.1);border-color:#a68a65;}
  .icon{width:46px;height:46px;border:1px solid ${p=>p.primary?'#8a7257':'#d7c3a7'};display:grid;place-items:center;color:${p=>p.primary?'#e9d7bb':'#856746'};margin-bottom:28px;}
  .eyebrow{font-size:.64rem;font-weight:800;letter-spacing:.16em;opacity:.7;}
  h2{font:500 clamp(1.6rem,2.6vw,2.25rem)/1.35 'Noto Serif KR',serif;letter-spacing:-.06em;margin:12px 0 10px;}
  p{max-width:410px;margin:0;font-size:.8rem;line-height:1.85;opacity:.78;}
  .go{display:flex;align-items:center;gap:8px;margin-top:auto;padding-top:26px;font-size:.77rem;font-weight:800;}
`;
const Note = styled.div`display:flex;align-items:flex-start;gap:10px;margin-top:22px;padding:15px 16px;background:#eee3d2;border:1px solid #dfcfb8;color:#7e694f;font-size:.72rem;line-height:1.7;svg{flex-shrink:0;margin-top:2px;color:#9a7d55;}`;
const ActivePass = styled.div`display:flex;gap:10px;align-items:center;margin-top:20px;padding:13px 15px;background:#e7eadf;border:1px solid #d0d8c4;color:#4f6549;font-size:.75rem;line-height:1.6;svg{flex-shrink:0;}`;

export default function StartPortal({ currentUser, store, onStartMembership, onExplore }) {
  const activeMembership = (store.memberships || []).find((m) => m.user_id === currentUser?.id && m.status === 'ACTIVE' && new Date(m.expires_at) > new Date());
  return <Shell><Content>
    <Kicker>WHATSUP HOUSE · YOUR NEXT TABLE</Kicker>
    <Heading>
      <h1>오늘 저녁을 시작하는<br/><em>두 가지 방법.</em></h1>
      <p>{currentUser?.name || '반가워요'}님, 오늘은 새로운 식탁을 찾아볼까요? 먼저 이용권을 구매하고 바로 참가를 신청하거나, 식탁을 둘러보며 분위기와 추천 정보를 확인할 수 있어요.</p>
    </Heading>
    {activeMembership && <ActivePass><Ticket size={17}/><span><strong>사용 가능한 멤버십이 있어요.</strong> {new Date(activeMembership.expires_at).toLocaleDateString('ko-KR')}까지 이용 가능하며 기간 내 참여 횟수 제한이 없습니다.</span></ActivePass>}
    <ChoiceGrid>
      <Choice primary type="button" onClick={onStartMembership}>
        <span className="icon"><CreditCard size={22}/></span>
        <span className="eyebrow">START WITH A PASS</span>
        <h2>회원권 결제하고 시작하기</h2>
        <p>내 프로필에 맞는 식탁을 추천받고, 참가할 모임을 선택해 이용권·신청·결제를 차례대로 진행해요. 다음 단계로 넘어가기 전마다 진행 내용을 확인할 수 있어요.</p>
        <span className="go">식탁 추천받기 <ArrowRight size={16}/></span>
      </Choice>
      <Choice type="button" onClick={onExplore}>
        <span className="icon"><Compass size={22}/></span>
        <span className="eyebrow">EXPLORE THE TABLES</span>
        <h2>앱 둘러보기</h2>
        <p>모집 중인 식탁, 지역, 관심사와 일정을 먼저 살펴보세요. 신청과 결제는 마음에 드는 식탁을 고른 다음 진행할 수 있어요.</p>
        <span className="go">식탁 둘러보기 <ArrowRight size={16}/></span>
      </Choice>
    </ChoiceGrid>
    <Note><ShieldCheck size={16}/><span>신청부터 다음 매칭까지 모든 진행 단계를 화면에 계속 표시해요. 각 단계는 안내 내용과 동의 항목을 확인한 후 직접 다음 단계로 진행합니다. 현재 결제는 테스트용 모의 결제이며 실제 청구는 발생하지 않습니다.</span></Note>
  </Content></Shell>;
}

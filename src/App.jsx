import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  Home,
  MessageCircleHeart,
  User,
  Shield,
  LogOut,
  Lock,
  Sparkles,
  ListChecks,
  Compass,
} from 'lucide-react';

import { INITIAL_STORE, evaluateTableClient } from './data/mockDatabase';
import { getEligibleMatchingCandidate, getEligibleMatchingCandidates } from './data/tableMatchingFlow';
import { createSeededDemoStore } from './data/seededDemoStore';
import excelSurveyDataset from './data/excelSurveyDataset.json';
import LandingExperience from './components/LandingExperience';
import AuthWaveModal from './components/AuthWaveModal';
import HomeView from './components/HomeView';
import ChatRoomView from './components/ChatRoomView';
import MyPageView from './components/MyPageView';
import AdminDashboardView from './components/AdminDashboardView';
import StartPortal from './components/StartPortal';
import ParticipationJourneyView from './components/ParticipationJourneyView';


const AppShell = styled.div`
  min-height: 100vh;
  background: #f5efe4;
  color: #39291d;
`;

const DemoBanner = styled.aside`
  padding: 8px 20px;
  border-bottom: 1px solid #deceb8;
  background: #eee2cf;
  color: #775c3d;
  text-align: center;
  font-size: .72rem;
  line-height: 1.6;
  letter-spacing: .01em;
`; 

const TopNav = styled.nav`
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 28px;
  background: rgba(248, 243, 234, 0.94);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid #ddcfbc;
  box-shadow: 0 5px 22px rgba(64, 43, 26, 0.035);
  flex-wrap: wrap;
  gap: 12px;
`;

const BrandLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Noto Serif KR', serif;
  font-size: 1.22rem;
  font-weight: 700;
  color: #39291d;
  cursor: pointer;

  img.brand-img {
    height: 36px;
    width: auto;
    border-radius: 6px;
    object-fit: contain;
    background: #fff;
    padding: 2px 6px;
  }

  .role-badge {
    font-family: 'Pretendard', sans-serif;
    font-size: 0.72rem;
    padding: 4px 10px;
    border-radius: 999px;
    background: ${(props) => props.isAdmin ? '#e8d8d0' : '#e8dfcf'};
    border: 1px solid ${(props) => props.isAdmin ? '#c5a89b' : '#d5c4ab'};
    color: ${(props) => (props.isAdmin ? '#7b3d2c' : '#775c3b')};
    font-weight: 800;
  }
`;

const NavTabsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const NavTabButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${(props) => props.active ? '#493423' : 'transparent'};
  background: ${(props) => props.active ? '#493423' : 'transparent'};
  color: ${(props) => (props.active ? '#fff5e7' : '#78644e')};

  &:hover { border-color: #bca487; background: ${(props) => props.active ? '#493423' : '#eee4d6'}; }
`;

const ProfileNavTrigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px 6px 8px;
  border-radius: 999px;
  border: 1px solid ${(props) => props.active ? '#9a7d5d' : '#ddcfbc'};
  background: ${(props) => props.active ? '#ece0cd' : '#f8f2e9'};
  color: #493423;
  cursor: pointer;
  transition: all 0.2s ease;

  .avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #cbb293;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.78rem;
    font-weight: 800;
    color: #fff;
  }

  .meta {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.2;

    .name {
      font-size: 0.82rem;
      font-weight: 800;
      color: #493423;
    }
    .sub {
      font-size: 0.68rem;
      color: #967952;
      font-weight: 600;
    }
  }

  &:hover {
    border-color: #b79a74;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(73, 52, 35, 0.08);
  }
`;

const LogoutBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 15px;
  border-radius: 999px;
  border: 1px solid #d8c7b7;
  background: transparent;
  color: #8b6656;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #efe2d7;
  }
`;

const ToastNotification = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 200;
  max-width: 440px;
  padding: 15px 20px;
  border-radius: 16px;
  background: #fbf7ef;
  border: 1px solid #c9b69d;
  box-shadow: 0 20px 50px rgba(55, 36, 19, 0.18);
  color: #493423;
  font-size: 0.86rem;
  line-height: 1.5;
`;

const rnStyles = StyleSheet.create({
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ece0cd',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d5c2a8',
  },
  statusText: {
    color: '#765b3b',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default function App() {
  const [store, setStore] = useState(() => createSeededDemoStore(INITIAL_STORE, excelSurveyDataset));

  /**
   * 핵심 인증 & 역할 분리 상태:
   * - currentUser가 null이면(비로그인 상태): 오직 3D 스크롤 스토리 랜딩 페이지와 로그인/회원가입 모달만 접근 가능!
   * - currentUser.role === 'USER'이면(일반 참가자): 랜딩 페이지를 숨기고 [홈 / 단체 채팅방 / 마이페이지]만 표시! (운영자 어드민 접근 차단)
   * - currentUser.role === 'ADMIN'이면(운영자): 랜딩 페이지와 사용자 탭을 숨기고 [운영자 전용 어드민 포털]만 표시!
   */
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState('WELCOME'); // USER: WELCOME/HOME/JOURNEY/CHAT/MYPAGE, ADMIN: ADMIN
  const [journeyApplicationId, setJourneyApplicationId] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTableId, setActiveTableId] = useState('tbl-1');
  const [toastMsg, setToastMsg] = useState('');
  const [homeRecommendationRequest, setHomeRecommendationRequest] = useState(0);
  const [preferMembershipChoice, setPreferMembershipChoice] = useState(false);
  const [checkoutResume, setCheckoutResume] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? '' : prev));
    }, 4500);
  };

  // 로그인 성공 시 역할(USER vs ADMIN)에 따라 완전히 분리된 워크스페이스로 진입
  const handleSuccessAuth = (userObj) => {
    setCurrentUser(userObj);
    setIsAuthModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (userObj.role === 'ADMIN') {
      setActiveView('ADMIN');
      showToast(`🛡️ [운영자 전용 포털] ${userObj.name} 계정으로 로그인되었습니다.`);
    } else {
      setJourneyApplicationId(null);
      setHomeRecommendationRequest(0);
      setPreferMembershipChoice(false);
      setActiveView('WELCOME');
      showToast(`👋 환영합니다, ${userObj.name}(${userObj.mbti || 'MBTI 미입력'})님! 이용권 결제와 앱 둘러보기 중 선택해주세요.`);
    }
  };

  // 로그아웃 시 비로그인 상태(currentUser = null)로 전환되어 다시 3D 스토리 랜딩 페이지로 복귀
  const handleLogout = () => {
    setCurrentUser(null);
    setJourneyApplicationId(null);
    setIsAuthModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('🔒 안전하게 로그아웃되어 우연한 식탁 메인 랜딩 페이지로 이동했습니다.');
  };

  // 2단계 회원가입 완료 시 스토어 저장 후 일반 사용자(USER) 홈 화면으로 입장
  const handleRegisterNewUser = (newUser) => {
    setStore((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
    }));
    setCurrentUser(newUser);
    setIsAuthModalOpen(false);
    setJourneyApplicationId(null);
    setActiveView('WELCOME');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(
      `🎉 ${newUser.name}님 회원가입(Step 1 & Step 2) 완료! 작성하신 성향과 희망 지역(${newUser.preferred_regions.join(
        '·'
      )})이 AI 매칭 엔진에 등록되었습니다.`
    );
  };

  // 신청서를 먼저 저장하고, 결제는 별도 화면에서 진행합니다. 실제 과금은 발생하지 않는 데모입니다.
  const handleSubmitTableApplication = (tableObj, ticketPlan) => {
    if (!currentUser) { setIsAuthModalOpen(true); return null; }
    const table = store.diningTables.find((t) => t.id === tableObj?.id);
    const isStoredTicketPlan = ticketPlan?.id === 'STORED_TICKET';
    const ticketType = isStoredTicketPlan ? 'ONE_TIME' : ticketPlan.id;
    const ticketCreditId = isStoredTicketPlan ? ticketPlan.creditId : null;
    const currentTableMembers = (table?.member_ids || []).filter((id) => id !== currentUser.id);
    if (!table || !['WAITING', 'REALLOCATING'].includes(table.match_status || 'WAITING') || currentTableMembers.length >= (table.max_members || 6)) {
      showToast('이 식탁은 더 이상 모집 중이 아니거나 좌석이 가득 찼습니다. 다른 식탁을 선택해주세요.');
      return null;
    }
    if (isStoredTicketPlan) {
      const storedCredit = (store.ticketCredits || []).find((credit) => credit.id === ticketCreditId && credit.user_id === currentUser.id && credit.status === 'ACTIVE');
      if (!storedCredit) { showToast('사용 가능한 보관 이용권이 없습니다. 마이페이지에서 상태를 새로 확인해주세요.'); return null; }
    }
    const duplicate = store.applications.find((a) => a.user_id === currentUser.id && a.table_id === table.id && a.application_status !== 'CANCELED');
    if (duplicate) {
      if (duplicate.payment_status === 'PENDING') {
        setStore((prev) => ({
          ...prev,
          applications: prev.applications.map((a) => a.id === duplicate.id ? {
            ...a,
            ticket_type: ticketType,
            ticket_credit_id: ticketCreditId,
            membership_id: ticketPlan.id === 'MEMBERSHIP_ACTIVE' ? ticketPlan.membershipId : null,
            amount: isStoredTicketPlan ? 0 : Number(ticketPlan.price || 0),
            payment_mode: isStoredTicketPlan ? 'TICKET_CREDIT' : ticketPlan.id === 'MEMBERSHIP_ACTIVE' ? 'MEMBERSHIP' : 'DEMO',
            desired_regions: [...new Set([...(currentUser.preferred_regions || []), table.region])],
            desired_dates: [String(table.event_date || '').slice(0, 10)].filter(Boolean),
            updated_at: new Date().toISOString(),
          } : a),
        }));
        return duplicate.id;
      }
      showToast('이미 신청한 식탁입니다. 마이페이지에서 진행 상태를 확인해주세요.');
      return null;
    }
    // 사용자가 상세 페이지에서 선택한 지역은 명시적인 선택으로 간주합니다.
    // 선호 점수/프로필 차이는 신청을 막지 않으며, 연령·안전 조건은 자동 매칭 및 확정 전에 검증합니다.
    const normalizeRegion = (value) => value === '종로/을지로' ? '을지로/종로' : value;
    const allowedRegions = [...new Set([...(currentUser.preferred_regions || []).map(normalizeRegion), normalizeRegion(table.region), table.region])];
    if (ticketPlan.id === 'MEMBERSHIP_ACTIVE') {
      const usable = (store.memberships || []).some((m) => m.id === ticketPlan.membershipId && m.user_id === currentUser.id && m.status === 'ACTIVE' && new Date(m.expires_at) > new Date());
      if (!usable) { showToast('사용 가능한 멤버십을 찾지 못했습니다. 이용권을 다시 선택해주세요.'); return null; }
    }
    const nowIso = new Date().toISOString();
    const applicationId = `demo-app-${Date.now()}`;
    const application = {
      id: applicationId,
      user_id: currentUser.id,
      table_id: table.id,
      slot_id: table.slot_id || 'slot-1',
      desired_regions: allowedRegions,
      desired_dates: [String(table.event_date || '').slice(0, 10)].filter(Boolean),
      ticket_type: ticketType,
      ticket_credit_id: ticketCreditId,
      membership_id: ticketPlan.id === 'MEMBERSHIP_ACTIVE' ? ticketPlan.membershipId : null,
      amount: isStoredTicketPlan ? 0 : Number(ticketPlan.price || 0),
      application_status: 'SUBMITTED',
      payment_status: 'PENDING',
      payment_mode: isStoredTicketPlan ? 'TICKET_CREDIT' : ticketPlan.id === 'MEMBERSHIP_ACTIVE' ? 'MEMBERSHIP' : 'DEMO',
      payment_reference: null,
      match_status: 'WAITING',
      attendance_status: 'SCHEDULED',
      workflow_stage: 'APPLICATION_SUBMITTED',
      workflow_history: ['APPLICATION_SUBMITTED'],
      reallocation_count: 0,
      match_reason: '신청서가 제출되었습니다. 결제 완료 후 자동 매칭을 시작합니다.',
      refund_reason: null,
      created_at: nowIso,
      demo_mode: true,
    };
    setStore((prev) => ({ ...prev, applications: [application, ...prev.applications] }));
    showToast('신청서가 저장되었습니다. 다음 단계에서 이용권 결제를 진행해주세요. 실제 과금은 없습니다.');
    return applicationId;
  };

  // 결제 완료 후 실행: 필수 조건 재검증 -> 자동 매칭/재배치 -> 확정 또는 대안 제안.
  // draftApplicationId를 받으면 앞 단계에서 만든 신청서 레코드를 갱신합니다.
  const handleJoinTableAndChat = (tableObj, ticketPlan, draftApplicationId = null) => {
    if (!currentUser) { setIsAuthModalOpen(true); return false; }
    const draftApplication = draftApplicationId ? store.applications.find((a) => a.id === draftApplicationId && a.user_id === currentUser.id) : null;
    if (draftApplicationId && (!draftApplication || draftApplication.payment_status !== 'PENDING')) {
      showToast('결제를 이어갈 신청서를 찾지 못했습니다. 마이페이지에서 상태를 새로 확인해주세요.');
      return false;
    }
    const initialTable = store.diningTables.find((t) => t.id === tableObj.id);
    if (!initialTable) { showToast('이 식탁을 찾을 수 없어요. 새로고침 후 다시 확인해주세요.'); return false; }
    const now = new Date();
    const nowIso = now.toISOString();
    const normalizeRegion = (value) => value === '종로/을지로' ? '을지로/종로' : value;
    const allowedRegions = [...new Set([...(currentUser.preferred_regions || []).map(normalizeRegion), normalizeRegion(initialTable.region), initialTable.region])];
    const desiredDates = [String(initialTable.event_date || '').slice(0, 10)].filter(Boolean);
    const alreadyApplied = store.applications.find((a) => a.user_id === currentUser.id && a.table_id === initialTable.id && a.application_status !== 'CANCELED' && a.id !== draftApplicationId);
    if (alreadyApplied) { setActiveView('MYPAGE'); showToast('이미 신청한 식탁입니다. 진행 상태를 확인할게요.'); return false; }

    // Use the same shared matcher as the visible journey. The previous ad-hoc
    // filter rejected every underfilled table and never applied merge candidates,
    // leaving users stuck at the final 4–6 person validation screen.
    const paidMatchApplication = {
      ...(draftApplication || {}),
      id: draftApplicationId || `demo-match-${currentUser.id}-${Date.now()}`,
      user_id: currentUser.id,
      table_id: initialTable.id,
      payment_status: 'PAID',
      desired_regions: allowedRegions,
      desired_dates: desiredDates,
      initial_selected_region: initialTable.region,
      selected_region: initialTable.region,
    };
    const matchingCandidates = getEligibleMatchingCandidates({
      application: paidMatchApplication,
      currentUser: { ...currentUser, preferred_regions: allowedRegions },
      store,
    });
    const chosenCandidate = matchingCandidates[0] || null;
    let targetTable = chosenCandidate?.table || null;
    const mergedFromTableIds = chosenCandidate?.mergedFromTableIds || [];
    const reallocated = Boolean(targetTable && (targetTable.id !== initialTable.id || mergedFromTableIds.length > 0));

    const planMonths = ({ MEMBERSHIP_1M: 1, MEMBERSHIP_3M: 3, MEMBERSHIP_6M: 6 })[ticketPlan.id] || null;
    const activeMemberships = (store.memberships || []).map((membership) => ({ ...membership }));
    let membershipToUse = ticketPlan.id === 'MEMBERSHIP_ACTIVE'
      ? activeMemberships.find((m) => m.id === ticketPlan.membershipId && m.user_id === currentUser.id && m.status === 'ACTIVE' && new Date(m.expires_at) > now)
      : null;
    if (ticketPlan.id === 'MEMBERSHIP_ACTIVE' && !membershipToUse) {
      showToast('보유 멤버십을 찾을 수 없어요. 이용권을 다시 선택해주세요.'); return false;
    }

    let purchasedMembership = null;
    const amount = ticketPlan.id === 'MEMBERSHIP_ACTIVE' ? 0 : Number(ticketPlan.price || 0);
    if (planMonths) {
      const expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + planMonths);
      purchasedMembership = {
        id: `membership-${Date.now()}`,
        user_id: currentUser.id,
        plan_type: ticketPlan.id,
        amount,
        status: 'ACTIVE',
        starts_at: nowIso,
        expires_at: expiresAt.toISOString(),
        extension_days: 0,
        unlimited: true,
        payment_mode: 'DEMO',
        demo_mode: true,
      };
      activeMemberships.unshift(purchasedMembership);
      membershipToUse = purchasedMembership;
    }

    const applicationId = draftApplicationId || `demo-app-${Date.now()}`;
    const reallocationHistory = reallocated ? ['AUTO_REALLOCATED'] : [];
    let matchStatus = 'ALTERNATIVE_OFFERED';
    let workflowStage = 'ALTERNATIVE_OFFERED';
    let finalTableId = targetTable?.id || initialTable.id;
    let matchReason = targetTable
      ? `자동 재배치 완료: ${targetTable.region} · 매칭 필수 조건과 선호 점수를 다시 확인합니다.`
      : '신청한 일정에서 적합한 테이블을 찾지 못했습니다. 희망 날짜·지역 안의 대체 일정이나 이용권 보관/환불을 선택해주세요.';
    let tableRows = [...store.diningTables];
    let chatRooms = [...(store.chatRooms || [])];
    const stageHistory = ['APPLICATION_SUBMITTED', 'PAYMENT_COMPLETED_DEMO', 'AUTO_MATCHING_STARTED', ...reallocationHistory];

    if (targetTable) {
      const evaluationUser = { ...currentUser, preferred_regions: [...new Set([...allowedRegions, targetTable.region, normalizeRegion(targetTable.region)])] };
      const currentMembers = (targetTable.member_ids || []).filter((id) => id !== currentUser.id);
      const evaluation = evaluateTableClient(evaluationUser, { ...targetTable, member_ids: currentMembers }, store);
      const sizeAfterJoin = currentMembers.length + 1;
      const isReady = sizeAfterJoin >= (targetTable.min_members || 4) && sizeAfterJoin <= (targetTable.max_members || 6)
        && evaluation.passedHardConstraints;
      if (isReady) {
        matchStatus = 'CONFIRMED';
        workflowStage = 'VENUE_CHAT';
        matchReason = `자동 확정: ${sizeAfterJoin}명 구성, 희망 지역/일정과 8세 이내 연령·안전 조건 통과. 선호 점수 ${evaluation.totalScore}점.`;
        stageHistory.push('AUTO_CONFIRMED', 'VENUE_CHAT_READY');
        tableRows = tableRows.map((t) => {
          if (t.id === targetTable.id) return {
            ...t,
            match_status: 'CONFIRMED',
            member_ids: [...new Set([...currentMembers, currentUser.id])],
            confirmed_at: nowIso,
            match_score: evaluation.totalScore,
            curation_reason: mergedFromTableIds.length
              ? `미완성 식탁 ${mergedFromTableIds.length + 1}개를 병합했습니다. ${matchReason}`
              : matchReason,
            merged_from_table_ids: mergedFromTableIds,
          };
          if (mergedFromTableIds.includes(t.id)) return {
            ...t,
            match_status: 'MERGED',
            member_ids: [],
            merged_into_table_id: targetTable.id,
            merged_at: nowIso,
          };
          return t;
        });
        const venue = (store.venues || []).find((v) => v.id === targetTable.venue_id);
        const systemMessage = {
          id: `msg-${Date.now()}-system`, sender_id: 'SYSTEM', sender_name: '우연한 식탁 안내', message_type: 'SYSTEM',
          content: `🎉 매칭이 자동 확정되었습니다. 식당: ${venue?.name || '식당 안내 예정'} · ${targetTable.region} · ${targetTable.event_date} ${targetTable.event_time || '19:00'}. 이 채팅방에서 모임 안내와 아이스브레이킹 콘텐츠를 확인하세요.`,
          created_at: nowIso,
        };
        const existingRoom = chatRooms.find((r) => r.table_id === targetTable.id);
        if (existingRoom) {
          chatRooms = chatRooms.map((r) => r.table_id === targetTable.id ? { ...r, messages: [...(r.messages || []), systemMessage] } : r);
        } else {
          chatRooms.push({
            id: `room-${targetTable.id}`, table_id: targetTable.id,
            room_name: `[${targetTable.region}] ${targetTable.title}`,
            active_game_id: null, game_status: 'IDLE', current_round: 0, messages: [systemMessage],
          });
        }
      } else {
        matchStatus = 'WAITING';
        workflowStage = 'MATCHING';
        matchReason = `${reallocated ? '대체 식탁으로 재배치했습니다. ' : ''}현재 ${sizeAfterJoin}/${targetTable.max_members || 6}명입니다. 4~6명 구성과 필수 조건을 만족하면 자동 확정되고, 확정 전에는 단체방이 열리지 않습니다.`;
        stageHistory.push('MATCHING_WAITING');
        // 결제 완료자는 좌석을 예약하지만, 식탁이 자동 확정될 때까지 채팅방 접근 권한은 주지 않습니다.
        tableRows = tableRows.map((t) => t.id === targetTable.id ? {
          ...t, member_ids: [...new Set([...currentMembers, currentUser.id])],
        } : t);
      }
    } else {
      stageHistory.push('ALTERNATIVE_OFFERED');
      if (membershipToUse) {
        const newExpiration = new Date(membershipToUse.expires_at);
        newExpiration.setDate(newExpiration.getDate() + 1);
        activeMemberships.forEach((m) => {
          if (m.id === membershipToUse.id) { m.expires_at = newExpiration.toISOString(); m.extension_days = (m.extension_days || 0) + 1; }
        });
        matchReason += ' 멤버십 이용자이므로 매칭 실패 1회에 대해 이용 기한을 1일 연장했습니다.';
      }
    }

    const application = {
      id: applicationId,
      user_id: currentUser.id,
      table_id: finalTableId,
      slot_id: targetTable?.slot_id || initialTable.slot_id || 'slot-1',
      desired_regions: [...allowedRegions],
      desired_dates: desiredDates,
      ticket_type: ticketPlan.id === 'MEMBERSHIP_ACTIVE' ? (membershipToUse?.plan_type || 'MEMBERSHIP_ACTIVE') : ticketPlan.id,
      membership_id: membershipToUse?.id || null,
      amount,
      application_status: 'SUBMITTED',
      payment_status: targetTable ? 'PAID' : (ticketPlan.id === 'ONE_TIME' ? 'REFUND_AVAILABLE' : 'PAID'),
      payment_mode: ticketPlan.id === 'MEMBERSHIP_ACTIVE' ? 'MEMBERSHIP' : 'DEMO',
      payment_reference: `DEMO-${applicationId}`,
      match_status: matchStatus,
      attendance_status: 'SCHEDULED',
      workflow_stage: workflowStage,
      workflow_history: stageHistory,
      reallocation_count: reallocated ? 1 : 0,
      match_reason: matchReason,
      refund_reason: null,
      checked_in_at: null,
      created_at: nowIso,
      demo_mode: true,
    };

    const mergeApplications = (previousApplications) => {
      const updated = previousApplications.map((a) => {
        if (draftApplicationId && a.id === draftApplicationId) return { ...application, created_at: a.created_at || application.created_at };
        if (matchStatus === 'CONFIRMED' && mergedFromTableIds.includes(a.table_id) && a.payment_status === 'PAID' && ['WAITING', 'MATCHING', 'REALLOCATING'].includes(a.match_status) && a.application_status !== 'CANCELED') {
          return { ...a, table_id: finalTableId, slot_id: targetTable?.slot_id || a.slot_id, match_status: 'CONFIRMED', workflow_stage: 'VENUE_CHAT', workflow_history: [...(a.workflow_history || []), 'TABLES_MERGED', 'AUTO_CONFIRMED', 'VENUE_CHAT_READY'], match_reason: `미완성 식탁 병합 후 자동 확정되었습니다. ${matchReason}` };
        }
        if (matchStatus === 'CONFIRMED' && a.table_id === finalTableId && a.payment_status === 'PAID' && ['WAITING', 'MATCHING', 'REALLOCATING'].includes(a.match_status) && a.application_status !== 'CANCELED') {
          return { ...a, match_status: 'CONFIRMED', workflow_stage: 'VENUE_CHAT', workflow_history: [...(a.workflow_history || []), 'AUTO_CONFIRMED', 'VENUE_CHAT_READY'], match_reason: `자동 확정: 같은 식탁이 4~6인 및 모든 필수 조건을 충족했습니다. ${matchReason}` };
        }
        return a;
      });
      return draftApplicationId ? updated : [application, ...updated];
    };
    setStore((prev) => ({
      ...prev,
      diningTables: tableRows,
      chatRooms,
      memberships: activeMemberships,
      applications: mergeApplications(prev.applications),
    }));
    if (matchStatus === 'CONFIRMED') setActiveTableId(finalTableId);
    setActiveView('MYPAGE');
    if (matchStatus === 'CONFIRMED') {
      showToast('모의 결제와 신청 기록이 저장됐고, 조건을 충족해 자동 확정되었습니다. 식당·단체방 안내를 확인하세요. 실제 과금은 없습니다.');
    } else if (matchStatus === 'WAITING') {
      showToast('모의 결제 기록이 저장됐습니다. 자동 매칭 대기 중이며, 확정 전에는 단체 채팅방이 열리지 않습니다. 실제 과금은 없습니다.');
    } else {
      showToast('모의 결제/신청 데모가 저장됐지만 매칭할 식탁이 없습니다. 대체 일정 또는 이용권/환불 선택지를 확인하세요. 실제 과금은 없습니다.');
    }
    setCheckoutResume(null);
    return true;
  };

  // 일반 단계는 버튼 클릭으로 진행합니다. 개인정보 및 신청/환불 정책 등 필수 동의만 별도 수집합니다.
  const handleAdvanceJourney = (appId, stageKey) => {
    const application = store.applications.find((a) => a.id === appId && a.user_id === currentUser?.id);
    if (!application || application.application_status === 'CANCELED') {
      return { ok: false, message: '진행 가능한 신청서를 찾을 수 없습니다. 마이페이지에서 신청 상태를 확인해주세요.' };
    }
    const appendHistory = (history, ...items) => {
      const next = [...(history || [])];
      items.forEach((item) => { if (!next.includes(item)) next.push(item); });
      return next;
    };
    const isCandidateEligible = (table) => getEligibleMatchingCandidate(table, { application, currentUser, store });
    const prioritizeCandidate = (a, b, preferredTableId = application.table_id) => {
      const aCount = (a.table.member_ids || []).length;
      const bCount = (b.table.member_ids || []).length;
      if ((a.table.id === preferredTableId) !== (b.table.id === preferredTableId)) return a.table.id === preferredTableId ? -1 : 1;
      if (aCount !== bCount) return bCount - aCount;
      return b.evaluation.totalScore - a.evaluation.totalScore;
    };

    if (stageKey === 'PAYMENT') {
      if (application.payment_status !== 'PENDING') {
        return { ok: false, message: '이 신청은 이미 결제가 진행되었거나 취소되었습니다. 현재 상태를 다시 확인해주세요.' };
      }
      const now = new Date();
      const nowIso = now.toISOString();
      const monthsByPlan = { MEMBERSHIP_1M: 1, MEMBERSHIP_3M: 3, MEMBERSHIP_6M: 6 };
      const months = monthsByPlan[application.ticket_type];
      const membershipList = [...(store.memberships || [])];
      const ticketCredits = [...(store.ticketCredits || [])];
      let membershipId = application.membership_id || null;
      let paymentMode = 'DEMO';
      if (application.ticket_credit_id) {
        const storedCredit = ticketCredits.find((credit) => credit.id === application.ticket_credit_id && credit.user_id === currentUser.id && credit.status === 'ACTIVE');
        if (!storedCredit) return { ok: false, message: '보관 이용권이 이미 사용되었거나 찾을 수 없습니다. 다른 이용권을 선택해주세요.' };
        storedCredit.status = 'USED';
        storedCredit.used_at = nowIso;
        storedCredit.used_by_application_id = appId;
        paymentMode = 'TICKET_CREDIT';
      } else if (application.ticket_type === 'MEMBERSHIP_ACTIVE') {
        const active = membershipList.find((m) => m.id === membershipId && m.user_id === currentUser.id && m.status === 'ACTIVE' && new Date(m.expires_at) > now);
        if (!active) return { ok: false, message: '사용할 수 있는 멤버십이 없습니다. 홈으로 돌아가 이용권을 다시 선택해주세요.' };
        paymentMode = 'MEMBERSHIP';
      } else if (months) {
        const expiration = new Date(now);
        expiration.setMonth(expiration.getMonth() + months);
        const membership = {
          id: `membership-${Date.now()}`,
          user_id: currentUser.id,
          plan_type: application.ticket_type,
          amount: Number(application.amount || 0),
          status: 'ACTIVE',
          starts_at: nowIso,
          expires_at: expiration.toISOString(),
          extension_days: 0,
          unlimited: true,
          payment_mode: 'DEMO',
          demo_mode: true,
        };
        membershipList.unshift(membership);
        membershipId = membership.id;
      }
      setStore((prev) => ({
        ...prev,
        memberships: membershipList,
        ticketCredits,
        applications: prev.applications.map((a) => a.id === appId ? {
          ...a,
          payment_status: 'PAID',
          payment_mode: paymentMode,
          payment_reference: paymentMode === 'TICKET_CREDIT' ? `TICKET-CREDIT-${application.ticket_credit_id}` : `DEMO-${appId}`,
          membership_id: membershipId,
          workflow_stage: 'PAYMENT_COMPLETED',
          workflow_history: appendHistory(a.workflow_history, 'PAYMENT_COMPLETED_DEMO'),
          match_reason: '모의 결제 단계가 확인되었습니다. 참가자가 자동 매칭 시작 버튼을 누르면 매칭을 실행합니다.',
          updated_at: nowIso,
        } : a),
      }));
      showToast('결제 단계가 기록되었습니다. 실제 카드 승인이나 청구는 없습니다. 다음 단계에서 자동 매칭을 시작할 수 있습니다.');
      return { ok: true, message: '결제 단계가 완료되었습니다. 자동 매칭 전에 안내를 확인해주세요.' };
    }

    if (stageKey === 'MATCHING') {
      if (application.payment_status !== 'PAID') {
        return { ok: false, message: '결제 완료로 확인된 신청만 자동 매칭할 수 있습니다.' };
      }
      const candidates = getEligibleMatchingCandidates({ application, currentUser, store })
        .sort((a, b) => prioritizeCandidate(a, b));
      const candidate = candidates[0] || null;
      setStore((prev) => ({
        ...prev,
        applications: prev.applications.map((a) => a.id === appId ? {
          ...a,
          match_status: 'MATCHING',
          matching_candidate_table_id: candidate?.table.id || null,
          matching_preview_member_count: candidate?.membersAfterJoining || null,
          matching_preview_merged_table_ids: candidate?.mergedFromTableIds || [],
          workflow_stage: 'AUTO_MATCHING_COMPLETED',
          workflow_history: appendHistory(a.workflow_history, 'AUTO_MATCHING_STARTED', 'AUTO_MATCHING_COMPLETED'),
          match_reason: candidate
            ? `자동 매칭 후보: ${candidate.table.region} · 필수 조건 통과 · 선호 점수 ${candidate.evaluation.totalScore}점. 다음 단계에서 재배치 여부를 다시 확인합니다.`
            : '초기 자동 매칭에서 적합한 후보를 찾지 못했습니다. 다음 단계에서 허용 범위 안의 대체 테이블을 다시 탐색합니다.',
          updated_at: new Date().toISOString(),
        } : a),
      }));
      showToast(candidate ? '자동 매칭 후보를 찾았습니다. 다음 단계에서 후보 테이블을 한 번 더 검증합니다.' : '초기 매칭 후보가 없습니다. 희망 날짜와 지역 안에서 재배치를 확인합니다.');
      return { ok: true, message: candidate ? `후보를 찾았어요: ${candidate.table.region}. 인원·일정·안전 조건을 다시 확인할게요.` : '초기 후보 없음. 재배치 단계에서 대체 가능성을 확인합니다.' };
    }

    if (stageKey === 'REALLOCATION') {
      if (application.payment_status !== 'PAID') return { ok: false, message: '결제 상태를 확인할 수 없어 재배치를 실행하지 않았습니다.' };
      const storedCandidate = store.diningTables.find((t) => t.id === application.matching_candidate_table_id);
      const existingCandidate = isCandidateEligible(storedCandidate);
      const candidate = existingCandidate || getEligibleMatchingCandidates({ application, currentUser, store })
        .sort((a, b) => prioritizeCandidate(a, b))[0] || null;
      const nowIso = new Date().toISOString();
      if (!candidate) {
        const history = appendHistory(application.workflow_history, 'REALLOCATION_CHECKED', 'ALTERNATIVE_OFFERED');
        const failIsMembership = application.ticket_type !== 'ONE_TIME';
        let membershipList = [...(store.memberships || [])];
        if (failIsMembership && application.membership_id && !history.includes('MATCH_FAILURE_EXTENSION_APPLIED')) {
          const membership = membershipList.find((m) => m.id === application.membership_id && m.user_id === currentUser.id);
          if (membership) {
            const expiry = new Date(membership.expires_at);
            expiry.setDate(expiry.getDate() + 1);
            membership.expires_at = expiry.toISOString();
            membership.extension_days = (membership.extension_days || 0) + 1;
          }
          history.push('MATCH_FAILURE_EXTENSION_APPLIED');
        }
        setStore((prev) => ({
          ...prev,
          memberships: membershipList,
          applications: prev.applications.map((a) => a.id === appId ? {
            ...a,
            match_status: 'ALTERNATIVE_OFFERED',
            payment_status: a.ticket_type === 'ONE_TIME' ? 'REFUND_AVAILABLE' : a.payment_status,
            workflow_stage: 'ALTERNATIVE_OFFERED',
            workflow_history: history,
            matching_candidate_table_id: null,
            matching_preview_member_count: null,
            matching_preview_merged_table_ids: [],
            refund_reason: failIsMembership ? '매칭 불가 · 멤버십 이용 기한 1일 연장 적용(데모)' : '매칭 불가 · 참가자가 대체 일정 또는 환불을 선택해야 함',
            match_reason: '허용된 날짜·지역에서 필수 조건을 충족하는 대체 테이블을 찾지 못했습니다. 시스템이 임의로 일정을 바꾸거나 환불하지 않습니다.',
            updated_at: nowIso,
          } : a),
        }));
        showToast(failIsMembership ? '매칭 후보가 없어 멤버십 이용 기한을 1일 연장했습니다. 대체 일정을 확인해주세요.' : '매칭 후보가 없어 대체 일정 또는 환불 선택이 필요합니다.');
        return { ok: false, message: failIsMembership ? '적합한 테이블이 없어요. 멤버십 기한을 1일 연장했고, 대체 일정 선택이 필요합니다.' : '적합한 테이블이 없어요. 하루권은 환불 가능 상태이며 대체 일정 또는 환불을 직접 선택해주세요.' };
      }
      const moved = candidate.table.id !== application.table_id;
      setStore((prev) => ({
        ...prev,
        applications: prev.applications.map((a) => a.id === appId ? {
          ...a,
          table_id: candidate.table.id,
          slot_id: candidate.table.slot_id || a.slot_id,
          matching_candidate_table_id: candidate.table.id,
          matching_preview_member_count: candidate.membersAfterJoining,
          matching_preview_merged_table_ids: candidate.mergedFromTableIds || [],
          match_status: 'REALLOCATING',
          workflow_stage: 'REALLOCATION_CHECKED',
          workflow_history: appendHistory(a.workflow_history, moved ? 'AUTO_REALLOCATED' : 'REALLOCATION_CHECKED'),
          reallocation_count: (a.reallocation_count || 0) + (moved ? 1 : 0),
          match_reason: moved
            ? `자동 재배치 완료: ${candidate.table.region} · 필수 조건 통과 · 선호 점수 ${candidate.evaluation.totalScore}점${candidate.mergedFromTableIds?.length ? ` · 미완성 식탁 ${candidate.mergedFromTableIds.length}개 병합 후보` : ''}.`
            : `재배치 검사 완료: 기존 ${candidate.table.region} 식탁을 유지합니다. 조건과 정원을 다시 확인했습니다${candidate.mergedFromTableIds?.length ? ` · 미완성 식탁 ${candidate.mergedFromTableIds.length}개 병합 후보` : ''}.`,
          updated_at: nowIso,
        } : a),
      }));
      const mergedCount = candidate.mergedFromTableIds?.length || 0;
      showToast(mergedCount
        ? `${candidate.table.region}의 미완성 식탁 ${mergedCount}개를 병합해 ${candidate.membersAfterJoining}명 구성 후보를 만들었습니다.`
        : moved ? `조건에 맞는 ${candidate.table.region} 식탁으로 자동 재배치했습니다.` : '기존 식탁이 조건을 충족해 유지했습니다. 재배치 검토를 완료했습니다.');
      return { ok: true, message: mergedCount
        ? `미완성 식탁을 병합하면 ${candidate.membersAfterJoining}명 구성이 가능합니다. 최종 조건을 다시 검증합니다.`
        : moved ? `다른 적합한 식탁으로 이동했습니다: ${candidate.table.region}.` : '기존 선택을 유지하기로 했어요. 다음 단계에서 최종 조건을 검증합니다.' };
    }

    if (stageKey === 'CONFIRMATION') {
      if (application.payment_status !== 'PAID') return { ok: false, message: '결제 완료 신청만 확정할 수 있습니다.' };
      if (['ALTERNATIVE_OFFERED', 'NO_MATCH'].includes(application.match_status)) return { ok: false, message: '대체 일정 또는 환불을 먼저 선택해주세요.' };
      const targetId = application.matching_candidate_table_id || application.table_id;
      const targetTable = store.diningTables.find((t) => t.id === targetId);
      const candidate = targetTable && isCandidateEligible({ ...targetTable, member_ids: (targetTable.member_ids || []).filter((id) => id !== currentUser.id) });
      if (!candidate) {
        setStore((prev) => ({
          ...prev,
          diningTables: prev.diningTables.map((table) => {
            if (table.id !== targetId || !['WAITING', 'REALLOCATING'].includes(table.match_status || 'WAITING')) return table;
            return { ...table, member_ids: (table.member_ids || []).filter((id) => id !== currentUser.id) };
          }),
          applications: prev.applications.map((a) => a.id === appId ? {
            ...a, matching_candidate_table_id: null, matching_preview_member_count: null, matching_preview_merged_table_ids: [], match_status: 'ALTERNATIVE_OFFERED',
            payment_status: a.ticket_type === 'ONE_TIME' ? 'REFUND_AVAILABLE' : a.payment_status,
            workflow_stage: 'ALTERNATIVE_OFFERED', workflow_history: appendHistory(a.workflow_history, 'REALLOCATION_CHECKED', 'ALTERNATIVE_OFFERED'),
            match_reason: '최종 검증에서 연령·안전·정원 조건을 충족하지 못했습니다. 가입을 막지 않고 다른 열린 식탁·대체 일정·이용권 보관·환불 선택지를 제공합니다.',
            updated_at: new Date().toISOString(),
          } : a),
        }));
        return { ok: false, message: '이 식탁은 최종 조건을 충족하지 않아 확정하지 않았습니다. 다른 열린 식탁을 선택하거나 대안을 고를 수 있어요.' };
      }
      const target = candidate.table;
      const memberIds = [...new Set([...(target.member_ids || []), currentUser.id])];
      const min = target.min_members || 4;
      const max = target.max_members || 6;
      if (memberIds.length > max) return { ok: false, message: '남은 좌석이 없어 확정할 수 없습니다. 재배치가 필요합니다.' };
      if (memberIds.length < min) {
        const history = appendHistory(application.workflow_history, 'REALLOCATION_CHECKED', 'ALTERNATIVE_OFFERED');
        setStore((prev) => ({
          ...prev,
          // A participant must not be attached to an incomplete table. Release any
          // stale waiting membership so the user can choose another open table.
          diningTables: prev.diningTables.map((t) => t.id === target.id && ['WAITING', 'REALLOCATING'].includes(t.match_status || 'WAITING')
            ? { ...t, member_ids: (t.member_ids || []).filter((id) => id !== currentUser.id) }
            : t),
          applications: prev.applications.map((a) => a.id === appId ? {
            ...a, table_id: target.id, slot_id: target.slot_id || a.slot_id, matching_candidate_table_id: null,
            match_status: 'ALTERNATIVE_OFFERED', payment_status: a.ticket_type === 'ONE_TIME' ? 'REFUND_AVAILABLE' : a.payment_status,
            workflow_stage: 'ALTERNATIVE_OFFERED', workflow_history: history,
            match_reason: `확정 직전 인원이 ${memberIds.length}/${min}명으로 부족해 확정하지 않았습니다. 다른 열린 식탁을 선택하거나 이용권 보관·환불을 결정할 수 있습니다.`,
          } : a),
        }));
        showToast(`최소 인원 ${min}명에 미치지 않아 확정하지 않았어요. 다른 식탁 선택 화면을 열었습니다.`);
        return { ok: false, message: `인원이 ${memberIds.length}/${min}명으로 부족합니다. 다른 식탁을 선택하거나 이용권 보관·환불을 선택해주세요.` };
      }
      const nowIso = new Date().toISOString();
      const venue = (store.venues || []).find((v) => v.id === target.venue_id);
      const systemMessage = {
        id: `msg-${Date.now()}-journey`, sender_id: 'SYSTEM', sender_name: '우연한 식탁 안내', message_type: 'SYSTEM',
        content: `🎉 식탁이 자동 확정되었습니다. 식당: ${venue?.name || '식당 안내 예정'} · ${target.region} · ${target.event_date} ${target.event_time || '19:00'}. 참가자는 다음 단계에서 상세 안내를 확인해주세요.`,
        created_at: nowIso,
      };
      const existingRoom = (store.chatRooms || []).find((r) => r.table_id === target.id);
      const nextRooms = existingRoom
        ? store.chatRooms.map((r) => r.table_id === target.id ? { ...r, messages: [...(r.messages || []), systemMessage] } : r)
        : [...(store.chatRooms || []), { id: `room-${target.id}`, table_id: target.id, room_name: `[${target.region}] ${target.title}`, active_game_id: null, game_status: 'IDLE', current_round: 0, messages: [systemMessage] }];
      const reason = `자동 확정: ${memberIds.length}명 구성, 지역·일정·8세 이내 연령 차이 및 안전 조건 통과. 선호 점수 ${candidate.evaluation.totalScore}점.`;
      const mergedTableIds = candidate.mergedFromTableIds || [];
      const mergedReason = mergedTableIds.length
        ? `미완성 식탁 ${mergedTableIds.length + 1}개를 같은 지역·일정으로 병합해 ${memberIds.length}명 구성을 만들었습니다. ${reason}`
        : reason;
      setStore((prev) => ({
        ...prev,
        diningTables: prev.diningTables.map((t) => {
          if (t.id === target.id) return { ...t, match_status: 'CONFIRMED', member_ids: memberIds, confirmed_at: nowIso, match_score: candidate.evaluation.totalScore, curation_reason: mergedReason, merged_from_table_ids: mergedTableIds };
          if (mergedTableIds.includes(t.id)) return { ...t, match_status: 'MERGED', merged_into_table_id: target.id, member_ids: [] };
          return t;
        }),
        chatRooms: nextRooms,
        applications: prev.applications.map((a) => {
          if (a.id === appId) return { ...a, table_id: target.id, slot_id: target.slot_id || a.slot_id, match_status: 'CONFIRMED', workflow_stage: 'AUTO_CONFIRMED', workflow_history: appendHistory(a.workflow_history, 'AUTO_CONFIRMED', ...(mergedTableIds.length ? ['TABLES_MERGED'] : [])), match_reason: mergedReason, updated_at: nowIso };
          if (mergedTableIds.includes(a.table_id) && a.payment_status === 'PAID' && ['WAITING', 'MATCHING', 'REALLOCATING'].includes(a.match_status) && a.application_status !== 'CANCELED') return { ...a, table_id: target.id, slot_id: target.slot_id || a.slot_id, match_status: 'CONFIRMED', workflow_stage: 'AUTO_CONFIRMED', workflow_history: appendHistory(a.workflow_history, 'AUTO_CONFIRMED', 'TABLES_MERGED'), match_reason: `미완성 식탁 병합으로 같은 테이블에 확정되었습니다. ${mergedReason}`, updated_at: nowIso };
          if (a.table_id === target.id && a.payment_status === 'PAID' && a.match_status === 'WAITING' && a.application_status !== 'CANCELED') return { ...a, match_status: 'CONFIRMED', workflow_stage: 'AUTO_CONFIRMED', workflow_history: appendHistory(a.workflow_history, 'AUTO_CONFIRMED'), match_reason: `같은 식탁의 자동 확정: ${mergedReason}` };
          return a;
        }),
      }));
      setActiveTableId(target.id);
      showToast('필수 조건을 통과해 식탁이 자동 확정되었습니다. 다음 단계에서 식당·단체방 안내를 확인해주세요.');
      return { ok: true, message: `자동 확정되었습니다. ${memberIds.length}명 구성, 선호 점수 ${candidate.evaluation.totalScore}점.` };
    }

    if (stageKey === 'VENUE_CHAT') {
      if (application.match_status !== 'CONFIRMED') return { ok: false, message: '테이블이 확정되기 전에는 식당·단체방 안내를 열 수 없습니다.' };
      setStore((prev) => ({
        ...prev,
        applications: prev.applications.map((a) => a.id === appId ? {
          ...a, workflow_stage: 'VENUE_CHAT', workflow_history: appendHistory(a.workflow_history, 'VENUE_CHAT_READY'),
        } : a),
      }));
      showToast('식당·단체방 안내 확인 단계가 완료되었습니다. 모임 당일 체크인할 수 있습니다.');
      return { ok: true, message: '식당·단체방 안내를 확인했습니다. 단체방에서 공지와 아이스브레이킹 콘텐츠를 볼 수 있어요.' };
    }

    return { ok: false, message: '요청한 단계가 올바르지 않습니다.' };
  };

  // 단체 채팅방 메시지 전송
  const handleSendMessage = (roomId, content) => {
    if (!currentUser) return;
    setStore((prev) => ({
      ...prev,
      chatRooms: prev.chatRooms.map((r) => {
        if (r.id !== roomId) return r;
        return {
          ...r,
          messages: [
            ...r.messages,
            {
              id: `msg-${Date.now()}`,
              sender_id: currentUser.id,
              sender_name: `${currentUser.name} (${currentUser.job_category} · ${currentUser.mbti})`,
              message_type: 'USER',
              content,
              created_at: new Date().toISOString(),
            },
          ],
        };
      }),
    }));
  };

  // 미니게임 투표 참여
  const handleVoteGameOption = (roomId, gameId, roundNumber, choice) => {
    if (!currentUser) return;
    setStore((prev) => ({
      ...prev,
      gamesCatalog: prev.gamesCatalog.map((g) => {
        if (g.id !== gameId) return g;
        return {
          ...g,
          rounds: g.rounds.map((r) => {
            if (r.round !== roundNumber) return r;
            const cleanA = (r.votesA || []).filter((n) => n !== currentUser.name);
            const cleanB = (r.votesB || []).filter((n) => n !== currentUser.name);
            return {
              ...r,
              votesA: choice === 'A' ? [...cleanA, currentUser.name] : cleanA,
              votesB: choice === 'B' ? [...cleanB, currentUser.name] : cleanB,
            };
          }),
        };
      }),
    }));
    showToast(`🗳️ 미니게임 Choice ${choice}에 투표했습니다!`);
  };

  // 운영자 전용: 미니게임 & 아이스브레이킹 시작/라운드/종료 조작
  const handleAdminControlGame = (tableId, action, gameId) => {
    const selectedGame =
      store.gamesCatalog.find((g) => g.id === gameId) || store.gamesCatalog[0];

    setStore((prev) => ({
      ...prev,
      chatRooms: prev.chatRooms.map((r) => {
        if (r.table_id !== tableId) return r;
        if (action === 'START') {
          return {
            ...r,
            active_game_id: selectedGame.id,
            game_status: 'RUNNING',
            current_round: 1,
            messages: [
              ...r.messages,
              {
                id: `msg-${Date.now()}`,
                sender_id: 'SYSTEM',
                sender_name: '와썹하우스 운영자 게임봇',
                message_type: 'GAME',
                content: `🎮 [CON-03 운영자 게임 시작] 운영자가 [${selectedGame.title}]을 시작했습니다! 채팅방 상단 보드에서 투표하고 이야기를 나눠보세요.`,
                created_at: new Date().toISOString(),
              },
            ],
          };
        }
        if (action === 'NEXT_ROUND') {
          const currentG =
            prev.gamesCatalog.find((g) => g.id === r.active_game_id) || selectedGame;
          const nextR =
            r.current_round < currentG.rounds.length ? r.current_round + 1 : 1;
          return {
            ...r,
            current_round: nextR,
          };
        }
        return {
          ...r,
          game_status: 'FINISHED',
        };
      }),
    }));

    showToast(
      action === 'START'
        ? `🎮 [${selectedGame.title}] 게임이 해당 테이블 단체 채팅방에 시작되었습니다!`
        : action === 'NEXT_ROUND'
        ? '⏭️ 다음 라운드로 전환되었습니다.'
        : '⏹️ 게임이 종료되었습니다.'
    );
  };

  // 환불 정책: 행사 주 화요일 24:00 이후 환불 불가. 행사 당일은 셀프 취소를 막고 운영자 확인으로 처리.
  // 결제대행사 연동 전에는 환불 요청 상태만 남기고 REFUNDED로 변경하지 않습니다.
  const handleRequestRefundOrCancel = (appId, reason, isRefundLocked) => {
    const selected = store.applications.find((a) => a.id === appId);
    if (!selected) return;
    const table = store.diningTables.find((t) => t.id === selected.table_id);
    const today = new Date().toLocaleDateString('sv-SE');
    if (table?.event_date && today === String(table.event_date).slice(0, 10)) {
      showToast('행사 당일 취소는 앱에서 제한됩니다. 운영자에게 문의해 주세요.');
      return;
    }
    const isUnpaid = selected.payment_status === 'PENDING';
    setStore((prev) => ({ ...prev, applications: prev.applications.map((a) => {
      if (a.id !== appId) return a;
      if (isUnpaid) return { ...a, application_status: 'CANCELED', attendance_status: 'CANCELED_EARLY', workflow_stage: 'CANCELED', refund_reason: `[데모 취소 기록] 미결제 상태이므로 환불 없음 (${reason})`, demo_mode: true };
      if (isRefundLocked) return { ...a, application_status: 'CANCELED', attendance_status: 'CANCELED_LATE', workflow_stage: 'CANCELED', refund_reason: `[정책 데모 기록] 화요일 24:00 환불 마감 이후 취소로 환불 제한 (${reason})`, demo_mode: true };
      return { ...a, application_status: 'CANCELED', payment_status: 'REFUND_REQUESTED', attendance_status: 'CANCELED_EARLY', workflow_stage: 'CANCELED', refund_reason: `[데모] 환불 요청 접수. PG 연동 전 실제 환불은 미실행 (${reason})`, demo_mode: true };
    }) }));
    showToast(isUnpaid ? '미결제 신청을 취소 기록했습니다. 결제가 없으므로 환불 요청은 생성하지 않았습니다.' : isRefundLocked ? '취소 기록을 남겼습니다. 화요일 24:00 이후에는 환불이 제한됩니다.' : '환불 요청을 데모 기록으로 접수했습니다. 결제대행사 연동 전 실제 환불은 실행되지 않습니다.');
  };

  // 다른 식탁을 고르는 클릭 자체가 날짜/지역 변경에 대한 명시적인 선택입니다.
  // 이 동작은 바로 확정하지 않고, 해당 날짜/지역에서 자동 매칭 절차를 다시 시작합니다.
  const handleTransferAlternativeSlot = (appId, targetTableId) => {
    const application = store.applications.find((a) => a.id === appId && a.user_id === currentUser?.id);
    const targetTable = store.diningTables.find((t) => t.id === targetTableId);
    const normalizeRegion = (region) => region === '종로/을지로' ? '을지로/종로' : region;
    const allowedStatuses = ['WAITING', 'MATCHING', 'REALLOCATING', 'ALTERNATIVE_OFFERED', 'NO_MATCH'];
    if (!application || !targetTable || !allowedStatuses.includes(application.match_status) || ['STORE_TICKET', 'REFUND'].includes(application.resolution_choice)) {
      const message = '다른 식탁을 선택할 수 있는 신청을 찾지 못했습니다. 마이페이지에서 현재 상태를 확인해주세요.';
      showToast(message); return { ok: false, message };
    }
    if (!['PAID', 'REFUND_AVAILABLE', 'REFUND_FAILED'].includes(application.payment_status)) {
      const message = '결제 완료된 신청만 다른 일정에서 매칭을 다시 시작할 수 있습니다.';
      showToast(message); return { ok: false, message };
    }
    const targetMembersWithoutCurrentUser = (targetTable.member_ids || []).filter((id) => id !== currentUser.id);
    if (!['WAITING', 'REALLOCATING'].includes(targetTable.match_status || 'WAITING') || targetMembersWithoutCurrentUser.length >= (targetTable.max_members || 6)) {
      const message = '선택한 식탁은 방금 모집이 마감되었거나 좌석이 가득 찼습니다. 다른 열린 식탁을 선택해주세요.';
      showToast(message); return { ok: false, message };
    }

    const targetRegion = normalizeRegion(targetTable.region);
    const targetDate = String(targetTable.event_date || '').slice(0, 10);
    if (!targetDate) {
      const message = '선택한 식탁에 날짜 정보가 없어 매칭을 다시 시작할 수 없습니다.';
      showToast(message); return { ok: false, message };
    }
    const desiredRegions = [...new Set([
      ...(currentUser?.preferred_regions || []).map(normalizeRegion),
      ...(application.desired_regions || []).map(normalizeRegion),
      targetRegion,
      targetTable.region,
    ].filter(Boolean))];
    const nowIso = new Date().toISOString();
    const coreHistory = ['APPLICATION_SUBMITTED', 'PAYMENT_COMPLETED_DEMO', 'ALTERNATIVE_TRANSFERRED'];

    setStore((prev) => ({
      ...prev,
      // 이전 식탁에서 대기 좌석을 임시로 잡아 두었다면 해제합니다.
      diningTables: prev.diningTables.map((table) => {
        if (![application.table_id, targetTable.id].includes(table.id)) return table;
        if (!['WAITING', 'REALLOCATING'].includes(table.match_status || 'WAITING')) return table;
        return { ...table, member_ids: (table.member_ids || []).filter((id) => id !== currentUser.id) };
      }),
      applications: prev.applications.map((a) => a.id === appId ? {
        ...a,
        table_id: targetTable.id,
        slot_id: targetTable.slot_id || a.slot_id,
        desired_regions: desiredRegions,
        desired_dates: [targetDate],
        payment_status: a.payment_status === 'REFUND_AVAILABLE' || a.payment_status === 'REFUND_FAILED' ? 'PAID' : a.payment_status,
        match_status: 'WAITING',
        workflow_stage: 'APPLICATION_SCOPE_UPDATED',
        workflow_history: coreHistory,
        matching_candidate_table_id: null,
        reallocation_count: (a.reallocation_count || 0) + 1,
        match_reason: `참가자가 ${targetRegion} · ${targetDate} 식탁을 직접 선택했습니다. 이 일정과 지역에서 다른 참여자와 인원·연령·안전 조건을 다시 확인하며 자동 매칭합니다. 선택한 카드에 즉시 확정 가입되는 것은 아닙니다.`,
        refund_reason: null,
        resolution_choice: null,
        resolution_at: null,
        last_resolution_choice: 'TRANSFER',
        updated_at: nowIso,
      } : a),
    }));
    showToast(`${targetRegion} · ${targetDate} 일정으로 범위를 변경했습니다. 자동 매칭부터 다시 시작합니다.`);
    return { ok: true, message: `선택한 일정으로 변경했어요. ${targetRegion} · ${targetDate}에서 다른 열린 식탁까지 다시 탐색합니다.` };
  };

  // PRD의 매칭 실패 해결: 사용자가 직접 대체 일정 이동·이용권 보관·환불 중 하나를 선택합니다.
  const handleResolveMatchFailure = (appId, choice) => {
    const application = store.applications.find((a) => a.id === appId && a.user_id === currentUser?.id);
    if (!application || !['ALTERNATIVE_OFFERED', 'NO_MATCH'].includes(application.match_status) || application.resolution_choice) {
      const message = '대체 해결을 선택할 수 있는 신청을 찾지 못했습니다. 현재 신청 상태를 확인해주세요.';
      showToast(message); return { ok: false, message };
    }
    if (!['PAID', 'REFUND_AVAILABLE', 'REFUND_FAILED'].includes(application.payment_status)) {
      const message = '결제 완료 또는 환불 선택 가능한 신청만 대안을 처리할 수 있습니다.';
      showToast(message); return { ok: false, message };
    }
    if (choice === 'STORE_TICKET') {
      const nowIso = new Date().toISOString();
      let createdCredit = null;
      let membershipList = [...(store.memberships || [])];
      const ticketCredits = [...(store.ticketCredits || [])];
      const history = [...(application.workflow_history || [])];
      if (application.ticket_type === 'ONE_TIME') {
        const existingCredit = ticketCredits.find((credit) => credit.source_application_id === appId && credit.status === 'ACTIVE');
        if (!existingCredit) {
          createdCredit = {
            id: `ticket-credit-${Date.now()}`,
            user_id: currentUser.id,
            source_application_id: appId,
            ticket_type: 'ONE_TIME',
            amount: Number(application.amount || 9900),
            status: 'ACTIVE',
            created_at: nowIso,
            used_at: null,
            used_by_application_id: null,
          };
          ticketCredits.unshift(createdCredit);
        } else createdCredit = existingCredit;
      } else if (application.membership_id && !history.includes('MATCH_FAILURE_EXTENSION_APPLIED')) {
        const membership = membershipList.find((item) => item.id === application.membership_id && item.user_id === currentUser.id && ['ACTIVE', 'REFUND_PENDING'].includes(item.status));
        if (membership) {
          const expiry = new Date(membership.expires_at);
          expiry.setDate(expiry.getDate() + 1);
          membership.expires_at = expiry.toISOString();
          membership.extension_days = (membership.extension_days || 0) + 1;
          membership.status = 'ACTIVE';
        }
        history.push('MATCH_FAILURE_EXTENSION_APPLIED');
      }
      history.push('TICKET_STORED');
      const reason = application.ticket_type === 'ONE_TIME'
        ? `참가자 선택: 1회권을 보관했습니다. 보관 이용권 ${createdCredit?.id || ''}은 다음 신청 때 사용할 수 있습니다.`
        : '참가자 선택: 멤버십을 유지했습니다. 매칭 실패 1회당 이용 기한 1일 연장 정책을 적용했습니다.';
      setStore((prev) => ({
        ...prev,
        ticketCredits,
        memberships: membershipList,
        applications: prev.applications.map((a) => a.id === appId ? {
          ...a,
          payment_status: a.payment_status === 'REFUND_AVAILABLE' ? 'PAID' : a.payment_status,
          match_status: 'NO_MATCH',
          workflow_stage: 'TICKET_STORED',
          workflow_history: [...new Set([...(a.workflow_history || []), ...history])],
          resolution_choice: 'STORE_TICKET',
          resolution_at: nowIso,
          refund_reason: null,
          match_reason: reason,
          updated_at: nowIso,
        } : a),
      }));
      const message = application.ticket_type === 'ONE_TIME'
        ? '1회권을 보관했습니다. 마이페이지에서 보관 이용권을 확인하고 다음 신청에 사용할 수 있습니다.'
        : '멤버십을 유지했습니다. 매칭 실패 1회 연장이 반영되었습니다.';
      showToast(message);
      return { ok: true, message };
    }
    if (choice === 'REFUND') {
      const nowIso = new Date().toISOString();
      const membershipList = [...(store.memberships || [])];
      if (application.membership_id) {
        const membership = membershipList.find((item) => item.id === application.membership_id && item.user_id === currentUser.id && item.status === 'ACTIVE');
        if (membership) membership.status = 'REFUND_PENDING';
      }
      const reason = '참가자 선택: 매칭 실패 환불을 요청했습니다. PG 연동 전이므로 실제 환불 완료가 아닌 데모 요청 상태입니다.';
      setStore((prev) => ({
        ...prev,
        memberships: membershipList,
        applications: prev.applications.map((a) => a.id === appId ? {
          ...a,
          payment_status: 'REFUND_REQUESTED',
          match_status: 'NO_MATCH',
          workflow_stage: 'REFUND_REQUESTED',
          workflow_history: [...new Set([...(a.workflow_history || []), 'MATCH_FAILURE_REFUND_SELECTED', 'REFUND_REQUESTED'])],
          resolution_choice: 'REFUND',
          resolution_at: nowIso,
          refund_reason: reason,
          match_reason: '매칭 실패 대안으로 환불을 선택했습니다. 원결제수단 환불 처리 결과를 기다리는 상태입니다.',
          updated_at: nowIso,
        } : a),
      }));
      const message = '환불 선택을 기록했습니다. 실제 환불은 결제대행사 연동 후 원결제수단으로 처리해야 하며, 현재는 요청 상태입니다.';
      showToast(message);
      return { ok: true, message };
    }
    return { ok: false, message: '지원하지 않는 해결 방법입니다.' };
  };

  // 마이페이지: 모바일 체크인
  const handleCheckInAttendance = (appId) => {
    const application = store.applications.find((a) => a.id === appId && a.user_id === currentUser?.id);
    const table = application && store.diningTables.find((t) => t.id === application.table_id);
    if (!application || application.match_status !== 'CONFIRMED' || application.attendance_status !== 'SCHEDULED' || !table) {
      showToast('확정된 식탁의 참석 예정 신청만 체크인할 수 있습니다.');
      return false;
    }
    const today = new Date().toLocaleDateString('sv-SE');
    if (today !== String(table.event_date || '').slice(0, 10)) {
      showToast('체크인은 모임 당일에만 할 수 있습니다. 모임 일정과 식당 안내를 확인해주세요.');
      return false;
    }
    const start = new Date(`${String(table.event_date).slice(0, 10)}T${table.event_time || '19:00'}:00`);
    const now = new Date();
    if (Number.isFinite(start.getTime()) && now < new Date(start.getTime() - 2 * 60 * 60 * 1000)) {
      showToast('체크인은 모임 시작 2시간 전부터 가능합니다.');
      return false;
    }
    if (Number.isFinite(start.getTime()) && now > new Date(start.getTime() + 3 * 60 * 60 * 1000)) {
      showToast('체크인 가능 시간이 지났습니다. 운영자에게 참석 여부 확인을 요청해주세요.');
      return false;
    }
    setStore((prev) => ({
      ...prev,
      applications: prev.applications.map((a) =>
        a.id === appId
          ? { ...a, attendance_status: 'ATTENDED', workflow_stage: 'ATTENDED', workflow_history: [...(a.workflow_history || []), 'ATTENDED'], checked_in_at: new Date().toISOString() }
          : a
      ),
    }));
    showToast('체크인을 로컬 데모 상태에 기록했습니다. 실제 참석 데이터는 서버 연동 후 저장됩니다.');
    return true;
  };

  // 결제 전 신청서는 과금과 좌석 예약이 없으므로 참가자가 직접 취소할 수 있습니다.
  const handleCancelPendingApplication = (appId) => {
    const application = store.applications.find((a) => a.id === appId && a.user_id === currentUser?.id);
    if (!application || application.payment_status !== 'PENDING' || application.application_status === 'CANCELED') {
      showToast('결제 대기 중인 신청서만 취소할 수 있습니다.');
      return;
    }
    setStore((prev) => ({
      ...prev,
      applications: prev.applications.map((a) => a.id === appId ? {
        ...a,
        application_status: 'CANCELED',
        workflow_stage: 'CANCELED',
        workflow_history: [...(a.workflow_history || []), 'APPLICATION_CANCELED_BEFORE_PAYMENT'],
        refund_reason: '결제 전 신청 취소 · 과금/환불 없음',
      } : a),
    }));
    showToast('결제 전 신청서를 취소했습니다. 결제와 좌석 예약은 발생하지 않았습니다.');
  };

  // 마이페이지: 피드백 제출
  const handleSubmitFeedback = (fbPayload) => {
    if (!currentUser) return false;
    const linkedApplication = store.applications.find((a) => a.id === fbPayload.application_id && a.user_id === currentUser.id);
    if (!linkedApplication || linkedApplication.attendance_status !== 'ATTENDED') {
      showToast('참석 완료로 기록된 신청에 대해서만 피드백을 제출할 수 있습니다.');
      return false;
    }
    if (store.feedbacks.some((fb) => fb.application_id === fbPayload.application_id && fb.user_id === currentUser.id)) {
      showToast('이미 이 식탁에 대한 피드백을 제출했습니다.');
      return false;
    }
    setStore((prev) => ({
      ...prev,
      feedbacks: [
        {
          id: `fb-${Date.now()}`,
          user_id: currentUser.id,
          user_name: currentUser.name,
          ...fbPayload,
          created_at: new Date().toISOString(),
        },
        ...prev.feedbacks,
      ],
      applications: prev.applications.map((a) => a.id === fbPayload.application_id
        ? { ...a, workflow_stage: 'FEEDBACK_DONE', workflow_history: [...(a.workflow_history || []), 'FEEDBACK_SUBMITTED'] }
        : a),
    }));
    showToast('피드백을 로컬 데모에 저장했습니다. PRD는 피드백 60%·이전 만남 이력 40%를 제안하지만, 실제 학습/매칭 반영은 서버 연동 후 확인할 수 있습니다.');
    return true;
  };

  // 운영자: 결제 상태 확인 토글
  const handleTogglePaymentStatus = (appId, nextPayStatus) => {
    setStore((prev) => ({
      ...prev,
      applications: prev.applications.map((a) =>
        a.id === appId ? { ...a, payment_status: nextPayStatus } : a
      ),
    }));
    showToast(`데모 화면에서 신청건(${appId}) 상태를 [${nextPayStatus}]로 변경했습니다. 결제대행사의 실제 거래 상태를 검증한 것은 아닙니다.`);
  };

  // 운영자 데모: 실제 스케줄러가 아닌 사전 점검 요약만 표시합니다.
  const handleRunAutoMatchingBatch = () => {
    const summary = store.diningTables.map((table) => ({ ...table, members: (table.member_ids || []).map((id) => store.users.find((u) => u.id === id)).filter(Boolean) }));
    const ready = summary.filter((t) => t.members.length >= 4 && t.members.length <= (t.max_members || 6));
    const msg = `로컬 데이터 사전 점검: 테이블 ${summary.length}개, 인원 조건(4~6명) 후보 ${ready.length}개. 연령·일정·지역·안전 조건의 서버 재검증과 자동 확정 스케줄러는 배포 전 구현이 필요합니다.`;
    showToast(msg);
    return msg;
  };

  // 참가자 안전 신고: 현재 브라우저 데모 스토어에만 기록합니다.
  const handleSubmitReport = (payload) => {
    if (!currentUser || !payload?.reported_user_id || !payload?.table_id) return;
    setStore((prev) => ({ ...prev, safetyReports: [{
      id: `demo-report-${Date.now()}`, reporter_user_id: currentUser.id, ...payload,
      status: 'OPEN', created_at: new Date().toISOString(), demo_mode: true,
    }, ...(prev.safetyReports || [])] }));
    showToast('안전 신고를 데모 기록으로 저장했습니다. 운영 배포 전에는 서버 저장·운영자 알림 연동이 필요합니다.');
  };

  // 운영자: 예외 큐 해결 처리
  const handleResolveException = (excId) => {
    setStore((prev) => ({
      ...prev,
      exceptionCases: prev.exceptionCases.map((e) =>
        e.id === excId
          ? { ...e, status: 'RESOLVED', resolved_at: new Date().toISOString() }
          : e
      ),
    }));
    showToast('운영자 예외 항목을 로컬 데모 상태에서 해결됨으로 표시했습니다. 실제 감사 로그는 서버 연동 후 남습니다.');
  };

  // 운영자가 행사 종료 후 노쇼를 기록합니다. 180일 내 2회부터는 자동 제재하지 않고 검토 예외를 생성합니다.
  const handleMarkNoShow = (appId) => {
    if (currentUser?.role !== 'ADMIN') { showToast('노쇼 처리는 운영자 권한이 필요합니다.'); return; }
    const selected = store.applications.find((a) => a.id === appId);
    if (!selected || selected.match_status !== 'CONFIRMED' || selected.attendance_status !== 'SCHEDULED') {
      showToast('확정된 식탁의 참석 예정 신청만 노쇼로 기록할 수 있습니다.'); return;
    }
    const eventTable = store.diningTables.find((t) => t.id === selected.table_id);
    if (eventTable?.event_date) {
      const start = new Date(`${String(eventTable.event_date).slice(0, 10)}T${eventTable.event_time || '19:00'}:00`);
      const expectedEnd = new Date(start.getTime() + 3 * 60 * 60 * 1000);
      if (Number.isFinite(expectedEnd.getTime()) && expectedEnd > new Date()) { showToast('행사 종료 후에만 노쇼를 기록할 수 있습니다.'); return; }
    }
    const now = new Date();
    const cutoff = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    const priorNoShows = store.applications.filter((a) => {
      if (a.user_id !== selected.user_id || a.attendance_status !== 'NO_SHOW') return false;
      const t = store.diningTables.find((row) => row.id === a.table_id);
      const occurred = new Date(t?.event_date ? `${String(t.event_date).slice(0, 10)}T23:59:59` : a.created_at || 0);
      return occurred >= cutoff;
    }).length;
    const noShowCount = priorNoShows + 1;
    const user = store.users.find((u) => u.id === selected.user_id);
    const reviewId = `exc-noshow-${selected.user_id}-${Date.now()}`;
    const needsReview = noShowCount >= 2 && !(store.exceptionCases || []).some((e) => e.exception_type === 'NO_SHOW_REVIEW' && e.target_id === selected.user_id && e.status === 'OPEN');
    setStore((prev) => ({
      ...prev,
      applications: prev.applications.map((a) => a.id === appId ? {
        ...a,
        attendance_status: 'NO_SHOW',
        workflow_stage: 'NO_SHOW',
        workflow_history: [...(a.workflow_history || []), 'NO_SHOW_RECORDED_BY_OPERATOR'],
        ticket_consumed: a.ticket_type === 'ONE_TIME',
        no_show_recorded_at: now.toISOString(),
        no_show_count_180d: noShowCount,
      } : a),
      exceptionCases: needsReview ? [{
        id: reviewId,
        exception_type: 'NO_SHOW_REVIEW',
        target_id: selected.user_id,
        title: `[노쇼 검토 필요] ${user?.name || selected.user_id} · 180일 내 ${noShowCount}회`,
        failure_reason: '180일 내 노쇼가 2회 이상 누적되었습니다. 자동 정지하지 않고 운영자가 사유·상황을 검토해야 합니다.',
        status: 'OPEN',
        admin_note: '검토 결과에 따라 30일 이용 제한 여부를 기록하세요. 이용 제한은 운영자 검토 후에만 적용합니다.',
        created_at: now.toISOString(),
      }, ...(prev.exceptionCases || [])] : (prev.exceptionCases || []),
    }));
    showToast(needsReview
      ? `노쇼를 기록했습니다. 180일 내 ${noShowCount}회 누적으로 운영자 검토 큐에 추가했습니다. 자동 이용 제한은 적용하지 않았습니다.`
      : `노쇼를 기록했습니다. ${selected.ticket_type === 'ONE_TIME' ? '1회권은 해당 회차 사용 완료로 처리했습니다.' : '멤버십의 이용 횟수는 차감하지 않았습니다.'}`);
  };

  // 운영자: CSV 내보내기
  const handleExportCsv = () => {
    const rows = [
      ['TableID', 'Title', 'Region', 'Date', 'Status', 'MemberCount', 'MatchScore'],
      ...store.diningTables.map((t) => [
        t.id,
        `"${t.title}"`,
        t.region,
        t.event_date,
        t.match_status,
        t.member_ids.length,
        t.match_score,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'serendipity_tables_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📊 참가자 및 테이블 매칭 결과 CSV 파일 다운로드를 시작했습니다.');
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <AppShell>
      {/* =====================================================================
          CASE 1: 비로그인 상태 (currentUser === null)
          - 오직 3D 스토리텔링 랜딩 페이지만 보여줌
          - 로그인하지 않은 상태에서는 절대 홈/채팅/마이페이지/운영자 페이지 진입 불가!
         ===================================================================== */}
      {!currentUser ? (
        <LandingExperience
          onOpenLogin={() => setIsAuthModalOpen(true)}
        />
      ) : (
        /* ===================================================================
           CASE 2: 로그인 완료 상태 (currentUser !== null)
           - 로그인 후에는 3D 랜딩 페이지를 더 이상 보여주지 않음!
           - 일반 사용자(USER)와 운영자(ADMIN)의 네비게이션 및 페이지를 완전히 분리!
           =================================================================== */
        <>
          <TopNav>
            <BrandLogo
              isAdmin={isAdmin}
              onClick={() => setActiveView(isAdmin ? 'ADMIN' : 'WELCOME')}
            >
              <img
                src={`${import.meta.env.BASE_URL}assets/whatsup-logo.png`}
                alt="와썹하우스 공식 로고"
                className="brand-img"
              />
              <span>우연한 식탁</span>
              <span className="role-badge">
                {isAdmin ? '🛡️ 운영자 전용 어드민 포털' : '🍽️ 참가자 전용 라운지'}
              </span>
            </BrandLogo>

            {/* 일반 참가자(USER) 전용 메뉴(홈 / 단체 채팅방) vs 운영자(ADMIN) 전용 메뉴 분리 */}
            {!isAdmin ? (
              <NavTabsGroup>
                <NavTabButton
                  active={activeView === 'WELCOME'}
                  onClick={() => setActiveView('WELCOME')}
                  data-testid="nav-start-btn"
                >
                  <Compass size={15} />
                  <span>시작</span>
                </NavTabButton>
                <NavTabButton
                  active={activeView === 'HOME'}
                  onClick={() => setActiveView('HOME')}
                  data-testid="nav-home-btn"
                >
                  <Home size={15} />
                  <span>식탁 찾기</span>
                </NavTabButton>
                <NavTabButton
                  active={activeView === 'JOURNEY'}
                  onClick={() => setActiveView('JOURNEY')}
                  data-testid="nav-journey-btn"
                >
                  <ListChecks size={15} />
                  <span>진행 단계</span>
                </NavTabButton>
                <NavTabButton
                  active={activeView === 'CHAT'}
                  onClick={() => setActiveView('CHAT')}
                  data-testid="nav-chat-btn"
                >
                  <MessageCircleHeart size={15} />
                  <span>대화방</span>
                </NavTabButton>
              </NavTabsGroup>
            ) : (
              <NavTabsGroup>
                <NavTabButton active data-testid="nav-admin-btn">
                  <Shield size={15} />
                  <span>운영 관리</span>
                </NavTabButton>
              </NavTabsGroup>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {/* 일반 참가자는 우측 상단 본인 프로필을 클릭하면 곧바로 내 정보/결제·환불(마이페이지) 화면으로 이동 */}
              {!isAdmin ? (
                <ProfileNavTrigger
                  type="button"
                  active={activeView === 'MYPAGE'}
                  onClick={() => setActiveView('MYPAGE')}
                  data-testid="nav-profile-mypage-btn"
                  title="클릭하여 내 결제 내역 및 환불/피드백 관리로 이동"
                >
                  <span className="avatar">{currentUser.name.slice(0, 1)}</span>
                  <span className="meta">
                    <span className="name">
                      {currentUser.name} ({currentUser.age}세 · {currentUser.mbti})
                    </span>
                    <span className="sub">내 프로필 · 결제/환불 내역 보기 →</span>
                  </span>
                </ProfileNavTrigger>
              ) : (
                <View style={rnStyles.statusBadge}>
                  <Text style={rnStyles.statusText}>
                    🛡️ {currentUser.name} (ADMIN)
                  </Text>
                </View>
              )}

              <LogoutBtn
                type="button"
                onClick={handleLogout}
                data-testid="logout-btn"
              >
                <LogOut size={14} />
                <span>로그아웃</span>
              </LogoutBtn>
            </View>
          </TopNav>
          <DemoBanner>
            개발용 가상데이터 · 프로필 {store.demoCatalogMeta?.participant_profile_count || 294}명 · 전체 식탁 {(store.diningTables || []).length}개 · 모집 중 {(store.diningTables || []).filter((table) => ['WAITING', 'REALLOCATING'].includes(table.match_status || 'WAITING') && (table.member_ids || []).length < (table.max_members || 6)).length}개.
            화면 데이터는 브라우저 메모리에 저장되며, 백엔드 MySQL CRUD·실제 결제·환불·예약·실시간 채팅은 아직 미연결입니다.
          </DemoBanner>

          {/* 로그인 직후 선택 포털: 회원권/신청 흐름 또는 앱 둘러보기 */}
          {!isAdmin && activeView === 'WELCOME' && (
            <StartPortal
              currentUser={currentUser}
              store={store}
              onStartMembership={() => {
                setPreferMembershipChoice(true);
                setActiveView('HOME');
                setHomeRecommendationRequest((value) => value + 1);
              }}
              onExplore={() => setActiveView('HOME')}
            />
          )}

          {/* 일반 참가자(USER) 화면 렌더링 */}
          {!isAdmin && activeView === 'HOME' && (
            <HomeView
              currentUser={currentUser}
              store={store}
              onSubmitTableApplication={handleSubmitTableApplication}
              onJoinTableAndChat={handleJoinTableAndChat}
              onStartJourney={(applicationId) => {
                setJourneyApplicationId(applicationId);
                setActiveView('JOURNEY');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onConsumeRecommendationRequest={() => { setHomeRecommendationRequest(0); setPreferMembershipChoice(false); }}
              preferMembershipChoice={preferMembershipChoice}
              onGoToChatRoom={(tblId) => { setActiveTableId(tblId); setActiveView('CHAT'); }}
              onGoToMyPage={() => setActiveView('MYPAGE')}
              recommendationRequest={homeRecommendationRequest}
              resumeCheckout={checkoutResume}
            />
          )}

          {!isAdmin && activeView === 'JOURNEY' && (
            <ParticipationJourneyView
              currentUser={currentUser}
              store={store}
              applicationId={journeyApplicationId}
              onAdvanceStage={handleAdvanceJourney}
              onGoHome={() => setActiveView('HOME')}
              onGoMyPage={() => setActiveView('MYPAGE')}
              onOpenChat={(tblId) => { if (tblId) setActiveTableId(tblId); setActiveView('CHAT'); }}
              onCheckInAttendance={handleCheckInAttendance}
              onSubmitFeedback={handleSubmitFeedback}
              onTransferAlternativeSlot={handleTransferAlternativeSlot}
              onResolveMatchFailure={handleResolveMatchFailure}
              onStartNextMatch={(applicationId) => {
                setStore((prev) => ({
                  ...prev,
                  applications: prev.applications.map((a) => a.id === applicationId ? {
                    ...a,
                    workflow_stage: 'NEXT_MATCH',
                    workflow_history: (a.workflow_history || []).includes('NEXT_MATCH_STARTED')
                      ? a.workflow_history
                      : [...(a.workflow_history || []), 'NEXT_MATCH_STARTED'],
                  } : a),
                }));
                setJourneyApplicationId(null);
                setPreferMembershipChoice(false);
                setHomeRecommendationRequest((value) => value + 1);
                setActiveView('HOME');
              }}
            />
          )}

          {!isAdmin && activeView === 'CHAT' && (
            <ChatRoomView
              currentUser={currentUser}
              store={store}
              activeTableId={activeTableId}
              onSelectTableId={setActiveTableId}
              onSendMessage={handleSendMessage}
              onVoteGameOption={handleVoteGameOption}
              onAdminControlGame={handleAdminControlGame}
              onSubmitReport={handleSubmitReport}
              onGoHome={() => setActiveView('HOME')}
            />
          )}

          {!isAdmin && activeView === 'MYPAGE' && (
            <MyPageView
              currentUser={currentUser}
              store={store}
              onRequestRefundOrCancel={handleRequestRefundOrCancel}
              onTransferAlternativeSlot={handleTransferAlternativeSlot}
              onCheckInAttendance={handleCheckInAttendance}
              onSubmitFeedback={handleSubmitFeedback}
              onCancelPendingApplication={handleCancelPendingApplication}
              onContinuePayment={(applicationId) => {
                setJourneyApplicationId(applicationId);
                setActiveView('JOURNEY');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onFindNextMatch={(applicationId) => {
                setStore((prev) => ({ ...prev, applications: prev.applications.map((a) => a.id === applicationId ? { ...a, workflow_stage: 'NEXT_MATCH', workflow_history: (a.workflow_history || []).includes('NEXT_MATCH_STARTED') ? a.workflow_history : [...(a.workflow_history || []), 'NEXT_MATCH_STARTED'] } : a) }));
                setJourneyApplicationId(null);
                setPreferMembershipChoice(false);
                setHomeRecommendationRequest((value) => value + 1);
                setActiveView('HOME');
              }}
            />
          )}

          {/* 운영자(ADMIN) 전용 화면 렌더링 */}
          {isAdmin && (
            <AdminDashboardView
              store={store}
              onTogglePaymentStatus={handleTogglePaymentStatus}
              onMarkNoShow={handleMarkNoShow}
              onAdminControlGame={handleAdminControlGame}
              onRunAutoMatchingBatch={handleRunAutoMatchingBatch}
              onResolveException={handleResolveException}
              onExportCsv={handleExportCsv}
            />
          )}
        </>
      )}

      {/* 물결 애니메이션 배경 로그인 & 2단계 회원가입 모달 */}
      <AuthWaveModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        users={store.users}
        excelSurveyDataset={store.excelSurveyDataset || excelSurveyDataset}
        onSuccessAuth={handleSuccessAuth}
        onRegisterNewUser={handleRegisterNewUser}
      />

      {toastMsg && <ToastNotification>{toastMsg}</ToastNotification>}
    </AppShell>
  );
}

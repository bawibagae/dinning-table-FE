import React, { useState } from 'react';
import styled from '@emotion/styled';
import {
  Play,
  CheckCircle2,
  RefreshCw,
  CreditCard,
  Users,
  Utensils,
  Gamepad2,
  Download,
  Sparkles,
  ChevronRight,
  Square,
  AlertTriangle,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

const AdminWrapper = styled.div`
  width: min(1440px, 100%);
  margin: 0 auto;
  padding: clamp(16px, 2.5vw, 32px) clamp(14px, 2.4vw, 30px) 72px;
  color: #493423;
  box-sizing: border-box;
  * { box-sizing: border-box; }
`;

const TopHeader = styled.div`
  padding: clamp(20px, 2.8vw, 32px);
  border-radius: 12px;
  background: linear-gradient(125deg, #e7dac6 0%, #f7f0e5 74%), repeating-linear-gradient(0deg, rgba(92,67,39,.025) 0 1px, transparent 1px 4px);
  border: 1px solid #d5c2a6;
  box-shadow: 0 16px 42px rgba(67, 46, 26, 0.07);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
  margin-bottom: 24px;
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 195px), 1fr));
  gap: 12px;
  margin-bottom: 24px;
`;

const KpiCard = styled.div`
  padding: 18px 19px;
  min-width: 0;
  border-radius: 12px;
  background: #fbf7ef;
  border: 1px solid #dfd1be;
  box-shadow: 0 10px 28px rgba(67, 46, 26, 0.045);

  .label {
    font-size: 0.8rem;
    color: #8b7761;
    margin-bottom: 8px;
    font-weight: 600;
  }
  .val {
    font-size: 1.65rem;
    font-weight: 800;
    color: ${(props) => props.color || '#95754e'};
  }
  .sub {
    font-size: 0.76rem;
    color: #a08d77;
    margin-top: 5px;
  }
`;

const SubTabBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 205px), 1fr));
  gap: 9px;
  margin-bottom: 18px;
`;

const SubTabBtn = styled.button`
  display:flex; align-items:center; justify-content:flex-start; text-align:left;
  min-height:48px; padding: 11px 14px;
  border-radius: 8px;
  font-size: 0.82rem; line-height:1.4;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${(props) => (props.active ? '#493423' : '#decfba')};
  background: ${(props) => (props.active ? '#493423' : '#f8f2e9')};
  color: ${(props) => (props.active ? '#fff5e7' : '#78644e')};

  &:hover {
    border-color: #b9a081;
    transform: translateY(-1px);
  }
`;

const SectionBox = styled.div`
  padding: clamp(16px, 2vw, 25px);
  border-radius: 12px;
  background: #fbf7ef;
  border: 1px solid #dfd1be;
  box-shadow: 0 12px 32px rgba(67, 46, 26, 0.05);
  margin-bottom: 24px;
`;

const GameCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: 12px;
`;

const TableGameControlCard = styled.div`
  min-width:0; padding: 18px;
  border-radius: 12px;
  background: ${(props) => props.running ? '#eee1ce' : '#f8f2e9'};
  border: 1px solid ${(props) => props.running ? '#b7a080' : '#e1d4c2'};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
`;


const PaymentStatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: 999px;
  white-space: nowrap;
  font-size: 0.75rem;
  font-weight: 850;
  letter-spacing: -0.01em;
  color: ${(p) => ({
    pending: '#805900', paid: '#27613d', warning: '#875300', processing: '#345b8c', danger: '#a32d2d',
  }[p.$tone] || '#68513a')};
  background: ${(p) => ({
    pending: '#fff1b8', paid: '#e3f2e5', warning: '#ffedcd', processing: '#e7efff', danger: '#fde6e4',
  }[p.$tone] || '#f1e7d8')};
  border: 1px solid ${(p) => ({
    pending: '#e5c653', paid: '#b5d9bc', warning: '#edc58a', processing: '#c0d1ec', danger: '#e6aaa6',
  }[p.$tone] || '#dfd1be')};
`;

const paymentStatusMeta = {
  PENDING: { label: '결제 대기', tone: 'pending' },
  PAID: { label: '결제 완료', tone: 'paid' },
  FAILED: { label: '결제 실패', tone: 'danger' },
  REFUND_AVAILABLE: { label: '환불 선택 가능', tone: 'warning' },
  REFUND_REQUESTED: { label: '환불 요청', tone: 'warning' },
  REFUND_PROCESSING: { label: '환불 처리 중', tone: 'processing' },
  REFUNDED: { label: '환불 완료', tone: 'danger' },
  REFUND_FAILED: { label: '환불 실패', tone: 'danger' },
};

const TableViewport = styled.div`
  width: 100%;
  max-width: 100%;
  overflow: auto;
  border: 1px solid #e5d9c7;
  border-radius: 9px;
  background: #fffaf2;
  overscroll-behavior-x: contain;
`;

const TableEl = styled.table`
  width: 100%;
  min-width: 830px;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.82rem;
  color: #5a4632;

  th, td {
    padding: 13px 14px;
    text-align: left;
    vertical-align: top;
    line-height: 1.55;
    border-bottom: 1px solid #e9dfd1;
  }
  th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: #f1e7d8;
    color: #806443;
    font-weight: 800;
    font-size: 0.74rem;
    white-space: nowrap;
  }
  tbody tr:last-child td { border-bottom: 0; }
  tbody tr:hover td { background: #fcf5e9; }
`;

const PaymentToolbar = styled.div`
  display:grid;
  grid-template-columns:minmax(220px,1fr) minmax(170px,220px) auto;
  align-items:center;
  gap:10px;
  margin:18px 0 14px;
  @media(max-width:760px){grid-template-columns:1fr 1fr;& > :last-child{grid-column:1/-1;text-align:left;}}
  @media(max-width:480px){grid-template-columns:1fr;}
`;

const SearchField = styled.label`
  min-width:0; display:flex; align-items:center; gap:9px;
  height:42px; padding:0 12px; border:1px solid #d8c7b0; border-radius:8px;
  background:#fffaf2; color:#967a59;
  &:focus-within{border-color:#8b6a44;box-shadow:0 0 0 3px rgba(139,106,68,.1);}
  svg{flex-shrink:0;}
  input{width:100%;min-width:0;border:0;outline:0;background:transparent;color:#493423;font:inherit;font-size:.82rem;}
  input::placeholder{color:#a4937e;}
  button{width:25px;height:25px;display:grid;place-items:center;flex-shrink:0;border:0;border-radius:5px;background:transparent;color:#8f7c67;cursor:pointer;}
  button:hover{background:#f0e5d4;}
`;

const FilterSelect = styled.label`
  height:42px; display:flex; align-items:center; gap:8px; padding:0 11px;
  border:1px solid #d8c7b0; border-radius:8px; background:#fffaf2; color:#967a59;
  svg{flex-shrink:0;}
  select{width:100%;min-width:0;border:0;outline:0;background:transparent;color:#5a4632;font:inherit;font-size:.8rem;cursor:pointer;}
`;

const ResultCount = styled.div`
  color:#8b7864;font-size:.78rem;white-space:nowrap;text-align:right;
  strong{color:#493423;font-size:.9rem;}
`;

const ActionGroup = styled.div`
  display:flex; align-items:center; flex-wrap:wrap; gap:6px; min-width:180px;
  @media(max-width:900px){min-width:240px;}
`;

const EmptyState = styled.div`
  padding:34px 16px;text-align:center;color:#8b7864;font-size:.85rem;
  strong{display:block;color:#604a35;font-size:1rem;margin-bottom:5px;}
`;

const MiniBtn = styled.button`
  padding: 8px 10px;
  min-height: 34px;
  border-radius: 7px;
  font-size: 0.74rem;
  line-height:1.25;
  font-weight: 750;
  cursor: pointer;
  border: 1px solid ${(props) => props.danger ? '#dfaaa5' : props.primary ? '#493423' : props.success ? '#b5d3ba' : props.warning ? '#e6c66f' : '#d5c3aa'};
  background: ${(props) => props.danger ? '#fde6e4' : props.primary ? '#493423' : props.success ? '#e3f2e5' : props.warning ? '#fff1b8' : '#f8f2e9'};
  color: ${(props) => props.danger ? '#a32d2d' : props.primary ? '#fff5e7' : props.success ? '#27613d' : props.warning ? '#805900' : '#68513a'};
  margin:0;
  display: inline-flex;
  align-items: center;
  justify-content:center;
  gap: 5px;
  white-space:nowrap;
  transition: background .16s ease,border-color .16s ease,transform .16s ease;
  &:hover { border-color:#b9a081; transform:translateY(-1px); }
  &:focus-visible{outline:2px solid #927452;outline-offset:2px;}
  &:active{transform:translateY(0);}
`;

export default function AdminDashboardView({
  store,
  onTogglePaymentStatus,
  onMarkNoShow,
  onAdminControlGame,
  onRunAutoMatchingBatch,
  onResolveException,
  onExportCsv,
}) {
  const [subTab, setSubTab] = useState('PAYMENTS_AND_GAMES');
  const [batchMessage, setBatchMessage] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');

  const totalApps = store.applications.length;
  const paidApps = store.applications.filter((a) => a.payment_status === 'PAID').length;
  const confirmedTables = store.diningTables.filter((t) => t.match_status === 'CONFIRMED').length;
  const openExceptions = store.exceptionCases.filter((e) => e.status === 'OPEN').length;
  const alternativeWaiting = store.applications.filter(
    (a) => a.match_status === 'ALTERNATIVE_OFFERED'
  ).length;
  const filteredApplications = store.applications.filter((app) => {
    const user = store.users.find((item) => item.id === app.user_id);
    const query = paymentSearch.trim().toLocaleLowerCase('ko-KR');
    const searchable = [user?.name, user?.email, user?.phone, app.id, app.user_id, ...(app.desired_regions || [])]
      .filter(Boolean).join(' ').toLocaleLowerCase('ko-KR');
    return (!query || searchable.includes(query)) &&
      (paymentStatusFilter === 'ALL' || app.payment_status === paymentStatusFilter);
  });

  const handleBatchRun = () => {
    const summary = onRunAutoMatchingBatch();
    setBatchMessage(summary);
  };

  return (
    <AdminWrapper>
      <TopHeader>
        <div>
          <div style={{ fontSize: '0.78rem', color: '#8b6b42', fontWeight: 700, marginBottom: 4 }}>
            WHATSUP HOUSE OPERATOR CONSOLE · PRD 11절 운영자 웹 어드민
          </div>
          <h1 style={{ fontFamily: 'Noto Serif KR, serif', fontSize: 'clamp(1.25rem, 2.4vw, 1.65rem)', color: '#493423' }}>
            우연한 식탁 운영자 대시보드
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#78644e', marginTop: 4 }}>
            이 화면은 로컬 데모입니다. 결제·자동 매칭·게임 상태 변경은 실제 운영 데이터에 반영되지 않으며, 실서비스 권한·서버 연동이 필요합니다.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <MiniBtn
            type="button"
            primary
            onClick={handleBatchRun}
            data-testid="admin-run-batch-btn"
            style={{ padding: '13px 18px', fontSize: '0.88rem' }}
          >
            <RefreshCw size={15} />
            <span>매칭 조건 사전 점검 실행</span>
          </MiniBtn>

          <MiniBtn
            type="button"
            onClick={onExportCsv}
            style={{ padding: '13px 16px', fontSize: '0.86rem' }}
          >
            <Download size={15} />
            <span>참가자·테이블 CSV 내보내기</span>
          </MiniBtn>
        </div>
      </TopHeader>

      {batchMessage && (
        <div
          style={{
            padding: '15px 20px',
            borderRadius: 16,
            background: '#f0e5d3',
            border: '1px solid #d5c1a5',
            color: '#654c32',
            fontSize: '0.88rem',
            marginBottom: 20,
          }}
        >
          <strong>로컬 데모 사전 점검 결과</strong> {batchMessage}
        </div>
      )}

      <KpiGrid>
        <KpiCard>
          <div className="label">전체 신청 / 결제 완료자 수</div>
          <div className="val">
            {paidApps}명 / {totalApps}건
          </div>
          <div className="sub">결제 전환율 {Math.round((paidApps / Math.max(1, totalApps)) * 100)}%</div>
        </KpiCard>

        <KpiCard color="#8b6b42">
          <div className="label">서버 자동 확정 미검증</div>
          <div className="val">
            {confirmedTables}개 / {store.diningTables.length}개
          </div>
          <div className="sub">로컬 시드 데이터 집계 · 실제 스케줄러 미연결</div>
        </KpiCard>

        <KpiCard color="#facc15">
          <div className="label">대체 일정 / 환불 선택 대기</div>
          <div className="val">{alternativeWaiting}명</div>
          <div className="sub">STA-04 원클릭 일정이동 안내 발송됨</div>
        </KpiCard>

        <KpiCard color="#f87171">
          <div className="label">미처리 운영자 예외 큐 (MAT-13)</div>
          <div className="val">{openExceptions}건</div>
          <div className="sub">식당부족 · 조건충돌 · 안전신고</div>
        </KpiCard>
      </KpiGrid>

      <SubTabBar>
        <SubTabBtn
          active={subTab === 'PAYMENTS_AND_GAMES'}
          onClick={() => setSubTab('PAYMENTS_AND_GAMES')}
        >
          결제 관리 · 게임 진행
        </SubTabBtn>
        <SubTabBtn
          active={subTab === 'EXCEPTIONS_AND_SAFETY'}
          onClick={() => setSubTab('EXCEPTIONS_AND_SAFETY')}
        >
          예외 처리 · 안전 신고 ({openExceptions})
        </SubTabBtn>
        <SubTabBtn
          active={subTab === 'VENUES_AND_TABLES'}
          onClick={() => setSubTab('VENUES_AND_TABLES')}
        >
          식당 재고 · 테이블 매칭
        </SubTabBtn>
        <SubTabBtn
          active={subTab === 'SURVEY_294'}
          onClick={() => setSubTab('SURVEY_294')}
        >
          설문 샘플 데이터 ({(store.excelSurveyDataset || []).length}명)
        </SubTabBtn>
      </SubTabBar>

      {subTab === 'PAYMENTS_AND_GAMES' && (
        <>
          {/* 테이블별 미니게임 & 아이스브레이킹 시작 조작 카드 그리드 */}
          <SectionBox>
            <h2 style={{ fontSize: '1.22rem', color: '#493423', marginBottom: 8 }}>
              🎮 테이블별 미니게임 & 아이스브레이킹 시작 컨트롤러 (CON-01 ~ CON-04)
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#8c7862', marginBottom: 18 }}>
              운영자가 아래 카드에서 <strong>[시작]</strong>을 누르면 해당 식탁의 단체 채팅방 상단에 실시간 미니게임·투표 보드가 즉시 활성화됩니다.
            </p>

            <GameCardsGrid>
              {store.diningTables.slice(0, 5).map((tbl) => {
                const room = store.chatRooms.find((r) => r.table_id === tbl.id);
                const activeGame = store.gamesCatalog.find(
                  (g) => g.id === room?.active_game_id
                );
                const isRunning = room?.game_status === 'RUNNING';

                return (
                  <TableGameControlCard key={tbl.id} running={isRunning}>
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 8,
                        }}
                      >
                        <span style={{ fontSize: '0.76rem', color: '#8b6b42', fontWeight: 700 }}>
                          {tbl.region} · {tbl.event_date} ({tbl.member_ids.length}/{tbl.max_members}명)
                        </span>
                        <span
                          style={{
                            padding: '3px 9px',
                            borderRadius: 999,
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: isRunning ? '#e1e9d8' : '#efe5d6',
                            color: isRunning ? '#536b43' : '#8f7b64',
                          }}
                        >
                          {isRunning ? `● LIVE (R${room.current_round})` : '대기중 (IDLE)'}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.05rem', color: '#493423', marginBottom: 4 }}>
                        {tbl.title}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: '#8c7862' }}>
                        {isRunning
                          ? `현재 진행 게임: ${activeGame?.title}`
                          : '현재 진행 중인 게임이 없습니다.'}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {store.gamesCatalog.map((g) => (
                          <MiniBtn
                            key={g.id}
                            type="button"
                            primary={room?.active_game_id === g.id && isRunning}
                            onClick={() => onAdminControlGame(tbl.id, 'START', g.id)}
                            data-testid={`admin-start-${tbl.id}-${g.id}`}
                          >
                            <Play size={12} />
                            <span>{g.category} 시작</span>
                          </MiniBtn>
                        ))}
                      </div>

                      {isRunning && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                          <MiniBtn
                            type="button"
                            onClick={() => onAdminControlGame(tbl.id, 'NEXT_ROUND')}
                          >
                            <span>다음 라운드 전환</span>
                            <ChevronRight size={13} />
                          </MiniBtn>
                          <MiniBtn
                            type="button"
                            onClick={() => onAdminControlGame(tbl.id, 'STOP')}
                          >
                            <Square size={11} />
                            <span>게임 종료</span>
                          </MiniBtn>
                        </div>
                      )}
                    </div>
                  </TableGameControlCard>
                );
              })}
            </GameCardsGrid>
          </SectionBox>

          {/* 참가자 결제 여부 확인 및 상태 변경 */}
          <SectionBox>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
              <div style={{minWidth:0,flex:'1 1 320px'}}>
                <h2 style={{ fontSize: 'clamp(1.08rem, 2vw, 1.3rem)', color: '#493423', marginBottom: 7 }}>
                  결제 상태 관리
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#8c7862', lineHeight:1.65, margin:0 }}>
                  이름이나 지역으로 신청자를 찾고 상태별로 필터링할 수 있습니다. 버튼 변경은 데모 표시값이며 실제 결제사 확인을 대신하지 않습니다.
                </p>
              </div>
              <div style={{display:'flex',gap:7,alignItems:'center',flexWrap:'wrap'}}>
                <PaymentStatusBadge $tone="pending">대기 {store.applications.filter((a)=>a.payment_status==='PENDING').length}</PaymentStatusBadge>
                <PaymentStatusBadge $tone="paid">완료 {paidApps}</PaymentStatusBadge>
                <PaymentStatusBadge $tone="danger">환불 {store.applications.filter((a)=>a.payment_status==='REFUNDED').length}</PaymentStatusBadge>
              </div>
            </div>

            <PaymentToolbar>
              <SearchField>
                <Search size={17} aria-hidden="true" />
                <input
                  type="search"
                  value={paymentSearch}
                  onChange={(event)=>setPaymentSearch(event.target.value)}
                  placeholder="이름, 이메일, 지역, 신청 ID 검색"
                  aria-label="신청자 결제 목록 검색"
                />
                {paymentSearch && <button type="button" aria-label="검색어 지우기" onClick={()=>setPaymentSearch('')}><X size={14}/></button>}
              </SearchField>
              <FilterSelect>
                <SlidersHorizontal size={16} aria-hidden="true"/>
                <select value={paymentStatusFilter} onChange={(event)=>setPaymentStatusFilter(event.target.value)} aria-label="결제 상태 필터">
                  <option value="ALL">모든 결제 상태</option>
                  {Object.entries(paymentStatusMeta).map(([value,meta])=><option key={value} value={value}>{meta.label}</option>)}
                </select>
              </FilterSelect>
              <ResultCount>검색 결과 <strong>{filteredApplications.length}</strong> / {store.applications.length}건</ResultCount>
            </PaymentToolbar>

            <TableViewport>
              <TableEl>
                <thead>
                  <tr>
                    <th>신청자</th>
                    <th>희망 지역 · 이용권</th>
                    <th>결제 상태</th>
                    <th>매칭 · 참석</th>
                    <th>결제 · 참석 데모 조작</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => {
                    const u = store.users.find((usr) => usr.id === app.user_id);
                    return (
                      <tr key={app.id}>
                        <td>
                          <strong style={{ color: '#493423',fontSize:'.88rem' }}>{u ? u.name : app.user_id}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#8f7c67' }}>{u?.age ? `${u.age}세` : '나이 미입력'} · {u?.mbti || 'MBTI 미입력'}</div>
                          <div style={{ fontSize: '0.72rem', color: '#9b8b78' }}>{u?.job_category || '직업 미입력'}</div>
                        </td>
                        <td>
                          <div style={{maxWidth:210,whiteSpace:'normal'}}>{(app.desired_regions || []).join(', ') || '지역 미입력'}</div>
                          <div style={{ marginTop:4,fontSize:'.75rem',color:'#8f7c67' }}>{app.ticket_type || '이용권 미입력'} · <strong style={{ color: '#8b6b42' }}>{(app.amount || 9900).toLocaleString()}원</strong></div>
                        </td>
                        <td>
                          <PaymentStatusBadge $tone={(paymentStatusMeta[app.payment_status] || {}).tone}>
                            {(paymentStatusMeta[app.payment_status] || {}).label || app.payment_status || '상태 미확인'}
                          </PaymentStatusBadge>
                          <div style={{ fontSize: '0.71rem', color: '#9b8b78', marginTop:6 }}>신청: {app.application_status || 'SUBMITTED'}</div>
                        </td>
                        <td>
                          <div style={{fontSize:'.76rem'}}>매칭: <strong>{app.match_status || '미확인'}</strong></div>
                          <div style={{fontSize:'.76rem',color:'#8f7c67',marginTop:3}}>참석: {app.attendance_status || '미정'}</div>
                        </td>
                        <td>
                          <ActionGroup>
                            <MiniBtn type="button" success={app.payment_status === 'PAID'} onClick={() => onTogglePaymentStatus(app.id, 'PAID')} data-testid={`admin-mark-paid-${app.id}`} title="로컬 데모 상태를 결제 완료로 표시">
                              <CheckCircle2 size={13} /> 결제 완료
                            </MiniBtn>
                            <MiniBtn type="button" warning={app.payment_status === 'PENDING'} onClick={() => onTogglePaymentStatus(app.id, 'PENDING')} title="로컬 데모 상태를 결제 대기로 표시">
                              결제 대기
                            </MiniBtn>
                            <MiniBtn type="button" danger={app.payment_status === 'REFUNDED'} onClick={() => onTogglePaymentStatus(app.id, 'REFUNDED')} title="로컬 데모 상태를 환불 완료로 표시">
                              환불 완료
                            </MiniBtn>
                            {app.match_status === 'CONFIRMED' && app.attendance_status === 'SCHEDULED' && <MiniBtn type="button" danger onClick={() => onMarkNoShow?.(app.id)} title="행사 종료 후 노쇼를 기록하고, 180일 내 2회면 운영자 검토 큐에 올립니다"><AlertTriangle size={13}/> 노쇼 기록</MiniBtn>}
                          </ActionGroup>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </TableEl>
            </TableViewport>
            {filteredApplications.length===0 && <EmptyState><strong>조건에 맞는 신청자가 없습니다.</strong>검색어를 지우거나 결제 상태 필터를 바꿔보세요.</EmptyState>}
          </SectionBox>
        </>
      )}

      {subTab === 'EXCEPTIONS_AND_SAFETY' && (
        <SectionBox>
          <h2 style={{ fontSize: '1.22rem', color: '#493423', marginBottom: 14 }}>
            🚨 자동 해결 불가 예외 큐 & 안전 신고 처리함 (MAT-13 / SAF-01~02)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {store.exceptionCases.map((exc) => (
              <div
                key={exc.id}
                style={{
                  padding: 20,
                  borderRadius: 18,
                  background: '#f5eee3',
                  border: exc.status === 'OPEN' ? '1px solid #d7ad9d' : '1px solid #c9d0b8',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#9a5b49', fontWeight: 700 }}>
                    예외 유형: {exc.exception_type} · 상태: {exc.status}
                  </div>
                  <h4 style={{ fontSize: '1.05rem', color: '#493423', margin: '5px 0' }}>
                    {exc.title}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#806c57' }}>{exc.failure_reason}</p>
                </div>

                {exc.status === 'OPEN' ? (
                  <MiniBtn
                    type="button"
                    primary
                    onClick={() => onResolveException(exc.id)}
                    data-testid={`resolve-exc-${exc.id}`}
                  >
                    <CheckCircle2 size={14} />
                    <span>예외 조치 완료(RESOLVED) 처리</span>
                  </MiniBtn>
                ) : (
                  <span style={{ color: '#65784d', fontWeight: 700, fontSize: '0.85rem' }}>
                    ✓ 조치 완료됨
                  </span>
                )}
              </div>
            ))}
          </div>
        </SectionBox>
      )}

      {subTab === 'VENUES_AND_TABLES' && (
        <SectionBox>
          <h2 style={{ fontSize: '1.22rem', color: '#493423', marginBottom: 14 }}>
            🍷 지역별 파트너 식당 재고 및 자동 배정 현황 (INF-02)
          </h2>
          <TableViewport>
          <TableEl>
            <thead>
              <tr>
                <th>식당명</th>
                <th>지역 / 테마</th>
                <th>주소 / 예약명</th>
                <th>수용 테이블 재고</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {store.venues.map((v) => (
                <tr key={v.id}>
                  <td>
                    <strong style={{ color: '#493423' }}>{v.name}</strong>
                  </td>
                  <td>
                    {v.region} · {v.category}
                  </td>
                  <td>
                    {v.address} ({v.reservation_name})
                  </td>
                  <td>
                    예약 {v.reserved_tables} / 최대 {v.max_tables} 테이블 (테이블당 {v.capacity_per_table}인)
                  </td>
                  <td>
                    <span
                      style={{
                        color: v.status === 'AVAILABLE' ? '#65784d' : '#a05b4d',
                        fontWeight: 800,
                      }}
                    >
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableEl>
          </TableViewport>
        </SectionBox>
      )}

      {subTab === 'SURVEY_294' && (
        <SectionBox>
          <h2 style={{ fontSize: '1.22rem', color: '#493423', marginBottom: 8 }}>
            📊 가상 설문 샘플 ({(store.excelSurveyDataset || []).length}명 · 구조 확인용)
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#8c7862', marginBottom: 16 }}>
            첨부된 가상 데이터셋의 항목 매핑을 확인하기 위한 화면입니다. 운영자 개인정보 저장·영속 DB 연결·실제 응답자 데이터 처리는 수행하지 않습니다.
          </p>
          <div style={{ maxHeight: 520, overflowY: 'auto' }}>
            <TableViewport>
            <TableEl>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>이름 (나이·성별·MBTI)</th>
                  <th>참석 가능 지역</th>
                  <th>관심사 & 본인 성향</th>
                  <th>참가 가능 날짜 / 참가권</th>
                  <th>식사 예산 / 못 먹는 음식</th>
                </tr>
              </thead>
              <tbody>
                {(store.excelSurveyDataset || []).slice(0, 60).map((row) => (
                  <tr key={row.row_no}>
                    <td>#{row.row_no}</td>
                    <td>
                      <strong style={{ color: '#493423' }}>{row.name}</strong> ({row.age}세 ·{' '}
                      {row.gender === 'M' ? '남' : '여'} ·{' '}
                      <span style={{ color: '#8b6b42', fontWeight: 800 }}>{row.mbti}</span>)
                    </td>
                    <td>{(row.regions || []).join(', ')}</td>
                    <td>
                      <div style={{ color: '#8b6b42' }}>{(row.interests || []).slice(0, 3).join(', ')}</div>
                      <div style={{ fontSize: '0.75rem', color: '#8f7c67' }}>
                        {(row.vibe_self || []).slice(0, 2).join(', ')}
                      </div>
                    </td>
                    <td>
                      <div>{(row.available_dates || []).join(', ')}</div>
                      <div style={{ fontSize: '0.75rem', color: '#65784d', fontWeight: 700 }}>
                        {row.ticket_label}
                      </div>
                    </td>
                    <td>
                      <div>{row.budget_range}</div>
                      <div style={{ fontSize: '0.75rem', color: '#976b5c' }}>
                        비선호/알레르기: {row.food_allergies}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableEl>
            </TableViewport>
          </div>
        </SectionBox>
      )}
    </AdminWrapper>
  );
}

import React, { useMemo, useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { ArrowLeft, ArrowRight, Check, Flag, LockKeyhole, MessageCircle, MoreHorizontal, Send, ShieldCheck, Sparkles, Users, X } from 'lucide-react';

const Shell=styled.main`min-height:calc(100vh - 82px);padding:30px clamp(14px,4vw,56px) 70px;background:#f5efe4;color:#39291d;`;
const Layout=styled.div`max-width:1380px;margin:0 auto;display:grid;grid-template-columns:300px minmax(0,1fr);gap:18px;align-items:start;@media(max-width:950px){grid-template-columns:1fr;}`;
const Panel=styled.aside`border:1px solid #d9c9b2;background:#fbf7ef;`;
const PanelHead=styled.div`padding:18px 18px 15px;border-bottom:1px solid #e2d5c2;display:flex;justify-content:space-between;align-items:center;gap:12px;
  .eyebrow{font-size:.63rem;letter-spacing:.15em;font-weight:800;color:#a0845f;}h2{margin:7px 0 0;font:500 1.35rem 'Noto Serif KR',serif;letter-spacing:-.05em;color:#4b3623;}svg{color:#947653;}
`;
const RoomList=styled.div`padding:9px;display:flex;flex-direction:column;gap:5px;`;
const RoomButton=styled.button`
  display:flex;align-items:flex-start;gap:11px;text-align:left;width:100%;padding:13px 12px;border:1px solid ${p=>p.active?'#9c805c':'transparent'};background:${p=>p.active?'#eee2cf':'transparent'};color:#57432e;cursor:pointer;transition:.16s;
  &:hover{background:#f1e7d9;border-color:#d9c7ac;}
  .avatar{width:37px;height:37px;flex-shrink:0;display:grid;place-items:center;border:1px solid #c6b08f;border-radius:50%;color:#8b6c45;background:#f7eedf;}
  .text{min-width:0;flex:1}.title{font-size:.76rem;font-weight:800;line-height:1.55;word-break:keep-all}.meta{display:block;font-size:.67rem;color:#96816a;margin-top:5px;line-height:1.45}.status{display:block;font-size:.6rem;color:${p=>p.member?'#6f805f':'#a38e75'};margin-top:6px;font-weight:800;}
`;
const SideNote=styled.div`margin:7px 17px 17px;padding:13px;background:#efe5d5;color:#806b54;font-size:.7rem;line-height:1.7;display:flex;gap:8px;svg{flex-shrink:0;color:#9e825b;margin-top:1px;}`;
const Main=styled.section`min-width:0;display:flex;flex-direction:column;border:1px solid #d9c9b2;background:#fbf7ef;min-height:770px;`;
const ChatHeader=styled.header`display:flex;align-items:center;justify-content:space-between;gap:18px;padding:20px 24px;border-bottom:1px solid #e2d5c2;background:#f8f2e8;
  .meta{display:flex;align-items:center;gap:13px;min-width:0}.symbol{display:grid;place-items:center;width:44px;height:44px;border:1px solid #c9b392;border-radius:50%;color:#8c6d47;flex-shrink:0;}.eyebrow{font-size:.61rem;letter-spacing:.15em;font-weight:800;color:#9a7e58;}h2{margin:5px 0 0;font:500 1.5rem 'Noto Serif KR',serif;letter-spacing:-.055em;color:#463221;}p{margin:5px 0 0;font-size:.69rem;color:#93806a;}button{width:35px;height:35px;display:grid;place-items:center;border:1px solid #d7c6ae;background:transparent;color:#80684c;cursor:pointer;}
  @media(max-width:500px){padding:15px}.meta{gap:9px}h2{font-size:1.2rem!important;}
`;
const MemberStrip=styled.div`display:flex;align-items:center;gap:7px;flex-wrap:wrap;padding:11px 24px;border-bottom:1px solid #e9ddcc;color:#90775a;font-size:.68rem;background:#fffaf2;
  .pill{border:1px solid #e1d2bd;background:#f4ebdd;padding:5px 8px;color:#745b3e;}.private{margin-left:auto;color:#9a876f;display:flex;align-items:center;gap:5px;}
`;
const MessageArea=styled.div`padding:22px clamp(14px,2.4vw,30px);display:flex;flex-direction:column;gap:16px;min-height:320px;flex:1;max-height:520px;overflow:auto;
  .date{align-self:center;background:#efe5d7;color:#9b846a;font-size:.64rem;letter-spacing:.08em;padding:6px 10px;}
`;
const MessageRow=styled.div`display:flex;align-items:flex-start;gap:10px;max-width:84%;align-self:${p=>p.mine?'flex-end':'flex-start'};flex-direction:${p=>p.mine?'row-reverse':'row'};
  .avatar{display:grid;place-items:center;width:31px;height:31px;flex-shrink:0;border-radius:50%;background:${p=>p.mine?'#d7c09d':'#e5d9c6'};color:#6f5436;font-size:.68rem;font-weight:800;}
  .msg-meta{display:flex;gap:8px;align-items:baseline;justify-content:${p=>p.mine?'flex-end':'flex-start'};margin:0 2px 5px;font-size:.64rem;color:#a08b74;}.name{color:#6c543b;font-weight:800;}.bubble{padding:12px 14px;border:1px solid ${p=>p.mine?'#cdb38f':'#e4d7c5'};background:${p=>p.mine?'#eee0ca':'#fffaf3'};font-size:.79rem;line-height:1.8;color:#55412d;white-space:pre-wrap;overflow-wrap:anywhere;}.time{font-size:.58rem;color:#ae9a83;}
  @media(max-width:600px){max-width:96%;}
`;
const SystemMessage=styled.div`align-self:center;max-width:90%;padding:11px 15px;background:${p=>p.game?'#e8e4d4':'#f0e6d7'};border-left:2px solid ${p=>p.game?'#89916f':'#b69a74'};color:#7a664e;font-size:.71rem;line-height:1.75;display:flex;gap:8px;svg{flex-shrink:0;margin-top:2px;color:${p=>p.game?'#747e5e':'#9a7d55'};}`;
const GameBoard=styled.section`margin:0 20px 20px;border:1px solid #c7b394;background:#eee4d3;padding:19px;
  .top{display:flex;align-items:center;justify-content:space-between;gap:14px;}.eyebrow{font-size:.62rem;font-weight:800;letter-spacing:.15em;color:#9a7e58;}.state{font-size:.61rem;font-weight:800;color:${p=>p.running?'#5e7655':'#9b8060'};border:1px solid #c5b393;padding:5px 7px;background:#f8f0e4;}
  h3{font:500 1.28rem 'Noto Serif KR',serif;letter-spacing:-.05em;margin:12px 0 7px;color:#4b3521;}.question{font-size:.79rem;line-height:1.7;color:#6c563d;margin:0 0 14px;}
  .options{display:grid;grid-template-columns:1fr 1fr;gap:8px;}.option{min-height:62px;padding:12px;border:1px solid #ccb89b;background:#fbf5e9;color:#685137;text-align:left;font-size:.73rem;line-height:1.65;cursor:pointer;}.option.selected{border-color:#785c3a;background:#ddc8a8;color:#44301e;box-shadow:inset 0 0 0 1px #785c3a;}.option:disabled{opacity:.75;cursor:default;}
  .votes{font-size:.64rem;color:#968064;margin-top:10px;}
  @media(max-width:520px){.options{grid-template-columns:1fr;}}
`;
const Composer=styled.form`display:flex;align-items:flex-end;gap:10px;padding:17px 20px;border-top:1px solid #e1d4c2;background:#f8f1e6;
  textarea{flex:1;min-width:0;max-height:110px;min-height:46px;resize:vertical;border:1px solid #d8c6ae;background:#fffaf2;color:#44301e;padding:13px;font:inherit;font-size:.79rem;outline:0;}textarea:focus{border-color:#a58a65;box-shadow:0 0 0 3px rgba(165,138,101,.12);}button{height:46px;min-width:48px;border:1px solid #493423;background:#493423;color:#fff3e4;display:grid;place-items:center;cursor:pointer;}button:disabled{opacity:.4;cursor:not-allowed;}.hint{position:absolute;bottom:4px;right:21px;color:#b09b81;font-size:.58rem;}
`;
const Empty=styled.div`flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 24px;color:#8a7760;
  .icon{width:62px;height:62px;display:grid;place-items:center;border:1px solid #d4c1a5;border-radius:50%;color:#977c57;background:#f0e4d2;margin-bottom:18px;}h3{margin:0 0 10px;color:#493422;font:500 1.6rem 'Noto Serif KR',serif;letter-spacing:-.06em;}p{max-width:350px;font-size:.79rem;line-height:1.8;margin:0 0 19px;}button{display:inline-flex;align-items:center;gap:7px;padding:12px 15px;border:1px solid #4a3423;background:#4a3423;color:#fff5e7;font-size:.75rem;font-weight:800;cursor:pointer;}
`;
const ReportBar=styled.div`display:flex;justify-content:flex-end;padding:8px 18px;border-top:1px solid #e9decd;background:#fbf7ef;button{border:0;background:transparent;color:#9b8061;font-size:.66rem;display:inline-flex;align-items:center;gap:6px;cursor:pointer;}`;
const ReportOverlay=styled.div`position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(40,28,18,.5);`;
const ReportBox=styled.form`width:min(440px,100%);padding:26px;background:#faf4e9;border:1px solid #d5c2a7;h3{font:500 1.55rem 'Noto Serif KR',serif;margin:0 0 9px;color:#493422;}.hint{color:#8d7860;font-size:.77rem;line-height:1.7;margin-bottom:16px;}label{display:block;font-size:.72rem;color:#725a40;margin-bottom:8px;}select,textarea{width:100%;padding:11px;border:1px solid #d7c6ae;background:#fffaf2;margin-top:6px;color:#4a3624;font:inherit;font-size:.76rem;}textarea{min-height:90px;resize:vertical;}.actions{display:flex;gap:8px;margin-top:15px}.actions button{flex:1;padding:12px;border:1px solid #493423;background:#493423;color:#fff4e5;font-weight:800;cursor:pointer}.actions button:first-child{background:transparent;color:#70563a;}`;

const fmtTime = value => {try{return new Date(value).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'});}catch{return ''}};

const displayText = (value='') => String(value).replace(/미식\s*&\s*와인/g, '미식 & 취향').replace(/미식\/와인/g, '맛집·식문화').replace(/와인/g, '취향').replace(/🍷/g, '🍽️');

export default function ChatRoomView({ currentUser, store, activeTableId, onSelectTableId, onSendMessage, onVoteGameOption, onAdminControlGame, onSubmitReport, onGoHome }) {
  const [message,setMessage]=useState('');
  const [reportOpen,setReportOpen]=useState(false);
  const [reportTarget,setReportTarget]=useState('');
  const [reportReason,setReportReason]=useState('불쾌하거나 무례한 행동');
  const [reportDetails,setReportDetails]=useState('');
  const messageRef=useRef(null);
  const visibleTables=useMemo(()=> (store.diningTables||[]).filter(t=>t.match_status==='CONFIRMED'&&(t.member_ids||[]).includes(currentUser.id)),[store,currentUser]);
  const currentTable=visibleTables.find(t=>t.id===activeTableId)||visibleTables[0]||null;
  const currentRoom=currentTable?(store.chatRooms||[]).find(r=>r.table_id===currentTable.id):null;
  const members=currentTable?(currentTable.member_ids||[]).map(id=>(store.users||[]).find(u=>u.id===id)).filter(Boolean):[];
  const venue=currentTable?(store.venues||[]).find(v=>v.id===currentTable.venue_id):null;
  const game=currentRoom?(store.gamesCatalog||[]).find(g=>g.id===currentRoom.active_game_id):null;
  const round=game?(game.rounds||[]).find(r=>r.round===(currentRoom.current_round||1)):null;
  const isRunning=currentRoom?.game_status==='RUNNING';
  useEffect(()=>{if(messageRef.current)messageRef.current.scrollTop=messageRef.current.scrollHeight;},[currentRoom?.messages?.length,currentRoom?.current_round]);
  const send=e=>{e.preventDefault();const clean=message.trim();if(!clean||!currentRoom)return;onSendMessage(currentRoom.id,clean.slice(0,800));setMessage('');};
  const submitReport=e=>{e.preventDefault();if(!reportTarget||!onSubmitReport)return;onSubmitReport({reported_user_id:reportTarget,table_id:currentTable?.id,reason:reportReason,details:reportDetails.trim()});setReportOpen(false);setReportDetails('');setReportTarget('');};

  return <Shell><Layout>
    <Panel><PanelHead><div><div className="eyebrow">YOUR TABLES</div><h2>나의 대화방</h2></div><MessageCircle size={19}/></PanelHead>
      <RoomList>{visibleTables.length===0?<div style={{padding:'24px 15px',fontSize:'.77rem',lineHeight:1.8,color:'#907c65'}}>아직 매칭이 확정된 식탁이 없습니다. 매칭이 확정되고 실제 멤버십이 부여되면 해당 식탁의 채팅방이 열립니다.</div>:visibleTables.map(t=>{const room=(store.chatRooms||[]).find(r=>r.table_id===t.id);return <RoomButton key={t.id} active={t.id===currentTable?.id} member onClick={()=>onSelectTableId(t.id)}><span className="avatar"><MessageCircle size={16}/></span><span className="text"><span className="title">{displayText(t.title)}</span><span className="meta">{t.region} · {t.event_date} · {(t.member_ids||[]).length}/{t.max_members||6}명</span><span className="status">{room?.game_status==='RUNNING'?'● 게임 진행 중':'● 참가 확정 채팅방'}</span></span></RoomButton>})}</RoomList>
      <SideNote><ShieldCheck size={15}/><span>채팅방은 실제 테이블 참가가 확인된 사용자에게만 열립니다. 연락처 대신 공개 범위가 제한된 프로필만 보여줍니다.</span></SideNote>
    </Panel>
    <Main>
      {!currentTable||!currentRoom?<Empty><div className="icon"><LockKeyhole size={23}/></div><h3>아직 함께할 식탁이 없어요.</h3><p>테이블 상세 페이지를 열어 신청을 완료하면, 해당 테이블의 단체 채팅방에 자동으로 참여할 수 있습니다. 단순히 채팅 페이지를 열었다고 멤버로 추가되지는 않습니다.</p><button type="button" onClick={()=>onGoHome?.()}>열려 있는 식탁 둘러보기 <ArrowRight size={14}/></button></Empty>:<>
        <ChatHeader><div className="meta"><div className="symbol"><Users size={20}/></div><div><div className="eyebrow">TABLE CHAT · PRIVATE ROOM</div><h2>{displayText(currentTable.title)}</h2><p>{currentTable.region} · {currentTable.event_date} · {currentTable.event_time||'19:00'}{venue?` · ${venue.name}`:''}</p></div></div><button type="button" title="채팅 정보" onClick={()=>setReportOpen(true)}><MoreHorizontal size={18}/></button></ChatHeader>
        <MemberStrip><span>참가자 {members.length}명</span>{members.slice(0,6).map(m=><span className="pill" key={m.id}>{m.name} · {m.mbti||'MBTI 미입력'}</span>)}<span className="private"><ShieldCheck size={13}/> 비공개 피드백</span></MemberStrip>
        {isRunning&&game&&round&&<GameBoard running><div className="top"><span className="eyebrow">ICE BREAKING / ROUND {round.round}</span><span className="state">● HOST STARTED</span></div><h3>{game.title.replace(/Icebreaking Stage \d/g,'')}</h3><p className="question">{round.question}</p><div className="options"><button type="button" className="option" onClick={()=>onVoteGameOption(currentRoom.id,game.id,round.round,'A')}>{round.optionA}</button><button type="button" className="option" onClick={()=>onVoteGameOption(currentRoom.id,game.id,round.round,'B')}>{round.optionB}</button></div><div className="votes">현재 투표 · A {round.votesA?.length||0}표 / B {round.votesB?.length||0}표 · 게임은 운영자가 시작하고 라운드를 관리합니다.</div></GameBoard>}
        {currentRoom.game_status==='FINISHED'&&<SystemMessage game><Sparkles size={14}/>아이스브레이킹이 종료되었습니다. 편안한 대화를 이어가세요.</SystemMessage>}
        <MessageArea ref={messageRef}><div className="date">오늘의 식탁 · {currentTable.event_date}</div>{(currentRoom.messages||[]).map(msg=>{
          const mine=msg.sender_id===currentUser.id;
          if(msg.sender_id==='SYSTEM'||msg.message_type==='SYSTEM'||msg.message_type==='CURATION'||msg.message_type==='GAME'||msg.message_type==='REMINDER')return <SystemMessage key={msg.id} game={msg.message_type==='GAME'}><Sparkles size={14}/><span><strong>{msg.sender_name||'우연한 식탁 안내'}</strong><br/>{displayText(msg.content)}</span></SystemMessage>;
          return <MessageRow key={msg.id} mine={mine}><div className="avatar">{(msg.sender_name||'참').slice(0,1)}</div><div><div className="msg-meta"><span className="name">{mine?'나':msg.sender_name}</span><span className="time">{fmtTime(msg.created_at)}</span></div><div className="bubble">{displayText(msg.content)}</div></div></MessageRow>;
        })}</MessageArea>
        <Composer onSubmit={send}><textarea value={message} onChange={e=>setMessage(e.target.value)} maxLength={800} placeholder="가벼운 인사로 대화를 시작해보세요..." aria-label="메시지 입력"/><button type="submit" disabled={!message.trim()} aria-label="메시지 보내기"><Send size={17}/></button></Composer>
        <ReportBar><button type="button" onClick={()=>setReportOpen(true)}><Flag size={13}/> 사용자 신고 / 안전 문의</button></ReportBar>
      </>}
    </Main>
  </Layout>
  {reportOpen&&currentTable&&<ReportOverlay onMouseDown={e=>{if(e.target===e.currentTarget)setReportOpen(false);}}><ReportBox onSubmit={submitReport}><h3>안전 신고 / 문의</h3><div className="hint">신고 내용은 신고 대상에게 공개되지 않습니다. 운영자가 검토할 수 있도록 필요한 내용만 작성해주세요.</div><label>신고 대상<select required value={reportTarget} onChange={e=>setReportTarget(e.target.value)}><option value="">대상 선택</option>{members.filter(m=>m.id!==currentUser.id).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label><label>사유<select value={reportReason} onChange={e=>setReportReason(e.target.value)}>{['불쾌하거나 무례한 행동','원치 않는 연락','개인정보 침해','안전 우려','기타'].map(v=><option key={v}>{v}</option>)}</select></label><label>상세 내용<textarea value={reportDetails} onChange={e=>setReportDetails(e.target.value)} placeholder="상황을 설명해주세요 (선택)"/></label><div className="actions"><button type="button" onClick={()=>setReportOpen(false)}>닫기</button><button type="submit" disabled={!reportTarget||!onSubmitReport}>신고 제출</button></div>{!onSubmitReport&&<p style={{fontSize:'.66rem',color:'#9b7960',marginTop:8}}>운영자 신고 API는 백엔드 연결 후 사용할 수 있습니다.</p>}</ReportBox></ReportOverlay>}
  </Shell>;
}

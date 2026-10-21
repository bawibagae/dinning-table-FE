import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Facebook, Mail, ShieldCheck, Sparkles, X } from 'lucide-react';

const Backdrop = styled.div`
  position:fixed; inset:0; z-index:100; display:flex; align-items:center; justify-content:center; padding:24px;
  background:rgba(39,27,18,.48); backdrop-filter:blur(10px);
  @media(max-width:620px){padding:0;align-items:stretch;}
`;
const WaveCanvas = styled.canvas`
  position:fixed; inset:0; width:100%; height:100%; pointer-events:none; opacity:.56;
`;
const Dialog = styled.section`
  position:relative; z-index:2; width:min(980px,100%); max-height:min(88vh,900px); display:grid; grid-template-columns:.84fr 1.16fr; overflow:hidden;
  border:1px solid rgba(80,56,35,.22); border-radius:5px; background:#f8f3e9; color:#38291d; box-shadow:0 32px 90px rgba(32,20,11,.28);
  @media(max-width:760px){grid-template-columns:1fr;max-height:100%;height:100%;border:0;border-radius:0;overflow:auto;}
`;
const VisualSide = styled.aside`
  min-height:600px; padding:36px; display:flex; flex-direction:column; justify-content:space-between; position:relative; overflow:hidden; color:#f5ead9;
  background:radial-gradient(circle at 30% 20%,rgba(197,157,107,.45),transparent 36%), linear-gradient(145deg,#4a3423,#2f2117 78%);
  &::before,&::after{content:'';position:absolute;border:1px solid rgba(226,202,167,.24);border-radius:50%;width:440px;height:440px;left:-215px;bottom:-205px;}
  &::after{width:330px;height:330px;left:-160px;bottom:-150px;}
  .back{position:absolute;inset:0;opacity:.12;background:repeating-linear-gradient(0deg,transparent 0px,transparent 9px,rgba(255,245,226,.08) 10px);}
  .mark{position:relative;z-index:1;display:flex;align-items:center;gap:11px;}
  .mark img{width:44px;height:44px;object-fit:contain;filter:grayscale(1) brightness(0) invert(1);opacity:.9;}
  .mark b{display:block;font:800 1rem 'Noto Serif KR',serif;letter-spacing:-.04em;}
  .mark small{display:block;margin-top:4px;font:700 .57rem Arial,sans-serif;letter-spacing:.22em;color:#cfb493;}
  .side-copy{position:relative;z-index:1;}
  .side-copy .overline{color:#cdb28e;font-size:.65rem;letter-spacing:.22em;font-weight:800;}
  h2{font:500 clamp(2.5rem,4vw,4rem)/1.25 'Noto Serif KR',serif;letter-spacing:-.08em;margin:17px 0;}
  p{max-width:280px;color:#cdbca7;font-size:.84rem;line-height:1.85;}
  .footer-note{position:relative;z-index:1;color:#a88d6b;font-size:.68rem;letter-spacing:.08em;}
  @media(max-width:760px){min-height:210px;padding:25px 24px 24px;.side-copy h2{font-size:2.3rem;margin:10px 0}.side-copy p,.footer-note{display:none}.side-copy .overline{font-size:.6rem}.mark img{width:36px;height:36px}}
`;
const FormSide = styled.div`
  min-width:0; display:flex; flex-direction:column; max-height:inherit; overflow:auto; padding:30px clamp(22px,4vw,52px) 36px;
  @media(max-width:760px){padding:22px 22px 34px;overflow:visible;}
`;
const TopBar = styled.div`
  display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:22px;
  .state{font-size:.68rem;font-weight:800;letter-spacing:.17em;color:#9a7b55;}
  button{display:grid;place-items:center;width:34px;height:34px;border:1px solid #d9cbb8;background:transparent;color:#6d5946;cursor:pointer;border-radius:50%;}
`;
const Progress = styled.div`
  display:flex;gap:5px;margin:0 0 28px;
  span{height:3px;flex:1;background:#e0d4c3;}
  span.active{background:#6c5034;}
`;
const Heading = styled.div`
  margin-bottom:24px;
  .eyebrow{color:#97774f;font-size:.68rem;font-weight:800;letter-spacing:.18em;margin-bottom:10px;}
  h3{margin:0;color:#39291c;font:500 clamp(1.7rem,3vw,2.55rem)/1.3 'Noto Serif KR',serif;letter-spacing:-.07em;}
  p{margin:10px 0 0;color:#857362;font-size:.83rem;line-height:1.75;}
`;
const SocialStack = styled.div`
  display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:21px;
  @media(max-width:460px){grid-template-columns:1fr;}
`;
const SocialBtn = styled.button`
  display:flex;align-items:center;justify-content:center;gap:9px;min-height:47px;padding:10px 13px;border:1px solid #d9cbb8;background:#fffaf2;color:#473526;font-size:.8rem;font-weight:750;cursor:pointer;transition:.18s;
  &:hover{border-color:#806344;background:#f1e7d7;transform:translateY(-1px);}
  svg{flex-shrink:0;}
`;
const Rule = styled.div`
  display:flex;align-items:center;gap:12px;color:#a18d78;font-size:.65rem;letter-spacing:.12em;margin:4px 0 19px;
  &::before,&::after{content:'';height:1px;flex:1;background:#e3d8c7;}
`;
const Form = styled.form`display:flex;flex-direction:column;gap:15px;`;
const FieldGrid = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:12px;@media(max-width:490px){grid-template-columns:1fr;}`;
const Field = styled.label`
  display:flex;flex-direction:column;gap:7px;color:#705a45;font-size:.73rem;font-weight:750;min-width:0;
  &.full{grid-column:1/-1;}
  input,select,textarea{width:100%;min-width:0;border:1px solid #d9cbb8;border-radius:2px;background:#fffaf2;color:#39291c;padding:12px 13px;font-size:.84rem;outline:none;transition:border .18s,box-shadow .18s;}
  input:focus,select:focus,textarea:focus{border-color:#8b6a44;box-shadow:0 0 0 3px rgba(139,106,68,.12);}
  textarea{min-height:70px;resize:vertical;}
  .hint{color:#a18d78;font-size:.66rem;font-weight:500;line-height:1.55;}
`;
const Chips = styled.div`display:flex;flex-wrap:wrap;gap:7px;`;
const Chip = styled.button`
  display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;white-space:nowrap;
  min-height:32px;border:1px solid ${p=>p.selected?'#8b6a44':'#d9cbb8'};
  background:${p=>p.selected?'#ead9c2':'#fffaf2'};color:${p=>p.selected?'#493423':'#806c57'};
  border-radius:3px;padding:8px 11px;font-size:.72rem;line-height:1.2;font-weight:700;cursor:pointer;
  transition:background-color .16s ease,border-color .16s ease,color .16s ease;
  &:hover{border-color:#8b6a44;background:${p=>p.selected?'#e4ceb0':'#f4ecdf'};}
  &:focus-visible{outline:2px solid #927452;outline-offset:2px;}
`;
const Consent = styled.label`
  display:flex;align-items:flex-start;gap:10px;padding:14px;background:#eee4d4;border:1px solid #e0d2bf;color:#6d5946;font-size:.73rem;line-height:1.65;cursor:pointer;
  input{accent-color:#6f5234;margin-top:3px;}
`;
const Alert = styled.div`
  padding:11px 13px;border-left:3px solid ${p=>p.error?'#a15b42':'#82906e'};background:${p=>p.error?'#f5e4db':'#e7eadf'};color:${p=>p.error?'#874631':'#56634a'};font-size:.76rem;line-height:1.6;
`;
const Submit = styled.button`
  display:flex;align-items:center;justify-content:center;gap:9px;width:100%;min-height:48px;padding:13px 17px;border:1px solid #39291c;background:#39291c;color:#fff6e8;font-weight:800;font-size:.82rem;cursor:pointer;transition:.2s;
  &:hover{background:#61452b;transform:translateY(-1px);} &:disabled{opacity:.5;cursor:not-allowed;transform:none;}
`;
const Secondary = styled.button`border:0;background:transparent;color:#81694f;font-size:.75rem;font-weight:750;text-decoration:underline;text-underline-offset:4px;cursor:pointer;padding:8px;`;
const DemoPanel = styled.div`
  border:1px dashed #c7b59d;background:rgba(238,228,212,.46);padding:13px 14px;margin-top:16px;
  .label{font-size:.64rem;letter-spacing:.14em;color:#9b7d58;font-weight:800;margin-bottom:10px;}
  .accounts{display:flex;flex-wrap:wrap;gap:8px;}
  button{border:1px solid #d4c2aa;background:#fffaf2;padding:8px 10px;color:#72573a;font-size:.72rem;font-weight:700;cursor:pointer;}
`;

const MBTI = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'];
const INTERESTS = ['맛집 탐방','전시·공연','책·인문','영화·드라마','여행·산책','커리어·창업','디자인·창작','운동·러닝','사진·기록','음악','요리','반려동물'];
const VIBES = ['편안한 경청러','유쾌한 분위기 메이커','조용한 관찰자','깊은 대화 선호','새로운 취향 탐험가','따뜻한 공감형','호기심 많은 질문러','차분하고 논리적인'];
const PARTNERS = ['대화가 잘 통하는','배려심 있는','유머 감각 있는','취향이 뚜렷한','새로운 관점을 나누는','리액션이 좋은','차분하게 경청하는','긍정적인 에너지'];
const REGIONS = ['홍대/연남','잠실','강남/역삼','을지로/종로'];
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export default function AuthWaveModal({ isOpen, onClose, users = [], onSuccessAuth, onRegisterNewUser }) {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('LOGIN');
  const [isAdmin, setIsAdmin] = useState(false);
  const [authProvider, setAuthProvider] = useState('EMAIL');
  const [step1, setStep1] = useState({ name:'', phone:'', age:'27', gender:'F', job_category:'', email:'', password:'' });
  const [step2, setStep2] = useState({ insta_id:'', mbti:'ENFP', interests:['맛집 탐방','전시·공연'], vibe_self:['편안한 경청러'], preferred_partner:['대화가 잘 통하는'], preferred_regions:['홍대/연남'], budget_range:'2~4만원', food_allergies:'없음', privacy_agreed:false, policy_agreed:false });
  const [login, setLogin] = useState({ email:'', password:'' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const demoMode = import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true';

  useEffect(() => {
    if (!isOpen) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d'); let raf = 0; let t = 0;
    const resize = () => { canvas.width = window.innerWidth * Math.min(window.devicePixelRatio || 1, 1.5); canvas.height = window.innerHeight * Math.min(window.devicePixelRatio || 1, 1.5); };
    resize(); window.addEventListener('resize', resize);
    const draw = () => {
      t += .004; const w = canvas.width; const h = canvas.height; ctx.clearRect(0,0,w,h);
      [0.28,0.43,0.58,0.73].forEach((ratio,index)=>{
        ctx.beginPath(); ctx.moveTo(0,h);
        for(let x=0;x<=w;x+=8){const y=h*ratio+Math.sin(x*.0028+t*(.7+index*.13)+index)*h*.025+Math.cos(x*.0015-t)*h*.012;ctx.lineTo(x,y);}
        ctx.lineTo(w,h);ctx.closePath();ctx.fillStyle=['rgba(163,129,87,.10)','rgba(126,103,75,.08)','rgba(192,159,115,.10)','rgba(94,77,55,.06)'][index];ctx.fill();
      });
      raf=requestAnimationFrame(draw);
    };
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) draw();
    return ()=>{window.removeEventListener('resize',resize);cancelAnimationFrame(raf);};
  },[isOpen]);

  useEffect(()=>{ if(isOpen){setError('');setNotice('');} },[isOpen]);
  if (!isOpen) return null;

  const toggle = (field,value) => setStep2(prev=>({...prev,[field]:prev[field].includes(value)?prev[field].filter(v=>v!==value):[...prev[field],value]}));
  const close = () => { setError(''); setNotice(''); onClose(); };
  const goSignup = () => { setAuthProvider('EMAIL'); setMode('SIGNUP_STEP1'); setError(''); setNotice(''); };
  const goLogin = () => { setAuthProvider('EMAIL'); setMode('LOGIN'); setError(''); setNotice(''); };
  const enterDemo = (role='USER') => {
    if(!demoMode){setError('데모 계정은 개발 환경에서만 사용할 수 있습니다. 이메일 가입 또는 설정된 소셜 로그인을 이용해주세요.');return;}
    const user = users.find(u=>u.role===(role==='ADMIN'?'ADMIN':'USER'));
    if(!user){setError('체험 계정을 찾을 수 없습니다. 초기 데이터 설정을 확인해주세요.');return;}
    onSuccessAuth(user);
  };

  const handleLogin = (e) => {
    e.preventDefault(); setError(''); setNotice('');
    const email = login.email.trim().toLowerCase();
    if(!email || !login.password){setError('이메일과 비밀번호를 입력해주세요.');return;}
    if(!demoMode){
      setError('이메일 로그인의 서버 연결이 아직 설정되지 않았습니다. 개발 데모에서는 체험 계정을 이용할 수 있습니다.');return;
    }
    const user = users.find(u=>u.email?.toLowerCase()===email && u.role!=='ADMIN' && u.password_hash===login.password);
    const admin = isAdmin && users.find(u=>u.role==='ADMIN' && (login.password==='admin1234' || login.password==='whatsup2026'));
    if(admin){onSuccessAuth(admin);return;}
    if(!user){setError('가입된 계정을 찾지 못했습니다. 이메일을 확인하거나 회원가입을 진행해주세요. 개발 데모는 체험 계정을 이용할 수 있습니다.');return;}
    onSuccessAuth(user);
  };

  const verifySocialToken = async (provider, accessToken) => {
    if(!API_BASE){setError('소셜 로그인 확인용 백엔드가 연결되지 않았습니다. VITE_API_BASE_URL 및 OAuth 서버 설정이 필요합니다.');return;}
    try{
      const response = await fetch(`${API_BASE}/api/auth/oauth/verify`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({provider,accessToken})});
      const result = await response.json();
      if(!response.ok || !result.ok) throw new Error(result.message || '계정 인증을 확인하지 못했습니다.');
      const profile=result.oauthProfile || {};
      // Provider email is not proof that an existing local account belongs to the same person.
      // Never sign in or link accounts by matching email alone.
      setAuthProvider(provider);
      setStep1(prev=>({...prev,email:profile.email||prev.email,name:profile.name||prev.name,password:''}));
      setMode('SIGNUP_STEP1');
      setNotice('제공자 토큰은 검증되었습니다. 앱 계정 연결·보안 세션·영구 저장은 아직 연결되지 않았으므로 기존 계정에 자동 로그인하지 않습니다.');
    }catch(err){setError(err.message || '소셜 인증에 실패했습니다.');}
  };

  const handleGoogle = () => {
    setError('');setNotice('');
    const clientId=import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if(!clientId || !window.google?.accounts?.oauth2){setError('Google OAuth를 사용하려면 VITE_GOOGLE_CLIENT_ID와 허용된 도메인 설정이 필요합니다. 설정되지 않은 상태에서는 성공 처리하지 않습니다.');return;}
    try{const client=window.google.accounts.oauth2.initTokenClient({client_id:clientId,scope:'openid email profile',callback:(response)=>{if(response.error){setError(`Google 로그인 취소 또는 오류: ${response.error}`);return;}verifySocialToken('GOOGLE',response.access_token);}});client.requestAccessToken({prompt:'select_account'});}catch(err){setError(`Google 로그인을 시작하지 못했습니다: ${err.message}`);}
  };
  const handleFacebook = () => {
    setError('');setNotice('');
    const appId=import.meta.env.VITE_FACEBOOK_APP_ID;
    if(!appId || !window.FB){setError('Facebook Login을 사용하려면 VITE_FACEBOOK_APP_ID와 Meta 앱 도메인 설정이 필요합니다. 설정되지 않은 상태에서는 성공 처리하지 않습니다.');return;}
    try{window.FB.init({appId,cookie:true,xfbml:false,version:'v20.0'});window.FB.login(response=>{if(!response.authResponse?.accessToken){setError('Facebook 로그인이 취소되었거나 권한이 승인되지 않았습니다.');return;}verifySocialToken('FACEBOOK',response.authResponse.accessToken);},{scope:'public_profile,email'});}catch(err){setError(`Facebook 로그인 오류: ${err.message}`);}
  };

  const handleStep1 = (e) => {
    e.preventDefault();setError('');setNotice('');
    if(!step1.name.trim()||!step1.phone.trim()||!step1.age||!step1.gender||!step1.job_category.trim()||!step1.email.trim()||(authProvider==='EMAIL'&&!step1.password)){setError('필수 항목을 모두 입력해주세요.');return;}
    const age=Number(step1.age);
    if(!Number.isFinite(age)||age<20||age>70){setError('우연한 식탁의 현재 대상은 20세 이상입니다. 나이를 다시 확인해주세요.');return;}
    if(authProvider==='EMAIL'&&step1.password.length<8){setError('비밀번호는 8자 이상으로 입력해주세요.');return;}
    if(users.some(u=>u.email?.toLowerCase()===step1.email.trim().toLowerCase())){setError('이미 가입된 이메일입니다. 로그인 화면으로 이동해주세요.');return;}
    setMode('SIGNUP_STEP2');
  };
  const handleStep2 = (e) => {
    e.preventDefault();setError('');setNotice('');
    if(!step2.interests.length||!step2.vibe_self.length||!step2.preferred_partner.length||!step2.preferred_regions.length){setError('관심사, 나의 분위기, 만나고 싶은 사람, 참석 가능 지역을 각각 하나 이상 선택해주세요.');return;}
    if(!step2.privacy_agreed||!step2.policy_agreed){setError('개인정보 수집·이용과 참가·취소 정책에 모두 동의해야 완료할 수 있습니다.');return;}
    const newUser={id:`usr-${Date.now()}`,email:step1.email.trim(),password_hash:'',auth_provider:authProvider,role:'USER',name:step1.name.trim(),phone:step1.phone.trim(),age:Number(step1.age),birth_year:new Date().getFullYear()-Number(step1.age),gender:step1.gender,job_category:step1.job_category.trim(),account_status:'ACTIVE',profile_completed:true,insta_id:step2.insta_id.trim(),mbti:step2.mbti,interests:step2.interests,vibe_self:step2.vibe_self,preferred_partner:step2.preferred_partner,preferred_regions:step2.preferred_regions,budget_range:step2.budget_range,food_allergies:step2.food_allergies.trim()||'없음',privacy_agreed:true,policy_agreed:true};
    onRegisterNewUser(newUser);
  };

  const field = (label, key, type='text', placeholder='') => <Field>{label}<input type={type} value={step1[key]} placeholder={placeholder} onChange={e=>setStep1(prev=>({...prev,[key]:e.target.value}))} required /></Field>;

  return (
    <Backdrop role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)close();}}>
      <WaveCanvas ref={canvasRef}/>
      <Dialog role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <VisualSide>
          <div className="back"/>
          <div className="mark"><img src={`${import.meta.env.BASE_URL}assets/whatsup-logo.png`} alt=""/><div><b>우연한 식탁</b><small>WHATSUP HOUSE</small></div></div>
          <div className="side-copy"><div className="overline">A SMALL TABLE, A NEW STORY</div><h2>좋은 저녁은<br/>좋은 만남으로.</h2><p>나와 결이 맞는 사람들과 나누는 한 끼. 당신의 취향이 새로운 대화의 시작이 됩니다.</p></div>
          <div className="footer-note">PEOPLE · TASTE · STORIES　 /　 2026</div>
        </VisualSide>
        <FormSide>
          <TopBar><span className="state">{mode==='LOGIN'?'WELCOME BACK':mode==='SIGNUP_STEP1'?'JOIN THE TABLE · 01 / 02':'YOUR PROFILE · 02 / 02'}</span><button type="button" onClick={close} aria-label="로그인 창 닫기"><X size={17}/></button></TopBar>
          {mode!=='LOGIN'&&<Progress><span className="active"/><span className={mode==='SIGNUP_STEP2'?'active':''}/></Progress>}

          {mode==='LOGIN'&&<>
            <Heading><div className="eyebrow">COME AS YOU ARE</div><h3 id="auth-title">당신의 자리를<br/>찾아볼까요?</h3><p>로그인하고 지금 열려 있는 식탁과 만남을 확인해보세요.</p></Heading>
            <SocialStack><SocialBtn type="button" onClick={handleGoogle}><span style={{fontWeight:900,color:'#4285f4'}}>G</span> Google로 계속하기</SocialBtn><SocialBtn type="button" onClick={handleFacebook}><Facebook size={16} color="#4267B2"/> Facebook으로 계속하기</SocialBtn></SocialStack>
            <Rule>OR CONTINUE WITH EMAIL</Rule>
            <Form onSubmit={handleLogin}>
              {isAdmin&&<Alert>운영자 데모 로그인 모드입니다. 개발 환경의 운영자 계정에만 연결됩니다.</Alert>}
              <Field>이메일<input type="email" autoComplete="email" value={login.email} onChange={e=>setLogin(p=>({...p,email:e.target.value}))} placeholder="hello@example.com" required/></Field>
              <Field>비밀번호<input type="password" autoComplete="current-password" value={login.password} onChange={e=>setLogin(p=>({...p,password:e.target.value}))} placeholder="비밀번호 입력" required/></Field>
              {error&&<Alert error>{error}</Alert>}{notice&&<Alert>{notice}</Alert>}
              <Submit type="submit">이메일로 로그인 <ArrowRight size={15}/></Submit>
            </Form>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:7,marginTop:14,fontSize:'.75rem',color:'#806b55'}}>아직 계정이 없나요? <Secondary type="button" onClick={goSignup}>회원가입하기</Secondary></div>
            {demoMode&&<DemoPanel><div className="label">LOCAL DEVELOPMENT / DEMO ACCESS</div><div className="accounts"><button type="button" onClick={()=>enterDemo('USER')}>참가자 화면 둘러보기</button><button type="button" onClick={()=>enterDemo('ADMIN')}>운영자 화면 둘러보기</button></div><p style={{fontSize:'.67rem',color:'#9b8770',lineHeight:1.6,margin:'10px 0 0'}}>데모 계정은 로컬 개발 환경에서만 사용됩니다. 실제 OAuth와 결제는 별도 서버 자격 증명이 필요합니다.</p></DemoPanel>}
          </>}

          {mode==='SIGNUP_STEP1'&&<>
            <Heading><div className="eyebrow">STEP 01 / BASIC INFORMATION</div><h3 id="auth-title">먼저, 당신을<br/>알려주세요.</h3><p>계정과 기본 정보를 입력해주세요. 현재 서비스의 대상 연령은 20세 이상입니다.</p></Heading>
            <Form onSubmit={handleStep1}>
              <FieldGrid>{field('이름','name','text','이름 입력')}{field('연락처','phone','tel','010-0000-0000')}</FieldGrid>
              <FieldGrid><Field>나이<input type="number" min="20" max="70" value={step1.age} onChange={e=>setStep1(p=>({...p,age:e.target.value}))} required/></Field><Field>성별<select value={step1.gender} onChange={e=>setStep1(p=>({...p,gender:e.target.value}))}><option value="F">여성</option><option value="M">남성</option><option value="OTHER">응답하지 않음</option></select></Field></FieldGrid>
              <Field>직업 / 직종<input value={step1.job_category} onChange={e=>setStep1(p=>({...p,job_category:e.target.value}))} placeholder="예: 프로덕트 디자이너" required/></Field>
              <Field>이메일<input type="email" value={step1.email} onChange={e=>setStep1(p=>({...p,email:e.target.value}))} placeholder="hello@example.com" required/></Field>
              <Field>비밀번호<input type="password" value={step1.password} onChange={e=>setStep1(p=>({...p,password:e.target.value}))} autoComplete="new-password" placeholder="8자 이상" required/><span className="hint">현재 회원가입은 브라우저 메모리에서만 시연됩니다. 계정 저장·비밀번호 해시·로그인 세션은 백엔드 연결 후 제공됩니다.</span></Field>
              {error&&<Alert error>{error}</Alert>}{notice&&<Alert>{notice}</Alert>}
              <Submit type="submit">다음 단계로 <ArrowRight size={15}/></Submit><Secondary type="button" onClick={()=>setMode('LOGIN')}><ArrowLeft size={13} style={{verticalAlign:'middle',marginRight:5}}/> 로그인으로 돌아가기</Secondary>
            </Form>
          </>}

          {mode==='SIGNUP_STEP2'&&<>
            <Heading><div className="eyebrow">STEP 02 / MATCHING PROFILE</div><h3 id="auth-title">어떤 식탁에서<br/>만나고 싶나요?</h3><p>취향과 대화 스타일을 선택하면 더 잘 어울리는 식탁을 찾는 데 도움이 됩니다.</p></Heading>
            <Form onSubmit={handleStep2}>
              <FieldGrid><Field>인스타그램 ID<input value={step2.insta_id} onChange={e=>setStep2(p=>({...p,insta_id:e.target.value}))} placeholder="@your.id"/><span className="hint">선택 입력 · 다른 참가자에게 자동 공개하지 않습니다.</span></Field><Field>MBTI<select value={step2.mbti} onChange={e=>setStep2(p=>({...p,mbti:e.target.value}))}>{MBTI.map(v=><option key={v}>{v}</option>)}</select></Field></FieldGrid>
              <Field>관심사 <span className="hint">여러 개 선택</span><Chips>{INTERESTS.map(v=><Chip key={v} type="button" selected={step2.interests.includes(v)} onClick={()=>toggle('interests',v)}>{v}</Chip>)}</Chips></Field>
              <Field>나는 어떤 사람인가요? <Chips>{VIBES.map(v=><Chip key={v} type="button" selected={step2.vibe_self.includes(v)} onClick={()=>toggle('vibe_self',v)}>{v}</Chip>)}</Chips></Field>
              <Field>만나고 싶은 사람의 특징 <Chips>{PARTNERS.map(v=><Chip key={v} type="button" selected={step2.preferred_partner.includes(v)} onClick={()=>toggle('preferred_partner',v)}>{v}</Chip>)}</Chips></Field>
              <Field>참석 가능한 지역 <Chips>{REGIONS.map(v=><Chip key={v} type="button" selected={step2.preferred_regions.includes(v)} onClick={()=>toggle('preferred_regions',v)}>{v}</Chip>)}</Chips></Field>
              <FieldGrid><Field>식사 예산<select value={step2.budget_range} onChange={e=>setStep2(p=>({...p,budget_range:e.target.value}))}><option>2만원 이하</option><option>2~4만원</option><option>4~6만원</option><option>6만원 이상</option></select></Field><Field>못 먹는 음식 / 알레르기<input value={step2.food_allergies} onChange={e=>setStep2(p=>({...p,food_allergies:e.target.value}))} placeholder="없음"/></Field></FieldGrid>
              <Consent><input type="checkbox" checked={step2.privacy_agreed} onChange={e=>setStep2(p=>({...p,privacy_agreed:e.target.checked}))}/><span><strong>개인정보 수집·이용 동의 (필수)</strong><br/>매칭, 참가 안내, 안전 관리와 서비스 운영에 필요한 정보를 이용하는 데 동의합니다. 민감한 정보는 매칭에 필요한 범위에서만 처리합니다.</span></Consent>
              <Consent><input type="checkbox" checked={step2.policy_agreed} onChange={e=>setStep2(p=>({...p,policy_agreed:e.target.checked}))}/><span><strong>참가·취소 정책 확인 (필수)</strong><br/>취소 및 환불 조건, 행사 당일 취소·노쇼 정책을 신청 전에 확인했습니다.</span></Consent>
              {error&&<Alert error>{error}</Alert>}{notice&&<Alert>{notice}</Alert>}
              <Submit type="submit">프로필 완성하고 시작하기 <Sparkles size={15}/></Submit><Secondary type="button" onClick={()=>setMode('SIGNUP_STEP1')}><ArrowLeft size={13} style={{verticalAlign:'middle',marginRight:5}}/> 이전 단계</Secondary>
            </Form>
          </>}
          <div style={{display:'flex',alignItems:'center',gap:7,marginTop:24,paddingTop:16,borderTop:'1px solid #e6dac9',fontSize:'.67rem',color:'#a08c76'}}><ShieldCheck size={14}/> 개인정보와 안전을 존중하는 식탁을 지향합니다.</div>
        </FormSide>
      </Dialog>
    </Backdrop>
  );
}

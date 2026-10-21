import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowRight, ArrowUpRight, Leaf, Sparkles, Users, Utensils, HeartHandshake } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Page = styled.main`
  --ink: #342419;
  --muted: #756657;
  --paper: #f5efe4;
  --paper-deep: #e9decd;
  --line: rgba(65, 43, 25, 0.22);
  background: var(--paper);
  color: var(--ink);
  overflow: hidden;
`;
const Header = styled.header`
  position: fixed; inset: 0 0 auto; z-index: 40; height: 82px; padding: 0 clamp(20px, 5vw, 76px);
  display: flex; justify-content: space-between; align-items: center; gap: 24px;
  background: rgba(245, 239, 228, .84); border-bottom: 1px solid rgba(65, 43, 25, .11);
  backdrop-filter: blur(18px);
  @media(max-width: 720px) { height: 70px; padding: 0 18px; }
`;
const Brand = styled.button`
  display:flex; align-items:center; gap: 12px; border:0; background:none; color:inherit; cursor:pointer; padding:0;
  img { width: 44px; height:44px; object-fit:contain; mix-blend-mode:multiply; }
  span { display:block; font-family:'Noto Serif KR', serif; font-weight:800; font-size:1.04rem; letter-spacing:-.055em; line-height:1.1; }
  small { display:block; margin-top:4px; color:#897866; font:600 .58rem/1.1 Arial,sans-serif; letter-spacing:.22em; text-transform:uppercase; }
`;
const NavRight = styled.nav`
  display:flex; align-items:center; gap: clamp(14px, 3vw, 34px);
  a { color:#6d5947; text-decoration:none; font-size:.82rem; font-weight:650; transition:color .2s; }
  a:hover { color:#a47b4b; }
  a.table-nav { color:#382719; font-weight:850; letter-spacing:.02em; position:relative; }
  a.table-nav::after { content:''; position:absolute; left:0; right:0; bottom:-8px; height:1px; background:#9b7b56; }
  @media(max-width:720px) { a:not(.login) { display:none; } }
`;
const LoginButton = styled.button`
  display:inline-flex; align-items:center; gap:9px; border:1px solid var(--ink); background:var(--ink); color:#fffaf1;
  border-radius:3px; padding:13px 17px; font-weight:700; font-size:.82rem; cursor:pointer; transition:transform .2s, background .2s;
  &:hover { transform:translateY(-2px); background:#5a3b25; }
`;
const Progress = styled.div`
  position:fixed; top:0; left:0; height:3px; width:${p=>p.value}%; background:#95744f; z-index:60; transform-origin:left;
`;
const Hero = styled.section`
  min-height:100svh; padding:128px clamp(20px, 7vw, 112px) 64px; display:grid; grid-template-columns:1.03fr .97fr;
  align-items:center; gap:clamp(30px, 6vw, 90px); max-width:1600px; margin:auto; position:relative;
  @media(max-width:900px) { grid-template-columns:1fr; padding-top:116px; gap:30px; }
`;
const HeroCopy = styled.div`
  position:relative; z-index:2;
  .eyebrow { display:flex; align-items:center; gap:10px; color:#886d4b; font-size:.73rem; font-weight:800; letter-spacing:.19em; text-transform:uppercase; margin-bottom:26px; }
  .eyebrow::before { content:''; width:30px; height:1px; background:#886d4b; }
  h1 { margin:0; font-family:'Noto Serif KR','Gowun Batang',serif; font-size:clamp(3.5rem, 7.8vw, 7.4rem); font-weight:500; letter-spacing:-.105em; line-height:1.08; }
  h1 em { font-style:normal; color:#927452; }
  p { max-width:450px; margin:28px 0 32px; color:#766657; font-size:1rem; line-height:1.9; word-break:keep-all; }
  .actions { display:flex; align-items:center; gap:22px; flex-wrap:wrap; }
  .text-link { display:inline-flex; align-items:center; gap:7px; color:#6d5540; font-size:.83rem; font-weight:750; text-decoration:none; border-bottom:1px solid #a8957c; padding:10px 0; }
`;
const HeroVisual = styled.div`
  position:relative; min-height:540px; height:min(68vh,760px); overflow:hidden; border-radius:5px; isolation:isolate;
  background-color:#251911;
  background-image:radial-gradient(ellipse at 52% 43%,rgba(177,126,68,.28),transparent 49%),radial-gradient(ellipse at 18% 15%,rgba(141,99,53,.2),transparent 34%),linear-gradient(135deg,#1e1510 0%,#4c3322 47%,#211712 100%);
  border:1px solid rgba(188,151,99,.38); box-shadow:0 28px 66px rgba(48,29,15,.18);
  &::before{content:'';position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(180deg,rgba(20,13,8,.05) 0%,rgba(20,13,8,0) 38%,rgba(20,13,8,.42) 100%),repeating-linear-gradient(0deg,rgba(250,225,187,.015) 0,rgba(250,225,187,.015) 1px,transparent 1px,transparent 4px);}
  .stamp { position:absolute; left:25px; top:25px; z-index:4; border:1px solid rgba(220,190,145,.48); padding:9px 11px; color:#e6d2b3; font-size:.6rem; font-weight:750; letter-spacing:.17em; background:rgba(34,23,15,.48); backdrop-filter:blur(10px); }
  .caption { position:absolute; right:27px; bottom:25px; z-index:4; text-align:right; color:#f7ead7; text-shadow:0 2px 22px rgba(0,0,0,.6); }
  .caption small { display:block; color:#d4b88d; font-size:.63rem; letter-spacing:.18em; margin-bottom:8px; }
  .caption strong { display:block; font-family:'Noto Serif KR',serif; font-weight:500; letter-spacing:-.04em; font-size:clamp(1.6rem, 3vw, 2.8rem); }
  @media(max-width:900px) { min-height:400px; height:58vh; }
  @media(max-width:500px) { min-height:365px; height:54vh; .stamp{left:14px;top:14px;font-size:.52rem;max-width:calc(100% - 28px)} }
`;
const HeroScene = styled.div`
  position:absolute; inset:0; z-index:1;
  canvas { display:block; width:100%; height:100%; }
`;
const VisualNote = styled.div`
  position:absolute; z-index:4; bottom:27%; left:24px; max-width:155px; padding:13px 15px;
  border:1px solid rgba(210,174,124,.42); border-radius:4px; display:flex; align-items:center; text-align:left;
  color:#ebdcc5; background:rgba(34,23,15,.58); backdrop-filter:blur(12px);
  font-family:'Noto Serif KR',serif; font-size:.88rem; line-height:1.65; letter-spacing:-.025em; box-shadow:0 12px 34px rgba(0,0,0,.14);
  @media(max-width:500px) { left:14px; bottom:26%; max-width:125px; padding:10px 11px;font-size:.75rem; }
`;
const VerticalLabel = styled.div`
  position:absolute; top:42%; right:13px; z-index:4; writing-mode:vertical-rl; color:rgba(226,200,164,.74); letter-spacing:.32em; font-size:.58rem; font-weight:700;
`;
const Marquee = styled.div`
  border-top:1px solid var(--line); border-bottom:1px solid var(--line); padding:17px 0; overflow:hidden; white-space:nowrap; color:#7f694f; font-size:.7rem; letter-spacing:.2em; font-weight:800;
  div { display:inline-block; min-width:100%; animation: drift 28s linear infinite; }
  span { padding:0 26px; }
  @keyframes drift { from {transform:translateX(0)} to {transform:translateX(-25%)} }
`;
const Section = styled.section`
  padding:clamp(78px, 10vw, 144px) clamp(20px, 7vw, 112px); max-width:1600px; margin:0 auto;
`;
const SectionIntro = styled.div`
  display:grid; grid-template-columns:.55fr 1.45fr; gap:28px; align-items:start; margin-bottom:58px;
  .number { color:#9b7b56; font-size:.75rem; letter-spacing:.18em; font-weight:800; padding-top:13px; }
  h2 { margin:0; font-family:'Noto Serif KR',serif; font-weight:500; font-size:clamp(2.25rem,5.2vw,5.2rem); letter-spacing:-.085em; line-height:1.2; }
  h2 em { color:#987a58; font-style:normal; }
  p { max-width:420px; margin:20px 0 0 auto; color:#7c6b5a; line-height:1.85; font-size:.93rem; }
  @media(max-width:760px) { grid-template-columns:1fr; gap:14px; h2{font-size:clamp(2.5rem,10vw,4rem)} p{margin:10px 0 0;} }
`;
const TableShowcase = styled.section`
  padding: clamp(76px, 9vw, 128px) clamp(20px, 7vw, 112px) clamp(86px, 10vw, 145px);
  background: #2d2118; color: #f5ead9; position:relative; overflow:hidden;
  &::before { content:''; position:absolute; inset:0; pointer-events:none; opacity:.25; background:radial-gradient(ellipse at 80% 10%,rgba(180,132,74,.24),transparent 40%),linear-gradient(115deg,transparent 35%,rgba(255,255,255,.025) 35.1%,transparent 35.4%); }
  .inner { max-width:1376px; margin:auto; position:relative; z-index:1; }
  .eyebrow { color:#c6a77d; font-size:.7rem; letter-spacing:.23em; font-weight:800; }
  .heading { display:flex; justify-content:space-between; align-items:end; gap:28px; margin:18px 0 38px; }
  h2 { margin:0; font-family:'Noto Serif KR',serif; font-weight:500; font-size:clamp(2.6rem,5.5vw,5.4rem); letter-spacing:-.09em; line-height:1.14; }
  h2 em { color:#c7a77b; font-style:normal; }
  .heading p { max-width:340px; color:#c3b19b; font-size:.88rem; line-height:1.85; margin:0; }
  .table-grid { display:grid; grid-template-columns:1.15fr .85fr .85fr; gap:14px; align-items:stretch; }
  @media(max-width:850px) { .heading {display:block;} .heading p{margin-top:18px;} .table-grid{grid-template-columns:1fr 1fr;} .table-card:first-child{grid-column:span 2;} }
  @media(max-width:520px) { .table-grid{grid-template-columns:1fr;} .table-card:first-child{grid-column:auto;} }
`;
const TableCard = styled.button`
  display:flex; flex-direction:column; text-align:left; padding:0; min-height:390px; position:relative; overflow:hidden; cursor:pointer;
  color:#fff8ec; border:1px solid rgba(219,188,143,.28); border-radius:3px; background:#493426; isolation:isolate;
  transition:transform .35s ease,border-color .35s ease;
  &:hover { transform:translateY(-6px); border-color:rgba(231,201,159,.75); }
  &::before { content:''; position:absolute; inset:0; z-index:-2; background-image:linear-gradient(180deg,rgba(19,13,9,.04) 0%,rgba(19,13,9,.18) 35%,rgba(19,13,9,.9) 100%),${p=>p.image}; background-size:cover; background-position:center; transition:transform .65s ease; }
  &:hover::before { transform:scale(1.045); }
  .top { display:flex; justify-content:space-between; align-items:center; width:100%; padding:20px; color:#ead4b4; font-size:.63rem; letter-spacing:.16em; font-weight:800; }
  .content { margin-top:auto; padding:26px 24px 25px; width:100%; }
  .tag { color:#d9b98d; font-size:.65rem; letter-spacing:.13em; font-weight:800; }
  strong { display:block; margin:10px 0 9px; font-family:'Noto Serif KR',serif; font-weight:500; font-size:clamp(1.55rem,2.5vw,2.25rem); letter-spacing:-.06em; }
  p { color:#eadfd0; font-size:.82rem; line-height:1.7; margin:0; max-width:320px; word-break:keep-all; }
  .bottom { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:22px; padding-top:15px; border-top:1px solid rgba(245,226,198,.25); color:#f6e8d4; font-size:.72rem; }
`;
const StoryGrid = styled.div`
  display:grid; grid-template-columns:1fr 1fr; gap:18px;
  @media(max-width:760px) { grid-template-columns:1fr; }
`;
const StoryCard = styled.article`
  min-height:350px; padding:clamp(26px,4vw,52px); background:${p=>p.dark?'#38271b':'#ebe0ce'}; color:${p=>p.dark?'#f4e8d7':'#38271b'}; display:flex; flex-direction:column; justify-content:space-between; position:relative; overflow:hidden;
  border:1px solid rgba(62,42,25,.13);
  .card-top { display:flex; align-items:center; justify-content:space-between; color:${p=>p.dark?'#c2a887':'#8d704d'}; font-size:.7rem; letter-spacing:.16em; font-weight:800; }
  h3 { margin:44px 0 16px; max-width:570px; font-family:'Noto Serif KR',serif; font-size:clamp(1.8rem,3.1vw,3rem); font-weight:500; letter-spacing:-.075em; line-height:1.28; }
  p { max-width:465px; line-height:1.85; font-size:.9rem; color:${p=>p.dark?'#dfd0bd':'#766452'}; word-break:keep-all; }
  .orb { position:absolute; width:240px; height:240px; border:1px solid ${p=>p.dark?'rgba(229,204,169,.22)':'rgba(93,66,39,.2)'}; border-radius:50%; right:-58px; bottom:-76px; }
  .orb::before,.orb::after { content:''; position:absolute; inset:25px; border:1px solid inherit; border:1px solid ${p=>p.dark?'rgba(229,204,169,.22)':'rgba(93,66,39,.2)'}; border-radius:50%; }
  .orb::after { inset:55px; }
`;
const HowSection = styled.section`
  padding:clamp(72px, 9vw, 130px) clamp(20px, 7vw, 112px) clamp(84px, 11vw, 160px); background:#e9decd; border-top:1px solid var(--line); border-bottom:1px solid var(--line);
`;
const HowInner = styled.div`
  max-width:1376px; margin:auto;
  .heading-row { display:flex; justify-content:space-between; align-items:end; gap:30px; margin-bottom:54px; }
  .label { color:#8b6c49; font-size:.72rem; font-weight:800; letter-spacing:.2em; }
  h2 { font-family:'Noto Serif KR',serif; font-weight:500; letter-spacing:-.08em; font-size:clamp(2.5rem,5.1vw,5rem); margin:12px 0 0; line-height:1.15; }
  .heading-row p { max-width:330px; font-size:.88rem; color:#766657; line-height:1.85; margin:0; }
  .steps { display:grid; grid-template-columns:repeat(4,1fr); border-top:1px solid rgba(65,43,25,.3); }
  .step { padding:28px 22px 0 0; border-right:1px solid rgba(65,43,25,.16); margin-right:22px; min-height:170px; }
  .step:last-child { border-right:0; margin-right:0; }
  .step b { display:block; color:#a08460; font-size:.73rem; letter-spacing:.15em; margin-bottom:22px; }
  .step strong { display:block; font-family:'Noto Serif KR',serif; font-size:1.35rem; letter-spacing:-.05em; margin-bottom:9px; }
  .step p { font-size:.81rem; line-height:1.75; color:#7b6958; margin:0; }
  @media(max-width:760px) { .heading-row{display:block} .heading-row p{margin-top:22px;} .steps{grid-template-columns:1fr 1fr; row-gap:30px;} .step:nth-child(2){border-right:0} }
  @media(max-width:460px) { .steps{grid-template-columns:1fr;} .step{border-right:0; min-height:auto; padding-top:18px; margin-right:0;} }
`;
const Cta = styled.section`
  padding:clamp(90px,12vw,170px) 20px; text-align:center; background:#3b291c; color:#f4e9d9; position:relative; overflow:hidden;
  .rule { display:flex; align-items:center; justify-content:center; gap:14px; color:#c1a47d; font-size:.66rem; letter-spacing:.25em; font-weight:800; }
  .rule::before,.rule::after { content:''; width:38px; height:1px; background:#a88a65; }
  h2 { margin:28px auto 18px; max-width:900px; font-family:'Noto Serif KR',serif; font-weight:500; font-size:clamp(2.5rem,6.5vw,6.4rem); line-height:1.2; letter-spacing:-.09em; }
  p { color:#cfbca5; margin:0 auto 34px; max-width:520px; font-size:.93rem; line-height:1.8; }
  .fine { margin-top:22px; color:#9c8367; font-size:.69rem; }
  &::before,&::after { content:''; position:absolute; width:320px; height:320px; border:1px solid rgba(223,196,160,.1); border-radius:50%; }
  &::before { top:-210px; left:-110px; } &::after { bottom:-240px; right:-120px; }
`;
const Footer = styled.footer`
  padding:26px clamp(20px,5vw,76px); display:flex; justify-content:space-between; align-items:center; gap:12px; color:#8b7864; font-size:.7rem; border-top:1px solid rgba(65,43,25,.17);
  @media(max-width:640px) { flex-direction:column; align-items:flex-start; }
`;

function TableScene({ containerRef }) {
  useEffect(() => {
    const host = containerRef.current;
    if (!host) return undefined;

    let renderer;
    let frame = 0;
    let resizeHandler;
    let scene;
    let camera;
    let modelRoot;
    let loadedModel;
    const clock = new THREE.Clock();
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    try {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
      camera.position.set(0, 4.25, 9.7);
      camera.lookAt(0, 0.77, 0);

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setSize(width, height);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
      renderer.setClearColor(0x000000, 0);
      host.appendChild(renderer.domElement);

      // Warm, broad light keeps the walnut, linen and ceramic materials legible without harsh contrast.
      scene.add(new THREE.HemisphereLight(0xffe8c9, 0x21130c, 1.05));
      const key = new THREE.DirectionalLight(0xffd7a0, 3.0);
      key.position.set(-4.5, 8, 5.5);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xfff2dc, 1.2);
      fill.position.set(5, 4, -4);
      scene.add(fill);
      const rimLight = new THREE.PointLight(0xd49a52, 1.7, 12, 2);
      rimLight.position.set(0, 3.5, -3.3);
      scene.add(rimLight);

      // A subtle, feathered shadow is more natural than a hard circular floor plane.
      const shadowMaterial = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { shadowTint: { value: new THREE.Color('#3f2919') } },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 shadowTint;
          varying vec2 vUv;
          void main() {
            float d = length((vUv - vec2(0.5)) * vec2(1.0, 1.0));
            float alpha = (1.0 - smoothstep(0.12, 0.50, d)) * 0.19;
            gl_FragColor = vec4(shadowTint, alpha);
          }
        `,
      });
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 60),
        new THREE.MeshStandardMaterial({ color: 0x2a1d14, roughness: 0.88, metalness: 0.02 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.025;
      floor.receiveShadow = true;
      scene.add(floor);
      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 6.6), shadowMaterial);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = -0.018;
      scene.add(shadow);

      modelRoot = new THREE.Group();
      modelRoot.position.set(0, 0, 0);
      scene.add(modelRoot);

      const loader = new GLTFLoader();
      loader.load(
        `${import.meta.env.BASE_URL}assets/serendipity-dining-table.glb`,
        (gltf) => {
          loadedModel = gltf.scene;
          loadedModel.traverse((object) => {
            if (!object.isMesh) return;
            object.castShadow = true;
            object.receiveShadow = true;
            if (object.material) {
              object.material.side = THREE.DoubleSide;
              object.material.needsUpdate = true;
            }
          });
          loadedModel.scale.setScalar(1.0);
          modelRoot.add(loadedModel);
          host.dataset.tableModel = 'ready';
        },
        undefined,
        () => {
          // Keep the rest of the landing page usable when a browser blocks WebGL assets.
          host.dataset.tableModel = 'unavailable';
        },
      );

      const animate = () => {
        frame = requestAnimationFrame(animate);
        const delta = Math.min(clock.getDelta(), 0.05);
        if (!prefersReduced && modelRoot) {
          // One quiet revolution takes about a minute: the table, settings and chairs move as one object.
          modelRoot.rotation.y += delta * 0.105;
        }
        renderer.render(scene, camera);
      };
      animate();

      resizeHandler = () => {
        if (!renderer || !camera) return;
        const w = Math.max(host.clientWidth, 1);
        const h = Math.max(host.clientHeight, 1);
        camera.aspect = w / h;
        if (w < 540) camera.position.set(0, 4.8, 11.0);
        else camera.position.set(0, 4.25, 9.7);
        camera.lookAt(0, 0.77, 0);
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', resizeHandler);
    } catch (err) {
      host.dataset.tableModel = 'unavailable';
    }

    return () => {
      cancelAnimationFrame(frame);
      if (resizeHandler) window.removeEventListener('resize', resizeHandler);
      if (scene) {
        scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
            else obj.material.dispose();
          }
        });
      }
      if (renderer) {
        renderer.dispose();
        renderer.domElement?.remove();
      }
      loadedModel = null;
    };
  }, [containerRef]);
  return null;
}

export default function LandingExperience({ onOpenLogin }) {
  const sceneRef = useRef(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const updateProgress = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0);
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.reveal-up').forEach((node) => {
        gsap.fromTo(node, { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85, ease: 'power2.out', scrollTrigger: { trigger: node, start: 'top 88%', once: true } });
      });
      gsap.utils.toArray('.line-draw').forEach((node) => {
        gsap.fromTo(node, { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left center', duration: 1.1, ease: 'power2.out', scrollTrigger: { trigger: node, start: 'top 88%', once: true } });
      });
    });
    return () => { window.removeEventListener('scroll', updateProgress); ctx.revert(); };
  }, []);

  return (
    <Page>
      <Progress value={progress} />
      <Header>
        <Brand type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="우연한 식탁 홈으로">
          <img src={`${import.meta.env.BASE_URL}assets/whatsup-logo.png`} alt="" />
          <span>우연한 식탁<small>WHATSUP HOUSE</small></span>
        </Brand>
        <NavRight aria-label="주요 메뉴">
          <a className="table-nav" href="#tables">테이블</a>
          <a href="#story">우연한 식탁</a>
          <a href="#how">이용 방법</a>
          <LoginButton className="login" type="button" onClick={onOpenLogin}>로그인하기 <ArrowUpRight size={15} /></LoginButton>
        </NavRight>
      </Header>

      <Hero id="top">
        <HeroCopy>
          <div className="eyebrow">THE TABLE IS THE MAIN CHARACTER · 2026</div>
          <h1>오늘의 저녁을<br/>고르고, 그곳에서<br/><em>인연을 만나다.</em></h1>
          <p>분위기와 취향으로 고르는 작은 다이닝 모임. 마음이 가는 식탁을 먼저 둘러보고, 그 저녁에 함께할 사람들의 이야기를 만나보세요.</p>
          <div className="actions">
            <LoginButton type="button" onClick={onOpenLogin}>테이블 둘러보기 <ArrowRight size={16}/></LoginButton>
            <a className="text-link" href="#story">조금 더 알아보기 <ArrowDown size={14}/></a>
          </div>
        </HeroCopy>
        <HeroVisual>
          <HeroScene ref={sceneRef}><TableScene containerRef={sceneRef}/></HeroScene>
          <div className="stamp">WHATSUP HOUSE / SOCIAL DINING</div>
          <VisualNote>한 끼의<br/>대화가<br/>시작되는 곳</VisualNote>
          <div className="caption"><small>YOUR EVENING, YOUR TABLE</small><strong>어떤 식탁에 앉을까요?</strong></div>
          <VerticalLabel>PEOPLE · TASTE · STORIES</VerticalLabel>
        </HeroVisual>
      </Hero>

      <Marquee aria-hidden="true"><div>{Array.from({ length: 4 }, (_, i) => <span key={i}>좋은 대화는 좋은 저녁을 만듭니다　✳　서로 다른 취향이 한 식탁에서 만납니다　✳　SERENDIPITY TABLE　✳　</span>)}</div></Marquee>

      <TableShowcase id="tables" data-scene-section>
        <div className="inner">
          <div className="eyebrow reveal-up">THE TABLE COLLECTION / 01—04</div>
          <div className="heading reveal-up">
            <h2>먼저, <em>식탁</em>을 골라보세요.</h2>
            <p>각 식탁에는 다른 분위기와 대화가 기다리고 있어요. 마음이 가는 모임을 선택하고 자세한 정보를 확인해 보세요.</p>
          </div>
          <div className="table-grid">
            <TableCard className="table-card reveal-up" image={`url("${import.meta.env.BASE_URL}assets/dining-table.webp")`} type="button" onClick={onOpenLogin}>
              <div className="top"><span>01 / SIGNATURE</span><span>✦ EDITOR'S TABLE</span></div>
              <div className="content"><span className="tag">WARM & INTIMATE</span><strong>느린 저녁의 식탁</strong><p>따뜻한 조명 아래, 서두르지 않고 나누는 취향과 일상의 이야기.</p><div className="bottom"><span>테이블 둘러보기</span><ArrowRight size={16}/></div></div>
            </TableCard>
            <TableCard className="table-card reveal-up" image={`url("${import.meta.env.BASE_URL}assets/dining-group.webp")`} type="button" onClick={onOpenLogin}>
              <div className="top"><span>02 / CONVERSATION</span><span>✦</span></div>
              <div className="content"><span className="tag">NEW PEOPLE</span><strong>처음 만나는 사이</strong><p>새로운 관점과 작은 공통점이 만나는 자리.</p><div className="bottom"><span>모임 살펴보기</span><ArrowRight size={16}/></div></div>
            </TableCard>
            <TableCard className="table-card reveal-up" image={`url("${import.meta.env.BASE_URL}assets/dining-table.webp")`} type="button" onClick={onOpenLogin}>
              <div className="top"><span>03 / TASTE</span><span>✦</span></div>
              <div className="content"><span className="tag">SHARED INTERESTS</span><strong>취향이 이어지는 밤</strong><p>좋아하는 것부터 시작해 대화가 자연스럽게 깊어지는 식탁.</p><div className="bottom"><span>나에게 맞는 식탁</span><ArrowRight size={16}/></div></div>
            </TableCard>
          </div>
        </div>
      </TableShowcase>

      <Section id="story" data-scene-section>
        <SectionIntro className="reveal-up">
          <div className="number">01 / OUR BELIEF</div>
          <div>
            <h2>우연을 기다리는 대신,<br/><em>만남의 이유</em>를 만듭니다.</h2>
            <p>처음 만나는 사이에도 대화가 이어지는 이유는 저마다의 취향과 리듬을 세심하게 살폈기 때문입니다. 우연한 식탁은 사람을 모으는 일을 넘어, 함께 앉을 이유를 설계합니다.</p>
          </div>
        </SectionIntro>
        <StoryGrid>
          <StoryCard className="reveal-up">
            <div className="card-top"><span>01 — PEOPLE</span><Users size={18}/></div>
            <div><h3>비슷한 나이대,<br/>서로 다른 세계.</h3><p>나이 차이와 신청 조건을 먼저 확인하고, 관심사와 대화 분위기가 자연스럽게 어우러지는 조합을 찾습니다.</p></div>
            <div className="orb" />
          </StoryCard>
          <StoryCard dark className="reveal-up">
            <div className="card-top"><span>02 — CONVERSATION</span><HeartHandshake size={18}/></div>
            <div><h3>어색함을 덜고<br/>대화의 문을 엽니다.</h3><p>함께 나누기 좋은 질문과 아이스브레이킹을 준비해, 누구나 편안하게 대화를 시작할 수 있도록 돕습니다.</p></div>
            <div className="orb" />
          </StoryCard>
        </StoryGrid>
      </Section>

      <HowSection id="how" data-scene-section>
        <HowInner>
          <div className="heading-row reveal-up">
            <div><div className="label">02 / THE EXPERIENCE</div><h2>한 번의 신청,<br/>차분하게 이어지는 과정.</h2></div>
            <p>신청부터 만남 이후의 피드백까지. 필요한 안내는 한곳에 모으고, 참가자는 좋은 저녁에만 집중할 수 있도록 합니다.</p>
          </div>
          <div className="steps">
            <div className="step reveal-up"><b>STEP 01</b><strong>취향을 알려주세요</strong><p>관심사와 분위기, 가능한 날짜와 지역을 선택합니다.</p></div>
            <div className="step reveal-up"><b>STEP 02</b><strong>어울리는 식탁 찾기</strong><p>나이 차이와 희망 지역 같은 필수 조건부터 확인합니다.</p></div>
            <div className="step reveal-up"><b>STEP 03</b><strong>만남을 준비해요</strong><p>확정 후 식당 안내와 단체 채팅방, 대화 콘텐츠가 이어집니다.</p></div>
            <div className="step reveal-up"><b>STEP 04</b><strong>다음 인연의 힌트</strong><p>남겨주신 피드백은 더 좋은 다음 만남을 만드는 데 쓰입니다.</p></div>
          </div>
        </HowInner>
      </HowSection>

      <Section data-scene-section>
        <SectionIntro className="reveal-up">
          <div className="number">03 / A BETTER TABLE</div>
          <div><h2>좋은 만남은<br/><em>작은 배려</em>에서 시작됩니다.</h2><p>모든 사람의 정보가 무분별하게 공개되지 않도록, 테이블 소개에는 대화에 필요한 프로필 정보만 보여줍니다. 매칭 기준과 취소 정책도 신청 전에 명확하게 확인할 수 있습니다.</p></div>
        </SectionIntro>
        <StoryGrid>
          <StoryCard className="reveal-up">
            <div className="card-top"><span>CARE / SAFETY</span><Leaf size={18}/></div>
            <div><h3>선호는 반영하고,<br/>경계는 존중합니다.</h3><p>차단 또는 다시 만나고 싶지 않다고 표시한 관계는 다음 매칭에서 제외됩니다. 사적인 피드백은 상대에게 공개하지 않습니다.</p></div>
            <div className="orb" />
          </StoryCard>
          <StoryCard dark className="reveal-up">
            <div className="card-top"><span>THE DETAILS</span><Utensils size={18}/></div>
            <div><h3>테이블마다 다른<br/>이야기가 있어요.</h3><p>문화, 취미, 일, 일상 등 여러 관심사를 주제로 준비된 식탁 중 나에게 맞는 자리를 찾아보세요.</p></div>
            <div className="orb" />
          </StoryCard>
        </StoryGrid>
      </Section>

      <Cta>
        <div className="rule">YOUR NEXT STORY STARTS HERE</div>
        <h2>마음이 가는 식탁에서<br/>다음 이야기를 시작하세요.</h2>
        <p>나와 결이 맞는 사람들과 나누는 한 끼. 다음 이야기는 지금부터 시작됩니다.</p>
        <LoginButton type="button" onClick={onOpenLogin}>식탁 선택하기 <ArrowRight size={16}/></LoginButton>
        <div className="fine">신청 가능한 식탁과 조건은 로그인 후 확인할 수 있어요.</div>
      </Cta>
      <Footer><span>© 2026 WHATSUP HOUSE · 우연한 식탁</span><span>PEOPLE × TASTE × STORIES</span></Footer>
    </Page>
  );
}

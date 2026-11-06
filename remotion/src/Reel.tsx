import React from "react";
import "@fontsource/noto-sans-devanagari/400.css";
import "@fontsource/noto-sans-devanagari/700.css";
import { AbsoluteFill, Series, useCurrentFrame, useVideoConfig, spring, interpolate, Audio, staticFile } from "remotion";

const BG = "#080D18";
const CYAN = "#35D9F2";
const VIOLET = "#8B7CFF";
const WHITE = "#F7FAFF";
const MUTED = "#AAB6C8";
const FONT = '"Inter", "Noto Sans Devanagari", system-ui, sans-serif';

type Slide = { kind: "hook" | "tool" | "cta"; n?: number; tag?: string; headline?: string; emphasis?: string; body?: string; important?: boolean; };
export type ReelProps = { slides: Slide[]; handle?: string; audioFile?: string };

const Backdrop: React.FC<{children: React.ReactNode; handle: string; index: number}> = ({children,handle,index}) => {
  const frame=useCurrentFrame();
  const drift=interpolate(Math.sin((frame+index*20)/35),[-1,1],[-35,35]);
  return <AbsoluteFill style={{background:BG,fontFamily:FONT,overflow:"hidden"}}>
    <AbsoluteFill style={{background:"radial-gradient(ellipse at 15% 18%, rgba(32,115,170,.32), transparent 42%), radial-gradient(ellipse at 90% 80%, rgba(100,70,190,.25), transparent 45%)"}}/>
    <div style={{position:"absolute",width:650,height:650,borderRadius:"50%",border:"1px solid rgba(53,217,242,.13)",top:180,left:-360,transform:`translateY(${drift}px)`}}/>
    <div style={{position:"absolute",width:520,height:520,borderRadius:"50%",border:"1px solid rgba(139,124,255,.16)",bottom:250,right:-300,transform:`translateY(${-drift}px)`}}/>
    {children}
    <div style={{position:"absolute",bottom:66,left:72,right:72,display:"flex",justifyContent:"space-between",alignItems:"center",color:"#9BAAC0",fontSize:25,fontWeight:700,letterSpacing:1}}>
      <span>{handle}</span><span style={{color:CYAN}}>AI FOR ALL</span>
    </div>
  </AbsoluteFill>;
};

const Eyebrow:React.FC<{children:React.ReactNode}> = ({children}) => <div style={{display:"inline-flex",padding:"13px 22px",borderRadius:999,background:"rgba(53,217,242,.12)",border:"1px solid rgba(53,217,242,.45)",color:CYAN,fontSize:25,fontWeight:800,letterSpacing:2}}>{children}</div>;

const Hook:React.FC<{s:Slide;handle:string;index:number}> = ({s,handle,index}) => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  const a=spring({frame:frame-3,fps,config:{damping:14}});
  return <Backdrop handle={handle} index={index}>
    <div style={{position:"absolute",top:360,left:78,right:78,display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",opacity:a,transform:`translateY(${interpolate(a,[0,1],[45,0])}px)`}}>
      <Eyebrow>{s.tag || "AI TOOLS • 2026"}</Eyebrow>
      <div style={{fontSize:91,fontWeight:900,lineHeight:1.14,color:WHITE,marginTop:48,letterSpacing:-2}}>{s.headline}</div>
      <div style={{fontSize:33,color:MUTED,marginTop:34}}>Save this reel. Try these tools today.</div>
      <div style={{marginTop:80,width:170,height:8,borderRadius:9,background:CYAN,boxShadow:"0 0 28px rgba(53,217,242,.6)"}}/>
    </div>
  </Backdrop>;
};

const Tool:React.FC<{s:Slide;handle:string;index:number}> = ({s,handle,index}) => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  const a=spring({frame:frame-4,fps,config:{damping:13,stiffness:120}});
  const accent=index%2===0?CYAN:VIOLET;
  return <Backdrop handle={handle} index={index}>
    <div style={{position:"absolute",top:390,left:70,right:70,opacity:a,transform:`translateY(${interpolate(a,[0,1],[35,0])}px)`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:34}}>
        <Eyebrow>TOOL {s.n || index} / 5</Eyebrow>
        <div style={{fontSize:25,color:MUTED,fontWeight:700}}>AI TOOLKIT</div>
      </div>
      <div style={{borderRadius:38,padding:"54px 48px 62px",background:"linear-gradient(145deg,rgba(22,34,55,.96),rgba(13,20,36,.96))",border:"1px solid rgba(130,165,205,.28)",boxShadow:"0 28px 90px rgba(0,0,0,.32)"}}>
        <div style={{width:104,height:104,borderRadius:28,display:"flex",alignItems:"center",justifyContent:"center",background:accent+"20",border:`2px solid ${accent}`,color:accent,fontSize:56,fontWeight:900,marginBottom:38}}>{s.n || index}</div>
        <div style={{fontSize:67,lineHeight:1.18,fontWeight:900,color:WHITE}}>{s.headline}</div>
        {s.emphasis?<div style={{fontSize:55,lineHeight:1.2,fontWeight:800,color:accent,marginTop:12}}>{s.emphasis}</div>:null}
        {s.body?<div style={{fontSize:35,lineHeight:1.48,color:MUTED,marginTop:34}}>{s.body}</div>:null}
        {s.demoLabel || s.demoPrompt || s.demoResult ? <div style={{marginTop:42,borderRadius:24,overflow:"hidden",border:"1px solid rgba(53,217,242,.3)",background:"#0A1220"}}>
          <div style={{padding:"15px 22px",display:"flex",alignItems:"center",gap:10,background:"#142239",color:CYAN,fontSize:21,fontWeight:900,letterSpacing:2}}>
            <span style={{width:12,height:12,borderRadius:99,background:"#55D69E"}}/> {s.demoLabel || "QUICK DEMO"}
          </div>
          <div style={{padding:"22px 24px"}}>
            <div style={{fontSize:20,color:CYAN,fontWeight:900,letterSpacing:1,marginBottom:9}}>TRY THIS</div>
            <div style={{fontSize:27,lineHeight:1.35,color:WHITE}}>{s.demoPrompt || "Explore a practical example"}</div>
            <div style={{height:1,background:"rgba(255,255,255,.12)",margin:"19px 0"}}/>
            <div style={{fontSize:20,color:VIOLET,fontWeight:900,letterSpacing:1,marginBottom:9}}>EXAMPLE OUTPUT</div>
            <div style={{fontSize:26,lineHeight:1.4,color:MUTED}}>{s.demoResult || "An illustrative result"}</div>
          </div>
        </div>:null}
      </div>
      <div style={{display:"flex",gap:10,marginTop:35}}>
        {Array.from({length:5},(_,i)=><div key={i} style={{height:7,flex:1,borderRadius:8,background:i<(s.n||index)?CYAN:"rgba(255,255,255,.16)"}}/>)}
      </div>
    </div>
  </Backdrop>;
};

const Cta:React.FC<{s:Slide;handle:string;index:number}> = ({s,handle,index}) => {
  const {fps}=useVideoConfig();const frame=useCurrentFrame();const a=spring({frame:frame-4,fps});
  return <Backdrop handle={handle} index={index}>
    <div style={{position:"absolute",top:570,left:65,right:65,textAlign:"center",opacity:a,transform:`scale(${interpolate(a,[0,1],[.9,1])})`}}>
      <Eyebrow>MORE AI. LESS EFFORT.</Eyebrow>
      <div style={{fontSize:82,fontWeight:900,color:WHITE,lineHeight:1.15,marginTop:45}}>Follow</div>
      <div style={{fontSize:67,fontWeight:900,color:CYAN,marginTop:12}}>@aiforall.daily</div>
      <div style={{fontSize:36,color:MUTED,lineHeight:1.4,marginTop:35}}>{s.body || "Daily AI tools, explained simply."}</div>
      <div style={{display:"inline-flex",marginTop:65,padding:"22px 42px",borderRadius:999,background:CYAN,color:BG,fontSize:34,fontWeight:900}}>FOLLOW FOR MORE ↗</div>
    </div>
  </Backdrop>;
};

export const Reel:React.FC<ReelProps> = ({slides=[],handle="@aiforall.daily",audioFile}) => {
  const {fps}=useVideoConfig();const per=Math.round(3.4*fps);
  return <AbsoluteFill style={{background:BG}}>
    <Series>{slides.map((s,i)=><Series.Sequence key={i} durationInFrames={per}>
      {s.kind==="hook"?<Hook s={s} handle={handle} index={i}/>:s.kind==="cta"?<Cta s={s} handle={handle} index={i}/>:<Tool s={s} handle={handle} index={i}/>}
    </Series.Sequence>)}</Series>
    {audioFile?<Audio src={staticFile(audioFile)} volume={1}/>:null}
  </AbsoluteFill>;
};

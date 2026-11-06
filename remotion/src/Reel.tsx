import React from "react";
import "@fontsource/noto-sans-devanagari/400.css";
import "@fontsource/noto-sans-devanagari/700.css";
import { AbsoluteFill, Series, useCurrentFrame, useVideoConfig, spring, interpolate, Audio, Video, staticFile } from "remotion";

const BG = "#080D18";
const CYAN = "#35D9F2";
const VIOLET = "#8B7CFF";
const WHITE = "#F7FAFF";
const MUTED = "#AAB6C8";
const FONT = '"Inter", "Noto Sans Devanagari", system-ui, sans-serif';

type Slide = { kind: "hook" | "tool" | "cta"; n?: number; tag?: string; headline?: string; emphasis?: string; body?: string; important?: boolean; demoLabel?: string; demoPrompt?: string; demoResult?: string; demoVideo?: string; };
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
  const videoPath=s.demoVideo;
  return <Backdrop handle={handle} index={index}>
    <div style={{position:"absolute",top:250,left:48,right:48,bottom:150,display:"flex",flexDirection:"column",gap:18,opacity:a,transform:`translateY(${interpolate(a,[0,1],[25,0])}px)`}}>
      <div style={{height:78,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <Eyebrow>TOOL {s.n || index} / 5</Eyebrow>
        <div style={{fontSize:23,color:MUTED,fontWeight:800}}>REAL DEMO + AI SIMULATION</div>
      </div>
      <div style={{height:690,flexShrink:0,borderRadius:30,overflow:"hidden",position:"relative",background:"#050912",border:"2px solid rgba(53,217,242,.42)",boxShadow:"0 18px 55px rgba(0,0,0,.38)"}}>
        {videoPath ? <Video src={staticFile(videoPath)} startFrom={0} muted volume={0} loop style={{width:"100%",height:"100%",objectFit:"cover"}}/> :
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#101e32,#080d18)",padding:38,textAlign:"center"}}>
            <div style={{fontSize:24,color:CYAN,fontWeight:900,letterSpacing:3}}>TOP VIDEO SLOT</div>
            <div style={{fontSize:49,color:WHITE,fontWeight:900,marginTop:22}}>{s.headline}</div>
            <div style={{fontSize:26,color:MUTED,marginTop:22,lineHeight:1.4}}>Add a real screen recording at<br/>remotion/public/{videoPath || "demos/tool-name.mp4"}</div>
          </div>}
        <div style={{position:"absolute",top:20,left:20,padding:"10px 17px",borderRadius:12,background:"rgba(0,0,0,.72)",color:WHITE,fontSize:20,fontWeight:900,letterSpacing:1}}>▶ LIVE TOOL FOOTAGE</div>
      </div>
      <div style={{flex:1,minHeight:0,borderRadius:30,padding:"25px 30px",background:"linear-gradient(145deg,rgba(22,34,55,.98),rgba(10,17,31,.98))",border:"2px solid rgba(139,124,255,.45)",boxShadow:"0 18px 55px rgba(0,0,0,.3)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontSize:23,color:VIOLET,fontWeight:900,letterSpacing:2}}>↓ SIMULATED EXAMPLE</div>
          <div style={{fontSize:22,color:accent,fontWeight:900}}>{s.demoLabel || "QUICK DEMO"}</div>
        </div>
        <div style={{fontSize:43,lineHeight:1.12,fontWeight:900,color:WHITE}}>{s.headline}</div>
        {s.emphasis?<div style={{fontSize:30,lineHeight:1.2,fontWeight:800,color:accent,marginTop:7}}>{s.emphasis}</div>:null}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:15,marginTop:19,flex:1,minHeight:0}}>
          <div style={{borderRadius:18,padding:19,background:"#081321",border:"1px solid rgba(53,217,242,.3)",overflow:"hidden"}}>
            <div style={{fontSize:19,color:CYAN,fontWeight:900,letterSpacing:1,marginBottom:11}}>PROMPT</div>
            <div style={{fontSize:25,lineHeight:1.35,color:WHITE}}>{s.demoPrompt || s.body || "Try a practical task with this AI tool."}</div>
          </div>
          <div style={{borderRadius:18,padding:19,background:"#111329",border:"1px solid rgba(139,124,255,.35)",overflow:"hidden"}}>
            <div style={{fontSize:19,color:VIOLET,fontWeight:900,letterSpacing:1,marginBottom:11}}>EXAMPLE OUTPUT</div>
            <div style={{fontSize:24,lineHeight:1.35,color:"#D7DDF0"}}>{s.demoResult || "Illustrative output preview — not a real product screenshot."}</div>
          </div>
        </div>
        <div style={{fontSize:17,color:"#91A0B6",marginTop:12}}>Illustrative simulation • not an actual product result</div>
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

import React from "react";
import "@fontsource/noto-sans-devanagari/400.css";
import "@fontsource/noto-sans-devanagari/700.css";
import { AbsoluteFill, Series, useCurrentFrame, useVideoConfig, spring, interpolate, Audio, Video, staticFile } from "remotion";

const BG="#080D18", CYAN="#35D9F2", VIOLET="#8B7CFF", WHITE="#F7FAFF", MUTED="#AAB6C8";
const FONT='"Inter", "Noto Sans Devanagari", system-ui, sans-serif';
type Slide={kind:"hook"|"tool"|"cta";n?:number;tag?:string;headline?:string;emphasis?:string;body?:string;demoLabel?:string;demoPrompt?:string;demoResult?:string;demoVideo?:string};
export type ReelProps={slides:Slide[];handle?:string;audioFile?:string};

const Backdrop:React.FC<{children:React.ReactNode;handle:string;index:number}>=({children,handle,index})=>{
 const f=useCurrentFrame(), drift=interpolate(Math.sin((f+index*20)/35),[-1,1],[-35,35]);
 return <AbsoluteFill style={{background:BG,fontFamily:FONT,overflow:"hidden"}}>
  <AbsoluteFill style={{background:"radial-gradient(ellipse at 15% 18%,rgba(32,115,170,.32),transparent 42%),radial-gradient(ellipse at 90% 80%,rgba(100,70,190,.25),transparent 45%)"}}/>
  <div style={{position:"absolute",width:650,height:650,borderRadius:"50%",border:"1px solid rgba(53,217,242,.13)",top:180,left:-360,transform:`translateY(${drift}px)`}}/>
  <div style={{position:"absolute",width:520,height:520,borderRadius:"50%",border:"1px solid rgba(139,124,255,.16)",bottom:250,right:-300,transform:`translateY(${-drift}px)`}}/>
  {children}
  <div style={{position:"absolute",bottom:45,left:62,right:62,display:"flex",justifyContent:"space-between",color:"#9BAAC0",fontSize:23,fontWeight:700}}><span>{handle}</span><span style={{color:CYAN}}>AI FOR ALL</span></div>
 </AbsoluteFill>;
};
const Eyebrow:React.FC<{children:React.ReactNode}>=({children})=><div style={{display:"inline-flex",padding:"11px 20px",borderRadius:999,background:"rgba(53,217,242,.12)",border:"1px solid rgba(53,217,242,.45)",color:CYAN,fontSize:23,fontWeight:800,letterSpacing:2}}>{children}</div>;
const Hook:React.FC<{s:Slide;handle:string;index:number}>=({s,handle,index})=>{
 const f=useCurrentFrame(),{fps}=useVideoConfig(),a=spring({frame:f-3,fps,config:{damping:14}});
 return <Backdrop handle={handle} index={index}><div style={{position:"absolute",top:370,left:78,right:78,textAlign:"center",opacity:a,transform:`translateY(${interpolate(a,[0,1],[45,0])}px)`}}>
  <Eyebrow>{s.tag||"AI TOOLS • 2026"}</Eyebrow><div style={{fontSize:88,fontWeight:900,lineHeight:1.14,color:WHITE,marginTop:48}}>{s.headline}</div><div style={{fontSize:32,color:MUTED,marginTop:34}}>Save this reel. Try these tools today.</div>
 </div></Backdrop>;
};
const TypeLine:React.FC<{text:string;frame:number;speed?:number}>=({text,frame,speed=1.7})=>{
 const count=Math.max(0,Math.min(text.length,Math.floor(frame*speed)));
 return <>{text.slice(0,count)}{count<text.length?<span style={{color:CYAN,opacity:Math.floor(frame/8)%2?.95:.25}}>▍</span>:null}</>;
};
const Tool:React.FC<{s:Slide;handle:string;index:number}>=({s,handle,index})=>{
 const f=useCurrentFrame(),{fps}=useVideoConfig(),a=spring({frame:f-4,fps,config:{damping:13,stiffness:120}});
 const accent=index%2===0?CYAN:VIOLET, prompt=s.demoPrompt||s.body||"Try a practical task with this AI tool.", result=s.demoResult||"Illustrative output preview — not a real product result.";
 const toolName=["","ChatGPT","Perplexity","Canva AI","Gamma","NotebookLM"][s.n||1];
 return <Backdrop handle={handle} index={index}>
  <div style={{position:"absolute",top:205,left:48,right:48,bottom:115,display:"flex",flexDirection:"column",gap:14,opacity:a,transform:`translateY(${interpolate(a,[0,1],[25,0])}px)`}}>
   <div style={{height:68,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}><Eyebrow>TOOL {s.n||index} / 5</Eyebrow><div style={{fontSize:21,color:MUTED,fontWeight:800}}>INFO + SIMULATION</div></div>
   <div style={{height:670,flexShrink:0,borderRadius:28,overflow:"hidden",position:"relative",background:"#050912",border:"2px solid rgba(53,217,242,.42)",boxShadow:"0 18px 55px rgba(0,0,0,.38)"}}>
    {s.demoVideo?<Video src={staticFile(s.demoVideo)} startFrom={0} muted volume={0} loop style={{width:"100%",height:"100%",objectFit:"cover"}}/>:
     <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#101e32,#080d18)",padding:42,textAlign:"center"}}>
      <div style={{fontSize:23,color:CYAN,fontWeight:900,letterSpacing:3}}>TOP • TOOL INFORMATION</div><div style={{fontSize:48,color:WHITE,fontWeight:900,marginTop:22}}>{s.headline}</div><div style={{fontSize:28,color:MUTED,marginTop:22,lineHeight:1.4}}>{s.body}</div>
      <div style={{fontSize:19,color:"#8294AE",marginTop:28}}>Place a genuine screen recording at demos/{toolName.toLowerCase().replace(/ /g,"-")}.mp4</div>
     </div>}
    <div style={{position:"absolute",top:18,left:18,padding:"9px 15px",borderRadius:12,background:"rgba(0,0,0,.75)",color:WHITE,fontSize:19,fontWeight:900}}>▶ TOOL EXPLAINER</div>
   </div>
   <div style={{flex:1,minHeight:0,borderRadius:28,padding:"20px 25px",background:"linear-gradient(145deg,rgba(22,34,55,.98),rgba(10,17,31,.98))",border:"2px solid rgba(139,124,255,.45)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div style={{fontSize:22,color:VIOLET,fontWeight:900,letterSpacing:2}}>↓ BOTTOM • SIMULATED DEMO</div><div style={{fontSize:21,color:accent,fontWeight:900}}>{s.demoLabel||"QUICK DEMO"}</div></div>
    <div style={{fontSize:37,lineHeight:1.08,fontWeight:900,color:WHITE}}>{s.headline}</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13,marginTop:15,flex:1,minHeight:0}}>
     <div style={{borderRadius:17,padding:16,background:"#081321",border:"1px solid rgba(53,217,242,.3)",overflow:"hidden"}}><div style={{fontSize:18,color:CYAN,fontWeight:900,marginBottom:9}}>PROMPT • TYPING</div><div style={{fontSize:23,lineHeight:1.3,color:WHITE}}><TypeLine text={prompt} frame={Math.max(0,f-42)} speed={2.2}/></div></div>
     <div style={{borderRadius:17,padding:16,background:"#111329",border:"1px solid rgba(139,124,255,.35)",overflow:"hidden"}}><div style={{fontSize:18,color:VIOLET,fontWeight:900,marginBottom:9}}>AI OUTPUT • BUILDING</div><div style={{fontSize:22,lineHeight:1.3,color:"#D7DDF0"}}><TypeLine text={result} frame={Math.max(0,f-95)} speed={2.3}/></div></div>
    </div>
    <div style={{height:6,background:"#26334A",borderRadius:10,marginTop:12,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,Math.max(0,f/145*100))}%`,background:accent}}/></div>
    <div style={{fontSize:16,color:"#91A0B6",marginTop:8}}>Illustrative simulation — not an actual product screenshot or verified output</div>
   </div>
  </div>
 </Backdrop>;
};
const Cta:React.FC<{s:Slide;handle:string;index:number}>=({s,handle,index})=>{
 const {fps}=useVideoConfig(),f=useCurrentFrame(),a=spring({frame:f-4,fps});
 return <Backdrop handle={handle} index={index}><div style={{position:"absolute",top:570,left:65,right:65,textAlign:"center",opacity:a,transform:`scale(${interpolate(a,[0,1],[.9,1])})`}}><Eyebrow>MORE AI. LESS EFFORT.</Eyebrow><div style={{fontSize:82,fontWeight:900,color:WHITE,marginTop:45}}>Follow</div><div style={{fontSize:67,fontWeight:900,color:CYAN,marginTop:12}}>@aiforall.daily</div><div style={{fontSize:36,color:MUTED,marginTop:35}}>{s.body||"Daily AI tools, explained simply."}</div><div style={{display:"inline-flex",marginTop:65,padding:"22px 42px",borderRadius:999,background:CYAN,color:BG,fontSize:34,fontWeight:900}}>FOLLOW FOR MORE ↗</div></div></Backdrop>;
};
export const Reel:React.FC<ReelProps>=({slides=[],handle="@aiforall.daily",audioFile})=>{
 const {fps}=useVideoConfig(),per=Math.round(3.4*fps);
 return <AbsoluteFill style={{background:BG}}><Series>{slides.map((s,i)=><Series.Sequence key={i} durationInFrames={per}>{s.kind==="hook"?<Hook s={s} handle={handle} index={i}/>:s.kind==="cta"?<Cta s={s} handle={handle} index={i}/>:<Tool s={s} handle={handle} index={i}/>}</Series.Sequence>)}</Series>{audioFile?<Audio src={staticFile(audioFile)} volume={1}/>:null}</AbsoluteFill>;
};
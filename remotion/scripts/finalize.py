#!/usr/bin/env python3
"""Loudness-normalize the mix and mux it onto a muted Remotion render."""
import argparse, json, shutil, subprocess
from pathlib import Path
def run(args):
    r=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
    if r.returncode: raise SystemExit(r.stderr[-3000:])
    return r
def main():
    p=argparse.ArgumentParser();p.add_argument("--video",required=True);p.add_argument("--audio",required=True);p.add_argument("--output",required=True);a=p.parse_args()
    ff=shutil.which("ffmpeg")
    if not ff: raise SystemExit("ffmpeg is required")
    out=Path(a.output);out.parent.mkdir(parents=True,exist_ok=True);norm=out.with_name(out.stem+"-norm.wav")
    run([ff,"-y","-i",a.audio,"-af","loudnorm=I=-16:TP=-1:LRA=11","-ar","48000","-c:a","pcm_s16le",str(norm)])
    run([ff,"-y","-i",a.video,"-i",str(norm),"-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac","-b:a","256k","-movflags","+faststart","-shortest",str(out)])
    norm.unlink(missing_ok=True)
    print("Final Reel:",out)
if __name__=="__main__":main()

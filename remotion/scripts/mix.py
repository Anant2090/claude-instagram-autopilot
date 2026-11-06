#!/usr/bin/env python3
"""Narration + generated royalty-free ambient bed, speech ducking and stereo master."""
import argparse, wave
from pathlib import Path
import numpy as np
from scipy import signal

SR=48000
def read_wav(path):
    with wave.open(str(path),"rb") as w:
        ch=w.getnchannels(); rate=w.getframerate(); raw=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float64)/32768
    if ch>1: raw=raw.reshape(-1,ch).mean(axis=1)
    return signal.resample_poly(raw,SR,rate)
def main():
    p=argparse.ArgumentParser();p.add_argument("--voice",required=True);p.add_argument("--output",required=True);a=p.parse_args()
    voice=read_wav(a.voice); n=len(voice); dur=n/SR; t=np.arange(n)/SR
    # Original soft synth bed: warm pad + restrained pluck pulse, no external copyrighted track.
    music=np.zeros(n)
    chords=[(146.83,220.00,293.66),(110.00,164.81,220.00),(123.47,185.00,246.94),(98.00,146.83,196.00)]
    bar=60/88*4
    for i,start in enumerate(np.arange(0,dur,bar)):
        end=min(dur,start+bar); idx=(t>=start)&(t<end); local=t[idx]-start
        chord=chords[i%len(chords)]
        pad=sum(np.sin(2*np.pi*f*local) for f in chord)/3
        music[idx]+=pad*(0.018+0.012*np.sin(np.pi*np.clip(local/bar,0,1)))
    # Duck background under speech with a smoothed speech envelope.
    env=np.abs(voice)
    smooth=signal.sosfilt(signal.butter(1,4,fs=SR,output="sos"),env)
    duck=1-0.62*np.clip(smooth/0.08,0,1)
    music*=duck
    stereo=np.stack([voice+music,voice+music],axis=1)
    peak=np.max(np.abs(stereo))+1e-9
    stereo=stereo/peak*0.88
    out=Path(a.output);out.parent.mkdir(parents=True,exist_ok=True)
    with wave.open(str(out),"wb") as w:
        w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((stereo*32767).astype(np.int16).tobytes())
    print(f"Mixed {dur:.2f}s audio, peak limited to -1.1 dBFS")
if __name__=="__main__":main()

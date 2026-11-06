#!/usr/bin/env python3
"""Cartesia narration with word timestamps, adapted from the second repo's audio workflow."""
import argparse, base64, json, os, urllib.error, urllib.request, wave
from pathlib import Path

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--input",required=True); p.add_argument("--output",required=True)
    p.add_argument("--language",required=True)
    a=p.parse_args()
    data=json.loads(Path(a.input).read_text(encoding="utf-8"))
    key=os.environ["CARTESIA_API_KEY"]; voice=os.environ["CARTESIA_VOICE_ID"]
    body={"model_id":"sonic-3.5","transcript":data["narration"],
          "voice":{"mode":"id","id":voice},"language":a.language,
          "output_format":{"container":"raw","encoding":"pcm_s16le","sample_rate":44100},
          "add_timestamps":True}
    req=urllib.request.Request("https://api.cartesia.ai/tts/sse",data=json.dumps(body).encode(),
        headers={"X-API-Key":key,"Cartesia-Version":"2024-11-13","Content-Type":"application/json"})
    pcm=bytearray(); words=[]
    try:
        response=urllib.request.urlopen(req,timeout=180)
    except urllib.error.HTTPError as e:
        # Print the provider's response body, but never print request headers or secrets.
        details=e.read().decode("utf-8",errors="replace")
        print(f"Cartesia HTTP {e.code} response: {details}")
        raise
    with response as res:
        for raw in res:
            line=raw.decode("utf-8").strip()
            if not line.startswith("data:"): continue
            event=json.loads(line[5:].strip())
            if event.get("type")=="chunk" and event.get("data"): pcm.extend(base64.b64decode(event["data"]))
            elif event.get("type")=="timestamps":
                ts=event["word_timestamps"]
                words=[{"word":w,"start":float(s),"end":float(e)} for w,s,e in zip(ts["words"],ts["start"],ts["end"])]
    if not pcm:
        raise RuntimeError("Cartesia returned no audio data.")
    out=Path(a.output); out.parent.mkdir(parents=True,exist_ok=True)
    with wave.open(str(out),"wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(44100); w.writeframes(bytes(pcm))
    out.with_suffix(".words.json").write_text(json.dumps(words,ensure_ascii=False,indent=2),encoding="utf-8")
    print(f"Cartesia audio: {len(pcm)/88200:.2f}s; {len(words)} word timestamps")

if __name__=="__main__": main()

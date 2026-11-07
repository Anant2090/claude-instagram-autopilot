#!/usr/bin/env python3
"""Generate Cartesia narration as raw PCM WAV, following the known-working bytes API path."""
import argparse, json, os, urllib.error, urllib.request, wave
from pathlib import Path

API = "https://api.cartesia.ai"
VERSION = "2024-11-13"
MODEL = "sonic-3.5"

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--input",required=True); p.add_argument("--output",required=True)
    p.add_argument("--language",required=True)
    a=p.parse_args()
    data=json.loads(Path(a.input).read_text(encoding="utf-8"))
    key=os.environ["CARTESIA_API_KEY"]
    voice=os.environ["CARTESIA_VOICE_ID"]
    transcript=data.get("narration")
    if not isinstance(transcript,str) or not transcript.strip():
        raise ValueError("Input JSON must contain a non-empty narration string.")

    body={
        "model_id":MODEL,
        "transcript":transcript,
        "voice":{"mode":"id","id":voice},
        "language":a.language,
        "output_format":{"container":"raw","encoding":"pcm_s16le","sample_rate":44100},
    }
    req=urllib.request.Request(
        API+"/tts/bytes",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "X-API-Key":key,
            "Cartesia-Version":VERSION,
            "Content-Type":"application/json",
            "Accept":"application/octet-stream",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req,timeout=180) as res:
            pcm=res.read()
            print(f"Cartesia response: HTTP {res.status}; received {len(pcm)} audio bytes")
    except urllib.error.HTTPError as e:
        details=e.read().decode("utf-8",errors="replace")
        print(f"Cartesia HTTP {e.code} response: {details[:4000]}")
        raise

    if not pcm:
        raise RuntimeError("Cartesia returned an empty audio response.")
    if len(pcm)%2:
        raise RuntimeError(f"Cartesia returned invalid 16-bit PCM byte length: {len(pcm)}")

    out=Path(a.output)
    out.parent.mkdir(parents=True,exist_ok=True)
    with wave.open(str(out),"wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(44100)
        w.writeframes(pcm)
    # The current Reel composition does not consume word-level timestamps.
    out.with_suffix(".words.json").write_text("[]",encoding="utf-8")
    print(f"Cartesia audio written: {len(pcm)/88200:.2f}s")

if __name__=="__main__":
    main()

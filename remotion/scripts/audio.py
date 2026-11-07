#!/usr/bin/env python3
"""Generate Cartesia narration and diagnose API-edge connectivity failures."""
import argparse, json, os, urllib.error, urllib.request, wave
from pathlib import Path

API = "https://api.cartesia.ai"
VERSION = "2024-11-13"
MODEL = "sonic-3.5"

def request(url, key, body=None):
    headers = {
        "X-API-Key": key,
        "Cartesia-Version": VERSION,
        "Content-Type": "application/json",
    }
    if body is not None:
        headers["Accept"] = "application/octet-stream"
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8") if body is not None else None,
        headers=headers,
        method="POST" if body is not None else "GET",
    )
    return urllib.request.urlopen(req, timeout=180)

def report_http_error(label, error):
    body = error.read().decode("utf-8", errors="replace")
    print(f"{label}: HTTP {error.code}")
    for header in ("server", "via", "x-cache", "x-amz-cf-id", "x-amz-cf-pop"):
        value = error.headers.get(header)
        if value:
            print(f"{header}: {value}")
    print(f"Response body: {body[:2500]}")

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

    # Check the authenticated API host separately from the TTS POST.
    try:
        with request(API+"/voices", key) as health:
            print(f"Cartesia API preflight: HTTP {health.status}")
            health.read(256)
    except urllib.error.HTTPError as e:
        report_http_error("Cartesia API preflight failed", e)
        raise RuntimeError(
            "Cartesia's API host rejected the simple /voices request. "
            "This is an API-edge/network/account-access issue, not a narration payload issue."
        ) from e
    except Exception as e:
        raise RuntimeError(f"Could not reach Cartesia API preflight: {type(e).__name__}: {e}") from e

    body={
        "model_id":MODEL,
        "transcript":transcript,
        "voice":{"mode":"id","id":voice},
        "language":a.language,
        "output_format":{"container":"raw","encoding":"pcm_s16le","sample_rate":44100},
    }
    try:
        with request(API+"/tts/bytes", key, body) as res:
            pcm=res.read()
            print(f"Cartesia TTS response: HTTP {res.status}; received {len(pcm)} audio bytes")
    except urllib.error.HTTPError as e:
        report_http_error("Cartesia TTS request failed", e)
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
    out.with_suffix(".words.json").write_text("[]",encoding="utf-8")
    print(f"Cartesia audio written: {len(pcm)/88200:.2f}s")

if __name__=="__main__":
    main()

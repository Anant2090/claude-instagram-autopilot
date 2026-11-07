#!/usr/bin/env python3
"""Generate Cartesia narration, falling back to free local eSpeak only if preflight fails."""
import argparse
import json
import os
import shutil
import subprocess
import urllib.error
import urllib.request
import wave
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
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8") if body is not None else None,
        headers=headers,
        method="POST" if body is not None else "GET",
    )
    return urllib.request.urlopen(req, timeout=45)


def report_http_error(label, error):
    body = error.read().decode("utf-8", errors="replace")
    print(f"{label}: HTTP {error.code}")
    for header in ("server", "via", "x-cache", "x-amz-cf-id", "x-amz-cf-pop"):
        value = error.headers.get(header)
        if value:
            print(f"{header}: {value}")
    print(f"Response body: {body[:1200]}")


def write_espeak(transcript, language, output):
    executable = shutil.which("espeak-ng") or shutil.which("espeak")
    if not executable:
        raise RuntimeError("Cartesia preflight failed and espeak-ng is not installed.")
    voice = "hi" if language.lower().startswith("hi") else "en"
    out = Path(output)
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [executable, "-v", voice, "-s", "150", "-w", str(out), transcript],
        check=True,
    )
    with wave.open(str(out), "rb") as wav:
        if wav.getnframes() == 0:
            raise RuntimeError("eSpeak generated an empty WAV file.")
    out.with_suffix(".words.json").write_text("[]", encoding="utf-8")
    print(f"Used local eSpeak ({voice}) fallback; no Cartesia TTS request was sent.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--language", required=True)
    parser.add_argument(
        "--fallback-espeak",
        action="store_true",
        help="Use local eSpeak only when Cartesia's non-billable /voices preflight fails.",
    )
    args = parser.parse_args()

    data = json.loads(Path(args.input).read_text(encoding="utf-8"))
    transcript = data.get("narration")
    if not isinstance(transcript, str) or not transcript.strip():
        raise ValueError("Input JSON must contain a non-empty narration string.")

    key = os.environ.get("CARTESIA_API_KEY", "").strip()
    voice = os.environ.get("CARTESIA_VOICE_ID", "").strip()
    if not key or not voice:
        if args.fallback_espeak:
            print("Cartesia credentials are not configured; using local eSpeak.")
            write_espeak(transcript, args.language, args.output)
            return
        raise RuntimeError("CARTESIA_API_KEY and CARTESIA_VOICE_ID are required.")

    # This GET is a non-TTS connectivity/authentication check. Do not send a
    # potentially billable synthesis request unless it succeeds.
    try:
        with request(API + "/voices", key) as health:
            print(f"Cartesia API preflight: HTTP {health.status}")
            health.read(256)
    except Exception as error:
        if isinstance(error, urllib.error.HTTPError):
            report_http_error("Cartesia API preflight failed", error)
        else:
            print(f"Cartesia API preflight failed: {type(error).__name__}: {error}")
        if args.fallback_espeak:
            write_espeak(transcript, args.language, args.output)
            return
        raise RuntimeError("Cartesia preflight failed; no TTS request was sent.") from error

    body = {
        "model_id": MODEL,
        "transcript": transcript,
        "voice": {"mode": "id", "id": voice},
        "language": args.language,
        "output_format": {
            "container": "raw",
            "encoding": "pcm_s16le",
            "sample_rate": 44100,
        },
    }
    # Intentionally do not retry or silently fall back after this POST: its
    # billing outcome could be ambiguous if the connection drops mid-request.
    try:
        with request(API + "/tts/bytes", key, body) as response:
            pcm = response.read()
            print(
                f"Cartesia TTS response: HTTP {response.status}; "
                f"received {len(pcm)} audio bytes"
            )
    except urllib.error.HTTPError as error:
        report_http_error("Cartesia TTS request failed", error)
        raise

    if not pcm:
        raise RuntimeError("Cartesia returned an empty audio response.")
    if len(pcm) % 2:
        raise RuntimeError(f"Cartesia returned invalid 16-bit PCM byte length: {len(pcm)}")

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(output), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(44100)
        wav.writeframes(pcm)
    output.with_suffix(".words.json").write_text("[]", encoding="utf-8")
    print(f"Cartesia audio written: {len(pcm) / 88200:.2f}s")


if __name__ == "__main__":
    main()

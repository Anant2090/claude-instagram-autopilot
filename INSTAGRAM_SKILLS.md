# Instagram Agent Skills — setup and operating guide

This repository uses the MIT-licensed skill pack from:
https://github.com/Jakeschincariol/instagram-agent-skill

The workflow pins upstream commit:
`d03c56bb598be770c60b201f94237e5d1a4268a6`

## What happens in GitHub Actions

Run **Actions → Generate English and Hindi Reels with Instagram Agent Skills → Run workflow**.

The job:
1. Installs the 13 upstream `ig-*` Claude skills into project-local `.claude/skills/`.
2. Loads the account voice profile from `auto-generate/voice.md`.
3. Asks Claude to use `/ig-reel`, `/ig-human` and `/ig-caption` for English and Hindi scripts.
4. Validates the seven-slide data structure.
5. Runs the local hook scorer, beat estimator, humanizer, writing-quality panel and caption linter.
6. Generates narration, mixes audio, renders the two Remotion videos and uploads videos, captions and quality reports as one artifact.

The job is manual by design. It does not publish to Instagram or send comments/DMs.

## Required GitHub secret

- `ANTHROPIC_API_KEY`: required for Claude script generation.

Optional:
- `CARTESIA_API_KEY` and `CARTESIA_VOICE_ID`: Cartesia voice is attempted only after its non-TTS `/voices` preflight succeeds. If the preflight fails, local eSpeak narration is used. A failed synthesis POST is not retried.

## Use the skills locally with Claude Code

On Windows PowerShell, from the repository root:

```powershell
.scriptsinstall-instagram-skills.ps1
```

Then open Claude Code in this repository. Example prompts:

```text
/ig-plan
/ig-reel 5 AI tools that help engineering students
/ig-carousel 7 free AI tools for job seekers
/ig-caption
/ig-profile
/ig-audit
/ig-human
```

For `/ig-viral`, manually inspect a small set of relevant public accounts and capture the details requested by the skill. Do not automate scraping or log into Instagram through a bot.

## Skill map

- `/ig-reel`: hook options, script and timed beat sheet.
- `/ig-viral`: manually researched examples and swipe file.
- `/ig-caption`: caption draft and local lint.
- `/ig-carousel`: carousel copy and image output.
- `/ig-story`: story sequence and sticker plan.
- `/ig-profile`: profile review from screenshots or supplied text.
- `/ig-plan`: weekly content plan.
- `/ig-human`: clean text and run the five-signal writing heuristic.
- `/ig-comment`: draft comments for posts you provide.
- `/ig-reply`: triage and draft replies from supplied comments.
- `/ig-dm`: draft DMs; you send them manually.
- `/ig-repurpose`: extract posts from a video, article or transcript.
- `/ig-audit`: analyze Instagram Insights you provide.

## Important limits

- The hook and human scores are heuristics, not guarantees of reach or AI-detector verdicts.
- The `beats.py` tokenizer is English-oriented; its timing output is not a reliable Hindi timing measurement.
- `/ig-viral` needs manually collected examples. GitHub Actions does not log into Instagram or scrape it.
- No automatic posting, commenting, following or unsolicited DMs are enabled.
- Review all current product facts, scripts, captions and generated videos before publishing.

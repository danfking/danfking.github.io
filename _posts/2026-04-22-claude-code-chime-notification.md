---
layout: post
title: "Small productivity hack that changed how I work with Claude Code"
date: 2026-04-22
tags: [claude-code, productivity, ai, developer-tools]
---

I typically have half a dozen Claude Code sessions running at once, spread across different terminals and monitors, some hidden behind other windows. The visual "done" indicator is easy to miss when you're not looking at the right terminal.

About a month ago I added a global hook that plays a short chime whenever any session finishes a task. Two minutes to configure. Can't live without it now.

The difference is about flow. Before, I'd either stare at a terminal waiting, or context-switch and then keep interrupting myself to check which session was ready. Now the chime pulls me back at exactly the right moment. I stay in whatever I'm doing until I hear it, then go find the session that needs me. It's kept me in a flow state in a way I genuinely didn't expect from something so simple.

## How to set it up

Drop this into your `~/.claude/settings.json`:

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -NoProfile -Command \"(New-Object Media.SoundPlayer 'C:\\Windows\\Media\\chimes.wav').PlaySync()\""
          }
        ]
      }
    ]
  }
}
```

That's it. Windows has the sound file built in. For Mac/Linux, swap the command for `afplay` or `paplay` with a sound file of your choice.

The empty matcher means it fires on every notification, regardless of which project or session triggered it. Claude Code sends a notification whenever a session finishes and is waiting for input, which is exactly the moment you want to know about.

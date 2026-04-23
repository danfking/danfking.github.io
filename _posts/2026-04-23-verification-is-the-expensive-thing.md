---
layout: post
title: "Verification is the expensive thing now"
date: 2026-04-23
tags: [agentic-development, ai, engineering-culture]
---

Martin Fowler's [latest fragments post](https://martinfowler.com/fragments/2026-04-02.html) collects several ideas about how AI is reshaping software development. The one that stuck with me is Ajey Gore's argument: as coding agents take over execution, verification becomes the premium activity.

Gore puts it bluntly. Instead of ten engineers building, you might have three engineers plus seven people defining acceptance criteria and designing tests. The bottleneck moves from "can we write the code?" to "do we know whether the code is right?"

This matches what I see daily. I run multiple Claude Code sessions in parallel, each producing working code at a pace I couldn't match alone. The hard part is never the generation. The hard part is knowing whether what came out actually does what I intended, handles the edges I care about, and doesn't quietly break something else. And it's not just me who needs to know. My team members need to look at that same output and reach the same confidence, often without the context I had when I prompted it.

The cultural shift Gore describes is the part most teams will struggle with. Your Monday standup changes. Instead of "what did we ship?" the question becomes "what did we validate?" Instead of tracking output, you're tracking whether the output was right. That reframes what it means to be productive. An engineer who catches a subtle misalignment in generated code before it ships has done more valuable work than one who prompted three features into existence without checking them.

This connects to something else Fowler highlights in the same post: Margaret-Anne Storey's concept of "intent debt," where the goals guiding a system are poorly documented or maintained. If you can't clearly articulate what the system should do, you can't verify that it does it. Intent debt was always a problem, but it was partially hidden when the same person writing the code also held the intent in their head. When an agent writes the code, that implicit knowledge gap becomes a concrete failure mode.

I think the teams that figure out verification workflows early will have a real advantage. Not just automated tests (though those matter), but the whole practice of clearly stating intent, reviewing output critically, and building confidence that what shipped is what was meant.

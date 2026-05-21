---
layout: post
title: "Continuous Development still has prerequisites"
date: 2026-05-20
tags: [agentic-development, engineering-culture, continuous-delivery, ai]
---

There's a pattern showing up in how teams talk about agentic coding. The agent writes code fast, faster than any of us could alone, so the next move feels obvious: ship it fast too. Out come the words that used to mark a mature engineering org. Trunk-based development. Feature flags. Continuous delivery, many releases a day. The reasoning goes that if generation is no longer the bottleneck, the release process shouldn't be either.

I understand the pull. But most teams reaching for that machinery haven't built the things that make it safe. They're trying to adopt the destination without the road that gets you there.

Continuous Development is a set of practices that lean on each other, and they were never free. Jez Humble and Dave Farley wrote a whole book about the discipline that has to sit under a fast release. The [DORA research](https://dora.dev/capabilities/continuous-delivery/) that followed, led by Nicole Forsgren, makes the empirical case: the strongest teams release more often and break things less, because the underlying practices make speed and stability climb together rather than trade off.

[Trunk-based development](https://dora.dev/capabilities/trunk-based-development/) assumes a green main and small, frequent, reviewed commits. It falls apart the moment people start landing large unreviewed changes, and agents make large changes trivially easy to produce. Without that discipline, trunk-based dev is just everyone breaking main faster.

Feature flags assume a lifecycle, the kind [Pete Hodgson spells out](https://martinfowler.com/articles/feature-toggles.html): someone owns each flag, release flags get retired once the feature beds in, dead ones get removed. The failure mode I see most often is subtler than forgetting to clean up: too many long-running features in flight at once. Each live flag forks the system's behaviour, and flags combine. Three half-finished features means eight possible states, every one a configuration someone has to keep working and verify before anything ships. That compatibility burden flows downstream and drags on the pipeline, the opposite of the speed the flags were supposed to buy. Skip the discipline altogether and flags stop being a safety mechanism and turn into a second debt pile layered on the first.

Fast releases assume observability and a quick rollback. Ship many times a day with neither and you've optimised for shipping bugs faster while detecting them slower.

And all of it assumes a test suite you actually trust. If you can't tell whether a change is correct without a human reading it carefully, you don't have continuous anything. You have a queue of changes waiting on the expensive step.

Here's the part I find genuinely interesting. The same agents driving the rush can build these foundations fast. Ask Claude Code to add structured logging, wire up flag cleanup, or write the rollback runbook, and it does. The capability that makes people want to skip the discipline is the same one that makes it cheap to acquire.

Testing is the clearest example, and it comes with a catch. Agents are very good at covering code that already exists, and they sit well with the test pyramid. Unit tests give the best return, quick to generate and cheap to run. Integration tests come next, still strong. User-facing tests are where they struggle, because driving a real UI is slow and the assertions are brittle. A suite that leans heavily on UI tests is the worst case twice over: the layer the agent helps least with, and the slow, flaky one a continuous pipeline can least afford. Lean on the top of the pyramid and CD will fight you, agent or not.

But only if you ask. The agent builds what you point it at, and most people are pointing it at features. The foundation work doesn't happen unless someone decides it matters and frames the questions that lead there. That's a culture problem, not a tooling one. A team that values a green main and a trustworthy suite will use the agent to protect both. A team that only counts features shipped will use the same agent to pile features onto a foundation that's quietly cracking.

This reframes what experience is for. You no longer need twenty years behind you to stand up a CD pipeline; the agent wires up the mechanics for someone who has never built one. What twenty years buys is different: knowing which questions to ask before you start, and checking the first-principle assumptions the setup quietly rests on. The experienced engineer spots the blank spaces and the assumptions that don't hold, the "we'll add rollback later," the test that asserts nothing, the flag no one will ever turn off. Those are cheap to fix now and genuinely expensive to discover in production. That instinct is the part you still have to bring. Ask the agent the right question and it will reason about any of them as well as anyone. It just won't raise what you didn't think to ask.

So the order matters more than ever, not less. Build the hygiene first, or build it alongside, but build it. The agent will happily help you go fast in either direction, including the wrong one.

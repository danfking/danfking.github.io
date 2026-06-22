---
layout: post
title: "Pinning what we couldn't pin: the case for investing in agentic tooling"
date: 2026-06-16
tags: [agentic-development, claude-code, engineering-culture, developer-tools]
---

Last week I attributed a measured performance improvement on a platform I work on to a specific sequence of technical components. That sounds unremarkable until you know I had been circling the same question for years.

The question was not new. Several capable people had taken runs at it over the years. The barrier was never a missing hypothesis. The barrier was the loop. Each hypothesis needed a prototype, a deploy to an environment shaped like production, a load test, an observation, a decision, and a retry. Doing that loop once by hand costs a day. Doing it ten times for a multi-component sequence costs a quarter no one has.

The reason I could do it this time was not that I got smarter. It was that I had spent a couple of months building a composed agentic stack underneath my workflow. Three layers.

The first layer is a Claude Code plugin with skills and hooks. Hooks enforce the rules I care about at the boundary: commit messages, file paths, safety checks, formatting. Skills encode the repeatable steps of the work my team actually does. Together they turn a clever assistant into a reliable operator. The agent stops making things up at the parts that matter, because the predictable glue catches it before the work leaves my workspace.

The second layer is an MCP server that exposes the product's own functionality to the agent. The agent can create test data, run a probe, configure a feature, query an internal endpoint, by calling the product's own API surface rather than driving a browser. The difference is the difference between an agent that pretends to use the system and an agent that actually does.

The third layer is MCP servers and CLIs for cloud integration. The agent can scale a dev environment up, deploy a candidate, tail logs, fetch metrics, scale back down, with the same guardrails I have as the human operator. Reversible by default, audited by the cloud provider's own controls.

With those three layers in place, three things compound.

First, the loop that used to cost a day costs an hour. Ten iterations becomes doable. A multi-component sequence becomes solvable.

Second, the loop can run when I am not at the desk. I scheduled long-running analyses to run overnight while I was offline, and I came back in the morning to results rather than to the queue of work I had left behind.

Third, the loop is repeatable. The same automated process that helped me find the answer will check the productised fix when the dev team ships it. I do not have to rebuild the environment, rewrite the load test, or re-derive the measurements. I can confirm the requirements are met in the same complex setup without much extra work.

That third one is the one that matters most for the investment case. Each layer alone is interesting. The three together compound across the whole lifecycle: faster discovery, work that runs off-hours, and cheap re-checking when the fix lands.

Investing in agentic tooling is not investing in a single product. It is investing in the predictable glue, the product MCP, and the cloud integration as a stack. The engineers who get to use that stack will solve problems the team has been carrying for years, and will keep checking those fixes cheaply every time they ship in a complex environment.

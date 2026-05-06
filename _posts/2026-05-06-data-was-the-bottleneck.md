---
layout: post
title: "I trained a sprite model with agents. The data was the bottleneck."
date: 2026-05-06
tags: [agentic-development, ai, machine-learning]
---

I just published [pixel-llm](https://github.com/danfking/pixel-llm), a small autoregressive transformer that generates 32x32 pixel art sprites of reef sea creatures. About 2.9 million parameters, a 64-colour palette, runs on consumer hardware. Built end to end through agent sessions, with me steering rather than typing.

The output is sub-par. I am sharing it anyway, because the way it failed taught me something I did not expect.

The setup was narrow on purpose. I picked sea creatures because the visual vocabulary is constrained: a few zones (shallows, twilight, midnight, abyss, hadal) and a few categories (reef fish, grazer, coral, jellyfish, cephalopod, plus an abyssal catch-all). A small, well-defined domain felt like the right shape for a small model. Six categories, five zones, thirty cells in the grid. Tractable on paper.

The model itself fell out fast. Agents wrote the transformer, the KV-cache inference loop, the sprite breeding via partial completion, and the post-process palette-aware shader. That last piece is the strongest output. The model produces flat colour-indexed sprites and a separate procedural shader applies directional light and ambient occlusion, staying inside the 64-colour palette by walking pre-computed luminance ramps.

![Flat versus shaded sprites across zones and categories](https://raw.githubusercontent.com/danfking/pixel-llm/main/docs/samples/shading_comparison.png)

When the categories worked, you can see what I was after. When they did not, you can see that too: two of the six categories (cephalopod and one abyssal column) never converged. Pure noise, regardless of sampling temperature.

I iterated the training data four times. A procedural synthetic generator. Wikimedia Commons photographs, downloaded and palette-quantised. Sprite sheet extraction from OpenGameArt. A mixed corpus stitched together from all three. The validation loss kept going down. The samples for those two categories kept looking wrong. The other four held up well enough to look at.

That is the part I want to flag. Loss is not taste. The agentic loop has a fast, local correctness signal for the code: does it run, does the loss go down, does it not crash. It does not have a corresponding signal for the data. Whether a corpus is the right shape for a problem is a slow, aesthetic judgment that arrives after a training run, after staring at sample grids, after a cycle measured in hours rather than seconds. Agents cannot close that loop on their own yet.

So the work split cleanly. The model code, training scaffold, sampler, breeder, and shader were straightforward agent output. The data choices were the part where I had to keep showing up.

This connects back to something I [wrote about in April]({% post_url 2026-04-23-verification-is-the-expensive-thing %}). When agents take over execution, the premium activity is the layer above. For a coding agent that layer is verification. For a research-flavoured agent loop, it is data curation: deciding what the model should see, recognising when the existing corpus is wrong, and recognising when the iteration has hit its ceiling.

Knowing when to stop is itself the call. After the fourth dataset I judged that the agentic loop had run out of useful moves for this architecture. The next step would not be more data, it would be a different model shape. I called time, wrote the README honestly, and shipped.

The repo is up at [github.com/danfking/pixel-llm](https://github.com/danfking/pixel-llm) with the sample images and a fuller writeup. The interesting thing in there is not the trained model. It is the trail.

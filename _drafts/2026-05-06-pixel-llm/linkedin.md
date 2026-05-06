I trained a sprite model with agents. The data was the bottleneck.

I just open-sourced pixel-llm, a tiny ~2.9M parameter transformer that generates 32x32 pixel art sprites of reef sea creatures. Built end to end through agent sessions, with me steering rather than typing.

The output is sub-par. The way it failed is the part worth sharing.

Agents handled the model code cleanly: the transformer, KV-cache inference, sprite breeding, palette-aware shading. All of it fell out fast.

What broke the loop was the data. Four iterations of the training corpus (synthetic, Wikimedia, sprite sheets, mixed). Two of the six categories never converged. Validation loss kept dropping. The samples kept looking wrong.

Three observations:

• Agents are strongest where the correctness signal is fast and local. Loss going down, code not crashing.
• Agents are weakest where the signal is slow and aesthetic. Whether a corpus is the right shape for the problem.
• Knowing when to stop is part of the work. I called time after the fourth dataset.

Repo and full writeup: https://github.com/danfking/pixel-llm

#agenticdevelopment #ai #machinelearning

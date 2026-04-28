# The Sanctum Memory 🧠

Agent persistence is what makes Lore Sanctum feel like a "live" ecosystem.

## 💾 Persistent Consciousness
Every agent in a campaign has a private memory file located in:
`campaigns/[your-campaign]/sanctum/[agent-id]/memory.md`

When you talk to an agent, the backend automatically retrieves their past memories and injects them as a "System Context". This allows the Chronicler to "remember" that you prefer certain styles or that the Weaver knows your players hate spiders.

## 🤖 The "Auto-Save" Philosophy
Lore Sanctum utilizes **Native Function Calling**. This is the core of its autonomy.

*   **Autonomous Writing:** When an agent says "I'm updating the wiki page for NPC Kael", they aren't just lying (the common AI hallucination). They are calling a tool (`save_file`) that actually writes to your disk.
*   **Success Toasts:** Every time an agent successfully interacts with your files or memory, a notification appears on the UI.
*   **Safety Sandboxing:** Agents are restricted to their campaign folder. They cannot access your system files or other campaigns.

---

**Next Up:** [Advanced Customization & Skills](06-Advanced-Customization)

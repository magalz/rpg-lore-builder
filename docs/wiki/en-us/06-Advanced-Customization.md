# Advanced Customization ⚙️

Lore Sanctum is designed to be modular. If you are a power user or a developer, you can create your own agents and rituals.

## 📂 The Campaign Sandbox
Your campaign structure looks like this:
*   `wiki/`: The main data.
*   `raw/`: Source materials.
*   `sanctum/`: Agent memories.
*   `schema/`: (Coming soon) Formatting rules.

## 🎨 Creating a New Agent/Skill
Agents are defined in the `skills/` folder of the project root.
To create a new agent:
1.  Create a folder named `rlb-agent-[name]`.
2.  Add a `SKILL.md` file. Use YAML frontmatter for the name and description.
3.  **Dynamic Tags:** Use `{CAMPAIGN_ROOT}` and `{WIKI_PATH}` in your instructions. The engine will automatically replace these with the correct paths for the active campaign.
4.  **Tools:** Declare that the agent should use tools like `save_file` or `read_file`.

## 🔄 Custom Workflows
Workflows are similarly defined in `rlb-workflow-[name]`. They usually contain a `references/` folder with step-by-step procedures (`01-phase.md`, `02-phase.md`, etc.).

---

**Congratulations!** You are now a Master of the Lore Sanctum.
[Back to Home](Home)

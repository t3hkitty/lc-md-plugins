# Library Companion MD (LC-MD) Plugin Developer Guide (=^･ω･^=)

Welcome to the official FOSS plugin registry for **anymd / LC-MD v3.8 Sovereign**! This repository hosts all default and community-contributed plugins. Below is the blueprint for extending existing modules, spawning creative surprises, and standing up your own custom plugin registry servers.

```
      /\_/\
     ( >.< )  *clinks keys*
      > 🐾 <
```

---

## 🛠️ How to Extend & Enhance Existing Plugins

Every plugin implements the `LcmdPlugin` interface defined in `src/types/plugins.ts`. You can directly import existing structures and add handlers.

### 💡 Unplanned/Experimental Plugin Ideas to Build

1. **🐱 Cheesy Cat Soundscape (`CheesyCatSoundscapePlugin`)**:
   - *Concept*: Plays soft, procedurally generated purring, white noise, or rain soundscapes based on user keyboard typing frequency.
   - *Hook to leverage*: Use a keypress listener inside the editor focus cycle, adjusting local audio gain dynamically based on activity.

2. **🧠 Brain-Dump Timer / Drift Guard (`DriftGuardPlugin`)**:
   - *Concept*: Watches if you have been idling inside the editor with the cursor in a specific vault node. If inactive for more than 5 minutes, it spawns a supportive ASCII companion modal suggesting a 2-minute raw microlog to dump current thought patterns.

3. **🗺️ Interactive 3D Zettelkasten Graph (`WebGlZettelGraphPlugin`)**:
   - *Concept*: Parses local wiki-links (`[[Note Name]]`) dynamically at build time and renders an interactive canvas force-directed graph. Clicking nodes navigates the app's workspace directly to that target note.

---

## 🌐 How to Build & Host Your Own Plugin Repository

To host custom plugins that others can add to their settings:

### 1. Create a `repository.json` File
In your GitHub repo (or web server), host a JSON file structured like this:

```json
{
  "name": "My Custom Kawaii Plugin Registry",
  "author": "YourName",
  "license": "FOSS",
  "description": "Custom extensions for anymd",
  "plugins": [
    {
      "id": "my-custom-plugin",
      "name": "Super Kawaii Custom UI",
      "version": "1.0.0",
      "author": "YourName",
      "description": "Alters the workspace headers to feature interactive custom cat indicators.",
      "enabledByDefault": false,
      "sourceUrl": "https://raw.githubusercontent.com/username/my-repo/main/myPlugin.js"
    }
  ]
}
```

### 2. Register Your Custom Repo in `anymd` Settings
1. Navigate to the **Plugin Manager** panel in settings.
2. Under "External Registries", enter the URL to your `repository.json` (e.g., `https://raw.githubusercontent.com/username/my-repo/main/repository.json`).
3. Click **Add Registry**. The app will fetch the JSON, parse the metadata, and instantly display your plugins in the local list!

*Go ahead and experiment. Happy coding!*

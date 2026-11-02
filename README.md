# CHISHTI BRO: PAKISTAN OPEN WORLD

A playable browser-based 3D open-world prototype set in a fictional modern Pakistani city inspired by Islamabad, Lahore and Karachi.

## Features
- Third-person walking and driving
- Enter/exit the player car (`E`)
- Procedural city blocks, roads, streetlights and buildings
- Ambient traffic vehicles
- Mission checkpoints, rewards and HUD
- Minimap, speedometer, health and cash display
- Python launcher for local play
- GitHub Actions workflow for a Windows EXE build

## Run locally
1. Install Python 3.10 or newer.
2. Run `python launcher.py`.
3. The game opens in your browser at `http://127.0.0.1:8765`.

The first run needs an internet connection to load Three.js from its CDN.

## Controls
- `W A S D` or arrow keys: move / drive
- Mouse: look around
- `E`: enter or exit your car
- `Shift`: sprint
- `Space`: handbrake while driving
- `M`: toggle map
- `Esc`: pause

## Build Windows EXE
Push this repository to GitHub. The workflow `.github/workflows/build-windows.yml` builds a Windows executable and uploads it as a workflow artifact. You can also download the artifact from the Actions run.

The EXE is a Python launcher that starts the local game server and opens the game in your default browser. It is not a standalone native 3D renderer.

## Notes
This is a playable procedural prototype, not a photorealistic AAA game. It uses generated geometry and lighting, with no paid game assets. For best visuals use a modern desktop browser with WebGL enabled.

---
description: Sync all PWA icons from apple-touch-icon.png source
---

# Icon Sync Workflow

Regenerates all favicon and PWA assets from `public/apple-touch-icon.png`.

## Steps

1. Ensure dependencies are installed (sharp, to-ico)
2. Run the icon generation script

// turbo
```bash
node scripts/generate-pwa-icons.mjs
```

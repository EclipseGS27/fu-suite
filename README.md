# Fabula Ultima Suite

Everything for running Fabula Ultima in Foundry VTT with the Project FU system, installed with one manifest URL and opened from one button. For Foundry v13 and Project FU 4.14 or later.

## Install
In Foundry: Add-on Modules → Install Module → paste this Manifest URL:
`https://github.com/EclipseGS27/fu-suite/releases/latest/download/module.json`

Foundry then offers to install the modules the suite brings with it. Each one stays a separate module with its own updates, settings and saved data.

**Installed with the suite**
- **Battle UI**: the JRPG battle screen, command menu, party cards, scene clocks, character and party sheets.
- **Victory Screen**: results after every battle, with combat and support stats, titles, records and rewards.
- **Shop & Economy**: shops on any merchant: buy, sell, compare gear, haggle, restock IP, the inn.
- **Projects & Downtime**: inventions by the rules and a shared downtime dashboard.
- **Advanced Class Mechanics**: Ace of Cards, Pilot vehicles on the map, Symbolist, Arcanist, Mutant, Dancer, Merchant and more.
- **Combat Simulator** (GM): plays an encounter hundreds of times before you run it.
- **Encounter Builder** (GM): balanced encounters, a creature designer, placing foes on the scene.
- **Character Creator**: step-by-step character creation.

**Optional (offered, not required)**
- **Battle Animations**: pixel-art animations for abilities, spells and attacks.
- **Living Sprites**: tokens that breathe, walk and react.
- **HD-2D Look**: depth of field, bloom, light shafts and color grading.

## Using it
- **One button**: the d20 button in the token controls, or **Shift+F**, opens the launcher: a card for every module with its main actions, its settings windows and a shortcut to its page in Configure Settings.
- **Cards follow the user**: players only see what they can use. The GM also sees the Preparation tools and the GM-only actions, and the cards of modules that are turned off or not installed (with a way to fix that).
- **The toolbar stays tidy**: the modules' own buttons (Battle UI, Shops, Downtime, Class mechanics, Battle history, Encounter Builder, Combat simulator, HD-2D) are gathered into the one button. Each user can switch this off (setting "One toolbar button", or the box at the bottom of the launcher) to get the separate buttons back.
- **Turning a module off still works**: its card says so, and everything else carries on.

The modules' keyboard shortcuts still work as before: Shift+B (Battle UI), Shift+E (Encounter Builder), Shift+H (HD-2D).

API: `game.modules.get('fu-suite').api` → `open()`, `close()`, `toggle()`, `modules` (the list the launcher shows).

Fonts: Antonio and PT Sans, SIL Open Font License (see fonts/).

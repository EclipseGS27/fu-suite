/**
 * The modules of the suite: what each card shows, what its buttons do, and which toolbar buttons it owns
 * (gathered into the one Fabula Ultima button). Every action goes through the module's own API.
 */

const controlled = () => canvas?.tokens?.controlled?.[0] ?? null;
const myActor = () => controlled()?.actor ?? game.user.character ?? null;

export const GROUPS = [
	{ id: 'play', label: 'At the table' },
	{ id: 'prep', label: 'Preparation', gm: true },
	{ id: 'look', label: 'Look and feel' },
];

export const MODULES = [
	{
		id: 'fu-battle-ui',
		title: 'Battle UI',
		icon: 'fa-solid fa-gamepad',
		group: 'play',
		repo: 'fu-battle-ui',
		blurb: 'The JRPG battle screen: turn order, command menu, party cards, scene clocks and opportunities.',
		tools: ['fbuiToggle'],
		actions: [{ label: 'Battle screen', icon: 'fa-solid fa-gamepad', key: 'Shift+B', run: (api) => api.toggle() }],
	},
	{
		id: 'fu-victory',
		title: 'Victory Screen',
		icon: 'fa-solid fa-flag-checkered',
		group: 'play',
		repo: 'fu-victory',
		blurb: 'Results after every battle: each hero\'s combat and support stats, titles, records and rewards.',
		tools: ['fuvsHistory'],
		actions: [
			{ label: 'Battle history', icon: 'fa-solid fa-book', run: (api) => api.history() },
			{ label: 'End battle', icon: 'fa-solid fa-flag-checkered', gm: true, when: () => !!game.combat?.started, run: (api) => api.endBattle() },
		],
	},
	{
		id: 'fu-shopmenu',
		title: 'Shop & Economy',
		icon: 'fa-solid fa-store',
		group: 'play',
		repo: 'fu-shopmenu',
		blurb: 'JRPG shops on any merchant: buy, sell, compare gear, haggle, restock IP and rest at the inn.',
		tools: ['fushShops'],
		actions: [{ label: 'Visit a shop', icon: 'fa-solid fa-store', run: (api) => api.pickShop() }],
	},
	{
		id: 'fu-projects',
		title: 'Projects & Downtime',
		icon: 'fa-solid fa-screwdriver-wrench',
		group: 'play',
		repo: 'fu-projects',
		blurb: 'Inventions by the rules: costs, materials, helpers, a shared downtime dashboard and finished items.',
		tools: ['fupjDowntime'],
		actions: [
			{ label: 'Downtime', icon: 'fa-solid fa-moon', run: (api) => api.open() },
			{ label: 'New project', icon: 'fa-solid fa-plus', run: (api) => api.wizard() },
		],
	},
	{
		id: 'fu-class-mechanics',
		title: 'Class Mechanics',
		icon: 'fa-solid fa-diamond',
		group: 'play',
		repo: 'fu-class-mechanics',
		blurb: 'Ace of Cards, Pilot vehicles on the map, Symbolist, Arcanist, Mutant, Dancer, Merchant and more.',
		tools: ['fucmHub'],
		actions: [{ label: 'Class mechanics', icon: 'fa-solid fa-diamond', run: (api) => api.open(myActor()) }],
	},
	{
		id: 'fu-character-creator',
		title: 'Character Creator',
		icon: 'fa-solid fa-hat-wizard',
		group: 'play',
		repo: 'fu-character-creator',
		blurb: 'Step-by-step character creation: identity, classes and skills, spells, attributes and gear.',
		tools: [],
		// players only when the GM allows it in the creator's settings
		actions: [{ label: 'Create a character', icon: 'fa-solid fa-hat-wizard', show: () => game.user.isGM || game.settings.get('fu-character-creator', 'playersCanOpen') === true, run: (api) => api.open() }],
	},
	{
		id: 'fu-encounter-builder',
		title: 'Encounter Builder',
		icon: 'fa-solid fa-dragon',
		group: 'prep',
		gm: true,
		repo: 'fu-encounter-builder',
		blurb: 'Balanced encounters for your party, a creature designer by the rules, and placing them on the scene.',
		tools: ['fueBuilder'],
		actions: [{ label: 'Build an encounter', icon: 'fa-solid fa-dragon', key: 'Shift+E', run: (api) => api.open() }],
	},
	{
		id: 'fu-combat-simulator',
		title: 'Combat Simulator',
		icon: 'fa-solid fa-chess-knight',
		group: 'prep',
		gm: true,
		repo: 'fu-combat-simulator',
		blurb: 'Plays an encounter hundreds of times before you run it: win rate, difficulty, who goes down.',
		tools: ['fucsSim'],
		actions: [{ label: 'Simulate a battle', icon: 'fa-solid fa-chess-knight', run: (api) => api.open() }],
	},
	{
		id: 'fu-animations',
		title: 'Battle Animations',
		icon: 'fa-solid fa-wand-magic-sparkles',
		group: 'look',
		optional: true,
		manifest: 'https://raw.githubusercontent.com/EclipseGS27/fu-animations/main/module.json',
		repo: 'fu-animations',
		blurb: 'Pixel-art animations for every ability, spell and attack, with impact effects and damage numbers.',
		tools: [],
		skipMenus: ['library'],
		actions: [{ label: 'Ability animations', icon: 'fa-solid fa-film', gm: true, run: (api) => api.library() }],
	},
	{
		id: 'living-sprites',
		title: 'Living Sprites',
		icon: 'fa-solid fa-person-running',
		group: 'look',
		optional: true,
		repo: 'fu-living-sprites',
		blurb: 'Tokens that breathe, walk and react: they flinch when hurt and cheer when healed.',
		tools: [],
		actions: [{ label: 'Animate the selected token', icon: 'fa-solid fa-person-running', run: (api) => api.studio(controlled()) }],
	},
	{
		id: 'fu-hd2d',
		title: 'HD-2D Look',
		icon: 'fa-solid fa-mountain-sun',
		group: 'look',
		optional: true,
		repo: 'Hd2d',
		blurb: 'Depth of field, bloom, light shafts and color grading that make any scene look like an HD-2D game.',
		tools: ['hd2d'],
		skipMenus: ['panel'],
		actions: [
			{ label: 'HD-2D panel', icon: 'fa-solid fa-sliders', run: (api) => api.open() },
			{ label: 'Turn on / off', icon: 'fa-solid fa-power-off', key: 'Shift+H', run: (api) => api.toggle() },
		],
	},
];

export const manifestOf = (m) => m.manifest ?? `https://github.com/EclipseGS27/${m.repo}/releases/latest/download/module.json`;

/** Every toolbar button the suite gathers */
export const GATHERED_TOOLS = new Set(MODULES.flatMap((m) => m.tools));

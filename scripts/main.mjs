import { GATHERED_TOOLS, MODULES } from './catalog.mjs';
import { MODULE_ID, SuiteLauncher } from './launcher.mjs';

let launcher = null;
const open = () => {
	launcher ??= new SuiteLauncher();
	launcher.render({ force: true });
	return launcher;
};
const close = () => launcher?.close();
const toggle = () => (launcher?.rendered ? close() : open());

/** Rebuild the scene controls so a change to the toolbar shows at once */
const refreshControls = () => {
	try {
		ui.controls?.render({ reset: true });
	} catch (err) {
		console.warn(`${MODULE_ID} | controls`, err);
	}
};

Hooks.once('init', () => {
	game.settings.register(MODULE_ID, 'gather', {
		name: 'One toolbar button',
		hint: 'Gather the Fabula Ultima modules\' buttons in the token controls (Battle UI, Shops, Downtime, Class mechanics, Battle history, Encounter Builder, Combat simulator, HD-2D) into the one Fabula Ultima button. Off: each module keeps its own button.',
		scope: 'client',
		config: true,
		type: Boolean,
		default: true,
		onChange: () => {
			refreshControls();
			if (launcher?.rendered) launcher.render();
		},
	});
	game.keybindings.register(MODULE_ID, 'open', {
		name: 'Open the Fabula Ultima launcher',
		editable: [{ key: 'KeyF', modifiers: ['Shift'] }],
		onDown: () => {
			toggle();
			return true;
		},
	});
	game.modules.get(MODULE_ID).api = { open, close, toggle, modules: MODULES };
});

/*
 * Registered at "ready" so it runs after every module has added its own buttons: it can then take theirs out
 * of the token (and lighting) controls and put the one Fabula Ultima button in their place.
 */
Hooks.once('ready', () => {
	Hooks.on('getSceneControlButtons', (controls) => {
		try {
			const gather = game.settings.get(MODULE_ID, 'gather') !== false;
			for (const key of ['tokens', 'lighting']) {
				const group = controls[key];
				if (!group?.tools || Array.isArray(group.tools)) continue;
				if (gather) for (const name of GATHERED_TOOLS) delete group.tools[name];
			}
			const tokens = controls.tokens ?? controls.token;
			if (tokens?.tools && !Array.isArray(tokens.tools)) {
				tokens.tools.fuSuite = { name: 'fuSuite', title: 'Fabula Ultima (Shift+F)', icon: 'fa-solid fa-dice-d20', button: true, order: 49, visible: true, onChange: () => toggle() };
			}
		} catch (err) {
			console.warn(`${MODULE_ID} | scene control`, err);
		}
	});
	refreshControls();
});

/* Keep an open launcher current as modules' state changes (combat starting enables "End battle") */
for (const h of ['combatStart', 'deleteCombat', 'updateCombat']) Hooks.on(h, () => launcher?.rendered && launcher.render());

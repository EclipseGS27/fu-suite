import { GROUPS, MODULES, manifestOf } from './catalog.mjs';

export const MODULE_ID = 'fu-suite';
const { ApplicationV2 } = foundry.applications.api;
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

/** A module's state in this world: missing, installed but off, or active */
function stateOf(m) {
	const mod = game.modules.get(m.id);
	if (!mod) return { id: 'missing', mod: null };
	if (!mod.active) return { id: 'off', mod };
	return { id: 'on', mod };
}

/** Settings menus the module registered (Turn glow, Default animation...), minus the ones a card button already opens */
function menusOf(m) {
	const out = [];
	for (const [key, menu] of game.settings.menus ?? []) {
		const [ns, name] = key.split('.');
		if (ns !== m.id || (m.skipMenus ?? []).includes(name)) continue;
		if (menu.restricted && !game.user.isGM) continue;
		out.push({ key, label: menu.label || menu.name, icon: menu.icon || 'fa-solid fa-sliders' });
	}
	return out;
}

/** Whether the module has settings this user can see in Configure Settings */
function hasSettings(m) {
	for (const s of game.settings.settings.values()) {
		if (s.namespace !== m.id || !s.config) continue;
		if (s.scope === 'world' && !game.user.isGM) continue;
		return true;
	}
	return false;
}

/** One window for the whole family: every module's tools, menus and settings, grouped */
export class SuiteLauncher extends ApplicationV2 {
	static DEFAULT_OPTIONS = {
		id: 'fu-suite-launcher',
		classes: ['fusu'],
		window: { title: 'Fabula Ultima', icon: 'fa-solid fa-dice-d20', resizable: true },
		position: { width: 860, height: 680 },
		actions: {
			run: SuiteLauncher.#run,
			menu: SuiteLauncher.#menu,
			settings: SuiteLauncher.#settings,
			copy: SuiteLauncher.#copy,
			manage: SuiteLauncher.#manage,
			gather: SuiteLauncher.#gather,
		},
	};

	async _renderHTML() {
		const gm = game.user.isGM;
		const sections = GROUPS.filter((g) => gm || !g.gm)
			.map((g) => {
				const cards = MODULES.filter((m) => m.group === g.id && (gm || !m.gm))
					.map((m) => this.#card(m, gm))
					.filter(Boolean)
					.join('');
				return cards ? `<section><h2>${esc(g.label)}</h2><div class="cards">${cards}</div></section>` : '';
			})
			.join('');
		const div = document.createElement('div');
		div.className = 'fusu-body';
		const gathered = game.settings.get(MODULE_ID, 'gather') !== false;
		div.innerHTML = `${sections || '<p class="empty">None of the Fabula Ultima modules are active in this world.</p>'}
			<footer><label class="chk"><input type="checkbox" data-action="gather" ${gathered ? 'checked' : ''}> Gather the modules' toolbar buttons into the one Fabula Ultima button</label>
			<span class="sp"></span><small>Shift+F opens this window</small></footer>`;
		return div;
	}

	#card(m, gm) {
		const st = stateOf(m);
		// players only see what they can use
		if (st.id !== 'on' && !gm) return '';
		const head = `<header><i class="${m.icon}"></i><div><b>${esc(m.title)}</b>${st.mod ? `<small>v${esc(st.mod.version)}</small>` : ''}</div>
			${m.optional ? '<span class="tag">optional</span>' : ''}</header><p>${esc(m.blurb)}</p>`;
		if (st.id === 'missing') {
			return `<article class="card missing">${head}<div class="note">Not installed. In the setup screen: Add-on Modules → Install Module → paste the manifest URL.</div>
				<div class="acts"><button type="button" data-action="copy" data-url="${esc(manifestOf(m))}"><i class="fa-solid fa-copy"></i> Copy manifest URL</button></div></article>`;
		}
		if (st.id === 'off') {
			return `<article class="card off">${head}<div class="note">Installed but turned off in this world.</div>
				<div class="acts"><button type="button" data-action="manage"><i class="fa-solid fa-cubes"></i> Manage Modules</button></div></article>`;
		}
		const shown = (a) => {
			try {
				return !a.show || a.show();
			} catch {
				return false;
			}
		};
		const actions = m.actions
			.filter((a) => (gm || !a.gm) && shown(a))
			.map((a) => {
				const ok = !a.when || a.when();
				return `<button type="button" class="cta" data-action="run" data-mod="${m.id}" data-i="${m.actions.indexOf(a)}" ${ok ? '' : 'disabled'} ${a.key ? `data-tooltip="${esc(a.key)}"` : ''}><i class="${a.icon}"></i> ${esc(a.label)}</button>`;
			})
			.join('');
		const menus = menusOf(m)
			.map((x) => `<button type="button" data-action="menu" data-key="${esc(x.key)}"><i class="${esc(x.icon)}"></i> ${esc(x.label)}</button>`)
			.join('');
		const settings = hasSettings(m) ? `<button type="button" class="cog" data-action="settings" data-mod="${m.id}" data-tooltip="Settings"><i class="fa-solid fa-gear"></i></button>` : '';
		// nothing this user can click: leave the card out
		if (!actions && !menus && !settings) return '';
		return `<article class="card">${head}<div class="acts">${actions}${menus}${settings}</div></article>`;
	}

	_replaceHTML(result, content) {
		content.replaceChildren(result);
	}

	static async #run(event, target) {
		const m = MODULES.find((x) => x.id === target.dataset.mod);
		const action = m?.actions[Number(target.dataset.i)];
		const api = game.modules.get(m?.id)?.api;
		if (!action || !api) return ui.notifications.warn(`${m?.title ?? 'That module'} is not ready.`);
		try {
			await action.run(api);
		} catch (err) {
			console.error(`${MODULE_ID} | ${m.id}`, err);
			ui.notifications.error(`${m.title}: ${err.message}`);
		}
	}

	static #menu(event, target) {
		const menu = game.settings.menus.get(target.dataset.key);
		if (!menu?.type) return;
		const app = new menu.type();
		app.render({ force: true });
	}

	/** Configure Settings, opened on this module's page */
	static async #settings(event, target) {
		const id = target.dataset.mod;
		const sheet = game.settings.sheet;
		await sheet.render({ force: true });
		try {
			sheet.changeTab(id, 'categories');
		} catch {
			/* older layout: the window still opens */
		}
	}

	static async #copy(event, target) {
		const url = target.dataset.url;
		try {
			await navigator.clipboard.writeText(url);
			ui.notifications.info('Manifest URL copied.');
		} catch {
			foundry.applications.api.DialogV2.prompt({ window: { title: 'Manifest URL' }, content: `<p>Copy this into Install Module:</p><input type="text" readonly value="${esc(url)}" style="width:100%">` });
		}
	}

	static #manage() {
		const MM = foundry.applications.sidebar?.apps?.ModuleManagement ?? globalThis.ModuleManagement;
		if (MM) new MM().render({ force: true });
	}

	static async #gather(event, target) {
		await game.settings.set(MODULE_ID, 'gather', !!target.checked);
	}
}

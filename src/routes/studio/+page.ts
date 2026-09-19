import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';

export const prerender = false;
export const ssr = true;

export function load() {
	// Local authoring only: 404 in production builds so nothing is deployed.
	if (!dev) throw error(404, 'Not found');
	return {};
}

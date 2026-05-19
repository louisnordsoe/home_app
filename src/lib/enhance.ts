import { enhance as svelteEnhance } from '$app/forms';
import type { SubmitFunction } from '@sveltejs/kit';

// MD3's form-submitter uses a trick: it calls form.requestSubmit() with no
// argument, then adds a one-time capture listener that patches e.submitter
// via Object.defineProperty to return the custom element. By the time our
// bubble-phase interceptor runs, e.submitter appears as the MD3 element.
//
// We cannot call form.requestSubmit() from inside a submit listener to
// re-dispatch — Chrome silently suppresses it while the form is in its
// "firing submission events" state.
//
// Instead: if e.submitter is a non-native element (custom element), we
// redefine it as null so svelteEnhance's new FormData(form, submitter) call
// works safely. null is the "no submitter" sentinel the browser already uses
// when form.requestSubmit() is called with no argument.
//
// We also guard against initialization-time spurious submits from MD3 by
// tracking whether a real user interaction has occurred first.
export function enhance(form: HTMLFormElement, submit?: SubmitFunction) {
	let userHasInteracted = false;
	const markInteraction = () => {
		userHasInteracted = true;
	};

	// Capture phase so we catch events on any descendant (e.g. text fields).
	form.addEventListener('mousedown', markInteraction, { capture: true });
	form.addEventListener('keydown', markInteraction, { capture: true });
	form.addEventListener('touchstart', markInteraction, { capture: true });

	function interceptor(e: SubmitEvent) {
		if (!userHasInteracted) {
			e.stopImmediatePropagation();
			e.preventDefault();
			return;
		}
		const submitter = e.submitter;
		if (
			submitter &&
			!(submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement)
		) {
			Object.defineProperty(e, 'submitter', { value: null, configurable: true, enumerable: true });
		}
	}

	form.addEventListener('submit', interceptor);
	const enhanced = svelteEnhance(form, submit);

	return {
		destroy() {
			form.removeEventListener('mousedown', markInteraction, { capture: true });
			form.removeEventListener('keydown', markInteraction, { capture: true });
			form.removeEventListener('touchstart', markInteraction, { capture: true });
			form.removeEventListener('submit', interceptor);
			enhanced?.destroy?.();
		}
	};
}

import { expect, describe, it } from 'vitest'
import getJSONWithParameters from '../apiFunctions'
// src/index.ts

// the implementation
function add(...args) {
	return args.reduce((a, b) => a + b, 0)
}

it('add', () => {
	expect(add()).toBe(0)
	expect(add(1)).toBe(1)
	expect(add(1, 2, 3)).toBe(6)
})
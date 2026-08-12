/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { Window } from 'happy-dom'

const domGlobals = [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'HTMLFormElement',
  'Image',
  'Node',
  'Element',
  'DOMParser',
  'NodeFilter',
  'Event',
  'CustomEvent',
  'MutationObserver',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'getComputedStyle',
] as const

/**
 * happy-dom implements `nodeName` by overriding it once per node subclass,
 * while DOMPurify reads it a single time off `Node.prototype` so that a DOM
 * clobbering attack cannot shadow it. Browsers expose a polymorphic getter
 * there, happy-dom only exposes the base one that answers `''`, so every node
 * reaches DOMPurify nameless, misses the allow list, and the walk collapses
 * after the first removal — `sanitize()` degrades into a pass-through.
 *
 * Without this bridge an XSS regression test would pass while the sanitizer is
 * doing nothing at all, so tests that assert sanitization MUST install it.
 */
function bridgeNodeNameToNodePrototype(domWindow: Window): void {
  const nodePrototype = domWindow.Node.prototype
  const baseGetter = Object.getOwnPropertyDescriptor(
    nodePrototype,
    'nodeName'
  )?.get

  if (!baseGetter) {
    return
  }

  Object.defineProperty(nodePrototype, 'nodeName', {
    configurable: true,
    get(this: object): string {
      let prototype: object | null = Object.getPrototypeOf(this)

      while (prototype !== null && prototype !== nodePrototype) {
        const descriptor = Object.getOwnPropertyDescriptor(
          prototype,
          'nodeName'
        )

        if (descriptor?.get) {
          return String(descriptor.get.call(this))
        }

        prototype = Object.getPrototypeOf(prototype)
      }

      return String(baseGetter.call(this))
    },
  })
}

function nextInTreeOrder(node: Node, root: Node): Node | null {
  if (node.firstChild) {
    return node.firstChild
  }

  return nextSkippingSubtree(node, root)
}

function nextSkippingSubtree(node: Node, root: Node): Node | null {
  let candidate: Node | null = node

  while (candidate !== null && candidate !== root) {
    if (candidate.nextSibling) {
      return candidate.nextSibling
    }

    candidate = candidate.parentNode
  }

  return null
}

/**
 * happy-dom's `NodeIterator` skips the DOM standard's pre-removing steps, so
 * removing the node it just handed out ends the walk. DOMPurify removes
 * disallowed elements as it walks, which means one `<script>` at the front of a
 * payload silently ends sanitization and lets the rest of that payload through
 * untouched — again turning an XSS regression test into a false negative.
 *
 * This replacement keeps the cursor on the position a removed node used to
 * occupy, which is the observable browser behaviour DOMPurify is written
 * against, including the replacement children it hoists into that slot.
 */
function installTreeOrderNodeIterator(domWindow: Window): void {
  const createNodeIterator = (root: Node, whatToShow = -1) => {
    let current: Node | null = null
    let parentOfCurrent: Node | null = null
    let previousOfCurrent: Node | null = null
    let exhausted = false

    const resume = (): Node | null => {
      if (current === null) {
        return root
      }

      if (current.parentNode !== null || current === root) {
        return nextInTreeOrder(current, root)
      }

      const replacement = previousOfCurrent
        ? previousOfCurrent.nextSibling
        : (parentOfCurrent?.firstChild ?? null)

      if (replacement) {
        return replacement
      }

      return parentOfCurrent ? nextSkippingSubtree(parentOfCurrent, root) : null
    }

    return {
      nextNode(): Node | null {
        if (exhausted) {
          return null
        }

        let candidate = resume()

        while (
          candidate !== null &&
          (whatToShow & (1 << (candidate.nodeType - 1))) === 0
        ) {
          candidate = nextInTreeOrder(candidate, root)
        }

        if (candidate === null) {
          exhausted = true

          return null
        }

        current = candidate
        parentOfCurrent = candidate.parentNode
        previousOfCurrent = candidate.previousSibling

        return candidate
      },
    }
  }

  // happy-dom builds a fresh class hierarchy per window, so `window.Document`
  // is not the prototype `window.document` actually inherits from.
  let documentPrototype: object | null = Object.getPrototypeOf(
    domWindow.document
  )

  while (
    documentPrototype !== null &&
    !Object.hasOwn(documentPrototype, 'createNodeIterator')
  ) {
    documentPrototype = Object.getPrototypeOf(documentPrototype)
  }

  if (documentPrototype === null) {
    return
  }

  Object.defineProperty(documentPrototype, 'createNodeIterator', {
    configurable: true,
    value: createNodeIterator,
    writable: true,
  })
}

/**
 * Publishes a happy-dom window on `globalThis` so that modules importing
 * browser APIs at load time (React DOM, DOMPurify) bind to it. Call this before
 * dynamically importing the module under test.
 */
export function installBrowserEnvironment(url: string): Window {
  const domWindow = new Window({ url })

  bridgeNodeNameToNodePrototype(domWindow)
  installTreeOrderNodeIterator(domWindow)

  for (const key of domGlobals) {
    Object.defineProperty(globalThis, key, {
      configurable: true,
      value: domWindow[key],
    })
  }

  const reactTestGlobals = globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT?: boolean
  }
  reactTestGlobals.IS_REACT_ACT_ENVIRONMENT = true

  return domWindow
}

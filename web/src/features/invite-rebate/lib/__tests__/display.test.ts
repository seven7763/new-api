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
import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { formatBasisPointsPercent, resolveInviteUserLabel } from '../display'

describe('formatBasisPointsPercent', () => {
  test('divides basis points by 100 to get the displayed percent', () => {
    assert.equal(formatBasisPointsPercent(500), '5')
    assert.equal(formatBasisPointsPercent(100), '1')
  })

  test('renders the backend maximum of 10000 bp as 100 percent', () => {
    assert.equal(formatBasisPointsPercent(10000), '100')
  })

  test('falls back to 0 for missing, zero, negative and non-finite rates', () => {
    assert.equal(formatBasisPointsPercent(undefined), '0')
    assert.equal(formatBasisPointsPercent(0), '0')
    assert.equal(formatBasisPointsPercent(-500), '0')
    assert.equal(formatBasisPointsPercent(Number.NaN), '0')
  })
})

describe('resolveInviteUserLabel', () => {
  test('prefers the display name over the username', () => {
    assert.equal(resolveInviteUserLabel('D***', 'u***', 7, 'Anonymous'), 'D***')
  })

  test('falls back to the username when the display name is blank', () => {
    assert.equal(resolveInviteUserLabel('   ', 'u***', 7, 'Anonymous'), 'u***')
  })

  test('falls back to the id only when the backend exposed one', () => {
    assert.equal(resolveInviteUserLabel('', '', 7, 'Anonymous'), '#7')
  })

  test('stays anonymous when the backend hid the id of another user', () => {
    assert.equal(resolveInviteUserLabel('', '', 0, 'Anonymous'), 'Anonymous')
  })
})

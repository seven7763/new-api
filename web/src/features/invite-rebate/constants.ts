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
/** Rows per page for the user-facing rebate log and invitee tables. */
export const REBATE_PAGE_SIZE = 20

/** Rows per page for the admin rebate ledger. */
export const ADMIN_PAGE_SIZE = 20

/**
 * Rows requested from the leaderboard endpoint. Both the overview preview and
 * the leaderboard tab request the same limit so they share one cache entry and
 * never trigger a second aggregation.
 */
export const LEADERBOARD_LIMIT = 20

/** Rows shown in the overview "Top inviters" preview. */
export const LEADERBOARD_PREVIEW_SIZE = 5

/** Top-ups scanned per manual backfill run; the backend caps this at 500. */
export const BACKFILL_LIMIT = 100

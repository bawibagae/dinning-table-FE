import { evaluateTableClient } from './mockDatabase.js';

export const normalizeTableRegion = (value = '') =>
  value === '종로/을지로' ? '을지로/종로' : String(value).trim();

const cleanMemberIds = (table, userId) => [...new Set(table?.member_ids || [])].filter((id) => id && id !== userId);

function hasInternalSafetyConflict(memberIds, store) {
  // Existing feedback/block decisions are hard constraints. Check every member pair,
  // not just the joining participant, when combining two partially-filled tables.
  for (const memberId of memberIds) {
    const member = (store.users || []).find((user) => user.id === memberId);
    if (!member) continue;
    const others = memberIds.filter((id) => id !== memberId);
    const evaluation = evaluateTableClient(member, { member_ids: others, max_members: 6 }, store);
    if (evaluation.hasSafetyConflict) return true;
  }
  return false;
}

function tableIsInApplicationScope(table, { application, currentUser }) {
  if (!table || !['WAITING', 'REALLOCATING'].includes(table.match_status || 'WAITING')) return false;
  const normalize = normalizeTableRegion;
  const regions = new Set([
    ...(Array.isArray(application.desired_regions) && application.desired_regions.length
      ? application.desired_regions
      : (currentUser.preferred_regions || [])),
    application.initial_selected_region,
    application.selected_region,
  ].filter(Boolean).map(normalize));
  const dates = new Set((application.desired_dates || []).map((date) => String(date || '').slice(0, 10)).filter(Boolean));
  if (regions.size && !regions.has(normalize(table.region))) return false;
  if (dates.size && !dates.has(String(table.event_date || '').slice(0, 10))) return false;
  return true;
}

/**
 * A paid user may select any open table in discovery. For automatic placement, this
 * function first checks the selected table, then tries to merge compatible, partially
 * filled tables sharing the same region/date/time. This avoids repeatedly sending a
 * participant to a dead-end 2- or 3-person group. Recommendations never reject based
 * on soft preferences; the 4–6 cap, 8-year age spread and confirmed safety conflicts
 * are checked before automatic confirmation.
 */
export function getEligibleMatchingCandidate(tableSource, { application, currentUser, store }) {
  if (!tableSource || !application || !currentUser || application.payment_status !== 'PAID') return null;
  if (!tableIsInApplicationScope(tableSource, { application, currentUser })) return null;

  const minimum = Number(tableSource.min_members || 4);
  const maximum = Number(tableSource.max_members || 6);
  const baseMembers = cleanMemberIds(tableSource, currentUser.id);
  if (baseMembers.length >= maximum) return null;

  const normalize = normalizeTableRegion;
  const targetRegion = normalize(tableSource.region);
  const targetDate = String(tableSource.event_date || '').slice(0, 10);
  const targetTime = String(tableSource.event_time || '19:00').slice(0, 5);

  // Generate candidate groups from the chosen table plus other open tables with the
  // same event slot. We only merge if the resulting table remains within 4–6 people.
  const mergeSources = (store.diningTables || [])
    .filter((table) => table.id !== tableSource.id && tableIsInApplicationScope(table, { application, currentUser }))
    .filter((table) => normalize(table.region) === targetRegion)
    .filter((table) => String(table.event_date || '').slice(0, 10) === targetDate)
    .filter((table) => String(table.event_time || '19:00').slice(0, 5) === targetTime)
    .map((table) => ({
      table,
      ids: cleanMemberIds(table, currentUser.id).filter((id) => !baseMembers.includes(id)),
    }))
    .filter((entry) => entry.ids.length > 0);

  const combinations = [{ memberIds: baseMembers, mergedFromTableIds: [] }];
  // Keep the search bounded. Tables are small; at most 96 candidate combinations are
  // examined per target, preferring a minimal merge before considering larger groups.
  for (const source of mergeSources) {
    const additions = [];
    for (const combination of combinations) {
      const genuinelyNewIds = source.ids.filter((id) => !combination.memberIds.includes(id));
      if (!genuinelyNewIds.length) continue;
      const combined = [...combination.memberIds, ...genuinelyNewIds];
      if (combined.length + 1 > maximum) continue;
      additions.push({
        memberIds: combined,
        mergedFromTableIds: [...combination.mergedFromTableIds, source.table.id],
      });
    }
    combinations.push(...additions);
    if (combinations.length > 96) combinations.length = 96;
  }

  const readyGroups = combinations
    .filter((combination) => combination.memberIds.length + 1 >= minimum && combination.memberIds.length + 1 <= maximum)
    .sort((a, b) => a.mergedFromTableIds.length - b.mergedFromTableIds.length);

  for (const combination of readyGroups) {
    const evaluatorUser = {
      ...currentUser,
      preferred_regions: [...new Set([...(currentUser.preferred_regions || []), tableSource.region, targetRegion])],
    };
    const candidateTable = {
      ...tableSource,
      member_ids: combination.memberIds,
      merged_from_table_ids: combination.mergedFromTableIds,
    };
    const evaluation = evaluateTableClient(evaluatorUser, candidateTable, store);
    if (!evaluation.ageConstraintPassed || evaluation.hasSafetyConflict || evaluation.isFull) continue;
    if (hasInternalSafetyConflict(combination.memberIds, store)) continue;

    return {
      table: candidateTable,
      evaluation,
      normalizedRegion: targetRegion,
      eventDate: targetDate,
      memberCount: combination.memberIds.length,
      membersAfterJoining: combination.memberIds.length + 1,
      minimum,
      maximum,
      mergedFromTableIds: combination.mergedFromTableIds,
    };
  }
  return null;
}

export function getEligibleMatchingCandidates({ application, currentUser, store }) {
  return (store.diningTables || [])
    .map((table) => getEligibleMatchingCandidate(table, { application, currentUser, store }))
    .filter(Boolean)
    .sort((a, b) => {
      if ((a.table.id === application.table_id) !== (b.table.id === application.table_id)) {
        return a.table.id === application.table_id ? -1 : 1;
      }
      if (a.mergedFromTableIds.length !== b.mergedFromTableIds.length) return a.mergedFromTableIds.length - b.mergedFromTableIds.length;
      if (a.memberCount !== b.memberCount) return b.memberCount - a.memberCount;
      return b.evaluation.totalScore - a.evaluation.totalScore;
    });
}

/** Discovery deliberately ignores preference-score and hard-constraint results. */
export function getOpenTablesForDiscovery(store, currentUser) {
  return (store.diningTables || []).filter((table) =>
    ['WAITING', 'REALLOCATING'].includes(table.match_status || 'WAITING') &&
    cleanMemberIds(table, currentUser?.id).length < (table.max_members || 6)
  );
}

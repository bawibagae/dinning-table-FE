import assert from 'node:assert/strict';
import { INITIAL_STORE, evaluateTableClient } from './mockDatabase.js';
import { getEligibleMatchingCandidate, getEligibleMatchingCandidates, getOpenTablesForDiscovery } from './tableMatchingFlow.js';

const seed = structuredClone(INITIAL_STORE);
const user = seed.users.find((item) => item.id === 'usr-1');
assert.ok(user, 'fixture user should exist');

// A freely selected open table is discoverable even when the profile preferences differ.
const openTables = getOpenTablesForDiscovery(seed, user);
assert.ok(openTables.some((table) => table.id === 'tbl-4'), 'open tables in another region remain discoverable');
const staleMembershipStore = structuredClone(seed);
const staleMembershipTable = staleMembershipStore.diningTables.find((table) => table.id === 'tbl-2');
staleMembershipTable.member_ids = ['usr-1', 'usr-5', 'usr-6', 'usr-7'];
assert.ok(getOpenTablesForDiscovery(staleMembershipStore, user).some((table) => table.id === 'tbl-2'),
  'a stale self ID must not hide a table from discovery');
const staleMembershipApplication = {
  id: 'app-stale-membership', user_id: user.id, table_id: staleMembershipTable.id,
  payment_status: 'PAID', desired_regions: [...new Set([...user.preferred_regions, staleMembershipTable.region])],
  desired_dates: [staleMembershipTable.event_date],
};
assert.equal(getEligibleMatchingCandidate(staleMembershipTable, { application: staleMembershipApplication, currentUser: user, store: staleMembershipStore })?.membersAfterJoining, 4,
  'stale membership must be removed before checking the final table size');

// For each seeded open table, explicitly selecting its region/date should give the
// matching engine a ready candidate when three compatible diners are already present.
for (const selected of openTables) {
  const application = {
    id: `app-${selected.id}`,
    user_id: user.id,
    table_id: selected.id,
    payment_status: 'PAID',
    desired_regions: [...new Set([...(user.preferred_regions || []), selected.region])],
    desired_dates: [selected.event_date],
  };
  const candidates = getEligibleMatchingCandidates({ application, currentUser: user, store: seed });
  assert.ok(candidates.length > 0, `${selected.id} should have an eligible matching candidate`);
  assert.equal(candidates[0].table.id, selected.id, `${selected.id} explicit choice should be respected when confirmable`);
  assert.equal(candidates[0].membersAfterJoining, 4, `${selected.id} should reach minimum capacity on join`);
}

// If a table has only two existing diners, the app must not attach the user and trap
// them in repeated "check confirmation" presses. It should go to alternative options.
const incompleteStore = structuredClone(seed);
const target = incompleteStore.diningTables.find((table) => table.id === 'tbl-5');
target.member_ids = ['usr-8', 'usr-2'];
const incompleteApplication = {
  id: 'app-incomplete', user_id: user.id, table_id: target.id,
  payment_status: 'PAID', desired_regions: ['홍대/연남'], desired_dates: [target.event_date],
};
assert.equal(getEligibleMatchingCandidate(target, { application: incompleteApplication, currentUser: user, store: incompleteStore }), null,
  'underfilled tables without a compatible peer must route to alternatives instead of a dead-end confirmation loop');

// Two incomplete tables in the same region/date/time can merge to make a viable 4–6
// person group. The selected table should not get stuck just because it began with 2.
const mergeStore = structuredClone(incompleteStore);
const mergeTarget = mergeStore.diningTables.find((table) => table.id === 'tbl-5');
mergeTarget.region = '홍대/연남';
mergeTarget.event_date = '2026-10-25';
mergeTarget.event_time = '18:00';
mergeTarget.member_ids = ['usr-8', 'usr-2'];
mergeStore.diningTables.push({
  ...mergeTarget,
  id: 'tbl-5-peer',
  slot_id: 'slot-5-peer',
  title: '연남 미완성 식탁 · 병합 후보',
  member_ids: ['usr-5', 'usr-6'],
});
const mergeApplication = {
  ...incompleteApplication,
  table_id: mergeTarget.id,
  desired_regions: ['홍대/연남'],
  desired_dates: [mergeTarget.event_date],
};
const mergedCandidate = getEligibleMatchingCandidate(mergeTarget, {
  application: mergeApplication,
  currentUser: user,
  store: mergeStore,
});
assert.ok(mergedCandidate, 'compatible incomplete tables should be merged into a valid group');
assert.equal(mergedCandidate.membersAfterJoining, 5, 'merged group should include 4 existing diners plus the applicant');
assert.ok(mergedCandidate.mergedFromTableIds.includes('tbl-5-peer'), 'merge source should be recorded for confirmation');

// Final matching still honors hard age/safety checks, but those checks do not hide a
// candidate from discovery or disable a manual choice.
const ageOutlier = { ...user, age: 45, preferred_regions: ['홍대/연남'] };
const selectedHongdae = { ...incompleteStore.diningTables.find((table) => table.id === 'tbl-5'), member_ids: ['usr-8', 'usr-2', 'usr-4'] };
const ageApplication = { ...incompleteApplication, table_id: selectedHongdae.id, desired_regions: ['홍대/연남'], desired_dates: [selectedHongdae.event_date] };
const ageEvaluation = evaluateTableClient({ ...ageOutlier, preferred_regions: ['홍대/연남'] }, selectedHongdae, incompleteStore);
assert.equal(ageEvaluation.ageConstraintPassed, false, 'age violation fixture should really be incompatible');
assert.ok(getOpenTablesForDiscovery(incompleteStore, ageOutlier).some((table) => table.id === selectedHongdae.id),
  'age mismatch must not hide an open table from discovery');
assert.equal(getEligibleMatchingCandidate(selectedHongdae, { application: ageApplication, currentUser: ageOutlier, store: incompleteStore }), null,
  'automatic confirmation still protects hard age conditions');

console.log('tableMatchingFlow tests passed');

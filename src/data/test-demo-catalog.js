import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { INITIAL_STORE } from './mockDatabase.js';
import { getEligibleMatchingCandidate, getEligibleMatchingCandidates } from './tableMatchingFlow.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(fs.readFileSync(path.join(here, 'generatedDemoCatalog.json'), 'utf8'));
const expectedRegions = new Set(['홍대/연남', '잠실', '강남/역삼', '을지로/종로']);
assert.equal(catalog.meta.demo_only, true, 'generated seed must be marked demo-only');
assert.equal(catalog.users.length, 294, 'all 294 virtual survey profiles should be used');
assert.equal(catalog.tables.filter((table) => table.match_status === 'WAITING').length, 72, 'should contain 72 upcoming/open tables');
assert.equal(catalog.tables.filter((table) => table.historical_demo).length, 12, 'should contain 12 historical examples');
assert.equal(catalog.applications.length, 290, 'demo applications should be populated');
assert.ok(catalog.venues.some((venue) => venue.id === 'ven-6' && venue.region === '잠실'), 'Jamsil demo venue is needed for the active region');
assert.ok(catalog.users.every((user) => user.email.endsWith('@example.test') && user.password_hash === null && user.insta_id === null), 'seed identities must not contain working passwords, real contact or Instagram values');

const userById = new Map(catalog.users.map((user) => [user.id, user]));
const openTables = catalog.tables.filter((table) => table.match_status === 'WAITING');
for (const table of openTables) {
  assert.ok(expectedRegions.has(table.region), `unexpected active region ${table.region}`);
  assert.ok(table.member_ids.length < table.max_members, `${table.id} should have open seats`);
  assert.ok(table.member_ids.every((id) => userById.has(id)), `${table.id} references a missing demo participant`);
  const ages = table.member_ids.map((id) => userById.get(id).age);
  assert.ok(Math.max(...ages) - Math.min(...ages) <= 8, `${table.id} itself should respect the 8-year span`);
}
const slotGroups = new Map();
for (const table of openTables) {
  const key = [table.region, table.event_date, table.event_time].join('|');
  slotGroups.set(key, [...(slotGroups.get(key) || []), table]);
}
const pairedGroups = [...slotGroups.values()].filter((group) => group.length > 1);
assert.ok(pairedGroups.length >= 8, 'at least eight same-slot group pairs should permit merging underfilled tables');

// Use synthetic test identities to verify that a user in the right age band can find
// a valid confirmation candidate from every seeded open table, including 2-person tables.
const store = {
  ...structuredClone(INITIAL_STORE),
  users: [...structuredClone(INITIAL_STORE.users), ...catalog.users],
  venues: [...structuredClone(INITIAL_STORE.venues), ...catalog.venues],
  diningTables: [...structuredClone(INITIAL_STORE.diningTables), ...openTables],
  applications: [...structuredClone(INITIAL_STORE.applications), ...catalog.applications.filter((application) => openTables.some((t) => t.id === application.table_id))],
  chatRooms: [...structuredClone(INITIAL_STORE.chatRooms), ...catalog.chatRooms],
};
for (const [index, table] of openTables.entries()) {
  const currentAges = table.member_ids.map((id) => userById.get(id).age).sort((a, b) => a - b);
  const demoUser = {
    id: `catalog-test-user-${index + 1}`,
    name: `테스트 참여자 ${index + 1}`,
    age: currentAges[Math.floor(currentAges.length / 2)],
    gender: index % 2 ? 'F' : 'M',
    mbti: 'ENFP',
    interests: table.tags || [],
    preferred_regions: [table.region],
    vibe_self: ['편안한 경청러'],
    preferred_partner: ['대화가 잘 통하는'],
  };
  const application = {
    id: `catalog-test-app-${index + 1}`,
    user_id: demoUser.id,
    table_id: table.id,
    payment_status: 'PAID',
    desired_regions: [table.region],
    desired_dates: [table.event_date],
  };
  const direct = getEligibleMatchingCandidate(table, { application, currentUser: demoUser, store });
  const candidates = getEligibleMatchingCandidates({ application, currentUser: demoUser, store });
  assert.ok(direct || candidates.length, `${table.id} should have a matching candidate after compatible table merging`);
  const best = direct || candidates[0];
  assert.ok(best.membersAfterJoining >= 4 && best.membersAfterJoining <= 6, `${table.id} should produce a 4–6 person candidate`);
}
console.log(`demo catalog tests passed: ${catalog.users.length} profiles, ${openTables.length} open tables, ${catalog.meta.historical_table_count} historical tables, ${pairedGroups.length} shared time slots`);

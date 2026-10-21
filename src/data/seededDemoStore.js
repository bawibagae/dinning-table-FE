import generatedDemoCatalog from './generatedDemoCatalog.json';

/**
 * Adds the virtual survey cohort to the local UI demo store.
 * All records marked demo_seed are synthetic/testing records; no phone or Instagram
 * values are imported from the spreadsheet. This is not a persistence layer.
 */
export function createSeededDemoStore(baseStore, surveyRows = []) {
  const uniqueById = (rows) => {
    const map = new Map();
    (rows || []).forEach((row) => { if (row?.id) map.set(row.id, row); });
    return [...map.values()];
  };

  return {
    ...baseStore,
    users: uniqueById([...(baseStore.users || []), ...generatedDemoCatalog.users]),
    venues: uniqueById([...(baseStore.venues || []), ...generatedDemoCatalog.venues]),
    diningTables: uniqueById([...(baseStore.diningTables || []), ...generatedDemoCatalog.tables]),
    applications: uniqueById([...(baseStore.applications || []), ...generatedDemoCatalog.applications]),
    chatRooms: uniqueById([...(baseStore.chatRooms || []), ...generatedDemoCatalog.chatRooms]),
    excelSurveyDataset: surveyRows,
    demoCatalogMeta: generatedDemoCatalog.meta,
  };
}

export { generatedDemoCatalog };

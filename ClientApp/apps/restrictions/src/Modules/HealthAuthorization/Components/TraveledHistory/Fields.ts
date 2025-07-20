export const fields = {
  traveledHistory: {
    fields: {
      isTraveledHistoryRequired: { label: 'Traveled History' },
      travelHistoryTimeframe: { label: 'Traveled History Time Frame*', rules: 'required|numeric|min:1' },
      isOther: { label: 'Other' },
      traveledHistoryCountries: { label: 'Traveled History Countries' },
      sectionLevelExclusions: { label: 'Requirements', value: [] },
      countryLevelExclusions: { label: 'Links', value: [] },
    },
  },
};

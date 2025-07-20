import { SurveyListModel, SurveyModel } from '../Models';

export const SurveyMock: SurveyListModel = new SurveyListModel({
  surveys: [
    new SurveyModel({
      id: 5,
      airportName: 'VALDOSTA RGNL',
      approvedDate: '',
      handlerName: 'VALDOSTA FLYING SERVICE',
      ICAO: 'KVLD',
      lastUpdatedUser: '',
      reviewStatus: 'Pending',
      submittedDate: '2020-06-04T20:04:24.323',
    }),
    new SurveyModel({
      id: 7,
      airportName: 'NORTHOLT',
      approvedDate: '',
      handlerName: 'NORTHOLT JET CENTER',
      ICAO: 'EGWU',
      lastUpdatedUser: '',
      reviewStatus: 'Approved',
      submittedDate: '2020-06-04T20:04:24.323',
    }),
  ],
});

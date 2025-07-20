import { IBaseApiResponse } from '@wings-shared/core';

export interface IAPINoiseChapterConfiguration extends IBaseApiResponse {
  noiseChapterId: number;
  aircraftNoiseTypeId: number;
  noiseDateTypeCertificationId: number;
  noiseChapter?: IAPINoiseChapterSettings;
  aircraftNoiseType?: IAPINoiseChapterSettings;
  noiseDateTypeCertification?: IAPINoiseChapterSettings;
}

export interface IAPINoiseChapterSettings extends IBaseApiResponse {
  noiseChapterId?: number;
  aircraftNoiseTypeId?: number;
  noiseDateTypeCertificationId?: number;
}

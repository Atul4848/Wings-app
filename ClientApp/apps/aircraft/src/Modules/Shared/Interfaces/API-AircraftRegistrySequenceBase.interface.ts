import { IAPIIdNameCode } from '@wings-shared/core';

export interface IAPIAircraftRegistrySequenceBase extends IAPIIdNameCode {
  sequenceNumber: number;
}

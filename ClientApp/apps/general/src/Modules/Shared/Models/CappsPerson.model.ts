import { IAPICappsPersonResponse } from '../Interfaces';
import { modelProtection } from '@wings-shared/core';

@modelProtection
export class CappsPersonModel {
  personId: number = 0;
  firstName: string = '';
  lastName: string = '';
  
  constructor(data?: Partial<CappsPersonModel>) {
    Object.assign(this, data);
  }

  static deserialize(cappsPerson: IAPICappsPersonResponse): CappsPersonModel {
    if (!cappsPerson) {
      return new CappsPersonModel();
    }

    const data: Partial<CappsPersonModel> = {
      personId: cappsPerson.personId,
      firstName: cappsPerson.firstName,
      lastName: cappsPerson.lastName,
    };

    return new CappsPersonModel(data);
  }

  static deserializeList(cappsPerson: IAPICappsPersonResponse[]): CappsPersonModel[] {
    return cappsPerson
      ? cappsPerson
        .map((personResponse: IAPICappsPersonResponse) =>
          CappsPersonModel.deserialize(personResponse))
      : [];
  }
}
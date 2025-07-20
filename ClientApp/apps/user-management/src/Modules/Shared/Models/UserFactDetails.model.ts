import { modelProtection } from '@wings-shared/core';
import { IAPIUserFactDetailsResponse, IAPIUserFactsArgsResponse } from '../Interfaces';

@modelProtection
export class UserFactDetails {
  Type: string;
  Id: string | any;

  constructor(data?: Partial<UserFactDetails>) {
    Object.assign(this, data);
  }

  static deserialize(arg: Partial<IAPIUserFactDetailsResponse>): UserFactDetails {
    if (!arg) {
      return new UserFactDetails();
    }
    const data: Partial<UserFactDetails> = {
      Type: arg.Type,
      Id: arg.Id,
    };

    return new UserFactDetails(data);
  }

  public serialize(): IAPIUserFactDetailsResponse {
    return {
      Type: this.Type,
      Id: this.Id,
    };
  }

  static deserializeList(args: IAPIUserFactDetailsResponse[]): UserFactDetails[] {
    return args
      ? args.map((arg: IAPIUserFactDetailsResponse) => UserFactDetails.deserialize(arg))
      : [];
  }
}
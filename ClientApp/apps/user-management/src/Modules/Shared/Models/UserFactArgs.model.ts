import { modelProtection } from '@wings-shared/core';
import { IAPIUserFactsArgsResponse } from '../Interfaces';
import { UserFactDetails } from './UserFactDetails.model';

@modelProtection
export class UserFactArgs {
  Args : UserFactDetails[]

  constructor(data?: Partial<UserFactArgs>) {
    Object.assign(this, data);
  }

  static deserialize(fact: Partial<IAPIUserFactsArgsResponse>): UserFactArgs {
    if (!fact) {
      return new UserFactArgs();
    }
    const data: Partial<UserFactArgs> = {
      Args : UserFactDetails.deserializeList(fact.Args || [])
    };

    return new UserFactArgs(data);
  }


  static deserializeList(facts: IAPIUserFactsArgsResponse[]): UserFactArgs[] {
    return facts
      ? facts.map((fact: IAPIUserFactsArgsResponse) => UserFactArgs.deserialize(fact))
      : [];
  }
}
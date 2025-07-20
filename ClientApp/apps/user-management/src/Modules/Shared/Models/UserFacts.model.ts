import { IAPIUserFactsResponse } from '../Interfaces';
import { UserFactArgs } from './UserFactArgs.model';
import { UserFactDetails } from './UserFactDetails.model';
import { Utilities, modelProtection, IdNameModel } from '@wings-shared/core';

@modelProtection
export class UserFactsModel extends IdNameModel {
  predicate: string;
  actorType: string;
  actorId: string;
  facts: UserFactArgs[] = [];

  constructor(data?: Partial<UserFactsModel>) {
    super();
    Object.assign(this, data);
    this.facts =
      data?.facts?.map(
        (args: UserFactArgs) =>
          new UserFactArgs({
            Args: args?.Args?.map(
              (fact: UserFactDetails) =>
                new UserFactDetails({
                  Id: fact.Id,
                  Type: fact.Type,
                })
            ) || []
          })
      ) || [];
  }

  static deserialize(fact: IAPIUserFactsResponse): UserFactsModel {
    if (!fact) {
      return new UserFactsModel();
    }
    const data: Partial<UserFactsModel> = {
      id: Utilities.getTempId(true),
      predicate: fact.Predicate,
      actorType: fact.ActorType,
      actorId: fact.ActorId,
      facts: UserFactArgs.deserializeList(fact.Facts || [])
      
    };

    return new UserFactsModel(data);
  }

  static deserializeList(facts: IAPIUserFactsResponse[]): UserFactsModel[] {
    return facts ? facts.map((fact: IAPIUserFactsResponse) => UserFactsModel.deserialize(fact)) : [];
  }
}

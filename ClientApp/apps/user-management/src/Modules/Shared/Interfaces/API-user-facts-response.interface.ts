import { IAPIUserFactDetailsResponse, IAPIUserFactsArgsResponse } from './API-user-factdetails-response.interface';

export interface IAPIUserFactsResponse {
    Predicate: string;
    ActorType: string;
    ActorId: string;
    Facts?: IAPIUserFactsArgsResponse[];
}
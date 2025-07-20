import { INoSqlAPIRequest } from '../Interfaces';
import { camelCase } from 'change-case';

// get Name of all Queries available in the API
export const listOfAllQueries = `query IntrospectionQuery {
  __schema {
    queryType {
      name
      fields {
        name
        args {
          name,
          type {
            name,
          }
        }
      }
    }
  }
}`;

// when user select a property then we can get the nested properties by using this query
export const getArgsByPropertyName = (
  name: string
) => `query IntrospectionQuery {
  __type(name: "${name}") {
    name
    kind
    inputFields {
      name
      description
      type {
        name
        kind
        inputFields {
          name
          description
          type {
            name
            kind
            inputFields {
              name
              description
              type {
                name
                kind
                inputFields {
                  name
                  description
                  type {
                    name
                    kind
                    inputFields {
                      name
                      description
                      type {
                        name
                        kind
                        inputFields {
                          name
                          description
                          type {
                            name
                            kind
                            inputFields {
                              name
                              description
                              type {
                                name
                                kind
                                inputFields {
                                  name
                                  description
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`;

// Generate Query for /gql endpoint
export const getGqlQuery = (request: INoSqlAPIRequest) => {
  // Remove string "anyKey": is replaced with anyKey:
  const replaceQuotes = r => r.replace(/"([^"]+)":/g, '$1:');

  const stringFormattedWhere = replaceQuotes(request.gqlQuery);
  const projections = replaceQuotes(request.projections).replace(/:1|:/g, '');

  const skipTake = `skip: ${request.pageSize *
    (request.pageNumber - 1)},take: ${request.pageSize}`;

  const where = stringFormattedWhere ? `where: ${stringFormattedWhere}` : '';
  const name = camelCase(request.collectionName);
  return `query Search {${name}(${where} ${skipTake}){items ${projections} totalCount}}`;
};

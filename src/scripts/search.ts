// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Modules from file
import { USER_NOT_LOGGED, UserNotLogged } from './classes/errors.js';
import Basic from './classes/handiwork/basic.js';
import HandiworkSearchQuery from './classes/query/handiwork-search-query.js';
import LatestSearchQuery from './classes/query/latest-search-query.js';
import ThreadSearchQuery from './classes/query/thread-search-query.js';
import fetchHandiworkURLs from './fetch-data/fetch-handiwork.js';
import fetchLatestHandiworkURLs from './fetch-data/fetch-latest.js';
import fetchThreadHandiworkURLs from './fetch-data/fetch-thread.js';
import { IQuery } from './interfaces.js';
import getHandiworkInformation from './scrape-data/handiwork-parse.js';
import shared from './shared.js';

/**
 * Gets the handiworks that match the passed parameters.
 *
 * You *must* be logged.
 * @param {IQuery} query Parameters used for the search.
 * @param {new () => T} type Handiwork class to use for casting the result.
 * @param {Number} limit Maximum number of items to get. Default: 30
 */
export default async function search<T extends Basic>(
  query: IQuery,
  type: new () => T,
  limit: number = 30
): Promise<T[]> {
  // Check if the user is logged
  if (!shared.isLogged) throw new UserNotLogged(USER_NOT_LOGGED);

  // Fetch the URLs
  const urls: string[] = await getURLsFromQuery(query, limit);

  // Fetch the data
  const results = urls.map(url => getHandiworkInformation<T>(url, type));

  return Promise.all(results);
}

//#region Private methods

/**
 * Gets the URLs of the Handiworks that are defined by the search query.
 *
 * @param query Query used for the search
 * @param limit Maximum number of items to get. Default: 30
 * @returns URLs of the fetched games
 */
async function getURLsFromQuery(query: IQuery, limit = 30): Promise<string[]> {
  const functionMap = {
    HandiworkSearchQuery: (query: IQuery, limit: number) =>
      fetchHandiworkURLs(query as HandiworkSearchQuery, limit),
    LatestSearchQuery: (query: IQuery, limit: number) =>
      fetchLatestHandiworkURLs(query as LatestSearchQuery, limit),
    ThreadSearchQuery: (query: IQuery, limit: number) =>
      fetchThreadHandiworkURLs(query as ThreadSearchQuery, limit),
  };

  // Throws error if the type of query is non existent
  if (!Object.keys(functionMap).includes(query.itype)) {
    throw Error(`Invalid query type: ${query.itype}`);
  }

  // fetch and return the urls
  return await functionMap[query.itype](query, limit);
}

//#endregion Private methods

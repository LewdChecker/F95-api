// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Modules from file
import HandiworkSearchQuery from '../classes/query/handiwork-search-query.js';
import LatestSearchQuery from '../classes/query/latest-search-query.js';
import ThreadSearchQuery from '../classes/query/thread-search-query.js';

import fetchLatestHandiworkURLs from './fetch-latest.js';
import fetchThreadHandiworkURLs from './fetch-thread.js';

/**
 * Gets the URLs of the handiworks that match the passed parameters.
 * You *must* be logged.
 * @param {LatestSearchQuery} query
 * Query used for the search
 * @param {Number} limit
 * Maximum number of items to get. Default: 30
 * @returns {Promise<String[]>} URLs of the handiworks
 */
export default async function fetchHandiworkURLs(
  query: HandiworkSearchQuery,
  limit = 30
): Promise<string[]> {
  // Local variables
  let urls: string[] = null;
  const searchType = query.selectSearchType();

  // Convert the query
  if (searchType === 'latest') {
    // Cast the query
    const castedQuery = query.cast<LatestSearchQuery>('LatestSearchQuery');

    // Fetch the urls
    urls = await fetchLatestHandiworkURLs(castedQuery, limit);
  } else {
    // Cast the query
    const castedQuery = query.cast<ThreadSearchQuery>('ThreadSearchQuery');

    // Fetch the urls
    urls = await fetchThreadHandiworkURLs(castedQuery, limit);
  }

  return urls;
}

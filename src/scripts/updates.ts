// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Modules from file
import { UserNotLogged, USER_NOT_LOGGED } from './classes/errors.js';
import Basic from './classes/handiwork/basic.js';
import HandiWork from './classes/handiwork/handiwork.js';
import LatestSearchQuery from './classes/query/latest-search-query.js';
import { DEFAULT_DATE } from './constants/generic.js';
import fetchLatestHandiworkURLs from './fetch-data/fetch-latest.js';
import { getHandiworkFromURL } from './handiwork-from-url.js';
import { urlExists } from './network-helper.js';
import getHandiworkInformation from './scrape-data/handiwork-parse.js';
import shared from './shared.js';

// Classes from file

/**
 * Gets the latest updated games that match the specified parameters.
 *
 * You **must** be logged in to the portal before calling this method.
 *
 * @param {LatestSearchQuery} query Parameters used for the search.
 * @param {new () => T} type Handiwork class to use for casting the result.
 * @param {Number} limit Maximum number of results. Default: 30
 */
export async function getLatestUpdates<T extends Basic>(
  query: LatestSearchQuery,
  type: new () => T,
  limit: number = 30
): Promise<T[]> {
  // Check limit value
  if (limit <= 0) throw new Error('Limit must be greater than 0');

  // Check if the user is logged
  if (!shared.isLogged) throw new UserNotLogged(USER_NOT_LOGGED);

  // Fetch the results
  const urls = await fetchLatestHandiworkURLs(query, limit);

  // Get the data from urls
  const promiseList = urls.map((u: string) => getHandiworkInformation<T>(u, type));
  return Promise.all(promiseList);
}

/**
 * Chek if exists a new version of the handiwork.
 *
 * You **must** be logged in to the portal before calling this method.
 */
export async function checkIfHandiworkHasUpdate<T extends Basic>(hw: T): Promise<boolean> {
  // Local variables
  let hasUpdate = false;

  // Check if the user is logged
  if (!shared.isLogged) throw new UserNotLogged(USER_NOT_LOGGED);

  // F95 change URL at every game update,
  // so if the URL is different an update is available
  const isTheSameURL = await urlExists(hw.url, true);
  if (!isTheSameURL) {
    // Fetch the online handiwork
    const onlineHw = await getHandiworkFromURL<HandiWork>(hw.url, HandiWork);

    // Check if properties exists in the object
    const version = hw['version'] as string;
    const lastRelease = hw['lastRelease'] as Date;

    // Compare different values
    if (version !== '') {
      hasUpdate = onlineHw.version.toUpperCase() !== version.toUpperCase();
    } else if (lastRelease != DEFAULT_DATE) {
      hasUpdate = onlineHw.lastRelease.getTime() !== lastRelease.getTime();
    } else {
      hasUpdate = onlineHw.lastThreadUpdate.getTime() !== hw.lastThreadUpdate.getTime();
    }
  }

  return hasUpdate;
}

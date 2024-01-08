// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Modules from file
import { USER_NOT_LOGGED, UserNotLogged } from './classes/errors.js';
import Basic from './classes/handiwork/basic.js';
import { isF95URL, isStringAValidURL, urlExists } from './network-helper.js';
import getHandiworkInformation from './scrape-data/handiwork-parse.js';
import shared from './shared.js';

/**
 * Given the url, it gets all the information about the handiwork requested.
 *
 * You **must** be logged in to the portal before calling this method.
 * @param {new () => T} type Handiwork class to use for casting the result.
 */
export async function getHandiworkFromURL<T extends Basic>(
  url: string,
  type: new () => T
): Promise<T> {
  // Check if the user is logged
  if (!shared.isLogged) throw new UserNotLogged(USER_NOT_LOGGED);

  // Check URL validity
  if (!isStringAValidURL(url)) throw new URIError(`'${url}' is not a valid URL`);
  const exists = await urlExists(url);
  if (!exists) throw new URIError(`${url} does not exists`);
  if (!isF95URL(url)) throw new Error(`${url} is not a valid F95Zone URL`);

  // Get game data
  /* c8 ignore next */
  return getHandiworkInformation<T>(url, type);
}

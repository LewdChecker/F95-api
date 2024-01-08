// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Modules from file
import shared from './scripts/shared.js';

//#region Re-export classes

export { default as PrefixParser } from './scripts/classes/prefix-parser.js';

export { default as Animation } from './scripts/classes/handiwork/animation.js';
export { default as Asset } from './scripts/classes/handiwork/asset.js';
export { default as Comic } from './scripts/classes/handiwork/comic.js';
export { default as Game } from './scripts/classes/handiwork/game.js';
export { default as Handiwork } from './scripts/classes/handiwork/handiwork.js';

export { default as PlatformUser } from './scripts/classes/mapping/platform-user.js';
export { default as Post } from './scripts/classes/mapping/post.js';
export { default as Thread } from './scripts/classes/mapping/thread.js';
export { default as UserProfile } from './scripts/classes/mapping/user-profile.js';

export { default as HandiworkSearchQuery } from './scripts/classes/query/handiwork-search-query.js';
export { default as LatestSearchQuery } from './scripts/classes/query/latest-search-query.js';
export { default as ThreadSearchQuery } from './scripts/classes/query/thread-search-query.js';

//#endregion Re-export classes

//#region Export properties

type TLog4JSLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Set the logger level for module debugging.
 */
function setLoggerLevel(level: TLog4JSLevel): void {
  shared.logger.level = level;
}

/**
 * Indicates the current logging level.
 */
function loggerLevel(): TLog4JSLevel {
  return shared.logger.level as TLog4JSLevel;
}

/**
 * Indicates whether the current session is authenticated.
 */
function isLogged(): boolean {
  return shared.isLogged;
}

export { isLogged, loggerLevel, setLoggerLevel };

setLoggerLevel('warn'); // By default log only the warn messages

//#endregion Export properties

//#region Re-export methods

export * from './scripts/handiwork-from-url.js';
export * from './scripts/login.js';
export { default as searchHandiwork } from './scripts/search.js';
export * from './scripts/updates.js';

//#endregion Re-export methods

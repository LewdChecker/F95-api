'use strict';

// Core modules
const { join } = require('path');

/**
 * Class containing variables shared between modules.
 */
class Shared {
    //#region Properties
    /**
     * Shows log messages and other useful functions for module debugging.
     * @type Boolean
     */
    static _debug = false;
    /**
     * Indicates whether a user is logged in to the F95Zone platform or not.
     * @type Boolean
     */
    static _isLogged = false;
    /**
     * List of cookies obtained from the F95Zone platform.
     * @type Object[]
     */
    static _cookies = null;
    /**
     * List of possible game engines used for development.
     * @type String[]
     */
    static _engines = null;
    /**
     * List of possible development statuses that a game can assume.
     * @type String[]
     */
    static _statuses = null;
    /**
     * Wait instruction for the browser created by puppeteer.
     * @type String
     */
    static WAIT_STATEMENT = 'domcontentloaded';
    /**
     * Path to the directory to save the cache generated by the API.
     * @type String
     */
    static _cacheDir = './f95cache';
    /**
     * If true, it opens a new browser for each request to 
     * the F95Zone platform, otherwise it reuses the same.
     * @type Boolean
     */
    static _isolation = false;
    //#endregion Properties

    //#region Getters
    /**
     * Shows log messages and other useful functions for module debugging.
     * @returns {Boolean}
     */
    static get debug() {
        return this._debug;
    }
    /**
     * Indicates whether a user is logged in to the F95Zone platform or not.
     * @returns {Boolean}
     */
    static get isLogged() {
        return this._isLogged;
    }
    /**
     * List of cookies obtained from the F95Zone platform.
     * @returns {Object[]}
     */
    static get cookies() {
        return this._cookies;
    }
    /**
     * List of possible game engines used for development.
     * @returns {String[]}
     */
    static get engines() {
        return this._engines;
    }
    /**
     * List of possible development states that a game can assume.
     * @returns {String[]}
     */
    static get statuses() {
        return this._statuses;
    }
    /**
     * Directory to save the API cache.
     * @returns {String}
     */
    static get cacheDir() {
        return this._cacheDir;
    }
    /**
     * Path to the F95 platform cache.
     * @returns {String}
     */
    static get cookiesCachePath() {
        return join(this._cacheDir, 'cookies.json');
    }
    /**
     * Path to the game engine cache.
     * @returns {String}
     */
    static get enginesCachePath() {
        return join(this._cacheDir, 'engines.json');
    }
    /**
     * Path to the cache of possible game states.
     * @returns {String}
     */
    static get statusesCachePath() {
        return join(this._cacheDir, 'statuses.json');
    }
    /**
     * If true, it opens a new browser for each request 
     * to the F95Zone platform, otherwise it reuses the same.
     * @returns {Boolean}
     */
    static get isolation() {
        return this._isolation;
    }
    //#endregion Getters

    //#region Setters
    static set cookies(val) {
        this._cookies = val;
    }

    static set engines(val) {
        this._engines = val;
    }

    static set statuses(val) {
        this._statuses = val;
    }

    static set cacheDir(val) {
        this._cacheDir = val;
    }

    static set debug(val) {
        this._debug = val;
    }

    static set isLogged(val) {
        this._isLogged = val;
    }

    static set isolation(val) {
        this._isolation = val;
    }
    //#endregion Setters
}

module.exports = Shared;
// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Core modules

// Local modules

// Public modules from npm
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { wrapper as addCookieJarSupport } from 'axios-cookiejar-support';
import axiosRetry from 'axios-retry';

import pkg from '../../package.json' assert { type: 'json' };

import { urls } from './constants/url.js';
import addDDoSSupport from './ddos-guard-bypass.js';
import shared from './shared.js';

/**
 * Explicit the HTTP adapter otherwise on Electron the XHR adapter
 * is used which is not supported by `axios-cookiejar-support`
 *
 * From v1.0, the adapters are not exposed to API, waiting for patch...
 */
axios.defaults.adapter = 'http';

/**
 * User agent string used to describe this API.
 */
const USER_AGENT = `Mozilla/5.0 (compatible; F95API/${pkg.version}; MillenniumEarl@f95zone; https://github.com/MillenniumEarl/F95API)`;

/**
 * Common configuration used to send request via Axios.
 */
const commonConfig: AxiosRequestConfig = {
  /**
   * This URL will be used as a base for every request to a non-complete URL.
   */
  baseURL: urls.BASE,
  /**
   * Headers to add to the request.
   */
  headers: {
    'User-Agent': USER_AGENT,
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  },
  /**
   * Specify if send credentials along the request.
   */
  withCredentials: true,
  /**
   * Jar of cookies to send along the request.
   */
  jar: shared.session.cookieJar,
  validateStatus: function (status: number) {
    return status < 500; // Resolve only if the status code is less than 500
  },
  /**
   * Maximum number of milliseconds to wait for a response.
   */
  timeout: 30000,
};

/**
 * Create a custom Axios agent already configurated.
 */
export default function createAxiosAgent(): AxiosInstance {
  // Create the agent with the custom configuration
  let agent: AxiosInstance = axios.create(commonConfig);

  // Add support for cookies with tough-cookies
  // @ts-expect-error tough-cookie is not supported by axios-cookiejar-support
  agent = addCookieJarSupport(agent);

  // Add support to bypass DDoS guard
  addDDoSSupport(agent);

  // Enable Axios to retry a request in case of errors
  // @ts-expect-error axiosRetry is not supported by axios
  axiosRetry(agent, {
    retryDelay: axiosRetry.exponentialDelay, // Use exponential back-off retry delay
    shouldResetTimeout: true, // Timer resets after every retry
  });

  return agent;
}

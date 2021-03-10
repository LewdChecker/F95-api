// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

interface IBaseError {
  /**
   * Unique identifier of the error.
   */
  id: number;
  /**
   * Error message.
   */
  message: string;
  /**
   * Error to report.
   */
  error: Error;
}

export const USER_NOT_LOGGED = "User not authenticated, unable to continue";

export class GenericAxiosError extends Error implements IBaseError {
  id: number;
  message: string;
  error: Error;

  constructor(args: IBaseError) {
    super();
    this.id = args.id;
    this.message = args.message;
    this.error = args.error;
  }
}

export class UnexpectedResponseContentType extends Error implements IBaseError {
  id: number;
  message: string;
  error: Error;

  constructor(args: IBaseError) {
    super();
    this.id = args.id;
    this.message = args.message;
    this.error = args.error;
  }
}

export class InvalidF95Token extends Error {}

export class UserNotLogged extends Error {}

export class ParameterError extends Error {}

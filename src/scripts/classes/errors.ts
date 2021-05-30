// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

interface IBaseError {
  /**
   * Unique identifier of the error.
   * Must be greater than zero.
   */
  id: number;
  /**
   * Error message.
   * Cannot be empty.
   */
  message: string;
  /**
   * Error to report.
   */
  error: Error;
}

export const USER_NOT_LOGGED = "User not authenticated, unable to continue";
export const INVALID_USER_ID = "Invalid user ID";
export const INVALID_POST_ID = "Invalid post ID";
export const INVALID_THREAD_ID = "Invalid thread ID";
export const INVALID_ERROR_ID = "The error ID cannot be null and must be greater than zero";
export const INVALID_ERROR_MESSAGE = "The error message cannot be null or empty";
export const INVALID_ERROR_ERROR = "The reporting error cannot be null";

export class BaseAPIError extends Error implements IBaseError {
  id: number;
  message: string;
  error: Error;

  constructor(args: IBaseError) {
    super();

    // Check arguments
    if (!args.id || args.id < 0) throw new ParameterError(INVALID_ERROR_ID);
    if (!args.message || args.message === "") throw new ParameterError(INVALID_ERROR_MESSAGE);
    if (!args.error) throw new ParameterError(INVALID_ERROR_ERROR);

    // Assign arguments
    this.id = args.id;
    this.message = args.message;
    this.error = args.error;
  }
}

export class GenericAxiosError extends BaseAPIError {
  constructor(args: IBaseError) {
    super(args);
  }
}

export class UnexpectedResponseContentType extends BaseAPIError {
  constructor(args: IBaseError) {
    super(args);
  }
}

export class InvalidF95Token extends Error {}

export class UserNotLogged extends Error {}

export class InvalidID extends Error {}

export class ParameterError extends Error {}

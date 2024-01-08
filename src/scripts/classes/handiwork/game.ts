// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Modules from files
import { DEFAULT_DATE } from '../../constants/generic.js';
import { IGame } from '../../interfaces.js';
import { TEngine, TStatus } from '../../types.js';

import Basic from './basic.js';

export default class Game extends Basic implements IGame {
  //#region Properties
  censored: boolean = false;
  engine: TEngine = "Ren'Py";
  genre: string[] = [];
  installation: string = '';
  language: string[] = [];
  lastRelease: Date = DEFAULT_DATE;
  os: string[] = [];
  status: TStatus = 'Ongoing';
  version: string = '';
  //#endregion Properties

  public constructor(init?: Partial<Basic>) {
    super();
    Object.assign(this, init);
  }
}

// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Modules from files
import { IAsset } from '../../interfaces.js';

import Basic from './basic.js';

export default class Asset extends Basic implements IAsset {
  //#region Properties
  assetLink: string = '';
  associatedAssets: string[] = [];
  compatibleSoftware: string = '';
  includedAssets: string[] = [];
  officialLinks: string[] = [];
  sku: string = '';
  //#endregion Properties

  public constructor(init?: Partial<Asset>) {
    super();
    Object.assign(this, init);
  }
}

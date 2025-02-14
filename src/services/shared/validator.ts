import { SpaceEntry } from '../model/model';

export function validateAsSpaceEntry(arg: any) {
  if ((arg as SpaceEntry).location === undefined) {
    throw new MissingFieldError('location');
  }
  if ((arg as SpaceEntry).name === undefined) {
    throw new MissingFieldError('name');
  }
}

export class MissingFieldError extends Error {
  constructor(missingField: string) {
    super(`Value for ${missingField} expected`);
  }
}

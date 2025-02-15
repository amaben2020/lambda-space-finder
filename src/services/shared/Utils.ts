import { randomUUID } from 'node:crypto';

export function parseJson(arg: string) {
  try {
    return JSON.parse(arg);
  } catch (error) {
    if (error instanceof JSONError) {
      throw new JSONError(error.message);
    }
  }
}

class JSONError extends Error {}

// class ValidationError extends Error {
//   constructor(message: string, public field: string) {
//     super(message);
//     this.name = 'ValidationError';
//     this.field = field;
//   }
// }

// // Usage
// try {
//   throw new ValidationError('Invalid input', 'email');
// } catch (error) {
//   if (error instanceof ValidationError) {
//     console.error(`Validation error in field ${error.field}: ${error.message}`);
//   } else {
//     console.error('Unexpected error:', error);
//   }
// }

// not depending of v4 anymore
export function createRandomUUID() {
  return randomUUID();
}

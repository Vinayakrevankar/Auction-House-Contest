import * as httpUtil from './httpUtil';

interface CustomError extends Error {
  code?: number;
  custom?: boolean;
}

function customException(message: string, code?: number): CustomError {
  const error: CustomError = new Error(message);
  error.code = code;
  error.custom = true;
  return error;
}

export {
  httpUtil,
  customException
};

type ErrorResponse = [string | null, string];
type SuccessResponse<T> = {
  status: number;
  errorCode: null | string;
  message: string;
  payload: T | null;
};

export const getSuccess = <T>(payload: T | null = null, message = 'OK'): SuccessResponse<T> => ({
  status: 200,
  errorCode: null,
  message,
  payload,
});

export const getCreated = <T>(payload: T | null = null, message = 'Created'): SuccessResponse<T> => ({
  status: 201,
  errorCode: null,
  message,
  payload,
});

export const getBadRequest = (error: ErrorResponse = [null, 'Bad Request']): SuccessResponse<null> => ({
  status: 400,
  errorCode: error[0],
  message: error[1],
  payload: null,
});

export const getException = (error: ErrorResponse = [null, 'Internal Server Error']): SuccessResponse<null> => ({
  status: 500,
  errorCode: error[0],
  message: error[1],
  payload: null,
});

export const getNotFound = (error: ErrorResponse = [null, 'Resource Not Found']): SuccessResponse<null> => ({
  status: 404,
  errorCode: error[0],
  message: error[1],
  payload: null,
});

export const getUnauthorized = (error: ErrorResponse = [null, 'Unauthorized']): SuccessResponse<null> => ({
  status: 401,
  errorCode: error[0],
  message: error[1],
  payload: null,
});

export const getAccessDenied = (error: ErrorResponse = [null, 'Forbidden']): SuccessResponse<null> => ({
  status: 403,
  errorCode: error[0],
  message: error[1],
  payload: null,
});

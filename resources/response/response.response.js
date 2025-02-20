const Response = {
  successResp: (message, data) => ({
    status: 'success',
    message,
    data,
  }),

  failResp: (message, error) => ({
    status: 'fail',
    message,
    error,
  }),

  validationFailResp: (message, error) => ({
    status: 'fail',
    message,
    error,
  }),
};

export default Response;

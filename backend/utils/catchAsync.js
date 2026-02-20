/**
 * catchAsync - A wrapper to eliminate repetitive try/catch blocks in express controllers.
 * It catches any errors from an async function and passes them to the next() middleware.
 */
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

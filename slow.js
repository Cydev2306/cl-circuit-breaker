module.exports = function(shouldBeSlow) {
  return function(req, res, next) {
    if (shouldBeSlow) {
      return setTimeout(function () {
        next();
      }, 5000);
    }
    next();
  }
}

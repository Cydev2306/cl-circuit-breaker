var onFinished = require('on-finished');
var onHeaders = require('on-headers');
var circuitStatus = 'CLOSE';
var numberOfErrors = 0;

module.exports = function breaker(threshold) {
  var limit = threshold || 5;

  return function(req, res, next) {
    onFinished(res, () => {
      if(res.statusCode === 503 || req.timedout) {
        numberOfErrors++;
        if(numberOfErrors >= threshold) {
          circuitStatus = "OPEN";
        }
      }
    });
    req.circuitStatus = circuitStatus;
    next();
  }
}

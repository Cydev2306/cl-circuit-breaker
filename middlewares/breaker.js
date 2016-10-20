var onFinished = require('on-finished');
var onHeaders = require('on-headers');
var circuitStatus = 'CLOSE';
var numberOfErrors = 0;

module.exports = function breaker(threshold, librato) {
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
    librato.measure('circuitStatus', ['OPEN', 'HALF_OPEN','CLOSE'].indexOf(circuitStatus));
    next();
  }
}

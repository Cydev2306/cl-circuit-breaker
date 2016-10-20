// require the dependencies we installed
var app = require('express')();
var morgan = require('morgan');
var callApi = require('./utils/api');
var timeout = require('connect-timeout');
var port = process.env.PORT || 3000;
var cors = require('cors');
var librato = require('librato-node');

if(process.env.NODE_ENV === 'production') {
  librato.configure({email: process.env.LIBRATO_MAIL, token: process.env.LIBRATO_TOKEN});
  app.use(librato.middleware());
}

// Custom middlewares
var breaker = require('./middlewares/breaker');

app.use(morgan('dev'));
app.use(cors());
app.use(timeout('2s', { respond: false }));
/* SLOW error testing
app.use((req,res, next) => {
  setTimeout(function () {
    next();
  }, 2500);
});*/

app.use(breaker(2));

app.use((req, res, next) => {
  console.log(req.timedout);
  if(!req.timedout || req.circuitStatus === 'OPEN') {
    next();
  } else {
    res.status(503).json({error:  'Timeout error.'});
  }
});


app.get('/orders', function(req, res) {
  callApi("orders", req.circuitStatus, res)
});

//pizzas
app.get('/pizzas', function(req, res) {
  callApi("pizzas", req.circuitStatus, res)
});

app.listen(port, function(){
  console.log('Server listening on port: ', port);
});

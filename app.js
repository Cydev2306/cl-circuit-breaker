// require the dependencies we installed
var app = require('express')();
var morgan = require('morgan');
var callApi = require('./utils/api');
var timeout = require('connect-timeout');
var port = process.env.PORT || 3000;
var cors = require('cors');
var librato = require('librato-node');

var bodyParser = require('body-parser');
var multer = require('multer');

librato.configure({email: process.env.LIBRATO_MAIL, token: process.env.LIBRATO_TOKEN});
librato.start()
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(librato.middleware());

// Custom middlewares
var breaker = require('./middlewares/breaker');

app.use(morgan('dev'));
app.use(cors());
app.use(timeout('2s', { respond: false }));
app.use(breaker(2, librato));

app.use((req, res, next) => {
  if(!req.timedout || req.circuitStatus === 'OPEN') {
    next();
  } else {
    res.status(503).json({error:  'Timeout error.'});
  }
});

app.post('/orders', function(req ,res) {
  if(req.circuitStatus === 'CLOSE') {
    librato.measure('orders-create', 1);
    return callApi(`orders`, 'post', req, res, false);
  }

  return res.status(403).json({error: "Can't create order. API unavailable."});
});

app.get('/orders/:id', function(req, res) {
  librato.measure('orders-single', 1);
  callApi(`orders/${req.params.id}`, 'get', req, res, false);
});

app.get('/orders', function(req, res) {
  librato.measure('orders', 1);
  callApi("orders", 'get', req, res, true);
});

//pizzas
app.get('/pizzas', function(req, res) {
  librato.measure('pizzas', 1);
  callApi("pizzas", 'get', req, res, true);
});

app.listen(port, function(){
  console.log('Server listening on port: ', port);
});

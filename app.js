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

app.use(timeout('2s', { respond: true }));

librato.configure({email: process.env.LIBRATO_MAIL, token: process.env.LIBRATO_TOKEN});
librato.start()
app.use(bodyParser.json()); // for parsing application/json
app.use(haltOnTimeout);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(haltOnTimeout);
app.use(librato.middleware());
app.use(haltOnTimeout);
// Custom middlewares
var breaker = require('./middlewares/breaker');
app.use(morgan('dev'));
app.use(haltOnTimeout);
app.use(cors());
app.use(haltOnTimeout);
app.use(breaker(5, librato));
app.use(haltOnTimeout);

function haltOnTimeout(req, res, next) {
  if(!req.timedout) {
    return next();
  }
}

app.post('/orders', function(req ,res) {
  if(req.circuitStatus === 'CLOSE') {
    librato.measure('orders-create', 1);
    callApi(`orders`, 'post', req, res, false);
  }else{
    res.status(403).json({error: "Can't create order. API unavailable."});
  }
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

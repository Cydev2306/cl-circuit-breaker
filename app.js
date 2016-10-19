// require the dependencies we installed
var app = require('express')();
var redis = require('redis');
var morgan = require('morgan');
var slow = require('./slow');

require('es6-promise').polyfill();
require('isomorphic-fetch');

var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    Authorization: `luc.cyril`,
};

var API_URL = "http://pizzapi.herokuapp.com"
var port = process.env.PORT || 3000;

// create a new redis client and connect to our local redis instance
var client = redis.createClient();
client.on('error', function (err) {
    console.log("Error " + err);
});
client.on('connect', function() {
    console.log('connected');
});
//END Redis creation

function Wrapper(param,res){
  return fetch(`${API_URL}/${param}`,{
     headers
   })
   .then(response =>
     response.json().then(json => ({ json, response }))
   )
   .then((responseObj) => {
    if (!responseObj.response.ok) {
      res.sendStatus(403);
      return client.get(param)
    }

    client.set(param, JSON.stringify(responseObj.json));
    return res.send(responseObj.json);
  });
};

app.use(morgan('dev'));
app.use(slow(true));

app.get('/orders', function(req, res) {
  console.log("orders")
  Wrapper("orders",res)
});

//pizzas
app.get('/pizzas', function(req, res) {
  console.log("pizzas")
   Wrapper("pizzas",res)
});

app.listen(port, function(){
  console.log('Server listening on port: ', port);
});

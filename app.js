// require the dependencies we installed
var app = require('express')();
var responseTime = require('response-time');
var redis = require('redis');


require('es6-promise').polyfill();
require('isomorphic-fetch');

var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    Authorization: `luc.cyril`,
}
var url = "http://pizzapi.herokuapp.com"
// create a new redis client and connect to our local redis instance
var client = redis.createClient();

function Wrapper(param,res){
  return fetch(`${url}/${param}`,{
     headers
   })
   .then(response =>
     response.json().then(json => ({ json, response }))
   )
   .then((responseObj) => {
    if (!responseObj.response.ok) {
      res.sendStatus(403);
      return client.get(data)
    }

    client.set(param,JSON.stringify(responseObj.json))


    var result = client.get(param,function(err,res){
      console.log("into : "+res);
    });
    console.log("outside :"+result)
    return res.send(responseObj.json);
  });
};
// if an error occurs, print it to the console
client.on('error', function (err) {
    console.log("Error " + err);
});
client.on('connect', function() {
    console.log('connected');
});
app.set('port', (process.env.PORT || 5000));

// set up the response-time middleware
app.use(responseTime());
// Store data
//client.set('framework', 'AngularJS');

app.get('/orders', function(req, res) {
  console.log("orders")
  Wrapper("orders",res)
});
  //pizzas
app.get('/pizzas', function(req, res) {
  console.log("pizzas")
   Wrapper("pizzas",res)
});

//Mock api dev pour le slow
app.get('/mock/pizzas', function(req, res) {
  result = [{"id":1,"name":"Margharita","price":1320},{"id":2,"name":"Regina","price":1240}];
  setTimeout(function(){
    res.send(responseObj.json)
  },5000)
});

app.get('/mock/orders', function(req, res){
  result = [{"id":1,"pizza":{"id":1,"name":"Margharita","price":1320},"status":"finished","CreatedAt":"2016-10-19T12:01:55.387698613Z"},
    {"id":2,"pizza":{"id":1,"name":"Margharita","price":1320},"status":"finished","CreatedAt":"2016-10-19T12:07:27.898098861Z"},
    {"id":3,"pizza":{"id":2,"name":"Regina","price":1240},"status":"finished","CreatedAt":"2016-10-19T12:07:31.380289161Z"},
    {"id":4,"pizza":{"id":1,"name":"Margharita","price":1320},"status":"finished","CreatedAt":"2016-10-19T12:08:05.789792804Z"},
    {"id":5,"pizza":{"id":1,"name":"Margharita","price":1320},"status":"finished","CreatedAt":"2016-10-19T12:21:54.873452553Z"},
    {"id":6,"pizza":{"id":1,"name":"Margharita","price":1320},"status":"finished","CreatedAt":"2016-10-19T12:23:11.815170092Z"},
    {"id":7,"pizza":{"id":2,"name":"Regina","price":1240},"status":"finished","CreatedAt":"2016-10-19T12:40:13.51264093Z"},
    {"id":8,"pizza":{"id":1,"name":"Margharita","price":1320},"status":"finished","CreatedAt":"2016-10-19T12:52:31.901825156Z"},
    {"id":9,"pizza":{"id":2,"name":"Regina","price":1240},"status":"finished","CreatedAt":"2016-10-19T12:56:27.138775787Z"},
    {"id":10,"pizza":{"id":1,"name":"Margharita","price":1320},"status":"finished","CreatedAt":"2016-10-19T13:17:23.277712093Z"},
    {"id":11,"pizza":{"id":1,"name":"Margharita","price":1320},"status":"finished","CreatedAt":"2016-10-19T13:24:38.32403522Z"},
    {"id":12,"pizza":{"id":2,"name":"Regina","price":1240},"status":"finished","CreatedAt":"2016-10-19T13:55:25.722306361Z"},
    {"id":13,"pizza":{"id":2,"name":"Regina","price":1240},"status":"finished","CreatedAt":"2016-10-19T14:30:33.549381146Z"},
    {"id":14,"pizza":{"id":1,"name":"Margharita","price":1320},"status":"delivering","CreatedAt":"2016-10-19T14:34:25.290005632Z"},
    {"id":15,"pizza":{"id":2,"name":"Regina","price":1240},"status":"cooking","CreatedAt":"2016-10-19T14:36:18.419104741Z"},
    {"id":16,"pizza":{"id":2,"name":"Regina","price":1240},"status":"cooking","CreatedAt":"2016-10-19T14:37:32.333511477Z"},
    {"id":17,"pizza":{"id":2,"name":"Regina","price":1240},"status":"processing","CreatedAt":"2016-10-19T14:43:51.574515137Z"},
    {"id":18,"pizza":{"id":1,"name":"Margharita","price":1320},"status":"processing","CreatedAt":"2016-10-19T14:44:17.783440998Z"}];

    setTimeout(function(){
      res.send(result)
    },5000)

});


app.listen(app.get('port'), function(){
  console.log('Server listening on port: ', app.get('port'));
});

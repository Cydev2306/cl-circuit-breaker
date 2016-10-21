require('es6-promise').polyfill();
require('isomorphic-fetch');
var client = require('./redis')();

var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    Authorization: 'luc.cyril',
};

var API_URL = "http://pizzapi.herokuapp.com";

function callApi(param, method, req, res, needCache){
  if (req.circuitStatus !== 'OPEN') {
    var fetchParameters = {
      headers,
      method,
    }

    if (method === 'post') {
      fetchParameters.body = JSON.stringify(req.body);
    }

    return fetch(`${API_URL}/${param}`,fetchParameters)
     .then(response =>
       response.json().then(json => ({ json, response }))
     )
     .then((responseObj) => {
      if (!responseObj.response.ok) {
        res.sendStatus(500);
        return client.get(param);
      }
      if (needCache) {
        client.set(param, JSON.stringify(responseObj.json));
        responseObj.json.forEach((elmt) => {
          client.set(`${param}:${elmt.id}`, JSON.stringify(elmt));
        });
      }

      const responseJson = Object.assign(
        {},
        {cached: false},
        {data: responseObj.json}
      );
      return res.status(200).json(responseJson);
    });
  }

  return client.get(`${param.split('/').join(':').trim()}`)
    .then((result) => {
      const cachedValues = Object.assign(
        {},
        {cached: true},
        {data: JSON.parse(result)}
      );
      res.status(200).json(cachedValues);
    });
};

module.exports = callApi;

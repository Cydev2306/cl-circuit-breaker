require('es6-promise').polyfill();
require('isomorphic-fetch');
var client = require('./redis')();

var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    Authorization: `luc.cyril`,
};

var API_URL = "http://pizzapi.herokuapp.com";

function callApi(param, status, res){
  if (status !== 'OPEN') {
    return fetch(`${API_URL}/${param}`,{
       headers
     })
     .then(response =>
       response.json().then(json => ({ json, response }))
     )
     .then((responseObj) => {
      if (!responseObj.response.ok) {
        res.sendStatus(403);
        return client.get(param);
      }
      client.set(param, JSON.stringify(responseObj.json));
      const responseJson = Object.assign(
        {},
        {cached: false},
        {data: responseObj.json}
      );
      return res.status(200).json(responseJson);
    });
  }

  return client.get(param)
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

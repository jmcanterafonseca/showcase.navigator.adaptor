'use strict';

const Hapi = require('hapi');
const Request = require('request');

var config = require('./config.json');

const server = new Hapi.Server();
server.connection({
  port: config.serverPort
});

var Joi = require('joi');

server.route({
    method: 'GET',
    path: '/v2/entities',
    config: {
      validate: {
        query: {
            type:     Joi.string().required(),
            coords:   Joi.string().required(),
            georel:   Joi.string().required(),
            geometry: Joi.string().required()
        }
      }
    },
    handler: function (request, reply) {
      var georel = request.query.georel;
      var geoTokens = georel.split(';');
      
      if (geoTokens.length < 2) {
        console.error('Max distance is not provided');
        reply({
          "error": "error"
        });
        return;
      }
      
      var georel1 = geoTokens[0];
      var georel2 = geoTokens[1];
      
      var distanceParams = georel2.split(':');
      if (distanceParams[0] !== 'maxDistance') {
        console.error('Max distance is not provided');
        reply({
          "error": "error"
        });
        return;
      }
      
      var maxDistance = distanceParams[1];
      var coords = request.query.coords;
      var geometry = request.query.geometry;
      var types = request.query.type.split(',');
      var coords = request.query.coords;
       
      var requestData = {
        coords:   coords,
        georel:   georel1,
        geometry: geometry,
        types:    types,
        maxDistance: maxDistance,
        // full georel param (needed for Orion v2 queries)
        fullGeoRel: georel
      };
       
      // Obtains the end point which provides data about the city
      getEndPointData(coords).then(function(configData) {
        if (configData.length === 1) {
          return getData(configData[0], requestData);
        }
        else {
          console.log('Configuration not found for the city. Empty response');
          return Promise.resolve([]);
        }
      }, function err(error) {
          reply(error);
      }).then(function(smartCityData) {
          // Here smart city data is ready to be delivered
          reply(smartCityData);
      }).catch(function(err) {
        console.error(err);
        reply(err);
      });
    }
});

function getData(configData, requestData) {
  var requests = [];
  
  var brokers = configData.cityBrokers;
  
  requestData.types.forEach(function(aType) {
    if (brokers[aType]) {
      var brokerData = brokers[aType];
      var providerFunction = getProviderFunction(brokerData);
      requests.push(providerFunction(brokerData, requestData));
    }
    else {
      console.warn('No provider found for: ', aType);
    }
  });
  
  return Promise.all(requests);
}

function getProviderFunction(brokerData) {
  if (brokerData.serviceType === 'ngsi-v1') {
    return queryOrionV1;
  }
  else if (brokerData.serviceType === 'ngsi-v2') {
    return queryOrionV2;
  }
  else if (brokerData.serviceType === 'ost') {
     return queryOST;
  }
}

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});


function getEndPointData(coords) {
  return new Promise(function(resolve, reject) {
    getCity(coords).then(function(cityData) {
      return queryOrionV2({
        url: config.rootContextBrokerUrl + '/v2',
        entityType: 'CityConfiguration'
      }, {
        q: cityData
      });
    }, reject).then(resolve, reject).catch(reject);
  });
}

function queryOrionV2(serviceData, queryData) {
  return new Promise(function(resolve, reject) {
    var q = '';
  
    if (queryData.q) {
      Object.keys(queryData.q).forEach(function(aKey) {
        q += aKey + '==' + queryData.q[aKey] + ';'
      });
    }
    
    if (serviceData.q) {
      Object.keys(serviceData.q).forEach(function(aKey) {
        q += aKey + ':' + serviceData.q[aKey] + ';'
      });
    }
    
    var options = {
      baseUrl: serviceData.url,
      url: '/entities',
      qs: {
        type: serviceData.entityType,
        options: 'keyValues'
      },
      headers: {
        'Accept': 'application/json'
      },
      json: true
    };
    
    if (q.length > 0) {
      options.qs.q = q;
    }
    
    // Check for georel query params
    if (queryData.georel) {
      options.qs.georel   = queryData.fullGeoRel;
      options.qs.coords   = queryData.coords;
      options.qs.geometry = queryData.geometry;
      options.qs.orderBy  = 'geo:distance';
    }
    
    console.log('Orion V2 query', JSON.stringify(options));
    
    Request.get(options, function(err, response, body) {
      if (err) {
        reject(err.message);
        return;
      }
      
      if (!body) {
        reject('Body is not valid');
        return;
      }
      if (response.statusCode !== 200) {
        reject('HTTP Error: ' + response.statusCode);
        return;
      }
      
      resolve(body);
    });
  });
}

function queryOrionV1(serviceData, queryData) {
  console.log('Orion v1 Query: ', JSON.stringify(serviceData),
              JSON.stringify(queryData));
  
  var Orion = require('fiware-orion-client');
  var OrionClient = new Orion.Client({
    url: serviceData.url,
    service: serviceData.fiwareService,
    path: serviceData.fiwareServicePath,
    userAgent: 'fiware-here-adapter'
  });
  
  var queryParams = {
    type: serviceData.entityType,
    pattern: serviceData.pattern
  };
  
  var locationOptions = {
     coords: queryData.coords,
     geometry: 'Circle',
     radius: queryData.maxDistance
  };
  
  return OrionClient.queryContext(queryParams, {
    location: locationOptions
  });
}

function queryOST(serviceData, requestData) {
  var OrionHelper = require('fiware-orion-client').NgsiHelper;
  
  return new Promise(function(resolve, reject) {
    var coordsArr = requestData.coords.split(',');
    var coordsStr = coordsArr[1] + ',' + coordsArr[0];

    var options = {
      url: serviceData.url,
      qs: {
        center: coordsStr,
        range: requestData.maxDistance / 1000,
        key: serviceData.key
      },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'fiware-here-adapter'
      },
      json: true
    };

    if (serviceData.poisCat) {
      options.qs.category = serviceData.poisCat;
    }
    
    console.log('OST service: ', JSON.stringify(options.qs));

    Request.get(options, function(err, response, body) {
      if (err) {
        reject(err.message);
      }
      if (!body) {
        reject('Body is not valid');
      }
      if (response.statusCode !== 200) {
        reject('HTTP Status Code is not valid:' + response.statusCode);
      }

      if (body.errorCode) {
        if (body.errorCode.code === '404') {
          resolve([]);
        } else {
          reject(body.errorCode);
        }
      }
      
      resolve(OrionHelper.parse(body));
    });
  });
}


function getCity(coords) {
  return new Promise(function(resolve, reject) {
    var finalCoords = coords.split(',').slice(0,2).join(',');
    console.log('FINAL coords', finalCoords);
    
    var options = {
      baseUrl: config.here.reverseGeocodingUrl,
      url: '/6.2/reversegeocode.json',
      qs: {
        'app_id': config.here.appId,
        'app_code': config.here.appCode,
        prox: finalCoords + ',100',
        gen: 9,
        mode: 'retrieveAddresses'
      },
      headers: {
        'Accept': 'application/json'
      },
      json: true
    };

    Request.get(options, function(err, response, body) {
      if (err) {
        reject(err.message);
        return;
      }
      
      if (!body) {
        reject('Body is not valid');
        return;
      }
      if (response.statusCode !== 200) {
        reject('HTTP Error: ' + response.statusCode);
        return;
      }
  
      try {
        var address = body.Response.View[0].Result[0].Location.Address;
      }
      catch(Error) {
        reject('Data not found while resolving address');
      }

      var cityInfo = {
        addressLocality: address.City,
        addressCountry: address.Country
      };
      
      resolve(cityInfo);
    });
  });
}
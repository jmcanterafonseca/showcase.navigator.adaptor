'use strict';

/**
 *   Main entry point for the adaptor server
 * 
 *
 */

const Hapi    = require('hapi');
const Joi     = require('joi');
const Request = require('request');

// Server configuration
const config  = require('./config.json');

require('./utils/promise.js');

const Retrievers = require('./retrievers.js');

const server = new Hapi.Server();
server.connection({
  port: config.serverPort
});


const PARKING        = 'Parking';
const STREET_PARKING = 'StreetParking';
const PARKING_LOT    = 'ParkingLot';

const Bf = require('./business_fwk.js');

server.route({
    method: 'GET',
    path: '/v2/entities',
    config: {
      validate: {
        query: {
            type:     Joi.string().required(),
            coords:   Joi.string().required(),
            georel:   Joi.string().required(),
            geometry: Joi.string().required(),
            token:    Joi.string().optional()
        }
      }
    },
    
    handler: function (request, reply) {
      var georel = request.query.georel;
      var geoTokens = georel.split(';');
      
      var isNear = georel.indexOf('near') !== -1;
      
      if (isNear && geoTokens.length < 2) {
        console.error('Max distance is not provided');
        reply({
          "error": "error"
        });
        return;
      }
      
      var maxDistance = -1;
      if (isNear) {
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
        maxDistance = distanceParams[1];
      }
      else {
        georel1 = georel;
      }
      
      var typeParam = request.query.type;
  
      var coords      = request.query.coords;
      var geometry    = request.query.geometry;
      var types       = typeParam.split(',');
      
      var token       = request.query.token;
      
      // Make 'Parking' a synonym for 'StreetParking' and 'ParkingLot'
      var index = types.indexOf(PARKING);
      if (index !== -1) {
        types = types.filter(function (item) {
          return (item !== PARKING);
        });
        types = types.concat([STREET_PARKING, PARKING_LOT]);
      }
       
      var requestData = {
        coords:   coords,
        georel:   georel1,
        geometry: geometry,
        types:    types,
        maxDistance: maxDistance,
        // full georel param (needed for Orion v2 queries)
        fullGeoRel: georel
      };
      
      if (token) {
        requestData.token = token;
      }
       
      // Obtains the end point which provides data about the city
      getEndPointData(coords).then(function (configData) {
        if (configData.length === 1) {
          return getData(configData[0], requestData);
        }
        else {
          console.warn('Configuration not found for the city. Empty response');
          return Promise.resolve([]);
        }
      }).then(function (data) {
          if (!data) {
            return;
          }
          // Here smart city data is ready to be delivered
          var out = [];
          for (let result of data.results) {
            if (result) {
              result = Array.isArray(result) ? result : [result];
              out = out.concat(result);
            }
          }
          reply(out);
      }).catch(function (err) {
        console.error(err);
        reply(err);
      });
    }
});


function getData(configData, requestData) {
  return new Promise(function(resolve, reject) {
    getDataPhase1(configData, requestData).then(function(results) {
      if (requestData.types.indexOf('.*') === -1) {
        resolve(results);
        return;
      }
      
      // This checks what was returned by the Business Framework
      if (results[requestData.types.length]) {
        console.log('BF Response: ', JSON.stringify(results[requestData.types.length]));
        resolve(results.slice(0, results.length - 2));
      }
    }, reject);
  });
}

// Obtains the final data to be delivered to the client
function getDataPhase1(configData, requestData) {
  var requests = prepareDataRequest(configData.cityBrokers, requestData);
  // Take opportunity to query the BF to check if there are additional
  if (requestData.types.indexOf('.*') !== -1) {
    requests.push(new Bf.BfQuery(requestData.token));
  }
  return executeTasks(requests);
}

// Executes a set of tasks in parallel 
function executeTasks(requests) {
  var executionData = Promise.parallel(requests);
  
  var resultHandler = function(r) {
    console.log('Done!!', r.subject,
                requests[r.subject].serviceData.entityType,
                requests[r.subject].serviceData.url);
  }
  
  for(var p of executionData.futures) {
    p.then(resultHandler, function rejected(r) {
      console.error('Error executing request: ',
                    requests[r.subject].serviceData.entityType,
                    requests[r.subject].serviceData.url,
                    r.error);
    });
  }   
  
  return executionData.all;
}

function prepareDataRequest(brokers, requestData) {
  var requests = [];
  
  requestData.types.forEach(function(aType) {
    if (brokers[aType]) {
      var brokerData = brokers[aType];
      var retriever = getRetriever(brokerData, requestData);
      requests.push(retriever);
    }
    else {
      console.warn('No provider found for: ', aType);
    }
  });
  
  return requests;
}

// Determines a provider function
function getRetriever(brokerData, requestData) {
  if (brokerData.serviceType === 'ngsi-v1') {
    return new Retrievers.NgsiV1Retriever(brokerData, requestData);
  }
  else if (brokerData.serviceType === 'ngsi-v2') {
    return new Retrievers.NgsiV2Retriever(brokerData, requestData);
  }
  else if (brokerData.serviceType === 'ost') {
     return new Retrievers.OstRetriever(brokerData, requestData);
  }
}

// Obtains all the end point data for the given coordinates
function getEndPointData(coords) {
  return new Promise(function(resolve, reject) {
    getCity(coords).then(function(cityData) {
      console.log('City data:', cityData);
      return new Retrievers.NgsiV2Retriever({
        url: config.rootContextBrokerUrl + '/v2',
        entityType: 'CityConfiguration'
      }, {
        q: cityData
      }).run();
    }, reject).then(resolve, reject).catch(reject);
  });
}


// Given a set of coordinates obtains the concerned city
function getCity(coords) {
  return new Promise(function(resolve, reject) {
    var finalCoords = coords.split(',').slice(0,2).join(',');
    console.log('FINAL coords', finalCoords);
    
    var options = {
      baseUrl: config.here.reverseGeocodingUrl,
      url: '/6.2/reversegeocode.json',
      qs: {
        'app_id':   config.here.appId,
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
      
      console.log('Address: ', address);

      var cityInfo = {
        addressLocality: address.City,
        addressCountry: address.Country
      };
      
      resolve(cityInfo);
    });
  });
}

server.start((err) => {
  if (err) {
      throw err;
  }
  console.log('Server running at:', server.info.uri);
});
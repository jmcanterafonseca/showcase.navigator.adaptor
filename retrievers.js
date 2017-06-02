'use strict';

const Request = require('request');
const adaptorsMap = require('./adaptors.js');

const DEFAULT_TIMEOUT = 5000;

function NgsiV2Retriever(serviceData, queryData) {
  this.serviceData = serviceData;
  this.queryData = queryData;
}

NgsiV2Retriever.prototype.run = function() {
  return queryOrionV2(this.serviceData, this.queryData);
}

function queryOrionV2(serviceData, queryData) {
  if (!serviceData.idm) {
    return queryOrionV2Data(serviceData, queryData);
  }
  
  return getAuthToken(serviceData).then(function(token) {
    console.log('Token obtained: ', token);
    
    serviceData.token = token;
    
    return queryOrionV2Data(serviceData, queryData);
  }, function token_err(err) {
      console.error('Error while retrieving token: ', err);
      return Promise.reject(err);
  });
}

// Performs a query through NGSIv2
function queryOrionV2Data(serviceData, queryData) {
  console.log(JSON.stringify(serviceData));
  console.log(JSON.stringify(queryData));
  
  return new Promise(function(resolve, reject) {
    var q = '';
  
    if (queryData.q) {
      Object.keys(queryData.q).forEach(function(aKey) {
        q += aKey + '==' + queryData.q[aKey] + ';';
      });
      // Avoid the trailing ';' Orion does not like
      q = q.substring(0, q.length - 1);
    }
    
    if (serviceData.q) {
      Object.keys(serviceData.q).forEach(function(aKey) {
        var value = serviceData.q[aKey];
        if (value.indexOf(',') !== -1 || value.indexOf(' ') !== -1) {
          value = "'" + value + "'";
        }
        q += aKey + ':' + value + ';';
      });
    }
    
    if (queryData.extraQ) {
      q += ';' + queryData.extraQ;
    }
    
    var options = {
      baseUrl: serviceData.url,
      strictSSL:false,
      uri: '',
      qs: {
        type: serviceData.entityType,
        options: 'keyValues'
      },
      headers: {
        'Accept': 'application/json'
      },
      json: true,
      
      timeout: DEFAULT_TIMEOUT
    };
    
    // Extra headers service, servicepath and token
    if (serviceData.fiwareService) {
      options.headers['Fiware-Service'] = serviceData.fiwareService;
    }
    
    if (serviceData.fiwareServicePath) {
       options.headers['Fiware-Servicepath'] = serviceData.fiwareServicePath;
    }
    
    if (serviceData.token) {
       options.headers['x-auth-token'] = serviceData.token;
    }
    
    if (serviceData.sofia2Token) {
      options.headers['x-sofia2-apikey'] = serviceData.sofia2Token;
    }
    
    if (q.length > 0) {
      options.qs.q = q;
    }
    
    // Check for georel query params
    if (!serviceData.noGeoNeeded && queryData.georel) {
      options.qs.georel   = queryData.fullGeoRel;
      options.qs.coords   = queryData.coords;
      options.qs.geometry = queryData.geometry;
      options.qs.orderBy  = 'geo:distance';
    }
    
    console.log('NGSI V2 query', JSON.stringify(options));
    console.log('Headers: ', JSON.stringify(options.headers));
    
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

function NgsiV1Retriever(serviceData, queryData) {
  this.serviceData = serviceData;
  this.queryData = queryData;
}

NgsiV1Retriever.prototype.run = function() {
  return new Promise((resolve, reject) => {
    queryOrionV1(this.serviceData, this.queryData).then((data) => {
      var out = data;
      if (!out) {
        resolve([]);
        return;
      }
      
      if (!Array.isArray(out)) {
        out = [out];
      }
      
      var adapter = this.serviceData.adapterKey;
      if (adapter) {
         console.log('Adapter: ', adapter);
         out = adaptorsMap[adapter](out);
      }
      
      resolve(out);
    }, (error) => reject);
  });
}

// Performs a query through NGSIv1
function queryOrionV1(serviceData, queryData) {
  console.log('Orion v1 Query: ', JSON.stringify(serviceData),
              JSON.stringify(queryData));
  
  var Orion = require('fiware-orion-client');
  var OrionClient = new Orion.Client({
    url: serviceData.url,
    service: serviceData.fiwareService,
    path: serviceData.fiwareServicePath,
    userAgent: 'fiware-here-adapter',
    timeout: DEFAULT_TIMEOUT
  });
  
  var queryParams = {
    type: serviceData.entityType
  };
  
  if (serviceData.pattern) {
    queryParams.pattern = serviceData.pattern;
  }
  
  var locationOptions = {
     coords: queryData.coords
  };
  
  if (queryData.fullGeoRel === 'coveredBy') {
    locationOptions.geometry = 'Polygon';
  }
  else {
    locationOptions.geometry = 'Circle';
    locationOptions.radius   = queryData.maxDistance;
  }
  
  return OrionClient.queryContext(queryParams, {
    location: locationOptions
  });
}

function OstRetriever(serviceData, queryData) {
  this.serviceData = serviceData;
  this.queryData = queryData;
}

OstRetriever.prototype.run = function() {
  return new Promise((resolve, reject) => {
    queryOST(this.serviceData, this.queryData).then((data) => {
      var out = data;
      var adapter = this.serviceData.adapterKey;
      if (adapter) {
         console.log('Adapter: ', adapter);
         out = adaptorsMap[adapter](data);
      }
      
      resolve(out);
    }, (error) => reject);
  });
  return 
}

// Performs a query through Porto OST service
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
      json: true,
      
      timeout: DEFAULT_TIMEOUT
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

function getAuthToken(brokerData) {
  var tenant = brokerData.fiwareService;

  if (!brokerData.userName) {
    return Promise.resolve('dummy_token');
  }
  
  return new Promise(function(resolve, reject) {
    
    // Payload needed to obtain a token
    var tokenPayload = {
      "auth": {
        "identity": {
          "methods": ["password"],
          "password": {
            "user": {
              "name": brokerData.userName,
              "domain": { "name": tenant},
              "password": brokerData.password
            }
          }
        }
      }
    };
    
    var requestParameters = {
      uri: brokerData.idm + '/v3/auth/tokens',
      method: 'POST',
      json: tokenPayload
    };

    Request(requestParameters, function (error, response, body) {
      if (!error && response.statusCode === 201) {
        var token = response.headers['x-subject-token'];
        
        console.log('Token retrieved: ', token);
        
        if (token) {
          resolve(token);
        }
        else {
          reject('Token not defined');
        }
      }
      else {
        console.log('HTTP status code returned by getToken: ', response.statusCode);
        reject(response.statusCode);
      }
    });  // Request

  }); // Promise 
}


module.exports.NgsiV2Retriever = NgsiV2Retriever;
module.exports.NgsiV1Retriever = NgsiV1Retriever;
module.exports.OstRetriever    = OstRetriever;
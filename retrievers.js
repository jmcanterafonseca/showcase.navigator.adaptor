'use strict';

const Request = require('request');
const adaptorsMap = require('./adaptors.js');

function NgsiV2Retriever(serviceData, queryData) {
  this.serviceData = serviceData;
  this.queryData = queryData;
}

NgsiV2Retriever.prototype.run = function() {
  return queryOrionV2(this.serviceData, this.queryData);
}

// Performs a query through NGSIv2
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

function NgsiV1Retriever(serviceData, queryData) {
  this.serviceData = serviceData;
  this.queryData = queryData;
}

NgsiV1Retriever.prototype.run = function() {
  return new Promise((resolve, reject) => {
    queryOrionV1(this.serviceData, this.queryData).then((data) => {
      var out = data;
      var adapter = this.serviceData.adapterKey;
      console.log('Adapter: ', adapter);
      if (adapter) {
         out = adaptorsMap[adapter](data);
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

function OstRetriever(serviceData, queryData) {
  this.serviceData = serviceData;
  this.queryData = queryData;
}

OstRetriever.prototype.run = function() {
  return queryOST(this.serviceData, this.queryData);
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

module.exports.NgsiV2Retriever = NgsiV2Retriever;
module.exports.NgsiV1Retriever = NgsiV1Retriever;
module.exports.OstRetriever    = OstRetriever;
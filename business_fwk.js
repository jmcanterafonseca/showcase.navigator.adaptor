'use strict';

const Request = require('request');

const config  = require('./config.json');

function BfQuery(token) {
  this.token = token;
}

BfQuery.prototype.run = function() {
  return getPurchasedDatasets(this.token);
}

function getPurchasedDatasets(token) {
  console.log('Purchased datasets: ', token);
  
  return new Promise(function(resolve, reject) {
    var bfApi = config.businessFrameworkAPI;
    
    console.log(bfApi);
    
    Request({
      url: bfApi,
      headers: {
        'Authorization': 'Bearer ' + token
      },
      json:true
    }, function(err, response, body) {
        if (err) {
          console.log('Error while querying purchased datasets: ', err);
          reject(err);
        }
        
        var serviceData = body;
        var out = [];
        
        console.log(JSON.stringify(serviceData));
        
        serviceData.forEach(function(aService) {
          var productCharacteristics = aService.productCharacteristic;
          var obj = Object.create(null);
          productCharacteristics.forEach(function(aChar) {
            if (aChar.name == 'NGSI Endpoint') {
              obj.endPoint = aChar.value;
            }
            else if (aChar.name == 'NGSIEntityType') {
              obj.entityType = aChar.value;
            }
          });
          out.push(obj);
        });
        
        resolve({ paidDatasets: [
          'Garage',
          'GasStation'
        ] });
    });
  });  
}

module.exports.BfQuery = BfQuery;
'use strict';

function ppm2micrograms(pollutant, value) {
  var out = value;
  
  switch (pollutant) {
    case 'CO':
      out = Math.round(value * 1.1642 * 1000)
      break;
  }
  
  return out;
}

function ppb2micrograms(pollutant, value) {
  var out = value;
  
  switch (pollutant) {
    case 'O3':
      out = Math.round(value * 1.9957)
      break;
    case 'NO2':
      out = Math.round(value * 1.9125)
      break;
    case 'SO2':
      out = Math.round(value * 2.6609)
      break;
  }
  
  return out;
}

function randomIntInc (arg) {
  var high = arg[1] || 100;
  var low = arg[0] || 0;
  return Math.floor(Math.random() * (high - low + 1) + low);
}

function calculatePollutants(item) {
  var out = Object.create(null);
  
  var co = item['carbon_monoxide'];
  if (co) {
    out['CO'] = {
      'description': 'Carbon Monoxide',
      'concentration': ppm2micrograms('CO', co)
    }
  }
  
  var no2 = item['nitrogen_dioxide'];
  if (no2) {
     out['NO2'] = {
      'description': 'Nitrogen Dioxide',
      'concentration': ppb2micrograms('NO2', no2)
    }
  }
  
  var o3 = item['ozone'];
  if (o3) {
     out['O3'] = {
      'description': 'Ozone',
      'concentration': ppb2micrograms('O3', o3)
    }
  }
  
  return out;
}

// Adapters map
var adaptorsMap = {
  'porto-AmbientObserved' : porto_AmbientObserved,
  'porto-ParkingLot'      : porto_ParkingLot
}

// Adapts Ambient Observed data coming from Porto
function porto_AmbientObserved(data) {
  return data.map(function(item) {
    var out = {
      type:        'AmbientObserved',
      id:          'porto-AmbientObserved' + '-' + item.id,
      location:    item.coordinates,
      temperature: item.temperature,
      humidity:    item.humidity,
      noiseLevel:  item.noise_level,
      pollutants:  calculatePollutants(item),
      created:     item.timestamp
    };
    
    return out;
  });
}

// Adapts parking lot data coming from Porto
function porto_ParkingLot(data) {
  // return data;
  return data.map(function(item) {
    var out = {
      type:                'ParkingLot',
      id:                  'porto-ParkingLot-' + '-' + item.id,
      name:                item.name,
      location:            item.geom_feature,
      totalSpotNumber:     randomIntInc([300, 500]),
      availableSpotNumber: randomIntInc([100, 200]),
      address: {
        streetAddress:     item.street,
        addressLocality:   item.municipality,
        addressCountry:    item.country
      },
      description:         item.metadata && item.metadata.description &&
                            item.metadata.description.eng 
    };
    
    return out;
  });
}

module.exports = adaptorsMap;
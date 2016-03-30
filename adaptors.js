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

function calculatePollutants(data) {
  return {
    
  };
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
      pollutants:  calculatePollutants(data)
    };
    
    return out;
  });
}

// Adapts parking lot data coming from Porto
function porto_ParkingLot(data) {
  return data;
}

module.exports = adaptorsMap;
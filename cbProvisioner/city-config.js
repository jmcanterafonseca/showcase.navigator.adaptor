'use strict';

/**
 *   Holds all the configuration for the different cities
 *
 */

var Orion = require('fiware-orion-client');

var contextDataAntwerp = {
    type: 'CityConfiguration',
    id: 'antwerp-cityconfiguarion',
    
    location: new Orion.Attribute('51.2221, 4.39768', 'geo:point'),
    addressLocality: "Antwerpen",
    addressCountry:  "BEL",
    
    cityBrokers: {
      StreetParking: {
        url: 'http://asign-demo02.romcloud.be:1026/v1',
        entityType: 'StreetParking',
        serviceType: 'ngsi-v1'
      },
      ParkingRestriction: {
        url: 'http://asign-demo02.romcloud.be:1026/v1',
        entityType: 'ParkingRestriction',
        serviceType: 'ngsi-v1'
      }
    }
};

var contextDataPorto = {
    type: 'CityConfiguration',
    id: 'porto-cityconfiguration',
    
    location: new Orion.Attribute('41.14946,-8.61031', 'geo:point'),
    addressLocality: "Porto",
    addressCountry: "PRT",
    
    cityBrokers: {
      AmbientArea: {
        url: 'http://130.206.83.68:1026/v2',
        entityType: 'AmbientArea',
        serviceType: 'ngsi-v2'
      },
      TrafficEvent: {
        url: 'http://fiware-porto.citibrain.com:1026/v1',
        entityType: 'TrafficEvent',
        serviceType: 'ngsi-v1'
      },
      AmbientObserved: {
        url: 'http://fiware-porto.citibrain.com:1026/v1',
        entityType: 'EnvironmentEvent',
        serviceType: 'ngsi-v1',
        adapterKey:  'porto-AmbientObserved'
      },
      ParkingLot: {
        url: 'https://api.ost.pt/ngsi10/contextEntityTypes/pois',
        poisCat: '418',
        serviceType: 'ost',
        key: 'hackacityporto2015_server',
        adapterKey:  'porto-ParkingLot',
        entityType:  'ParkingLot'
      },
      StreetParking: {
        url: 'http://fiware-porto.citibrain.com:1026/v1',
        entityType: 'StreetParking',
        serviceType: 'ngsi-v1'
      },
      CityEvent: {
        url: 'https://api.ost.pt/ngsi10/contextEntityTypes/events',
        serviceType: 'ost',
        key: 'hackacityporto2015_server',
        entityType: 'CityEvent'
      },
      WeatherForecast: {
        url:    'http://130.206.83.68:1028/v2',
        q: {
          country: 'PT',
          addressLocality: 'Porto'
        },
        entityType:    'WeatherForecast',
        serviceType:   'ngsi-v2'
      },
      GasStation: {
        url: 'https://api.ost.pt/ngsi10/contextEntityTypes/pois',
        poisCat: '417',
        serviceType: 'ost',
        key: 'hackacityporto2015_server',
        payment: true,
        entityType: 'GasStation'
      },
      Garage: {
        url: 'https://api.ost.pt/ngsi10/contextEntityTypes/pois',
        poisCat: '9',
        serviceType: 'ost',
        key: 'hackacityporto2015_server',
        payment: true,
        entityType: 'Garage'
      }
    }
};


var contextDataAveiro = {
  type: 'CityConfiguration',
  id: 'aveiro-cityconfiguration',
  
  location: new Orion.Attribute('40.64123,-8.65391', 'geo:point'),
  adressLocality: "Aveiro",
  addressCountry: "PRT",
  
  cityBrokers: {
    ParkingLot: {
      url: 'http://fiware-aveiro.citibrain.com:1026/v1',
      entityType: 'ParkingLot',
      pattern: 'Aveiro*',
      serviceType: 'ngsi-v1'
    },
    StreetParking: {
      url: 'http://fiware-aveiro.citibrain.com:1026/v1',
      entityType: 'StreetParking',
      pattern: 'Aveiro*',
      serviceType: 'ngsi-v1'
    }
  }
};


var contextDataSantander = {
  type: 'CityConfiguration',
  id: 'santander-cityconfiguration',
  
  location: new Orion.Attribute('43.46156,-3.81006', 'geo:point'),
  addressLocality: "Santander",
  addressCountry: "ESP",
  
  cityBrokers: {
    StreetParking: {
      url: 'http://130.206.83.68:1026/v2',
      entityType: 'StreetParking',
      pattern: 'santander.*',
      serviceType: 'ngsi-v2'
    },
    ParkingLot: {
      url:     'http://mu.tlmat.unican.es:8099/v1',
      pattern: 'urn:x-iot:smartsantander:parking:indoor.*',
      serviceType:  'ngsi-v1',
      entityType:  'ParkingLot',
      fiwareService: 'smartsantander',
      fiwareServicePath: '/parking/#'
    },
    AmbientObserved: {
      url:     'http://mu.tlmat.unican.es:8099/v1',
      serviceType: 'ngsi-v1',
      entityType:  'AmbientObserved',
      pattern: 'urn:x-iot:smartsantander:environmental:mobile.*',
      fiwareService: 'smartsantander'
    },
    AmbientArea: {
      url: 'http://mu.tlmat.unican.es:8099/v1',
      entityType: 'AmbientArea',
      serviceType: 'ngsi-v1',
      fiwareService: 'smartsantander'
    },
    WeatherForecast: {
      url:    'http://130.206.83.68:1028/v2',
      q: {
        postalCode: '39001',
        country: 'ES'
      },
      entityType: 'WeatherForecast',
      serviceType:   'ngsi-v2'
    }
  }
};

  
var contextDataSevilla = {
  type: 'CityConfiguration',
  id: 'sevilla-cityconfiguration',
  
  location: new Orion.Attribute('37.3879, -6.00198', 'geo:point'),
  adressLocality: "Sevilla",
  addressCountry: "ESP",
  
  cityBrokers: {
    ParkingLot: {
      url:     'http://130.206.122.29:1026/v1',
      serviceType:    'orion',
      entityType:  'ParkingLotZone'
    },
    WeatherForecast: {
      url:    'http://130.206.83.68:1028/v2',
      q: {
        postalCode: '41001',
        country: 'ES'
      },
      entity: 'WeatherForecast',
      type:   'ngsi-v2'
    }
  }
};

var contextDataMadrid = {
  type: 'CityConfiguration',
  id: 'madrid-cityconfiguration',
  location: new Orion.Attribute('40.42028,-3.70578', 'geo:point'),
  
  adressLocality: "Madrid",
  addressCountry: "ESP",
  
  cityBrokers: {
    AmbientObserved: {
      url: 'http://130.206.83.68:1029/v1',
      entityType: 'AmbientObserved',
      pattern: 'Madrid.*',
      serviceType: 'ngsi-v1'
    },
    WeatherForecast: {
      url:    'http://130.206.83.68:1028/v2',
      q: {
        postalCode: '28001',
        country: 'ES'
      },
      entityType: 'WeatherForecast',
      serviceType:   'ngsi-v2'
    }
  }
};

var citiesKeyMap = {
  'Antwerp'   : contextDataAntwerp,
  'Porto'     : contextDataPorto,
  'Madrid'    : contextDataMadrid,
  'Sevilla'   : contextDataSevilla,
  'Santander' : contextDataSantander,
  'Aveiro'    : contextDataAveiro
};

var cityData = [];

Object.keys(citiesKeyMap).forEach(function(aKey) {
  cityData.push(citiesKeyMap[aKey]);
});

module.exports.citiesKeyMap = citiesKeyMap;
module.exports.cityData     = cityData;
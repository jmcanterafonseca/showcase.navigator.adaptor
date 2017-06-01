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
        entityType: 'GasStation',
        adapterKey:  'porto-GasStation'
      },
      Garage: {
        url: 'https://api.ost.pt/ngsi10/contextEntityTypes/pois',
        poisCat: '9',
        serviceType: 'ost',
        key: 'hackacityporto2015_server',
        payment: true,
        entityType: 'Garage',
        adapterKey:  'porto-Garage'
      }
    }
};


var contextDataAveiro = {
  type: 'CityConfiguration',
  id: 'aveiro-cityconfiguration',
  
  location: new Orion.Attribute('40.64123,-8.65391', 'geo:point'),
  addressLocality: "Aveiro",
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
    /*
    OnStreetParking: {
      url: 'http://130.206.83.68:1026/v2',
      entityType: 'StreetParking',
      pattern: 'santander.*',
      serviceType: 'ngsi-v2'
    },
    OffStreetParking: {
      url:     'http://mu.tlmat.unican.es:8099/v1',
      pattern: 'urn:x-iot:smartsantander:parking:indoor.*',
      serviceType:  'ngsi-v1',
      entityType:  'ParkingLot',
      fiwareService: 'smartsantander',
      fiwareServicePath: '/parking/#'
    },
    AirQualityObserved: {
      url:     'http://mu.tlmat.unican.es:8099/v1',
      serviceType: 'ngsi-v1',
      entityType:  'AmbientObserved',
      pattern: 'urn:x-iot:smartsantander:environmental:mobile.*',
      fiwareService: 'smartsantander'
    },
    District: {
      url: 'http://mu.tlmat.unican.es:8099/v1',
      entityType: 'AmbientArea',
      serviceType: 'ngsi-v1',
      fiwareService: 'smartsantander'
    }, */
    PointOfInterest: {
      url: 'http://130.206.118.244:1027/v2',
      entityType: 'PointOfInterest',
      serviceType:   'ngsi-v2',
      fiwareService: 'poi',
      fiwareServicePath: '/Spain',
      idm: 'http://130.206.121.52:5001',
      userName: 'dev_poi',
      password: 'dev_poi_pwd'
    },
    WeatherForecast: {
      url: 'http://130.206.118.244:1027/v2',
      q: {
        "address.addressLocality": "Santander"
      },
      noGeoNeeded: true,
      entityType: 'WeatherForecast',
      serviceType:   'ngsi-v2',
      fiwareService: 'weather',
      fiwareServicePath: '/Spain',
      idm: 'http://130.206.121.52:5001',
      userName: 'dev_weather',
      password: 'dev_weather_PWD'
    },
    WeatherObserved: {
        url: 'http://130.206.118.244:1027/v2',
        q: {
            "address.addressLocality": "Santander"
        },
        entityType: 'WeatherObserved',
        serviceType:   'ngsi-v2',
        fiwareService: 'weather',
        fiwareServicePath: '/Spain',
        idm: 'http://130.206.121.52:5001',
        userName: 'dev_weather',
        password: 'dev_weather_PWD'
    }
  }
};

var contextDataSevilla = {
  type: 'CityConfiguration',
  id: 'sevilla-cityconfiguration',
  
  location: new Orion.Attribute('37.3879, -6.00198', 'geo:point'),
  addressLocality: "Sevilla",
  addressCountry: "ESP",
  
  cityBrokers: {
    PointOfInterest: {
        url: 'http://130.206.118.244:1027/v2',
        entityType: 'PointOfInterest',
        serviceType:   'ngsi-v2',
        fiwareService: 'poi',
        fiwareServicePath: '/Spain',
        idm: 'http://130.206.121.52:5001',
        userName: 'dev_poi',
        password: 'dev_poi_pwd'
    },
    WeatherForecast: {
        url: 'http://130.206.118.244:1027/v2',
        q: {
            "address.addressLocality": "Sevilla"
        },
        noGeoNeeded: true,
        entityType: 'WeatherForecast',
        serviceType:   'ngsi-v2',
        fiwareService: 'weather',
        fiwareServicePath: '/Spain',
        idm: 'http://130.206.121.52:5001',
        userName: 'dev_weather',
        password: 'dev_weather_PWD'
    },
    WeatherObserved: {
        url: 'http://130.206.118.244:1027/v2',
        q: {
            "address.addressLocality": "Sevilla"
        },
        entityType: 'WeatherObserved',
        serviceType:   'ngsi-v2',
        fiwareService: 'weather',
        fiwareServicePath: '/Spain',
        idm: 'http://130.206.121.52:5001',
        userName: 'dev_weather',
        password: 'dev_weather_PWD'
    }
  }
};

var contextDataMalaga = {
  type: 'CityConfiguration',
  id: 'malaga-cityconfiguration',
  
  location: new Orion.Attribute('36.7585406, -4.3971722', 'geo:point'),
  addressLocality: "Málaga",
  addressCountry: "ESP",
  
  cityBrokers: {
    PointOfInterest: {
        url: 'http://130.206.118.244:1027/v2',
        entityType: 'PointOfInterest',
        serviceType:   'ngsi-v2',
        fiwareService: 'poi',
        fiwareServicePath: '/Spain',
        idm: 'http://130.206.121.52:5001',
        userName: 'dev_poi',
        password: 'dev_poi_pwd'
    },
    WeatherForecast: {
        url: 'http://130.206.118.244:1027/v2',
        q: {
            "address.addressLocality": "Málaga"
        },
        noGeoNeeded: true,
        entityType: 'WeatherForecast',
        serviceType:   'ngsi-v2',
        fiwareService: 'weather',
        fiwareServicePath: '/Spain',
        idm: 'http://130.206.121.52:5001',
        userName: 'dev_weather',
        password: 'dev_weather_PWD'
    },
    WeatherObserved: {
        url: 'http://130.206.118.244:1027/v2',
        q: {
            "address.addressLocality": "Málaga"
        },
        entityType: 'WeatherObserved',
        serviceType:   'ngsi-v2',
        fiwareService: 'weather',
        fiwareServicePath: '/Spain',
        idm: 'http://130.206.121.52:5001',
        userName: 'dev_weather',
        password: 'dev_weather_PWD'
    },
    OffStreetParking: {
        url: 'http://217.172.12.177:1026/v2',
        entityType:    'OffStreetParking',
        serviceType:   'ngsi-v2',
        fiwareService: 'Malaga',
        fiwareServicePath: '/parking/harmonized',
    },
    AirQualityObserved: {
        url: 'http://130.206.118.244:1027/v2',
        entityType: 'AirQualityObserved',
        serviceType:   'ngsi-v2',
        fiwareService: 'airquality',
        fiwareServicePath: '/Spain_Malaga',
        idm: 'http://130.206.121.52:5001',
        userName: 'greencities',
        password: 'greencities_pwd'
    },
  }
};

var contextDataCorunaA = {
  type: 'CityConfiguration',
  id: 'corunaA-cityconfiguration',
  
  location: new Orion.Attribute('43.3712591, -8.4188010', 'geo:point'),
  addressLocality: "A Coruña",
  addressCountry: "ESP",
  
  cityBrokers: {
    PointOfInterest: {
        url: 'http://130.206.118.244:1027/v2',
        entityType: 'PointOfInterest',
        serviceType:   'ngsi-v2',
        fiwareService: 'poi',
        fiwareServicePath: '/Spain',
        idm: 'http://130.206.121.52:5001',
        userName: 'dev_poi',
        password: 'dev_poi_pwd'
    },
    WeatherForecast: {
        url: 'http://130.206.118.244:1027/v2',
        q: {
            "address.addressLocality": "A Coruña"
        },
        noGeoNeeded: true,
        entityType: 'WeatherForecast',
        serviceType:   'ngsi-v2',
        fiwareService: 'weather',
        fiwareServicePath: '/Spain',
        idm: 'http://130.206.121.52:5001',
        userName: 'dev_weather',
        password: 'dev_weather_PWD'
    },
    WeatherObserved: {
        url: 'http://130.206.118.244:1027/v2',
        q: {
            "address.addressLocality": "Coruña, A"
        },
        entityType: 'WeatherObserved',
        serviceType:   'ngsi-v2',
        fiwareService: 'weather',
        fiwareServicePath: '/Spain',
        idm: 'http://130.206.121.52:5001',
        userName: 'dev_weather',
        password: 'dev_weather_PWD'
    },
    OffStreetParking: {
        
    }
  }
};


var contextDataMadrid = {
  type: 'CityConfiguration',
  id: 'madrid-cityconfiguration',
  location: new Orion.Attribute('40.42028,-3.70578', 'geo:point'),
  addressLocality: "Madrid",
  addressCountry: "ESP",
  
  cityBrokers: {
    AirQualityObserved: {
        url: 'http://130.206.118.244:1027/v2',
        entityType: 'AirQualityObserved',
        serviceType:   'ngsi-v2',
        fiwareService: 'airquality',
        fiwareServicePath: '/Spain_Madrid',
        idm: 'http://130.206.121.52:5001',
        userName: 'dev_airquality',
        password: 'dev_airquality_PWD'
    },
    WeatherForecast: {
        url: 'http://130.206.118.244:1027/v2',
        q: {
            "address.addressLocality": "Madrid"
        },
        noGeoNeeded: true,
        entityType: 'WeatherForecast',
        serviceType:   'ngsi-v2',
        fiwareService: 'weather',
        fiwareServicePath: '/Spain',
        idm: 'http://130.206.121.52:5001',
        userName: 'dev_weather',
        password: 'dev_weather_PWD'
    },
    WeatherObserved: {
        url: 'http://130.206.118.244:1027/v2',
        q: {
            "address.addressLocality": "Madrid"
        },
        entityType: 'WeatherObserved',
        serviceType:   'ngsi-v2',
        fiwareService: 'weather',
        fiwareServicePath: '/Spain',
        idm: 'http://130.206.121.52:5001',
        userName: 'dev_weather',
        password: 'dev_weather_PWD'
    },
    PointOfInterest: {
        url: 'http://130.206.118.244:1027/v2',
        entityType: 'PointOfInterest',
        serviceType:   'ngsi-v2',
        fiwareService: 'poi',
        fiwareServicePath: '/Spain',
        idm: 'http://130.206.121.52:5001',
        userName: 'dev_poi',
        password: 'dev_poi_pwd'
    }
  }
};


var citiesKeyMap = {
  'Antwerp'   : contextDataAntwerp,
  'Porto'     : contextDataPorto,
  'Madrid'    : contextDataMadrid,
  'Sevilla'   : contextDataSevilla,
  'Santander' : contextDataSantander,
  'Aveiro'    : contextDataAveiro,
  'Malaga'    : contextDataMalaga,
  'CorunaA'  : contextDataCorunaA 
};

var cityData = [];

Object.keys(citiesKeyMap).forEach(function(aKey) {
  cityData.push(citiesKeyMap[aKey]);
});

module.exports.citiesKeyMap = citiesKeyMap;
module.exports.cityData     = cityData;
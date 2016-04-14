'use strict';

// 10 seconds
const DEFAULT_TIMEOUT_PROMISE = 5000;

// Promise.parallel executes the list of runnables in batches which are
// transparent to the developer
Promise.parallel = function(runnables, pbatchSize) {
  const DEFAULT_BATCH_SIZE = 4;
  
  var batchSize = Math.min(pbatchSize || DEFAULT_BATCH_SIZE, runnables.length);

  var futureHandler = {
    numResponses: 0,
    errors: [],
    results: [],
    totalCalls: runnables.length,
    promiseResolvers: [],
    nextToRun: batchSize,

    oncompleted: function(index, result) {
      this.results[index] = result;
      this.numResponses++;
      this._doResolve();
    },
    
    onerror: function(index, err) {
      this.results[index] = null;
      this.errors[index] = err;
      this.numResponses++;
      this._doResolve();
    },

    _checkFinish() {
      if (this.numResponses === this.totalCalls &&
          typeof this.resolutionFunction === 'function') {
          setTimeout(this.resolutionFunction, 0, {
            errors: this.errors,
            results: this.results
        });
      }
    },

    _doResolve: function() {
      this._checkFinish();

      var nextToRun = this.nextToRun++;
      if (nextToRun >= runnables.length) {
        return;
      }
      console.log('Next to run: ', nextToRun);

      var timeoutId = -1;
      var timeoutHappened = false;
      
      var resolutionFunction = function(idx, result) {
        clearTimeout(timeoutId);
        
        if (timeoutHappened) {
          console.log('Timeout of: ', nextToRun, 'before finishing');
          return;
        }
        
        var resolver = this.promiseResolvers[idx];
        resolver && resolver.resolve({
          subject: idx,
          result: result
        });
        this.oncompleted(idx, result);
      }.bind(this, nextToRun);
      
      var errorFunction = function(idx, err) {
        var resolver = this.promiseResolvers[idx];
        resolver && resolver.reject({
          subject: idx,
          error: err
        });
        this.onerror(idx, err);
      }.bind(this, nextToRun);
      
      timeoutId = setTimeout(function() {
        console.log('Timeout happened for: ', nextToRun);
        timeoutHappened = true;
        
        errorFunction('Timeout');
      }, DEFAULT_TIMEOUT_PROMISE);
      
      runnables[nextToRun].run().then(resolutionFunction, errorFunction);
    },

    set resolver(r) {
      this.resolutionFunction = r;
      // Check if by the time we have the resolver everything was resolved
      this._checkFinish();
    },

    setPromiseResolver: function(index, resolve, reject) {
      // If by the time we call this function the corresponding promise was
      // already resolved, then call directly resolve or reject
      if (typeof this.results[index] !== 'undefined') {
        resolve(this.results[index]);
        return;
      }

      if (typeof this.errors[index] !== 'undefined') {
        reject(this.errors[index]);
        return;
      }

      this.promiseResolvers[index] = {
        resolve: resolve,
        reject: reject
      };
    }
  };

  var allPromise = new Promise(function(resolve, reject) {
    futureHandler.resolver = resolve;
  });

  return {
    all: allPromise,
    futures: parallelGen(runnables, batchSize, futureHandler)
  }
}

// Auxiliary generator for Promise.parallel
function* parallelGen(runnables, batchSize, futureHandler) {
  // Initially only the the first batch is launched
  for(var j = 0; j < batchSize; j++) {
    var newPromise = new Promise(function(index, resolve, reject) {
      
      var timeoutHappened = false;
      var timeoutId = setTimeout(function() {
        timeoutHappened = true;
        reject({
          subject: index,
          error: 'timeout'
        });
        
        futureHandler.onerror(index, 'timeout');        
      }, DEFAULT_TIMEOUT_PROMISE);
      
      runnables[j].run().then(function(result) {
        clearTimeout(timeoutId);
        if (timeoutHappened) {
          console.log('Timeout of: ', index, ' before finishing');
          return;
        }        
        resolve({
          subject: index,
          result: result
        });
        
        futureHandler.oncompleted(index, result);
      }, function(err) {
          reject({
            subject: index,
            error: err
          });
          
          futureHandler.onerror(index, err);
      });
    }.bind(null, j));

    yield newPromise;
  }

  for(var v = batchSize; v < runnables.length; v++) {
    var promise = new Promise(function(index, resolve, reject) {
      futureHandler.setPromiseResolver(index, resolve, reject);
    }.bind(null, v));

    yield promise;
  }
}

// Run the passed runnables sequentially
Promise.sequential = function(runnables) {
  return new Promise(function(resolve, reject) {
    var results = [];

    runnables.reduce(function(sequence, aRunnable) {
      return sequence.then(function() {
        return aRunnable.run();
      }).then(function(data) {
          results.push(data);
          if (results.length === runnables.length) {
            resolve(results);
          }
      });
    }, Promise.resolve());
  });
}

Promise.sequential2 = function(runnables) {
  return Promise.parallel(runnables, 1);
}
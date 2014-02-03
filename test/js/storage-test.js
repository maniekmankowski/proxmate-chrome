(function() {
  define('ChromeMock', function() {
    return {
      storage: {
        local: {
          set: function(obj) {},
          get: function(key, callback) {}
        }
      }
    };
  });

  require.config({
    map: {
      'storage': {
        'chrome': 'ChromeMock'
      }
    }
  });

  define(['storage', 'ChromeMock'], function(StorageModule, ChromeMock) {
    return describe('Storage', function() {
      after(function() {
        require.config({
          map: {}
        });
        return require.undef('ChromeMock');
      });
      describe('Testing flush', function() {
        StorageModule.set('123', 5678);
        StorageModule.flush();
        return assert.equal(null, StorageModule.get('123'));
      });
      return describe('Testing get/set', function() {
        beforeEach(function() {
          return this.clock = sinon.useFakeTimers();
        });
        afterEach(function() {
          return StorageModule.flush();
        });
        it('should set and return values correctly', function() {
          var testArray, testString, testValue;
          testValue = 12345;
          testArray = [1, 2, 3, 4, 5];
          testString = '12345asdf';
          StorageModule.set('test', testValue);
          assert.equal(testValue, StorageModule.get('test'));
          StorageModule.set('test', testArray);
          assert.equal(testArray, StorageModule.get('test'));
          StorageModule.set('test', testString);
          return assert.equal(testString, StorageModule.get('test'));
        });
        it('should return null on missing keys', function() {
          return assert.equal(null, StorageModule.get('abcasdfasdfasdfkasdfjasdf'));
        });
        it('should call chrome.storage.local after 1000 ms', function() {
          var expectedPayload, spy;
          spy = sinon.spy(ChromeMock.storage.local, 'set');
          StorageModule.set(123, 'hallo');
          StorageModule.set(456, 'wuhu');
          assert.isFalse(spy.calledOnce);
          this.clock.tick(1000);
          expectedPayload = {
            123: 'hallo',
            456: 'wuhu'
          };
          return assert.isTrue(spy.calledWith(expectedPayload));
        });
        return it('should sync chrome storage on init into RAM', function() {
          var expectedStorageContent, stub;
          expectedStorageContent = {
            123: 456,
            'asdf': 'muh',
            8888: 9999999
          };
          stub = sinon.stub(ChromeMock.storage.local, 'get', function(key, callback) {
            return callback(expectedStorageContent);
          });
          StorageModule.init();
          assert.isTrue(stub.calledOnce);
          assert.equal(456, StorageModule.get(123));
          assert.equal('muh', StorageModule.get('asdf'));
          return assert.equal(9999999, StorageModule.get(8888));
        });
      });
    });
  });

}).call(this);

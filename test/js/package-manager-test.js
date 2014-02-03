(function() {
  define('StorageMock', function() {
    return {
      get: function(key) {
        return {
          'somethingThatsUpToDate': 2,
          'somethingOutdated': 1,
          'somethingWithoutUpdate': 1,
          'somethingElseOutdated': 2
        };
      },
      set: function(key, val) {}
    };
  });

  define('ConfigMock', function() {
    return {
      get: function(key) {
        return 'www.abc.de';
      }
    };
  });

  require.config({
    map: {
      'package-manager': {
        'storage': 'StorageMock',
        'config': 'ConfigMock'
      }
    }
  });

  define(['package-manager', 'StorageMock'], function(PackageManager, StorageMock) {
    return describe('Package Manager', function() {
      beforeEach(function() {
        var requests;
        requests = this.requests = [];
        this.xhr = sinon.useFakeXMLHttpRequest();
        return this.xhr.onCreate = function(xhr) {
          return requests.push(xhr);
        };
      });
      after(function() {
        require.undef('StorageMock');
        require.undef('ConfigMock');
        require.config({
          map: {}
        });
        return this.xhr.restore();
      });
      describe('The update behaviour', function() {
        afterEach(function() {
          var key, val, _results;
          _results = [];
          for (key in PackageManager) {
            val = PackageManager[key];
            if (typeof PackageManager[key].restore === 'function') {
              _results.push(PackageManager[key].restore());
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        });
        it('should checkForUpdates on init', function() {
          var spy;
          spy = sinon.stub(PackageManager, 'checkForUpdates');
          PackageManager.init();
          return assert.isTrue(spy.calledOnce);
        });
        it('should download the version overview and execute callback', function() {
          var callback, expectedPayload;
          callback = sinon.spy();
          PackageManager.downloadVersionRepository(callback);
          expectedPayload = {
            "1337asdf": 1,
            "anotherrandomID": 2
          };
          assert.equal(1, this.requests.length);
          assert.equal('www.abc.de/api/package/update.json', this.requests[0].url);
          this.requests[0].respond(200, {
            'Content-Type': 'application/json'
          }, JSON.stringify(expectedPayload));
          return assert.isTrue(callback.calledWith(expectedPayload));
        });
        return it('should call downloadVersionRepository and install outdated packages', function() {
          var downloadVersionRepositoryStub, installPackageStub, testVersionJson;
          testVersionJson = {
            'somethingThatsUpToDate': 2,
            'somethingOutdated': 2,
            'somethingElseOutdated': 3
          };
          downloadVersionRepositoryStub = sinon.stub(PackageManager, "downloadVersionRepository", function(callback) {
            return callback(testVersionJson);
          });
          installPackageStub = sinon.stub(PackageManager, "installPackage");
          PackageManager.checkForUpdates();
          assert.isTrue(downloadVersionRepositoryStub.calledOnce);
          assert.isTrue(installPackageStub.calledTwice, "All outdated packages have been passed to installing");
          assert.isTrue(installPackageStub.calledWith('somethingOutdated'));
          return assert.isTrue(installPackageStub.calledWith('somethingElseOutdated'));
        });
      });
      describe('Installation behaviour', function() {
        return it('should download package information from server', function() {
          var StorageGetMock, StorageSetMock, newInstalledPackageObject, pkgId, pkgInfo;
          pkgId = 'somethingOutdated';
          pkgInfo = {
            "name": "Test Package",
            "version": 100,
            "url": "http://pandora.com",
            "user": "52e51a98217d32e2270e211f",
            "country": "52e5c40294ed6bd4032daa49",
            "_id": "52e5c59e18bf010c04b0ef9e",
            "__v": 0,
            "createdAt": "2014-01-27T02:34:06.874Z",
            "routeRegex": ["host == 'www.pandora.com'"],
            "hosts": ["pandora.com", "*.pandora.com"]
          };
          newInstalledPackageObject = {
            'somethingThatsUpToDate': 2,
            'somethingOutdated': 100,
            'somethingWithoutUpdate': 1,
            'somethingElseOutdated': 2
          };
          StorageSetMock = sinon.stub(StorageMock, 'set');
          StorageGetMock = sinon.spy(StorageMock, 'get');
          PackageManager.installPackage(pkgId);
          assert.equal(1, this.requests.length);
          assert.equal("www.abc.de/api/package/" + pkgId + ".json", this.requests[0].url);
          this.requests[0].respond(200, {
            'Content-Type': 'application/json'
          }, JSON.stringify(pkgInfo));
          assert.isTrue(StorageGetMock.calledOnce);
          assert.isTrue(StorageSetMock.calledTwice);
          assert.isTrue(StorageGetMock.calledWith('installed_packages'));
          assert.isTrue(StorageSetMock.calledWith(pkgId, pkgInfo));
          assert.isTrue(StorageSetMock.calledWith('installed_packages', newInstalledPackageObject));
          StorageSetMock.restore();
          return StorageGetMock.restore();
        });
      });
      return describe('Basic functionality', function() {
        return it('should retrieve all installed packages', function() {
          var StorageGetMock, expectedJson, packages;
          expectedJson = [
            {
              "name": "Test Package 1",
              "version": 100,
              "url": "http://pandora.com",
              "user": "52e51a98217d32e2270e211f",
              "country": "52e5c40294ed6bd4032daa49",
              "_id": "anotherid",
              "__v": 0,
              "createdAt": "2014-01-27T02:34:06.874Z",
              "routeRegex": ["host == 'www.pandora.com'"],
              "hosts": ["pandora.com", "*.pandora.com"]
            }, {
              "name": "Test Package 2",
              "version": 100,
              "url": "http://pandora.com",
              "user": "52e51a98217d32e2270e211f",
              "country": "52e5c40294ed6bd4032daa49",
              "_id": 123,
              "__v": 0,
              "createdAt": "2014-01-27T02:34:06.874Z",
              "routeRegex": ["host == 'www.pandora.com'"],
              "hosts": ["pandora.com", "*.pandora.com"]
            }
          ];
          StorageGetMock = sinon.stub(StorageMock, 'get', function(key) {
            switch (key) {
              case 'installed_packages':
                return {
                  'anotherid': 10,
                  123: 1
                };
              case 'anotherid':
                return expectedJson[0];
              case '123':
                return expectedJson[1];
            }
          });
          packages = PackageManager.getInstalledPackages();
          assert.isTrue(StorageGetMock.calledThrice, 'the storage has been queried the correct amount of times');
          assert.isTrue(StorageGetMock.calledWith('installed_packages'), 'Installed packages have been queried from storage');
          assert.isTrue(StorageGetMock.calledWith('anotherid'), 'first installed package has been queried from storage');
          assert.isTrue(StorageGetMock.calledWith('123'), 'second installed package has been queried from storage');
          return assert.deepEqual(expectedJson.sort(), packages.sort());
        });
      });
    });
  });

}).call(this);

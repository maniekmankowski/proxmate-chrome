// Generated by CoffeeScript 1.7.1
(function() {
  define(['server-manager', 'config', 'storage', 'text!../testdata/servers.json'], function(ServerManager, Config, Storage, testServers) {
    testServers = JSON.parse(testServers);
    return describe('Server Manager', function() {
      beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
        this.storageStub = this.sandbox.stub(Storage, 'get', function() {
          return testServers;
        });
        return this.xhr = this.sandbox.useFakeXMLHttpRequest();
      });
      afterEach(function() {
        return this.sandbox.restore();
      });
      return describe('Initialisation', function() {
        it('should generate the intern server array correctly', function() {
          var callback, fetchServersStub, loadServersSpy;
          loadServersSpy = this.sandbox.spy(ServerManager, 'loadServersFromStorage');
          fetchServersStub = this.sandbox.stub(ServerManager, 'fetchServerList');
          callback = this.sandbox.spy();
          ServerManager.init(callback);
          assert.isTrue(loadServersSpy.calledOnce);
          assert.isFalse(fetchServersStub.called);
          assert.isTrue(callback.calledOnce);
          loadServersSpy.restore();
          loadServersSpy = this.sandbox.spy(ServerManager, 'loadServersFromStorage');
          fetchServersStub.restore();
          fetchServersStub = this.sandbox.stub(ServerManager, 'fetchServerList');
          this.storageStub.restore();
          this.storageStub = this.sandbox.stub(Storage, 'get', function() {
            return null;
          });
          callback = this.sandbox.spy();
          ServerManager.init(callback);
          assert.isTrue(loadServersSpy.calledOnce);
          assert.isTrue(fetchServersStub.calledOnce);
          return assert.isTrue(fetchServersStub.calledWith(callback));
        });
        it('should read the server configuration from local storage', function() {
          var servers;
          servers = ServerManager.loadServersFromStorage();
          assert.isTrue(this.storageStub.calledOnce);
          assert.isTrue(this.storageStub.calledWith('server_config'));
          assert.deepEqual(testServers, servers);
          this.storageStub.restore();
          this.storageStub = this.sandbox.stub(Storage, 'get', function() {
            return null;
          });
          servers = ServerManager.loadServersFromStorage();
          return assert.deepEqual([], servers);
        });
        it('should retrieve servers correctly', function() {
          var servers;
          ServerManager.loadServersFromStorage();
          servers = ServerManager.getServers();
          return assert.deepEqual(testServers, servers);
        });
        return it('should ajax load the server list correctly', function() {
          var callback, configGetStub;
          configGetStub = this.sandbox.stub(Config, 'get', function() {
            return 'www.abc.de';
          });
          callback = this.sandbox.spy();
          ServerManager.fetchServerList(callback);
          assert.isTrue(configGetStub.calledWith('primary_server'));
          assert.equal(1, this.sandbox.server.requests.length);
          assert.equal("www.abc.de/api/server/list.json", this.sandbox.server.requests[0].url);
          this.sandbox.server.requests[0].respond(200, {
            'Content-Type': 'application/json'
          }, JSON.stringify(testServers));
          return assert.isTrue(callback.calledOnce);
        });
      });
    });
  });

}).call(this);

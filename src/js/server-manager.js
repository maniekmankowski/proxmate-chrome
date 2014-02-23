// Generated by CoffeeScript 1.7.1
(function() {
  define(['storage', 'config', 'jquery'], function(Storage, Config, $) {
    var exports, fetchServerList, getServers, init, loadServersFromStorage, servers;
    servers = [];
    init = function(callback) {
      servers = exports.loadServersFromStorage();
      if (servers.length > 0) {
        exports.fetchServerList(function() {});
        return callback();
      } else {
        return exports.fetchServerList(callback);
      }
    };

    /**
     * Load servers from storage into array
     */
    loadServersFromStorage = function() {
      var tmpServers;
      tmpServers = Storage.get('server_config');
      if (!tmpServers) {
        tmpServers = [];
      }
      servers = tmpServers;
      return servers;
    };

    /**
     * Fetch a fresh server list from storage
     * @param  {Function} callback Callback
     */
    fetchServerList = function(callback) {
      return $.get(Config.get('primary_server') + '/server/list.json', function(data) {
        servers = data;
        Storage.set('server_config', servers);
        return callback();
      });
    };

    /**
     * Return all servers
     * @return {Object} all servers
     */
    getServers = function() {
      return servers;
    };
    exports = {
      init: init,
      getServers: getServers,
      loadServersFromStorage: loadServersFromStorage,
      fetchServerList: fetchServerList
    };
    return exports;
  });

}).call(this);

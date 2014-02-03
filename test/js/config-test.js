(function() {
  define('TextMock', function() {
    return {
      load: function(path, req, onLoad, config) {
        var returnArray;
        returnArray = {
          "primary_server": "http://127.0.0.1/"
        };
        return onLoad(JSON.stringify(returnArray));
      }
    };
  });

  require.config({
    map: {
      'config': {
        'text': 'TextMock'
      }
    }
  });

  define(['config'], function(ConfigProvider) {
    return describe('Config loader', function() {
      after(function() {
        require.config({
          map: {}
        });
        return require.undef('TextMock');
      });
      return it('should return config content correctly', function() {
        ConfigProvider.init();
        return assert.equal('http://127.0.0.1/', ConfigProvider.get('primary_server'));
      });
    });
  });

}).call(this);

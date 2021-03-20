/**
 * @author Afonso Matumona Elias
 * @version v2.1.0
 * Released under the MIT License.
 * This is easy.js ajax connector, makes web requests easier. 
 */

/**
 * Easy Ajax Connector
 * @param {String} baseUrl The base URL
 * @param {Object} fetchOptions fetch API default options
 */
function EasyConnector(baseUrl, fetchOptions) {
    this.dependencyId = "Connector";
    this.name = "Easy Ajax Connector";
    this.version = '2.1.0';
    this.attachedEasyInstance = null;
    // Checking EasyJs definition
    if (typeof Easy === undefined) return;
    var $easy = Easy.prototype;

    var self = this;
    // Adds the value of id parameter to the url
    var normalizeId = function (value) {
        if (value === null || value === undefined) return '';
        return (value.endsWith('/') ? value : '/' + value);
    }

    // Easy connector
    this.conn = {
        baseUrl: baseUrl,
        fetchOptions: fetchOptions,
        add: function (path, obj) {
            // you may set as you wish
            return self.ajax(path, obj, 'post');
        },
        remove: function (path, id) {
            // you may set as you wish
            return self.ajax(path + normalizeId(id), null, 'delete');
        },
        update: function (path, obj, id) {
            // you may set as you wish
            return self.ajax(path + normalizeId(id), obj, 'put');
        },
        list: function (path, extra) {
            // you may set as you wish
            return self.ajax(path + normalizeId(extra), null, 'get');
        },
        getOne: function (path, id) {
            // you may set as you wish
            return self.ajax(path + normalizeId(id), null, 'get');
        }
    };

    // Function to make an ajax call 
    this.ajax = function (url, body, method, redefine) {
        try {
            var easy = self.attachedEasyInstance;

            if (easy == null)
                throw ({ message: 'No instance attached to this connector' });

            // The final url that will be used in fetch request
            var $url = redefine === true ? url : self.conn.baseUrl + url;

            // Resolving the Fetch options object
            var options = easy.extend.obj({
                // adding the body if exits
                body: body ? JSON.stringify(body) : null,
                // The method of the request
                method: method,
                // And outside options values
            }, self.conn.fetchOptions);

            // Sending and Retrieving the response
            var $fetch = new easy.http($url, options);

            // The promise that needs to be returned
            return new Promise(function (resolve, reject) {
                // Getting the data from fetch response
                $fetch.then(function (result) {
                    if (!result.ok)
                        throw ($easy.return(false, result.statusText, null));
                        
                    var response = result.response;
                        
                    return resolve($easy.return(true, 'Ok', response));
                }).catch(function (error) {
                    return reject(error);
                });
            });

        } catch (error) {
            return Promise.reject($easy.return(false, error, null));
        }
    };

}
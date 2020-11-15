/**
 * @author Afonso Matumona Elias
 * @version v2.0.2
 * Released under the MIT License.
 * This is easy.js ajax connector, makes web requests easier. 
 */

new EasyConnector('https://jsonplaceholder.typicode.com/', {
    type: 'json',
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
});

/**
 * Easy Ajax Connector
 * @param {String} baseUrl The base URL
 * @param {Object} fetchOptions fetch API Options
 */
function EasyConnector(baseUrl, fetchOptions) {
    this.name = "Easy Ajax Connector";
    this.version = '2.0.2';
    // Checking EasyJs definition
    if (typeof Easy === undefined) return;
    var $easy = Easy.prototype;

    // Function to make an ajax call 
    $easy.ajax = function (url, body, method) {
        try {
            // redefine if as http:// or https://
            var redefine = url.includes('http://') || url.includes('https://');
            // The final url that will be used in fetch request
            var $url = redefine ? url : $easy.conn.baseUrl + url;

            // Resolving the Fetch options object
            var options = $easy.extend.obj({
                // adding the body if exits
                body: body ? JSON.stringify(body) : null,
                // The method of the request
                method: method,
                // And outside options values
            }, $easy.conn.fetchOptions);

            // Sending and Retrieving the response
            var $fetch = new $easy.http($url, options);

            // The promise that needs to be returned
            return new Promise(function (resolve, reject) {
                // Getting the data from fetch response
                $fetch.then(function (result) {
                    if (!result.ok)
                        throw ($easy.return(false, result.statusText, null));

                    var response = result.response;
                    // Always return the actually data, if the response come into an object like:
                    // { data: {...}, errors: [...], success: boolean }
                    // Access the data and passe in 3th parameter of $easy.return(true, 'Ok', -> response.data <- ) 

                    return resolve($easy.return(true, 'Ok', response));
                }).catch(function (error) {
                    return reject(error);
                });
            });

        } catch (error) {
            return Promise.reject($easy.return(false, error, null));
        }
    };

    // Adds the value of id parameter to the url
    var normalizeId = function (id) {
        if (id === null || id === undefined) return '';
        return (id.endsWith('/') ? id : '/' + id);
    }
    // Easy connector
    $easy.conn = {
        baseUrl: baseUrl,
        fetchOptions: fetchOptions,
        add: function (path, obj) {
            // you may set as you wish
            return $easy.ajax(path, obj, 'post');
        },
        remove: function (path, id) {
            // you may set as you wish
            return $easy.ajax(path + normalizeId(id), null, 'devare');
        },
        update: function (path, obj, id) {
            // you may set as you wish
            return $easy.ajax(path + normalizeId(id), obj, 'put');
        },
        list: function (path, extra) {
            // you may set as you wish
            return $easy.ajax(path + normalizeId(extra), null, 'get');
        },
        getOne: function (path, id) {
            // you may set as you wish
            return $easy.ajax(path + normalizeId(id), null, 'get');
        }
    };
}
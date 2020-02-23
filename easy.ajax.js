/**
 * @author Afonso Matumona Elias
 * @version v2.0.0
 * Released under the MIT License.
 * This is easy.js ajax connector, makes easy able to make web requests. 
 * 
 * # Salute 😉
 */
new EasyConnector('https://jsonplaceholder.typicode.com/', {
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
function EasyConnector(baseUrl, fetchOptions = {}){
    // Checking EasyJs definition
    if (typeof Easy === undefined) return;    
    
    // Easy object
    var $e = Easy.prototype;
    var normalizeId = function(id){
        if(id === null || id === undefined) return '';
        return ( id.endsWith('/') ? id : '/' + id );
    }
    // Easy connector
    Easy.prototype.conn = {
        baseUrl: baseUrl,
        fetchOptions: fetchOptions, 
        add: async function(path, obj){
            return await $e.ajax(path, obj, 'post');
        },
        remove: async function(path, id){
            // you may set as you wish
            return await $e.ajax(path + normalizeId(id), null, 'delete');
        },
        update: async function(path, obj, id){
            // you may set as you wish
            return await $e.ajax(path + normalizeId(id), obj, 'put');
        },
        list: async function(path, filter){
            // you may set as you wish
            return await $e.ajax(path + normalizeId(filter), null, 'get');
        },
        getOne: async function(path, id){
            // you may set as you wish
            return await $e.ajax(path + normalizeId(id), null, 'get');
        }
    };

    /**
     * Function to make an ajax call 
     */
    Easy.prototype.ajax = async function(url, body, method){
        try {
            // redefine if as http:// or https://
            var redefine = url.includes('http://') || url.includes('https://');
            var builtUrl = redefine ? url : $e.conn.baseUrl + url; 
            // Sending or Retrieving the data
            var response = await fetch(builtUrl, {
                body: body ? JSON.stringify(body) : null,
                method: method,
                //Spreading every options defined for fetch API
                ...$e.conn.fetchOptions
            });
            
            if(!response.ok) throw(response);
            // Getting the json
            var data = await response.json();

            return Promise.resolve($e.return(true, 'Ok', data));
        } catch (error){
            return Promise.reject($e.return(false, error, null));
        }
    };
}
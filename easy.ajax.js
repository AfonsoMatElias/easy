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
    const self = Easy.prototype;

    // Easy connector
    Easy.prototype.conn = {
        baseUrl: baseUrl,
        fetchOptions: fetchOptions, 
        async add(path, obj) {
            return await self.ajax(path, obj, 'post');
        },
        async remove (path, id) {
            // you may set as you wish
            return await self.ajax(path + ( id.endsWith('/') ? id : '/' + id ), null, 'delete');
        },
        async update (path, obj, id) {
            // you may set as you wish
            return await self.ajax(path + ( id.endsWith('/') ? id : '/' + id ), obj, 'put');
        },
        async list (path) {
            // you may set as you wish
            return await self.ajax(path, null, 'get');
        },
        async getOne (path, id) {
            // you may set as you wish
            return await self.ajax(path + ( id.endsWith('/') ? id : '/' + id ), null, 'get');
        }
    };

    /**
     * Function to make an ajax call 
     */
    Easy.prototype.ajax = async function (url, body, method) {
        try {
            // Checking if the base url needs to be ignored
            const builtUrl = url[0] === '@' ? url.substr(1) : self.conn.baseUrl + url; 
            // Sending or Retrieving the data
            const response = await fetch(builtUrl, {
                body: body ? JSON.stringify(body) : null,
                method: method,
                //Spreading every options defined for fetch API
                ...self.conn.fetchOptions
            });

            // Getting the json
            const data = await response.json();

            // Checking if the response is ok
            if (!response.ok) throw (data);

            // Note: Always return the real data from the server!
            // If the server returns a structure is like this
            // { data: object, errors: array, sucecess: boolean }
            // You need to access the 'data' proprierty from the result data 
            //    and passe it in third parameter of self.return(1, 2, ->'3'<-)
            // Eg.: self.return(true, 'Ok', data.data);

            return self.return(true, 'Ok', data);
        } catch (error) {
            return self.return(false, error, null);
        }
    };
}
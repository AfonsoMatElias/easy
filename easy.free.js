/**
 * @author Afonso Matumona Elias
 * @version v2.0.0
 * Released under the MIT License.
 * This is easy.js free connector, you may create your own connector. 
 * 
 * # Salute 😉
 */

new EasyConnector();

function EasyConnector() {
    // Checking EasyJs definition
    if (typeof Easy === undefined) return;    
    
    // Easy object
    const self = Easy.prototype;

    // Easy connector
    Easy.prototype.conn = {
        async add(path, obj) {
            // TODO insert:
            // Success
            // return self.return(true, 'Replace this with success message here', {'Replace this with object'})
            // Error 
            // return self.return(false, 'Replace this with error message here', null); 
        },
        async remove(path, id) {
            // TODO delete:
            // Success
            // return easy.return(true, 'Replace this with success message here', {'Replace this with object'})
            // Error 
            // return easy.return(false, 'Replace this with error message here', null); 
        },
        async update(path, obj, id) {
            // TODO update:
            // Success
            // return easy.return(true, 'Replace this with success message here', {'Replace this with object'})
            // Error 
            // return easy.return(false, 'Replace this with error message here', null); 
        },
        async list(path, filter) {
            // TODO select/list:
            // Success
            // return easy.return(true, 'Replace this with success message here', {'Replace this with object'})
            // Error 
            // return easy.return(false, 'Replace this with error message here', null); 
        },
        async getOne(path, id) {
            // TODO select one:
            // Success
            // return easy.return(true, 'Replace this with success message here', {'Replace this with object'})
            // Error 
            // return easy.return(false, 'Replace this with error message here', null); 
        },
    };
}
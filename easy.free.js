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
    if (typeof Easy === undefined)
        return console.error(`Easy: Could not found Easy Object, it seems like is not imported. Please, make sure easy.js is imported!.`);  
    
    // Easy object
    var $e = Easy.prototype;

    // Easy connector
    Easy.prototype.conn = {
        add: function(path, obj) {
            // TODO insert:
            // Success
            // return Promise.resolve($e.return(true, 'Replace this with success message here', {'Replace this with object'}));
            // Error 
            // return Promise.reject($e.return(false, 'Replace this with error message here', null)); 
        },
        remove: function(path, id) {
            // TODO delete:
            // Success
            // return Promise.resolve($e.return(true, 'Replace this with success message here', {'Replace this with object'}));
            // Error 
            // return Promise.reject($e.return(false, 'Replace this with error message here', null)); 
        },
        update: function(path, obj, id) {
            // TODO update:
            // Success
            // return Promise.resolve($e.return(true, 'Replace this with success message here', {'Replace this with object'}));
            // Error 
            // return Promise.reject($e.return(false, 'Replace this with error message here', null)); 
        },
        list: function(path, filter) {
            // TODO select/list:
            // Success
            // return Promise.resolve($e.return(true, 'Replace this with success message here', {'Replace this with object'}));
            // Error 
            // return Promise.reject($e.return(false, 'Replace this with error message here', null)); 
        },
        getOne: function(path, id) {
            // TODO select one:
            // Success
            // return Promise.resolve($e.return(true, 'Replace this with success message here', {'Replace this with object'}));
            // Error 
            // return Promise.reject($e.return(false, 'Replace this with error message here', null)); 
        },
    };
}
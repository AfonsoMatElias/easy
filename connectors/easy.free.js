/**
 * @author Afonso Matumona Elias
 * @version v2.1.0
 * Released under the MIT License.
 * This is easy.js free connector..
 * The developer can create his own connector based on this one.
 */

new EasyConnector();

/** Easy Connector */
function EasyConnector() {
    // The unique Id to retrive the dependency object with: app.dependencies['dependencyId']
    this.dependencyId = "Connector";
    this.name = "Easy Free Connector";
    this.version = '2.1.0';
    this.attachedEasyInstance = null;

    // Checking EasyJs definition
    if (typeof Easy === undefined) return;
    var $easy = Easy.prototype;

    // $easy.return(Boolean, Message, Response);
    //
    // $easy.return(  
    //        -> Response Status (Boolean) <- , 
    //        -> Some Message (String) <-, 
    //        -> Response Data <- 
    //     );
    //
    // Return: { status: (...), msg: (...), result: (...) }

    // Easy connector
    this.conn = {
        add: function (path, obj) {
            // TODO: Code here...

            return new Promise(function(resolve, reject) {
                // Resolve data
                resolve($easy.return(true, Message, Response));
                // Reject data
                reject($easy.return(false, Message, Response));
            });
        },
        remove: function (path, id) {
            // TODO: Code here...

            return new Promise(function(resolve, reject) {
                // Resolve data
                resolve($easy.return(true, Message, Response));
                // Reject data
                reject($easy.return(false, Message, Response));
            });
        },
        update: function (path, obj, id) {
            // TODO: Code here...

            return new Promise(function(resolve, reject) {
                // Resolve data
                resolve($easy.return(true, Message, Response));
                // Reject data
                reject($easy.return(false, Message, Response));
            });
        },
        list: function (path, extra) {
            // TODO: Code here...

            return new Promise(function(resolve, reject) {
                // Resolve data
                resolve($easy.return(true, Message, Response));
                // Reject data
                reject($easy.return(false, Message, Response));
            });
        },
        getOne: function (path, id) {
            // TODO: Code here...

            return new Promise(function(resolve, reject) {
                // Resolve data
                resolve($easy.return(true, Message, Response));
                // Reject data
                reject($easy.return(false, Message, Response));
            });
        }
    };
}
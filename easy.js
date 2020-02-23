/**
 * @author Afonso Matumona Elias
 * @version v2.0.0
 *
 * # easy.js
 * Released under the MIT License.
 * Easy.js 'easy and asynchronous js' is a javascript library that helps the (web) developer
 * build web application faster without writting too many lines of js codes.
 * Copyright 2019 Afonso Matumona <afonsomatumona@hotmail.com>
 *
 * ## Salute 😉
 */

// Using secure javascript code
'use strict';

/**
 * Easy main object
 * @param {Element} elem The root element where easy.js will have control 
 * @param {Object} options Options to define data and components of the page 
 */
function Easy(elem, options){
    // The main object reference
    var $e = this;
    if(!options) options = {};
    // Store every objects of the 
    $e.data = {};
    // Defining the $this reference
    var $this = $e.data; 
    // Store adddress of every property defined in the 'data' 
    var propertiesAddress = {};
    
    /**
     * Message logger
     * @param {Object} input The object to console and return
     * @param {String} fun The console function name, by default is 'error'
     */
    this.log = function(input, fun){
        if(!fun) fun = 'error';
        return console[fun]('Easy:', input) || input;
    }

    if(typeof document === 'undefined' || typeof window === 'undefined')
        return $e.log('Document Element or Window element is undefined');

    /** DOM Shortcut */
    var doc = document;
    this.global = window;

    // Easy Dependencies
    // Function and Extensions used by easy
    var func = new Func();
    // UI Handler
    var ui = new UIHandler();
    // Includer
    var inc = new Includer(options.components || {});

    /** Easyjs Variables */
    var vars = {
        webCalls: {}, // UI Calls
        temps: {}, // templates
        cmds: {
            e: '-e-',
            id: 'e-id',
            tmp: 'e-tmp',
            rvs: 'e-rvs',
            anm: 'e-anm',
            field: 'text',
            fill: 'e-fill',
            build: 'e-build',
            array: 'e-array',
            filter: 'e-filter',
            if: 'e-if',
            show: 'e-show',
            for: 'e-for',
            tag: 'e-tag',
            data: 'data',
            def: 'e-def',
            content: 'e-content',
        }, // Commands
        anm: {
            to: {
                up: 'to-top',
                down: 'to-bottom',
                left: 'to-left',
                right: 'to-right'
            },
            from: {
                up: 'from-top',
                down: 'from-bottom',
                left: 'from-left',
                right: 'from-right'
            },
            reverse: function(v){
                switch (v){
                    case 'up':
                        return 'down';
                    case 'down':
                        return 'up';
                    case 'left':
                        return 'right';
                    case 'right':
                        return 'left';
                    default: 
                        return 'none';
                }
            }
        }, // easy animations keys
        types:[
            'String',
            'Number',
            'BigInt',
            'Symbol'
        ] // String Instantiable classes
    };
    function extendObj(){
        var out = {};
        arguments.keys(function(idx, value){
            value.keys(function(prop){
              Object.defineProperty(out, prop, 
                Object.getOwnPropertyDescriptor(value, prop));
          });
        });
        return out;
    };
    function extendArray(){
        var out = [];
        arguments.keys(function(idx, value){
          if(Array.isArray(value)){
          	var len = value.length, i = 0;
          	for(i; i < len; i++) out.push(value[i]);
          }else{
          	out.push(value);
          }
        });
        return out;
    };
    function setDefault(obj, options){
        if(!obj) obj = {};
        if(!options) options = {};
        options.keys(function(k, v){
          if(func.isInvalid(obj[k]))
            obj[k] = v;
      });
      return obj;
    };
    function toArray(obj, cb){
        if(!obj) return [];
        var array = [].slice.call(obj);
        // Calling the callback if it needs
        if(cb) func.loop(array, cb);
        return array;
    };
    function isSkip(name){
        switch (name){
            case "#comment": return true;
            case "#text": return true;
            case "SCRIPT": return true;         
            case "STYLE": return true;
            default: return false;
        }
    };
    
    // Error messages
    var error = {
        conn: function(){ return "It seems that there is not any easy connector available. " + 
                    "Please check if any easy.[ajax|free|something].js is imported."; },
        notFound: function(v){ return "Element '"+ (v ? v : '') + "' not found."; },
        invalid: function(v){ return "Invalid value" + (v ? ': ' + v : '') + "." },
        invalidField: function(v){ return "Invalid field" + (v ? ': ' + v : '') + "." },
        elem: function(v){ return "The selector or object passed for '" + v + "' is invalid, please check it." }
    };

    /**
     * HTML Element handler
     */
    this.html = {
        /**
         * Allow to fill and add an element in the DOM
         * @param {HTMLElement} container The html element or selector
         * @param {Object} data The object model to get the values
         * @param {HTMLElement} elem The element to serve as insertion point
         * @param {Boolean} reserve Allows to switch the insertion direction, 
         * **false** for insert after, **true** for insert before.
         */
        add: function(container, data, options){
            if(!data) data = {};
            options = setDefault(options, {
                elem: null,
                reverse: false
            });

            if(!container._callId) container._callId = data._callId;

            // Filling the element
            var template = $e.html.fill(container.$tmp.cloneNode(true), data);

            template._callId = data._callId;
            var call = vars.webCalls[data._callId];
            if(!call.elem) call.elem = container;
            
            // Cleaning the template
            vars.cmds.keys(function(k, value){ template.removeAttribute(value) });
            // Defining a tmp attr
            template.tmpAttr = template.tmpAttr || func.attr(container, [vars.cmds.tmp]);
            template.$preventMutation = true;

            if(!options.elem){
                // Default insertion
                if(options.reverse) container.insertBefore(template, container.children[0]);
                else container.appendChild(template);
            } else {
                // Insertion in some point
                if(options.reverse) container.insertBefore(template, options.elem);
                else container.insertBefore(template, options.elem.nextElementSibling);
            }
        },
        /**
         * Allow to fill an element
         * @param {HTMLElement} element The html element or selector
         * @param {Object} data The object model to get the values to fill
         * @returns {HTMLElement} The element filled
         */
        fill: function(element, data){
            if(!data) data = {};
            var cmds = vars.cmds;

            // Setting the template name
            if(!element.tmpAttr)
                element.tmpAttr = func.attr(element, [cmds.fill, cmds.tmp, cmds.data], true);

            // Reading the UI element
            ui.read(element, data);

            var anm = element.valueIn(vars.cmds.anm);
            // Applying animation if needed
            if(!func.isInvalid(anm)) element.niceIn(anm);
            return element;
        }
    };
    /**
     * Creates an obj (if form is a selector) and send it to the available connector
     * @param {String} path The URL endpoint
     * @param {HTMLElement} form The html element or selector
     * @return The easy return type
     */
    this.create = function(path, form){
        try {
            // Checking the connector
            if(func.isInvalid($e.conn)) throw ({
                message: error.conn()
            });

            // Getting the object js object
            var obj = $e.toJsObj(form);
            if(!obj) throw ({
                message: error.elem('create')
            });

            // Sending and Getting the data from the data source
            var promise = $e.conn.add(path, obj);
            promise.then(function(data) {
                if(func.isInvalid(data.result)) return data;
                ui.observer.emitAdd(data, path);
            }).catch(function(error) {
                return $e.log(error);
            });
            
            return promise;
        } catch (error){
            return Promise.reject($e.return(false, $e.log(error), null));
        }
    };
    /**
     * Get all from a path
     * @param {String} path The URL endpoint
     * @param {Function} cb (optional) The callback that will be passed the return
     * @param {String} filter (optional) The string filter for the returned values
     * @return The easy return type
     */
    this.read = function(path, cb, filter){
        try {
            // Checking the connector
            if(func.isInvalid($e.conn)) throw ({
                message: error.conn()
            });

            // Sending and Getting the data from the data source
            var promise = $e.conn.list(path, filter);
            promise.then(function(data) {
                if(func.isInvalid(data.result)) return data;
                
                if(!func.isInvalid(cb)){
                    // Subscribing the event
                    var sub = ui.observer.subscribe({
                        meth: 'list',
                        flag: path,
                        call: cb
                    });
    
                    if(Array.isArray(data.result)) 
                        data.result.forEach(function(model){
                            model._callId = sub.id;
                            sub.run(model);
                        });
                    else
                        $e.log("The result of "+ path +" is not an array.");
                }
            }).catch(function(error) {
                return $e.log(error);
            });

            return promise;
        } catch (error){
            return Promise.reject($e.return(false, $e.log(error), null));
        }
    };
    /**
     * Creates an obj (if form is a selector) and send to the available connector to updated it
     * @param {String} path The URL endpoint
     * @param {HTMLElement} form The html element or selector
     * @param {string} id The Id of the object that will be updated
     * @return The easy return type
     */
    this.update = function(path, form, id){
        try {
            // Checking the connector
            if(func.isInvalid($e.conn)) throw ({
                message: error.conn()
            });

            // Getting the object js object
            var obj = $e.toJsObj(form);
            // Checking if the object is valid
            if(!obj) throw ({
                message: error.elem('updated')
            });

            // Sending and Getting the data from the data source
            var promise = $e.conn.update(path, obj, id);
            promise.then(function(data) {
                if(func.isInvalid(data.result)) return data;
                // Emitting
                ui.observer.emitUpdate(id, data.result, path);
            }).catch(function(error) {
                return $e.log(error);
            });

            return promise;
        } catch (error){
            return Promise.reject($e.return(false, $e.log(error), null));
        }
    };
    /**
     * Deletes an obj from a source
     * @param {String} path The URL endpoint
     * @param {String} id The Id of the object that will be deleted
     * @return The easy return type
     */
    this.delete = function(path, id){
        try {
            // Checking the connector
            if(func.isInvalid($e.conn)) throw ({
                message: error.conn()
            });

            // Checking the id parameter is null
            if(!id) throw ({
                message: error.invalid('id')
            });

            // Sending and Getting the data from the data source
            var promise = $e.conn.remove(path, id);
            promise.then(function(data) {
                if(func.isInvalid(data.result)) return data;
                // Emitting
                ui.observer.emitRemove(id, path);
            }).catch(function(error) {
                return $e.log(error);
            });
           
            return promise;
        } catch (error){
            return Promise.reject($e.return(false, $e.log(error), null));
        }
    };
    /**
     * getOne obj from a source
     * @param {string} path The URL endpoint
     * @param {string} id The Id of the object
     * @param {Function} cb (optional) The callback that will be passed the return
     * @return The easy return type
     */
    this.getOne = function(path, id, elem){
        try {
            // Checking the connector
            if(func.isInvalid($e.conn)) throw ({
                message: error.conn()
            });

            // Sending and Getting the data from the data source
            var promise = $e.conn.getOne(path, id);
            promise.then(function(data) {
                // Checking if the result is not valid
                if(func.isInvalid(data.result)) return data;
                if(!func.isInvalid(elem)){
                    // Subscribing the event
                    var sub = ui.observer.subscribe({
                        meth: 'get',
                        flag: path,
                        call: function(elem, mdl){
                            if(elem){
                                // Getting the element
                                var mElem = func.isString(elem) ? $e.elem.node(elem) : elem;
                                if(mElem){
                                    mElem._callId = sub.id;
                                    // Adding to the call
                                    vars.webCalls[sub.id].elem = mElem;
                                    $e.html.fill(mElem, mdl);
                                } else
                                    $e.log(error.notFouded(func.desc(elem)));
                            }
                        }
                    });
                    sub.run(elem, data.result);
                }
            }).catch(function(error) {
                return $e.log(error);
            });

            return promise;
        } catch (error){
            return Promise.reject($e.return(false, $e.log(error), null));
        }
    };
    /**
     * Generates an Javascript Object from an HTML Element
     * Eg.: easy.toJsObj(element, { names: '[name],[nm]', values: '[value],[vl]' })
     * @param {HTMLElement} input The html element or selector
     * @param {Object} options.names Defines which attribute will be search for. By default is [name], the order matters!
     * @param {Object} options.values Defines which attribute will be taken the value. By default is [value], the order matters!
     * @returns {Object} Javascript object
     */
    this.toJsObj = function(input, options){
        options = setDefault(options, {
            names: '[name]',
            values: '[value]'
        });

        if(!input) return null;

        var elem;

        if(input instanceof Element)
            elem = input;
        else if(input instanceof Object)
            return input;
        else if(func.isString(input)){
            try { elem = doc.node(input); } 
            catch (error){ return input; }
        }

        if(!elem){
            $e.log(error.notFound(input));
            return null;
        }

        // Store the build command name
        var cmd = vars.cmds.build;

        var buildObj = function(element){
            // Elements that it needs to escape on serialization
            var escapes = ['BUTTON', 'DIV', 'SPAN'];
            function clear(val){
                return val.split(',').map(function(el){
                    return el.replaceAll(['[', ']']).trim();
                });
            } 

            var obj = {};

            function tryGetValue(e){
                var val = null;
                clear(options.values).findOne(function (v){
                    return (val = e.valueIn(v)) ? true : false;
                });
                return val;
            }

            (function exec(el){
                var mNames = clear(options.names);
                var attr = func.attr(el, mNames);
                if(attr){
                    name = attr.value;

                    if(escapes.findOne(function(f){
                        return f === el.tagName;
                    })) return;
                    if(el.type === 'checkbox' && el.checked === false) return;
    
                    var prop_value = obj[tryGetValue(el)];
                    var isArray = el.hasAttribute(vars.cmds.array);

                    if(!isArray){
                        if(prop_value)
                            obj[name] = extendArray(prop_value, tryGetValue(el));
                        else
                            obj[name] = tryGetValue(el);
                    } else {
                        if(prop_value)
                            obj[name] = extendArray(prop_value, tryGetValue(el));
                        else
                            obj[name] = extendArray(tryGetValue(el));
                    }
                }
                toArray(el.children, function(child){
                    if(!func.attr(child, [cmd])) exec(child); 
                });
            })(element);
            return obj;
        }

        // Building the base form
        var obj = buildObj(elem);

        // Getting the builds 
        var builds = elem.nodes('['+ cmd +']');

        // Building builders
        func.loop(builds, function(b){
            // Getting the e-build attr value
            var name = b.valueIn(cmd);
            // Checking if has an attr defined
            var isArray = b.hasAttribute(vars.cmds.array);
            // Building the object
            var value = buildObj(b);

            if(value.keys().length === 0) return;

            // Build a path to set the value in the main object
            var pathBuilder = function(fullPath, cb){
                var path = '';
                // Looping the path
                var sections = fullPath.split('.');
                func.loop(sections, function(sec){
                    path += '.' + sec;
                    var prop_value = eval('obj' + path);
                    // Checking the path has a null value
                    if(func.isInvalid(prop_value)){
                        eval('obj'+ path +'={}');
                        // Checking if it's last section of the path
                        if(sections[sections.length - 1] === sec)
                            cb(path);
                    }
                    // Otherwise, check if the value is an array
                    else if(Array.isArray(prop_value)){
                        var remainPath = func.toPath(fullPath.substr(path.length));
                        if(remainPath === '')
                            cb(path, prop_value);
                        else
                            func.loop(prop_value, function(e, i){
                                // Building new path according the index of the array
                                
                                pathBuilder(path.substr(1) + '['+ i +']' + remainPath, cb);
                            });
                        // Breaking the main loop, because every work is done
                        return;
                    }else{
                        // Checking if it's last section of the path
                        if(sections[sections.length - 1] === sec)
                            cb(path, prop_value);
                    }
                });
            }

            pathBuilder(name, function(path, prop_value){
                if(isArray){
                    // Checking if it already has properties defined
                    if(!func.isInvalid(prop_value)){
                        // Checking if the old value is also an array
                        if(Array.isArray(prop_value))
                            eval("obj" + path + "=extendArray(prop_value, value)");
                        else {
                            // If it's not, só spread it
                            eval("obj" + path + "=[ extendObj(value, prop_value) ]");
                        }
                    }
                    else
                        eval("obj" + path + "=[ value ]");
                } else {
                    // Checking if it already has properties
                    if(prop_value && prop_value.keys().length > 0)
                        eval("obj" + path + "=extendObj(prop_value, value)");

                    else
                        eval("obj" + path + "=value");
                }
            });
        });

        return obj;
    };
    // Helper to add easy css in the DOM
    Easy.prototype.css = function(){
        var easyStyle = doc.node('[e-style="true"]');
        if(easyStyle) return;

        var style = doc.createElement("style");
        style.valueIn('e-style', 'true');

        var val = {
            dist: 15,
            opacity: 1,
            dur: 0.2
        };

        // Creates to- animation body
        var toAnim = function(name, dir){
            return "transform: translate" + dir + "; -webkit-transform: translate" + dir + "; animation:" + 
            name + " " + val.dur + "s ease-out forwards; -webkit-animation:" + name+ " " +val.dur + "s ease-out forwards;";
        }
        // Creates from- animation body
        var fromAnim = function(name){
            return "animation:" + name + " " + val.dur + "s ease-out forwards; -webkit-animation: " + name + " " +val.dur +"s ease-out forwards;";
        }
        // Creates keyframes animation body
        var keyframes = function(name, opacity, dir){
            return "keyframes " + name + " { to { opacity: " + opacity + "; transform: translate" + dir + "; } }"
        }

        style.textContent = ".hide-it { display: none !important; }" +
        ".to-top, .to-bottom, .to-right, .to-left { opacity: 0; }" +
        ".from-top, .from-bottom, .from-right, .from-left" +
        "{ opacity: 1; transform: translateY(0%); -webkit-transform: translateY(0%); }" +
        
        ".to-top {" + toAnim('to-top', 'Y(' + val.dist +'%)') + " }" +
        ".to-bottom { " + toAnim('to-bottom', 'Y(-' + val.dist +'%)') + " }" + 
        ".to-right { " + toAnim('to-right', 'X(-' + val.dist +'%)') + " }" + 
        ".to-left { " + toAnim('to-right', 'X(' + val.dist +'%)') + " }" + 

        ".from-top { " + fromAnim('from-top') + " }" +
        ".from-bottom { " + fromAnim('from-bottom') + " }" +
        ".from-right { " + fromAnim('from-right') + " }" +
        ".from-left { " + fromAnim('from-left') + " }" +

        "@" + keyframes('to-top', val.opacity, 'Y(0%)') +
        "@" + keyframes('to-bottom', val.opacity, 'Y(0%)') +
        "@" + keyframes('to-right', val.opacity, 'Y(0%)') +
        "@" + keyframes('to-left', val.opacity, 'Y(0%)') +
        
        "@-webkit-" + keyframes('to-top', val.opacity, 'Y(0%)') +
        "@-webkit-" + keyframes('to-bottom', val.opacity, 'Y(0%)') +
        "@-webkit-" + keyframes('to-right', val.opacity, 'Y(0%)') +
        "@-webkit-" + keyframes('to-left', val.opacity, 'Y(0%)') +

        "@" + keyframes('from-top', 0, 'Y(' + val.dist +'%)') +
        "@" + keyframes('from-bottom', 0, 'Y(-' + val.dist +'%)') +
        "@" + keyframes('from-right', 0, 'X(-' + val.dist +'%)') +
        "@" + keyframes('from-left', 0, 'X(' + val.dist +'%)') +
        
        "@-webkit-" + keyframes('from-top', 0, 'Y(' + val.dist +'%)') +
        "@-webkit-" + keyframes('from-bottom', 0, 'Y(-' + val.dist +'%)') +
        "@-webkit-" + keyframes('from-right', 0, 'X(-' + val.dist +'%)') +
        "@-webkit-" + keyframes('from-left', 0, 'X(' + val.dist +'%)');

        doc.head.appendChild(style);
    };
    /**
     * A code generator
     * @param {Number} length The length of chars to generate
     * @returns Some random code
     */
    Easy.prototype.code = function(len){
        if(func.isInvalid(len)) len = 25;
        var alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_01234567890';
        var alt = false,
            result = '';
        for (var i = 0; i < len; i++){
            var p = Math.floor(Math.random() * alpha.length);
            result += alt ? alpha[p].toLowerCase() : alpha[p];
            alt = !alt;
        }
        return result;
    },
    /**
     * Easy return type
     * @param {Boolean} status The status
     * @param {String} message The message
     * @param {Object} result The result
     */
    Easy.prototype.return = function(status, message, result){
        return {
            status: status,
            msg: message,
            result: result
        };
    }
    /**
     * Helper function to filter results by string value
     * @param {Array} array - The array to be filtered
     * @param {String} expression - The string expression. Eg.: Name=='Afonso'
     */
    Easy.prototype.filter = function(array, expression){
        try {
            if(!array || !Array.isArray(array)) throw ({
                message: 'Bad array definition passed in easy filter function, it seems that is not an Array'
            });
            if(!expression) return array;
        } catch (error){
            $e.log(error);
            return array;
        }

        try {
            return func.loop(array, function(model){
                var value = func.exec(expression, model) || false;
                return value;
            });
        } catch (error){
            $e.log('Something is wrong with the expression!: ' + expression, 'warn');
            return [];
        }
    };
    /**
     * Sets values in the data 
     */
    Easy.prototype.setData = function(input){
        if(func.isInvalid(input)) return;
        if(typeof input === 'function'){
            var data = input.call(null, $this);
            if(data) new ReactiveObject(data);
            else $e.log('Returned object is needed configure the new data object', 'warn');
        } else {
            var data = new ReactiveObject(input);
            // Defining
            data.keys(function (k){
                Object.defineProperty($this, k, Object.getOwnPropertyDescriptor(data, k))
            }); 
        }
        return $this;
    };

    // Classes
    /**
     * Component includer
     */
    function Includer(paths){
        if(!paths) paths = {};
        // Includer paths
        this.paths = (function(paths){
            var components = {};
            paths.keys(function(key, value){
                components[key] = func.isString(value) ? {
                    url: value,
                    title: undefined,
                    route: undefined
                } : value;
            });
            return components;
        })(paths);
        // Store all the components while the application is running
        this.components = {}
        // Includer events
        this.events = [];
        // Helper to check if a request to a path is on.
        // It Stores temporarily the path untill the is complete
        this.webRequest =  {}
        /**
         * The a file from the server
         * @param {String} path The of the element 
         * @param {Function} cb The callback if it is ok
         */
        this.get = function(path, cb){
            // fetch function to get the file
            fetch( location.origin + '/' + path + '.html' , {
                method: 'get',
                headers: {
                    'Content-Type': 'text/plain'
                }
            }).then(function(data) {
                // Checking if the response is ok
                if(data.ok)
                    data.text().then(function(text) { cb(text); });
                else
                    $e.log('Unable to load the file: '+ path +'. \nDescription: ' + data.statusText + '.');
            }).catch(function(error) { $e.log(error); });
        }
        /**
         * Html includer main function
         * @param {String} name The file Name or Path of the element that will be included. 
         * @param {HTMLElement} inc The inc element that the content will be included. 
         */
        this.include = function(name, elem){
            // Checking if the name is not Ok 
            if(func.isInvalid(name))
                return $e.log("Invalid value of attribute 'src' or 'inc-src' of '"+ elem.desc() +"'. Or, it's undefiened.");
            // Checking if the name is not Ok 
            if(func.isInvalid(elem))
                return $e.log("Invalid value element of '"+ name +"'. Or, it's undefiened.");
            // Set has includer done
            elem.idone = true;
            // Checking if the replace attribute is defined
            var no_replace = elem.hasAttribute('no-replace');
            // Get from Page
            if(name[0] === '@'){
                // Normalizing the name, removing @
                var nameNormalized = name.substr(1);

                var el = inc.components[nameNormalized];

                if(!el){
                    // Getting the template
                    el = $e.elem.node("[inc-tmp='"+ nameNormalized +"']");
                    // Storing the inc
                    if(el){
                        el.removeAttribute('inc-tmp');
                        el = inc.newElem(el);

                        inc.components[nameNormalized] = el;
                    }
                }

                // Checking if the template was found
                if(!el) return $e.log("No element[inc-tmp] was found with this identifier '@"+ nameNormalized +"'.", 'warn');

                if(func.isString(el)) 
                    return $e.log("Wrong 'src' or 'inc-src', try to set to outer include removing '@' sign in '"+ name +"'.", 'warn');

                // Generating new element 
                el = inc.newElem(el);

                if(!no_replace)
                    elem.aboveMe().replaceChild(el, elem);
                else
                    elem.appendChild(el);

                // Firing the events
                func.loop(inc.events, function (evt){ evt(el); });

                return;
            }

            var compObj = inc.paths[name];
            // Getting the path
            var path = compObj ? compObj.url : undefined;
            if(!path) path = name;

            // Get from Server
            // Inserts the content to the DOM
            function insert(content, store){
                // Storing the content
                if(store) inc.components[name] = content;

                var temp = doc.createElement('body');
                temp.innerHTML = content;
                
                var el;
                var styles = [];
                var scripts = [];
                func.loop(temp.children, function(child){
                    switch (child.nodeName){
                        case 'STYLE':
                            styles.push(child);
                            return;
                        case 'SCRIPT':
                            scripts.push(child);
                            return;
                        default:
                            el = child;
                            return;
                    }
                });
                
                if(!el) return $e.log("The component '" + name + 
                "' seems to be empty or it has not an root element" + 
                "Eg.: <div></div>, to include. Please, check it!", 'warn');

                // Adding inner elements
                var main = el.node('main');
                if(main){
                    var above = main.aboveMe();
                    above.removeChild(main);
                    toArray(elem.children, function(child){
                        if(child.nodeName === 'SCRIPT')
                            scripts.push(child);
                        else
                            above.appendChild(child);
                    });
                }
                var scopedStyles;
                // Looping the scripts
                func.loop(styles, function(style){
                    doc.head.appendChild(style);
                    // For scoped styles
                    if(style.hasAttribute('scoped')){
                        // Generating some class for the selectors
                        var value = 'scope-style-s'+$e.code(7);
                        if(!scopedStyles) scopedStyles = [];
                        
                        scopedStyles.push(value);

                        // Changing each selector to avoid conflit
                        func.loop(style.sheet.cssRules, function(rule){
                            rule.selectorText = "." + value + " " + rule.selectorText; 
                        });
                    }
                });

                if(scopedStyles){
                    func.loop(scopedStyles, function(s){ 
                        el.valueIn('class', 
                        // Redefining the top object class
                        (s + ' ' + el.valueIn('class')));
                    });
                }

                // Changing the title and the url if it needed
                if(compObj.title)
                    doc.title = compObj.title; 
                
                if(compObj.route)
                    window.history.pushState(content, compObj.title || undefined, compObj.route);
                
                // Adding the element in the DOM
                if(!no_replace){
                    // Adding the attributes to the that will be inserted
                    toArray(elem.attributes, function(attr){
                        switch (attr.name){
                            case 'src':
                            case 'inc-src':
                            case 'no-replace':
                                return;
                            
                            case 'class':
                                toArray(elem.classList, function(c){
                                    el.classList.add(c);
                                });
                                return;
                            default:
                                el.valueIn(attr.name, attr.value);
                                return;
                        }
                    });
                    elem.aboveMe().replaceChild(el, elem);
                }
                else
                    elem.appendChild(el);

                // Looping the scripts
                func.loop(scripts, function(script){
                    //doc.body.appendChild(script);
                    // Evalueting them
                    eval(script.innerHTML);
                });
                
                // Firing the events
                func.loop(inc.events, function (evt){
                    evt(el);
                });
            }

            var compContent = inc.components[name];
            // Checking if the component is stored
            if(compContent) insert(compContent);
            // Otherwise, check if we don't have a web request made to this path
            // because we don't wan't request again 
            else if(!inc.webRequest[name]){
                // Setting that we have a web request to this path
                inc.webRequest[name] = true;
                // Getting the data
                inc.get(path, function(content){
                    delete inc.webRequest[name];
                    insert(content, true);
                });
            }
            // Otherwise, wait untill the web request is done 
            else {
                var t = setInterval(function(){
                    // Checking if the component is configured
                    var content = inc.components[name];
                    if(content){
                        insert(content);
                        clearInterval(t);
                    }
                }, 0);
            }
        }
        /**
         * Helper to get the source value a inc value 
         * @param {HTMLElement} elem The inc element
         */
        this.src = function(elem){
            return elem.valueIn('src') || elem.valueIn('inc-src');
        } 
        /**
         * Creates new element from the input element
         * @param {Element} The element to based on
         */
        this.newElem = function(el){
            var e = doc.createElement('body');
            e.innerHTML = func.isString(el) ? el : el.outerHTML;
            return e.children[0];
        }
    };
    /**
     * Functions and extensions used by easy
     */
    function Func(){
        /**
         * Check if a value is null/undefined
         * @param {*} input The input value
         */
        this.isInvalid = function(input){
            return (typeof input === 'undefined') || (input === undefined || input === null);
        }
        /**
         * Check if a value is a string
         * @param {String} input The input value
         */
        this.isString = function(input){
            return (typeof input !== 'undefined') && (typeof input === 'string');
        }
        /**
         * Gets a description 'name, id, classes' of an element
         * @param {Element} elem The element to get de description
         */
        this.desc = function(elem){
            return (elem instanceof Element ? elem.desc() : elem);
        }
        /**
         * Execute an expression and returns the value if valid and undefiened is not valid.
         * WARNING: It uses the window (globalObject)
         * @param {String} exp The expression to be evaluated
         * @param {Object} $data The model to get the value if needed, by default is empty object
         * @param {Boolean} $return Allows you to define if the function needs to have a return value or not
         * @param {Boolean} escape Allows you to escape showing message error
         */
        this.eval = function(exp, $data, $return, $args){
            if(!$data) $data = {};
            if(func.isInvalid($return)) $return = true; 
            var value = undefined;
            try {
                if(func.isInvalid(exp) || exp === '') return;
                func.spreadData(function(){
                    eval( ($return ? 'value=' : '') +  exp );
                }, $data, $args);
            } catch (error){
                $e.log(error.message + '. \nExpression: << ' + exp + ' >>.\nAvailable variables: { ' + $data.keys().join(', ') + ' }');
            }
            return value;
        }
        /**
         * Execute an expression and returns the value if an primitive or a JSON if an object, 
         * and an empty string if is not valid
         * @param {String} exp The expression to be evaluated
         * @param {Object} $data The model to get the value if needed, by default is empty object
         * @param {Boolean} json Allow to convert the result to json if it's an object, by default is false
         */
        this.exec = function(exp, $data, json){
            try {
                if(func.isInvalid(json)) json = false;
                var value = func.eval(exp, $data);
                if(func.isInvalid(value)) return '';
                if(json){
                    if(value instanceof Object) 
                        value = JSON.stringify(value);
                }
                return value;
            } catch (error){
                return '';
            }
        }
        /**
         * Builds arguments to array accesable one. 
         *  Eg.: 'Person.Name' -> ['Person']['Name']
         */
        this.toPath = function(){
            var path = '';
            for (var key in arguments){
                var el = arguments[key];
                if(!func.isInvalid(el) && el !== ''){
                    if(Array.isArray(el))
                        path += el.map(function (m){
                            return "['" + m + "']";
                        }).join('');
                    else if(func.isString(el)){
                        path += func.loop(el.split('.'), function (f){
                            return f;
                        }).map(function (m){
                            return !m.includes('[') ? "['" + m + "']" : m
                        }).join('');
                    }
                }
            }
            return path;
        }
        /**
         * Get an attribute of an element
         * @param {Element} elem The element to be searched
         * @param {Array} attrs The attributes, the order matter 
         * @param {Boolean} remove Allow to remove the attribute if was found
         */
        this.attr = function(elem, attrs, remove){
            if(!elem) return;
            if(!attrs) return;
            if(func.isInvalid(remove)) remove = false;
            if(func.isInvalid(elem.attributes)) return;

            var res = toArray(elem.attributes).findOne(function(attr){
                return attrs.findOne(function(a){
                    return attr.name === a;
                }) ? true : false
            });

            if(res && remove) elem.removeAttribute(res.name);
            return res;
        }

        /**
         * Compiles a string, checking if it has some replacable parts
         * @param {String} str The expression do compile
         * @param {String} str The data to base on
         */
        this.compile = function(str, $dt){
            if(!str) return '';
            if(!$dt) $dt = {};
            // Getting the value
            var value = str;

            func.loop(ui.hasDelimiter(value), function(field){
                var val = func.exec(field.exp, $dt, true);
                value = value.replaceAll(field.field, val);
            });

            return value;
        }

        /**
         * Define temporary properties in window (globalObject), 
         * call the main callback and removes all the properties define.
         * @param {Function} cb The main object that will use the  
         */
        this.spreadData = function(cb, $dt, $args){
            var keys = ($dt || $this).keys();
            // Calling the callback
            try { 
                // Defining 
                func.loop(keys, function(k){
                    Object.defineProperty($e.global, k, 
                        Object.getOwnPropertyDescriptor($dt || $this, k))
                });
                cb($args); // Calling the main function
            } 
            catch (error){ throw({ message: error.message });}
            finally{
                // Cleaning
                func.loop(keys, function(k){ delete $e.global[k]; });
            }
        }

        this.loop = function(array, cb){
            if(!array){
                $e.log(error.invalid('array'));
                return array;
            }
            var len = array.length, i, res = [];
            for (i = 0; i < len; i++){
                if(cb(array[i], i)) res.push(array[i]);
            }
            return res;                
        }

        // Extensions
        // Prevents redefinition of the extensions
        if(doc.node !== undefined) return;

        // Extension setter
        function def(key, cb, type){
            Object.defineProperty((type || Object).prototype, key, {
                configurable: true,
                writable: true,
                value: cb,
            });
        };
        // Query one element
        def('node', function(v){
            if(!v) return null;
            var result = v[0] === '#' ?
                this.getElementById(v.substr(1)) :
                this.querySelector(v);
            return result;
        }, Node);
        // Query many elements
        def('nodes', function(v){
            if(!v) return null;
            var result = toArray(this.querySelectorAll(v));
            return result;
        }, Node);
        // get key of an object
        def('keys', function(cb){
            var self = this;
            var array = Object.keys(self);
            // Calling the callback if it needs
            if(cb) func.loop(array, function (e){ cb(e, self[e]); });
            return array;
        });
        // map values from an object to the current one
        def('mapObj', function(input, deep){
            var self = this;
            if(func.isInvalid(deep)) deep = false;
            return input.keys(function(key, value){
                var destination = self[key];
                if(deep && destination instanceof Object){
                    if(!Array.isArray(destination))
                        self[key].mapObj(value);
                } else {
                    var source = (value ? value : self[key]);
                    if(source != destination)
                        self[key] = source;
                }
            });
        });
        // Get or Set and Get value from an attribute or content value
        def('valueIn', function(name, set){
            // To Set and Get the same value
            if(set)
                return this.setAttribute(name, set) || this.getAttribute(name);
            // Only get value
            else
                return name != null ? this[name] || this.getAttribute(name) : this.innerText;
        }, Element);
        // get the elem above the current element
        def('aboveMe', function(selector){
            // Parent getter
            function parent(elem, name){
                var parentObject = elem.parentNode;
                if(parentObject === doc) return null;
                // Checking if the search must
                if(name){
                    if(parentObject.tagName && parentObject.tagName.toUpperCase() != name.toUpperCase()){
                        var normalizedName = name.replaceAll(['#', '.']);
                        if(name[0] === '.'){
                            var containClass = parentObject.classList.contains(normalizedName);
                            if(!containClass) return parent(parentObject, name);
                        } else if(name === '#'){
                            if(parentObject.valueIn('id') != normalizedName) return parent(parentObject, name);
                        } else {
                            // Getting the parent again
                            return parent(parentObject, name);
                        }
                    }
                }
                return parentObject;
            }
            // Getting the parent
            return parent(this, selector);
        }, Element);
        // check if an object has some value, and it returns true or false
        def('hasValue', function(value){
            var self = this;
            // Finding any property that matches the input value
            return self.keys().findOne(function(x){ return self[x] === value; });
        });
        // Gets any object that matches the value
        def('get', function(value){
            var self = this;
            // Finding the object that matches a value or index
            return self.findOne(function(x){
                return x === value || x.hasValue(value);
            }) || self[value];
        }, Array);
        // Gets any object that matches the value
        def('findOne', function(cb){
            var self = this, i = 0, 
            len = self.length, result;
            for(i; i < len; i++){
                if(cb(self[i], i)){
                    result = self[i];
                    break;
                }
            }
            return result;
        }, Array);
        // Get the index of an object
        def('index', function(value){
            var index = -1;
            this.findOne(function(x, i){
                if((x === value || x.hasValue(value))){
                    index = i;
                    return true;
                }
                return false;
            });
            return index;
        }, Array);
        // Get the index of all the ocurrencies of an object
        def('indexes', function(value, cb){
            var array = [];
            // Finding the object that matches a value or index
            func.loop(this, function(x, i){
                if((x === value || x.hasValue(value)))
                    array.push(i);
            });
            // Calling the callback if it needs
            if(cb) func.loop(array, function(e){ cb(e); });
            return array;
        }, Array);
        // Remove element(s) from an array
        def('remove', function(value, allWith){
            try {
                if(func.isInvalid(allWith)) allWith = false;
                // Handling the default pop function if the value is not defined
                if(!value && value != 0){
                    this.pop();
                } else {
                    // Otherwise, Handling the costumized remove function
                    // Removing all objects with this value
                    if(allWith === true){
                        extendArray(this).indexes(value, function(i){
                            // removing the element
                            this.splice(i, 1);
                        });

                    } else {
                        var index = this.index(value);
                        if(index === -1){
                            if(Number.isInteger(value * 1))
                                index = value * 1;
                        }
                        // removing the element
                        this.splice(index, 1);
                    }
                }
            } catch (error){
                $e.log({
                    msg: 'Remove function error. ' + error.message,
                    error: error
                });
            }
            return this;
        }, Array);
        // Animation extension
        // The main function for the animation extension to be shared between them
        var niceShared = function(elem, direction, key, other){
            // Adding a style elem in the DOM
            $e.css();

            var anm = vars.anm;
            var keyNormalized = key.toLowerCase().split(':');

            // the animations keys, defined by the user
            var keyIn = keyNormalized[0];
            var keyOut = keyNormalized[1] || anm.reverse(keyIn);

            if(other) other.niceOut(keyOut);

            anm['to'].keys(function (k, v){ elem.classList.remove(v); });
            anm['from'].keys(function (k, v){ elem.classList.remove(v); });

            // Adding the class in the main element
            elem.classList.add(anm[direction][keyIn]);
        }
        // Execute the nice in animation into an element
        def('niceIn', function(key, outElem, cb, delay){
            var self = this;
            if(func.isInvalid(delay)) delay = 80;
            // Executing the main function
            niceShared(self, 'to', key, outElem);
            // Executing the callback
            setTimeout(function(){
                if(cb) cb(self, outElem);
            }, delay);
        }, HTMLElement);
        // Adds the nice out animation into an element
        def('niceOut', function(key, inElem, cb, delay){
            var self = this;
            if(func.isInvalid(delay)) delay = 80;
            // Executing the main function
            niceShared(self, 'from', key, inElem);
            // Executing the callback
            setTimeout(function(){
                if(cb) cb(self, inElem);
            }, delay);
        }, HTMLElement);
        // End Animation Extension
        // Generate element description. eg.: form#some-id.class1.class2
        def('desc', function(){
            var self = this;
            if(!self.nodeName) return self.toString();
            return extendArray(self.nodeName.toLowerCase(), (self.id ? '#' + self.id : ''), 
                toArray(self.classList).map(function (x){
                    return '.' + x;
                })).join('')
        }, Element);
        // Adds Event listener in a object or a list of it
        def('listen', function(name, cb){
            var elems = Array.isArray(this) ? this : [this];
            // Looping the elements
            func.loop(elems, function(elem){
                // Checking if the element is valid
                if(!(elem instanceof Node) && (elem !== window))
                    return $e.log("Cannot apply '"+ name +"'to the element" + elem.desc() + ".")
                // Event object
                var evt = {
                    event: name,
                    func: cb,
                    options: false
                }
                elem.addEventListener(evt.event, function(){
                    // base property where will be passed the main object, **not the target**.
                    arguments[0]['base'] = elem;
                    evt.func.apply(evt.func, arguments);
                }, evt.options);
            });
        });
        // Helper to replace every ocurrence of a string or a list of strings
        def('replaceAll', function(oldValue, newValue){
            // The current value
            var self = this;
            if(!newValue) newValue = '';

            // Replace all ocurrencies tha will be found
            var replace = function(str, _old_, _new_){
                var slen = str.length, 
                len = _old_.length;
                var out = '';
                for(var i = 0; i < slen; i++){
                    if(str[i] === _old_[0] && str.substr(i, len) === _old_){
                        out += _new_;
                        i += len - 1;
                    }else{
                        out += str[i];
                    }
                }
                return out;
            }
            
            if(!Array.isArray(oldValue))
                self = replace(self, oldValue, newValue);
            else
                func.loop(oldValue, function (el){
                    self = replace(self, el, newValue);
                });

            return self;
        }, String);
        // Helper to check if a string starts with some
        def('beginWith', function(value){
            return (this.substr(0, value.length) === value);
        }, String);
    };
    /**
     * Handler 
     */
    function UIHandler(){
        // UI observer functions
        this.observer = {
            /**
             * Subcribe get and read requests
             * @param {Object} obj - The call object
             */
            subscribe: function(obj){
                var id = obj.flag + ':' + $e.code();
                vars.webCalls[id] = obj;
                return {
                    id: id,
                    run: obj.call
                };
            },
            // emit add action to the UI
            emitAdd: function(r, path){
                if(r.status){
                    vars.webCalls.keys(function(key, value){
                        if(value.flag === path && value.meth === 'list'){
                            r.result._callId = key;
                            value.call(r.result);
                        }
                    });
                }
            },
            // emit update action to the UI
            emitUpdate: function(id, model, path){
                vars.temps.keys(function(k, value){
                    var bool = value.model.hasValue(id) &&
                        (path === value.tmp.tmpAttr.value);
                    if(!bool) return;

                    // Mapping the object
                    value.model.mapObj(model, true);

                    // Filling the element
                    $e.html.fill(value.tmp, value.model);
                });
            },
            // emit remove action to the UI
            emitRemove: function(id, path){
                vars.temps.keys(function(k, value){
                    var bool = value.model.hasValue(id) &&
                    (path === value.tmp.tmpAttr.value);

                    if(!bool) return;

                    if(value.tmp.tmpAttr.name === vars.cmds.fill)
                        // Cleaning the element
                        $e.html.fill(value.tmp);
                    else
                        // Removing the child
                        value.tmp.aboveMe().removeChild(value.tmp);
                });
            },
            mutation: function(cb){
                var maintenance = function(){
                    var clean = function(object, cb){
                        for (var key in object) 
                            if(object.hasOwnProperty(key))
                                cb(key);
                    }

                    clean(vars.temps, function(key){
                        var e = vars.temps[key];
                        if(e.tmp.isConnected === false) delete vars.temps[key];
                    });
                    
                    clean(vars.webCalls, function(key){
                        var e = vars.webCalls[key];
                        if(e.elem && e.elem.isConnected === false) delete vars.webCalls[key];
                    });
                }

                return new MutationObserver(function(mutations){
                    var cmds = vars.cmds;
                    func.loop(mutations, function(mut){
                        // For show attribute changes
                        if(mut.attributeName === cmds.if)
                            if(func.eval(mut.target.getAttribute(vars.cmds.if)) === false){
                                var above = mut.target.aboveMe();
                                if(above && !mut.target.attributes.hasAttribute(vars.cmds.id))
                                    above.removeChild(mut.target);
                            }
                        // For added nodes
                        func.loop(mut.addedNodes, function(node){
                            // Checking if the element needs to be skipped
                            if(node.$preventMutation) return;

                            // Skip if it's a comment
                            if(isSkip(node.nodeName)) return;
 
                            cb(node);                                    
                        });

                        if(mut.removedNodes.length > 0){
                            maintenance();
                        }

                        var target = mut.target;
                        function tmp() {
                            if(!target.$tmp) return;

                            toArray(target.children, function(child){
                                if(child._callId && child._callId === target._callId)
                                    target.removeChild(child);
                            });
                            
                            // Removing the call attached to this container
                            delete vars.webCalls[target._callId];
                            delete target._callId;

                            var attr = func.attr(target, [cmds.tmp]);
                            if(attr) target.$tmp.valueIn(cmds.tmp, attr.value);
                            // Defining the container in the tmp to be able to find it
                            // As the tmp as not parentNode
                            target.$tmp.__ctn__ = target;
                            // Removing the attribute added
                            target.removeAttribute(cmds.tmp);
                            
                            ui.init(target.$tmp);
                            maintenance();
                        }

                        function fill() {
                            // Removing the call attached to this element
                            delete vars.webCalls[target._callId];
                            delete target._callId;
                            
                            ui.init(target);
                            maintenance();
                        }

                        // Only fire when the attribute exists
                        if(target.hasAttribute(mut.attributeName))
                            switch (mut.attributeName){
                                case cmds.tmp: tmp(); break;
                                case cmds.fill: fill(); break;
                                case cmds.id:
                                    if(target.$tmp) tmp();
                                    else if(target._callId) fill();
                                    break;
                                default: break;
                            }

                    });
                });
            }
        };
        // Comments handler
        this.comment = {
            // Creates a comment with some identifier
            create: function(id, options){
                if(!options) options = {};
                var comment = document.createComment(' e ');
                comment.$id = id || $e.code();
                options.keys(function(k, value){
                    comment[k] = value;
                });
                return comment;
            },
            // Gets a comment from an element
            get: function(elem, id){
                if(func.isInvalid(id)) return;
                return ui.comment.getAll(elem, id).findOne(function (n){
                    return n.$id === id;
                }); 
            },
            getAll: function(elem, id){
                if(!elem) return [];
                var filterNone = function (){ return NodeFilter.FILTER_ACCEPT; }; 
                var iterator = document.createNodeIterator(elem, NodeFilter.SHOW_COMMENT, filterNone, false); 
                var nodes = [], node; 
                while (node = iterator.nextNode()){
                    if(node.$id === id || id === undefined) 
                        nodes.push(node);
                }
                return nodes;
            }
        };
        /**
         * Check if a string has the delimiter
         * @param {String} str The input string that needs to be checked
         */
        this.hasDelimiter = function(str){
            if(func.isInvalid(str) || str === '') return [];

            var delimiter = {
                easy: function(text, flag){
                    return text.match(RegExp('-e-([\\S\\s]*?)-', flag));
                },
                common: function(text, flag){
                    return text.match(RegExp('{{([\\S\\s]*?)}}', flag));
                } 
            }
            var res = delimiter.easy(str, 'g') || delimiter.common(str, 'g');
            
            if(!res) return [];
            return res.map(function(m){
                var matches = delimiter.easy(m) || delimiter.common(m);               
                return {
                    field: matches[0],
                    exp: matches[1].trim()
                };
            });
        };
        /**
         * Reads an element to find easy commands
         * @param {HTMLElement} elem The element to be read
         * @param {Object} data The object model having the data 
         * @param {Object} path The path to get the data
         */
        this.read = function(elem, $data){
            if(func.isInvalid(elem)) return [];
            if(!$data) $data = {};

            // Defines some reading scopes
            var cmds = vars.cmds;
            var scopes = {};
            scopes[cmds.tmp] = true;
            scopes[cmds.fill] = true;
            scopes[cmds.data] = true;
            scopes[cmds.for] = true;
            scopes['inc-src'] = true;
            scopes['INC'] = true;

            // Sets the old value of the attr and the element where it belongs
            function setBaseProps(attr, elem){
                if(!attr._name) attr._name = attr.name;
                if(!attr.$e.$oldValue) attr.$e.$oldValue = attr.nodeValue;
                if(!attr.$e.$baseElement) attr.$e.$baseElement = elem;
            }
            // Adds attrs having easy definition  
            function addOldAttrs(elem, value){
                if(!elem.$e.$oldAttrs){
                    elem.$e.$oldAttrs = [value]
                }else{
                    if(elem.$e.$oldAttrs.findOne(function(x){ return x == value; }))
                        return value;
                    elem.$e.$oldAttrs.push(value);
                }
                return value;
            }
            // Skipping the root element
            if(elem !== $e.elem){
                if(!elem.$e) elem.$e = {};
                var check = elem.$e;
                // Checking if the template is already in the list of it
                if(!check.tmpid){
                    check.tmpid = check.tmpid || $e.code();
                    var obj = {
                        tmp: elem,
                        model: $data
                    };
                    vars.temps[check.tmpid] = obj;
                }
            }

            (function exec(elem, $iData){
                // Ignore
                if(elem.nodeName === '#comment') return;
                // Calls the default UI.read callback
                function mainAction(el, fields){
                    // Setting the path in field
                    el.$e.$fields = fields;
                    
                    binding(el, $iData, function(){
                        ui.compileElem(el, $iData);
                    });
                }
                // Checking if it's a scope element
                var scope = scopes[elem.nodeName] ? elem : func.attr(elem, scopes.keys());
                if(scope){
                    switch (scope.name){
                        case cmds.tmp:
                        case cmds.fill:
                            ui.init(elem);
                            return;

                        case cmds.data:
                            // Gettind and removing the attr
                            elem.tmpAttr = func.attr(elem, [cmds.data], true);
                            // Getting the data or the default
                            var $dt = func.eval(elem.tmpAttr.value, $iData) || $iData;
                            $e.html.fill(elem, $dt);    
                            return;

                        case cmds.for:
                            if(!scope.value) return $e.log('Invalid value in e-for');
                            var body = scope.value.split(' of ');
                            var array;
                            // Checking array definition type                            
                            if(body.length === 1) array = body[0];
                            else array = body[1];

                            ui.for.run(elem, func.eval(array, $iData));
                            return;

                        default:
                            // For includers
                            if(scope.name === 'inc-src' || scope.nodeName === 'INC')
                                inc.include(inc.src(elem), elem);
                            
                            return;
                    }
                }
                // Checkind if is a property definer
                var isDef = func.attr(elem, [cmds.def], true);
                if(isDef){
                    // Evaluating the object that needs to be created
                    var defs = func.eval(isDef.value, $iData);
                    // Defining it in the easy data property
                    if(defs) $e.setData(defs);
                }
                // checking attributes
                func.loop((elem.$e || {}).$oldAttrs || toArray((elem.attributes || [])),
                function(attr){
                    if(!attr.$e) attr.$e = {};
                    switch (attr.name){
                        case cmds.content:                        
                            elem.innerHTML = func.attr(elem, [attr.name], true).value;
                            break;

                        case cmds.if:
                        case cmds.show:
                            if(!elem.$e) elem.$e = {};
                            
                            var name = attr.name, value = attr.value;
                            if(!func.isInvalid(value) && value.trim() === '') return;
                            
                            addOldAttrs(elem, attr);
                            // Storing the if value of the command and removing it
                            elem.$e[name] = elem.$e[name] || value;
                            elem.removeAttribute(name);

                            mainAction(elem, [{ exp: value }]);
                            break;

                        default:
                            if(!elem.$e) elem.$e = {};
                            // Event attr
                            if(attr.name.beginWith('listen:') || attr.name.beginWith('on:')){
                                elem.removeAttribute(attr.name);
                                elem.listen(attr.name.split(':')[1], function(){
                                    func.eval("if(typeof (" + attr.value + ") === 'function') " + 
                                    attr.value + ".apply(null, $args);", $iData || {}, false, arguments);
                                });
                            }
                            // Bind attr
                            if(attr.name.beginWith('e-bind')){
                                var val = attr.name.split(':'), 
                                field = val.length === 1 ? 'value' : val[1];                                    

                                elem.$e.b = {
                                    dprop: attr.value,
                                    eprop: field
                                };

                                // Defining the object for 'setValue' function
                                elem.$e.$oldValue = attr.value;
                                elem.$e.$fields = [ { exp: attr.value, field: attr.value } ];
                                elem.$e.$baseElement = elem;
                                elem._name = field;

                                elem.removeAttribute(attr.name);

                                binding(elem, $iData, function(){
                                    ui.setValue(elem, $iData);
                                }, { two: true });
                            } else {
                                var fields = attr.$e.$fields || ui.hasDelimiter(attr.value);
                                if(fields.length > 0){
                                    setBaseProps(attr, elem);
                                    addOldAttrs(elem, attr);
                                    mainAction(attr, fields);
                                }
                            }
                            break;
                    }
                });
                // Checking the textcontent
                if(elem.nodeValue){
                    var text = elem, fields;
                    if(!text.$e) text.$e = {};
                    if(text.$e.$fields && text.$e.$fields.length > 0) fields = text.$e.$fields;
                    else fields = ui.hasDelimiter(text.$e.$oldValue || text.nodeValue);
                    
                    if(fields.length > 0){
                        setBaseProps(text, elem);
                        mainAction(text, fields);
                    }
                }

                // Getting in the children
                if(!func.isInvalid(elem.childNodes)){
                    toArray(elem.childNodes, function(child){
                        exec(child, $iData);
                    });
                }
            })(elem, $data);
        };
        /**
         * Fills an element field, such as #value, #text, etc.
         * @param {HTMLComponet} field The field to be filled 
         * @param {Object} $dt The data object 
         * @param {HTMLDataElement} copy The original copy of the element having the firat values 
         */
        this.setValue = function(elem, $dt){
            var origin = elem.$e.$baseElement,
            name = elem._name || elem.nodeName;
            var value = elem.$e.$oldValue;

            func.loop(elem.$e.$fields, function(field){
                var val = func.exec(field.exp, $dt, true);
                value = value.replaceAll(field.field, val);
            });

            if((name in origin)){
                try {
                    // Building the type of the object to set
                    if(!func.isInvalid(origin[name])){
                        var ctorName = origin[name].constructor.name;
                        // In case of Boolean, the constructor does not parse string to boolean
                        // The verification will be manually
                        
                        if(vars.types.indexOf(ctorName) !== -1){
                            // Getting Class from the global
                            var ctor = $e.global[ctorName];
                            origin[name] = ctor.call(null, value);
                        }else{
                            switch (value.trim()){
                                case 'true': origin[name] = true; break;
                                case 'false': origin[name] = false; break;
                                // Otherwise set the default value 
                                default: origin[name] = value; break;
                            }
                        }
                    }else{
                        // Otherwise set the default value 
                        origin[name] = value;
                    }
                } catch (error){
                    // Something went wrong, set the default value
                    origin[name] = value;
                }
            }
            else elem.nodeValue = value;

            if(name.beginWith('e-') && !vars.cmds.hasValue(name)){
                origin.valueIn(name.substr(2), elem.nodeValue);
                origin.removeAttribute(name);
            }
        };
        /**
         * Hide Or Show an element from the DOM.
         *  if -> removes and add again
         *  show -> add or remove a style attribute in the element  
         * @param {Element} elem The element to toggled according easy show attribute 
         * @param {Object} data The object model to get the values
         */
        this.toggle = {
            if: function(elem, $dt){
                if(func.isInvalid($dt)) $dt = {};
                var exp = elem.$e[vars.cmds.if];
                var prop = vars.cmds.id; 
                // Evaluating the value of the element
                var res = func.eval(exp, $dt);
                
                // Hide
                if(String(res).toLowerCase() === 'false'){
                    res = false;
                    var above = elem.aboveMe();
    
                    if(func.isInvalid(above)){
                        $e.log("It seems like the element having e-if '" + func.desc(elem) + 
                        "' does not exist in the DOM anymore.", 'warn');
                        return res;
                    }

                    var id = $e.code();
                    var comment = ui.comment.create(id);
                    
                    above.replaceChild(comment, elem);
                    elem.valueIn(prop, id);
                } else
                // Show
                if(String(res).toLowerCase() === 'true'){
                    res = true;
                    var id = elem.valueIn(prop);
                    if(func.isInvalid(id)) return res;
                    
                    // Getting the comment having the id
                    var commet = ui.comment.get($e.elem, id);
                    
                    if(func.isInvalid(commet)){
                        $e.log("It seems like the element having e-if '"+ func.desc(elem) +
                                "' has been removed manually.", 'warn');
                        return res;
                    }
    
                    // Restoring the
                    elem.removeAttribute(prop);
                    commet.parentNode.replaceChild(elem, commet);
                }
                return res;
            },
            show: function(elem, $dt){
                if(func.isInvalid($dt)) $dt = {};
                var exp = elem.$e[vars.cmds.show], 
                styleValue = elem.getAttribute('style') || '',
                value = 'display:none!important;';
                
                var res = func.eval(exp, $dt);

                // Hide
                if(String(res).toLowerCase() === 'false'){
                    res = false;
                    if(!styleValue.includes(value))
                        elem.setAttribute('style',  value + styleValue)
                } else 
                // Show
                if(String(res).toLowerCase() === 'true'){
                    res = true;
                    elem.setAttribute('style', styleValue.replace(value, ''))
                }

                return res;
            }
        }
        /**
         * Get an element/attribute and compile the value based on the data passed
         * @param {Element} elem The element to toggled according easy show attribute 
         * @param {Object} $dt The object model to get the values
         */
        this.compileElem = function(el, $dt){
            var c = vars.cmds, _e = el.$e;
            // By default compile as text
            var type = c.field;
            
            if(_e && _e[c.if])
                type = c.if;
            else if(_e && _e[c.show])
                type = c.show;

            switch (type){
                case c.field: 
                    ui.setValue(el, $dt);
                    return;
                case c.if: 
                case c.show:
                    var res = ui.toggle[type.replaceAll('e-')](el, $dt);
                    // Reading the elem only if th
                    if(res === true && type === c.if)
                        if(!el.$preventMutation) 
                            el.$preventMutation = true;

                    return;
                default: return;
            }
        };
        // Function for 'e-for' scope
        this.for = {
            run: function(elem, array, before){
                var name = vars.cmds.for,
                      attr = func.attr(elem, [name]);

                if(!attr.value){
                    return $e.log({
                        message: 'Invalid value on e-for',
                        elem: elem
                    });
                }
                
                if(!array){
                    return $e.log({
                        message: 'It seems like the array defined in e-for is invalid',
                        elem: elem,
                        expression: attr.value 
                    }, 'warn');
                }

                var body = attr.value.split(' of '),
                      len = array.length;

                var comment = ui.comment.getAll($e.elem)
                .findOne(function(n){
                    return n.$arrayid && n.$arrayid === elem.$arrayid;
                });
                if(!comment){
                    var arrayId = $e.code();
                    comment = ui.comment.create(array._lid || $e.code(), {
                        $tmp: elem,
                        $arrayid: arrayId
                    });
                    elem.$arrayid = arrayId;
                    // Removing the current element
                    elem.aboveMe().replaceChild(comment, elem);
                }
                
                for (var i = 0; i < len; i++){
                    var item = array[i], 
                    copy = elem.cloneNode(true), 
                    obj = {};
                    
                    copy.removeAttribute(name);
                    var trim = function(s){ return s ? s.trim() : s; };
                    
                    // Defining an index in the element
                    copy._lid = array._lid;
                    
                    if(body.length === 1){
                        obj = item;
                    }else{
                        // Getting the declaration
                        var dec = body[0].replaceAll(['(', ')']).split(',');
                        obj[trim(dec[0])] = item
                        obj[trim(dec[1]) || '$index'] = i;
                    }

                    ui.read(copy, obj);
                    copy.$preventMutation = true;

                    comment.parentNode.insertBefore(copy, before || comment);
                }
            }
        };
        /**
         * UI initiator
         * @param {HTMLElement} element The element to be initialized
         */
        this.init = function(elem){
            var cmds = vars.cmds;
            var attr = func.attr(elem, [cmds.fill, cmds.tmp, cmds.data], true);
            attr = elem.tmpAttr = attr || elem.tmpAttr;
            if(func.isInvalid(elem.tmpAttr)) return;
            // tmp/fill actions
            var actions = {
                'e-tmp': {
                    wait: function(cb, sec){
                        var t = setTimeout(function(){
                            cb(); clearTimeout(t);
                        }, sec * 40);
                    },
                    // Main action
                    main: function(e, expression, container){
                        var counter = 1;
                        var rvs = e.valueIn(cmds.rvs) === 'true' ? true : false;
                        
                        // Getting the value of e-id and defining in properties of the element
                        var eId, attr = func.attr(e, [cmds.id], true);
                        if(attr){
                            eId = func.compile(attr.value, $this);
                            e[cmds.id] = attr;
                        }

                        $e.read(expression, function(data){
                            var insert = function(){
                                $e.html.add(container, data, { reverse: rvs });
                            }

                            // Wait a bit to insert the element to de DOM
                            if(e.hasAttribute(cmds.anm))
                                actions[cmds.tmp].wait(function(){ insert(); }, counter++);
                            else
                                insert();

                        }, eId);
                    }
                },
                'e-fill': {
                    // Main action
                    main: function(e, expression){
                        // Getting the value of e-id and defining in properties of the element
                        var eId, attr = func.attr(e, [cmds.id], true);
                        if(attr){
                            eId = func.compile(attr.value, $this);
                            e[cmds.id] = attr;
                        }
                        
                        $e.getOne(expression, eId, e);
                    }
                }
            }

            var container = null;            
            if(attr.name === cmds.data){
                var source = func.eval(attr.value);
                $e.html.fill(elem, source, true);
            } else {
                switch (attr.name){
                    // For fill template 
                    case cmds.fill:
                        // In case of fill without value
                        if(func.isInvalid(attr.value) || attr.value === '')
                            return $e.log(error.invalid('In' + attr.name));
                        break;
                        // For tmp template
                    case cmds.tmp:
                        if(elem.__ctn__){
                            container = elem.__ctn__; break;
                        }
                        container = elem.aboveMe();
                        container[cmds.tmp] = attr.value;
                        // Setting the template value in the container
                        container.$tmp = elem;
                        container.removeChild(elem);

                        if(elem.valueIn('e-auto') === 'true') return;
                        break;
                    default: break;
                }

                var expression = func.compile(attr.value, $this);
                // Checking if any connector is available
                if(!func.isInvalid($e.conn))
                    actions[attr.name].main(elem, expression, container);
                else
                    $e.log(error.conn());
            }
        }
    };
    /**
     * Makes a primitive property reactive on get and set
     * @param {Object} object The object having the property to observe
     * @param {String} property The primitive property to observe
     */
    function ReactiveProperty(config){
        var object = config.object;
        var property = config.property;
        // Execute when some value changes
        function emitChanges(el, val, $dt){
            ui.compileElem(el, $dt);
        }
        // Property definer
        function def(el, name, value){
            Object.defineProperty(el, name, {
                value: value
            });
        }
        // Getting the value of the property
        var value = object[property];
        // Getting the 
        var address = object._aid; 
        if(!address){
            // Generating an address
            address = 'c' + $e.code(15);
            // Adding the address in the object
            def(object, '_aid', address);    
            propertiesAddress[address] = {};
        }
        // Setting the values in the address
        propertiesAddress[address][property] = { property: property, value: value, binds: [] };
        // Setting the default getter and setter
        Object.defineProperty(object, property, {
            get: function(){
                var prop = propertiesAddress[address][property];
                if(propertiesAddress.getter){ propertiesAddress.getter(object, prop); }
                return prop.value;
            },
            set: function(v){
                var prop = propertiesAddress[address][property];
                prop.value = v;
                func.loop(prop.binds, function(bind){
                    emitChanges(bind.el, v, bind.obj);
                });
            }
        });
        // Setting the default value
        object[property] = propertiesAddress[address][property].value;
    };
    /**
     * Makes some array methods reactive on the calls
     * @param {Object} object The object having the property to observe
     * @param {String} property The array property of the object to observe
     * @param {Array} value The value of the property
     */
    function ReactiveArray(config){
        var object = config.object;
        var property = config.property;
        var value = config.value;
        // Execute when some value changes
        function emitChanges(config){
            var currArray = config.currArray;
            var oldArray = config.oldArray;
            var method = config.method;
            var args = config.args;
            function getListedElements (com){
                var elems = [], len = oldArray.length;
                var current = com.previousElementSibling;
                for(var i = 0; i < len; i++){
                    elems.unshift(current);
                    current = current.previousElementSibling;
                }
                return elems;
            }
            // Helper that allows to remove all elements
            function removeAll(els){
                func.loop(els, function(remove){
                    remove.aboveMe().removeChild(remove);
                });
            }

            switch (method){
                case 'push':
                case 'unshift':
                    if(!args) throw({ message: "Invalid argument in "+ method +"." });
                    // Making the elements added reactive
                    toArray(args, function(arg){
                        if(!arg._aid)new ReactiveObject(arg)
                    }); 
                    break;
                default: break;
            }

            ui.comment.getAll($e.elem, currArray._lid).
            filter(function(com){
                removeAll(getListedElements(com));
                ui.for.run(com.$tmp, currArray);
            });
        }

        var id = object[property]._lid;
        
        function defId(obj, val){
            var id = val || 'l' + $e.code(15);
            Object.defineProperty(obj, '_lid', {
                value: id
            });
            return id;
        }
        // Defining the id if it doesn't exists
        if(!id) id = defId(object[property]);    

        // Set the value in the array if its needed
        if(value) object[property] = value;
        // Store sthe value of the original array
        var original = extendArray(object[property]);
        
        defId(original, id); 
        // Push, addes to the end
        // Unshift, addes to the begining
        // Pop, removes from the end
        // Shift, removes from the begining
        // Splice, removes in some point and amount of elements
    
        // methods to observe
        this.methods = ['push', 'pop', 'shift', 'unshift', 'splice'];
        
        // Applying the methods
        func.loop(this.methods, function(method){
            object[property][method] = function(){
                var oldArray = extendArray(original);
                // Calling the method and getting the result
                var res = original[method].apply(original, arguments);
                var value = extendArray(original);
                defId(value, id); 
                // Redefing the shown array
                new ReactiveArray({
                    object: object, 
                    property: property, 
                    value: value 
                });
                // Emiting the call
                emitChanges({ 
                    currArray: original,
                    oldArray: oldArray, 
                    method: method, 
                    args: arguments
                });
                // Returning the default value
                return res;
            }
        });
        return this;
    }
    /**
     * Makes an object Reactive , it already includes 'ReactiveProperty' and 'ReactiveArray'  
     * @param {Object} object The object to observe
     */
    function ReactiveObject(obj){
        if(!obj) obj = {}; 
        // Looping all the properties of the object
        for (var key in obj){
            var prop = obj[key];

            // Applying to the property
            new ReactiveProperty({
                object: obj,
                property: key
            });

            if(typeof prop === 'object'){
                if(Array.isArray(prop)){
                    new ReactiveArray({
                        object: obj,
                        property: key
                    });
                    func.loop(prop, function(item){
                        new ReactiveObject(item)
                    });
                }
                else{
                    new ReactiveObject(prop);
                }
            }
        }
        return obj;
    }
    /**
     * Binds a value to an element and/or element to a value and vice-versa
     * @param {Object} options Bind configuration properties
     *  Having:
     *  @param {Element} el The element to be binded
     *  @param {Object} layer The object that will be in bind object
     *  @param {Object} lastLayer The object having the property that will be binded
     *  @param {String} property The property that will be binded
     *  @param {Boolean} two Allow two way data binding, by default is false
     */
    function Bind(options){
        this.el = options.el;
        this.layer = options.layer;
        this.lastLayer = options.lastLayer;
        this.property = options.property;
        this.two = options.two || false;

        var prop = propertiesAddress[this.lastLayer._aid][this.property];
        if(!func.isInvalid(prop)){
            // Avoiding twice binds
            if(!prop.binds.findOne(function(bind){ return bind.el === options.el; }))
                // Addind the bind object
                // It needs to be 'layer' to be added because
                // 'lastLayer' has the last layer that the value was gotten
                // In case of * layer1.layer2.prop * -> obj == layer2
                // But, actually we need layer1, and bindObj == layer1
                prop.binds.push({
                    obj: this.layer,
                    el: this.el
                });
        }

        if(this.two === true){
            // Configuring
            Object.defineProperty(this.el.$e.b, 'val', 
                Object.getOwnPropertyDescriptor(this.lastLayer, this.property))

            this.el.listen(this.el.nodeName.toLowerCase(), callback);
            this.el.listen('propertychange', callback);
            this.el.listen('change', callback);

            function callback(evt){
                if(!evt.base && !evt.base.$e && !evt.base.$e.b)
                    return $e.log('Invalid value in e-bind property, please make sure ' +
                                  'that it has not undefine or null value');

                var bindConfig = evt.base.$e.b;
                var value = evt.base[bindConfig.eprop];
                if(value !== bindConfig.val){
                    // Setting the bind config value
                    bindConfig.val = value;
                }
            }
        }
    }
    /**
     * Bind properties that was read
     * @param {Node} el The element to be binded
     * @param {Function} callback The callback
     * @param {Object} options Options for Bind Class
     */
    function binding(el, baseObj, callback , options){
        try {
            // Defining the getter to object in the dt
            propertiesAddress.getter = function(obj, prop){
                if(!options) options = {};
                var input = {
                    el: el,
                    layer: baseObj, 
                    lastLayer: obj, 
                    property: prop.property
                };
    
                options.keys(function(k, v){
                    input[k] = v;
                });
    
                new Bind(input);
            };
            
            callback();
        } catch (error){ throw(error) }
        finally{
            // Destroying the stored function
            delete propertiesAddress.getter;
        }
    }

    // Easy.on
    this.on = function (evt, cb){
        switch (evt){
            // Fire every time an includer element is added in the DOM
            case 'inicAdded': inc.events.push(cb); break;
            default: break;
        }
    }
    // Global Object functions
    $e.global.$e = function(selector){
        if(!selector) return $e.log('Invalid selector');
        var result = [];
        if(selector[0] === '#') 
            result = func.loop([ doc.node(selector) ], 
            function(x){ return x && x.isConnected; });
        else result = func.loop(doc.nodes(selector), 
            function(x){ return x && x.isConnected; });

        Object.defineProperty(result, 'on', {
            value: function(event, cb){
                doc.addEventListener(event, function(e){
                    doc.nodes(selector).findOne(function(el){
                        if(el === e.target || e.target.aboveMe(selector)){
                            arguments[0]['base'] = el;
                            cb.apply(cb, arguments);
                            return true;
                        }
                        return false;
                    });
                });
            }
        });
        return result;
    }

    // Classes for Browser compatibility
    if(typeof Promise === 'undefined'){
        $e.global.Promise = function(promise) {
            var self = this;
            self.status = 'pending';
            var thens = {}, catches = {};

            function exec(resolve, reject) {
                if(resolve) thens[$e.code(5)] = (resolve);
                if(reject) catches[$e.code(5)] = (reject);

                function run(obj, value) {
                    extendObj(obj).
                    keys(function(k, v){ v(value); delete (obj[k]); });
                }

                promise(function(value){
                    self.status = 'resolved';
                    self.value = value;
                    run(thens, value);
                }, function(value){
                    self.status = 'rejected';
                    run(catches, value);
                });
                return self;
            }

            self.then = function(resolve, reject) {
                return exec(resolve, reject);
            }
            self.catch = function(reject, resolve) {
                return exec(resolve, reject);
            }
            self.finally = function(cb) {
                promise(function(){ if(cb) cb(); }, 
                        function(){ if(cb) cb(); });
                return self;
            }
            return self;
        }
        Promise.resolve = function(value){
            return new Promise(function(resolve) {
                return resolve(value);
            });
        }
        Promise.reject = function(value){
            return new Promise(function(resolve, reject) {
                return reject(value);
            });
        }
    }
    
    // Initializing Easy
    try {
        // Setting the begin data
        $e.setData(options.data || {});
        // Listening the DOM
        doc.listen('DOMContentLoaded', function(){
            // Defining the root elem
            $e.elem = document.node(elem || '');
            // Checking if the app element is set
            if(!$e.elem){
                $e.log('Root element not found, please check it.', 'warn');
                return $e;
            }
            // Initializing easy animation css
            if($e.elem.node('[e-anm]')) $e.css();

            ui.read($e.elem, $this);

            var c = vars.cmds;
            ui.observer.mutation(function(elem){
                ui.read(elem, $this);
            }).observe($e.elem, {
                attributes: true,
                attributeOldValue: true,
                attributeFilter: [c.tmp, c.fill, c.if, 'inc-src', c.id],
                childList: true,
                subtree: true,
                characterData: false
            });
        });

    } catch (error){
        $e.log({
            msg: 'Error while initializing. Description: ' + error.message,
            error: error
        });
    }

    // Exports
    $e.setDefault = setDefault;
    return $e;
}
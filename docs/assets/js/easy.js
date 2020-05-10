/**
 * Easy.js @version v2.0.0
 * Released under the MIT License.
 * (c) 2019 @author Afonso Matumona
 */
(function(global, factory){
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.Easy = factory());
}(window, (function(){ 'use strict';
    // Shared variables
    var standardEvents = {}, eventModifiers = {};
    var getter; // Store getter function
    var $global = window, doc = $global.document;
    delete $global.name; // Removing window.name property

    // Helper variables to resolve url issues, based on Angular.js version 1.7.9
    var urlParsingNode = doc.createElement('a');
    urlParsingNode.href = 'http://[::1]';
    var ipv6InBrackets = urlParsingNode.hostname === '[::1]';
    
    // Get all default events registed in the DOM Elements
    for ( var key in doc.createElement('input') ) {
        if( key[0] === 'o' && key[1] === 'n' )
            standardEvents[key.substr(2)] = true;
    }

    // Get all modifier functions
    var $$evt = new Event('e');
    for (const key in $$evt) {
        if ( typeof $$evt[key] === 'function' )
        eventModifiers[key.toLowerCase()] = key
    }

    var vars = {
        cmds: {
            id: 'e-id',
            order: 'e-order',
            anm: 'e-anm',
            field: 'text',
            req: 'e-req',
            tmp: 'e-tmp',
            fill: 'e-fill',
            build: 'e-build',
            array: 'e-array',
            filter: 'e-filter',
            if: 'e-if',
            show: 'e-show',
            for: 'e-for',
            data: 'data',
            def: 'e-def',
            use: 'e-use',
            toggle: 'e-toggle',
            content: 'e-content',
            skeleton: 'e-skeleton',
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
            reverse: function (v) {
                switch (v) {
                    case 'up': return 'down';
                    case 'down': return 'up';
                    case 'left': return 'right';
                    case 'right': return 'left';
                    default: return 'none';
                }
            }
        }, // easy animations keys
        // String Instantiable classes, for UI prints
        types: [ 'String', 'Number', 'BigInt', 'Symbol' ],
        // Easy Own Events 
        events:{ 
            add: 'add',
            empty: 'empty',
            response: 'response', 
            fail: 'fail',
            data: 'data' 
        }
    }
    // Error messages
    var error = {
        dlm: 'The command cannot contain a delimiter in ' +
             'expression value... The variables are compiled without a delimiter.',
        conn: function () {
            return "It seems that there is not any easy connector available. " +
                "Please make sure easy.[ajax|free|something].js is imported.";
        },
        invalid: function (v) { return "Invalid value" + (v ? ' ' + v : '') + "." },
        elem: function (v) { return "The selector or object passed for '" + v + "' is invalid, please check it." }
    }
    // Comparison functions
    var cmp = {
        'match': function (s1, s2) { return s1.match(s2) },
        'equal': function (s1, s2) { return s1 === s2 }
    }
    // Join objects. Can be used as object/array copier 
    var extend = {
        // join objects into one,
        obj: function () {
            var out = {};
            arguments.keys(function (idx, value) {
                if (isNull(value)) {
                    return;
                }
                value.keys(function (prop) {
                    $propTransfer(out, value, prop);
                });
            });
            return out;
        },
        // join arrays into one
        array: function () {
            var out = [];
            arguments.keys(function (_, v) {
                if (isNull(v)) return;
                if (isArray(v)) {
                    var len = v.length, i = 0;
                    for(i; i < len; i++) out.push(v[i]);
                } else{
                    out.push(v);
                }
            });
            return out;
        }
    }

    function unget() { getter = undefined; }
    function $objDesigner(obj, options) {
        // Set default properties in a object if it doesn't exists
        if (!obj) obj = {};
        if (!options) options = {};
        options.keys(function (k, v) {
            if (isNull(obj[k])) obj[k] = v;
        });
        return obj;
    }
    function $propTransfer(dst, src, name) {
        $propDefiner(dst, name, $propDescriptor(src, name));
    }
    function $propDefiner(obj, prop, desc) {
        Object.defineProperty(obj, prop, desc); return obj;
    }
    function $propDescriptor(obj, prop) {
        return Object.getOwnPropertyDescriptor(obj, prop); 
    }
    function isIgnore(v) {
        switch (v) {
            case "#comment": case "SCRIPT": case "#text": case "STYLE":
                return true;
            default: return false;
        }
    }
    function isObj(v) {
        return v instanceof Object; 
    }
    function isArray(v) {
        return Array.isArray(v); 
    }
    function isNull(v) {
        return (typeof v === 'undefined') || (v === undefined || v === null);
    }
    function isString(v) {
        return (typeof v !== 'undefined') && (typeof v === 'string');
    }
    function isEmptyObj(obj) {
        if(!obj) return true;
        return obj.keys().length === 0;
    }
    function toArray(obj, cb, ctx) {
        if (!obj) return [];
        var array = [].slice.call(obj);
        if (cb) forEach(array, cb, ctx);
        return array;
    }
    function toPath() {
        // Builds arguments to reference string path. Eg.: 'p.n.a' -> ['p']['n']['a']
        var path = '';
        for(var key in arguments) {
            var el = arguments[key];
            if (!isNull(el) && el !== '') {
                if (isArray(el))
                    path += el.map(function (m) {
                        return "['" + m + "']";
                    }).join('');
                else if (isString(el)) {
                    path += forEach( el.split('.'), function (f) {
                        return f;
                    }).map(function (m) {
                        return !m.includes('[') ? "['" + m + "']" : m
                    }).join('');
                }
            }
        }
        return path;
    }
    function toStr(v) { 
        return v ? v + '' : ''; 
    }
    function forEach(obj, cb, ctx) {
        // Array iterator
        if (!obj || !obj.length) return [];

        var len = obj.length, index, result = [];
        for(index = 0; index < len; index++) {
            if (cb.call(ctx, obj[index], index)) {
                result.push(obj[index]);
            } 
        }
        return result;
    }
    function nameof(v) { 
        return v.keys()[0]; 
    }
    function trim(v) {
        return v ? v.trim() : v; 
    }
    function setEasy(el) {
        // Sets $easy property in a element where will be stored configurations used by easy
        if ( !el.$e ) el.$e = {};
    }
    function extractor(obj, name) {
        // Extracts and generate a new object having only value of the extraction type  
        var out = {};     
        if (obj) obj.keys(function(k, v) {
            if (typeof v === name) out[k] = v;
        });
        return out;
    }
    function urlResolve(url) {
        if (!isString(url)) return url;

        var href = url;
        // Support: IE 9-11 only, /* doc.documentMode is only available on IE */
        if (doc.documentMode) {
            urlParsingNode.setAttribute('href', href);
            href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);
        var hostname = urlParsingNode.hostname;

        if (!ipv6InBrackets && hostname.indexOf(':') > -1)
            hostname = '[' + hostname + ']';

        return {
            href: urlParsingNode.href,
            protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
            host: urlParsingNode.host,
            search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
            hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
            hostname: hostname,
            port: urlParsingNode.port,
            pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname : '/' + urlParsingNode.pathname
        };
    }
    
    // Classes for Browsers compatibility
    if (typeof Promise === 'undefined') {
        /** Represents the completion of an asynchronous operation. by easy.js */
        $global.Promise = function (promise) {
            var self = this;
            this.status = 'pending';
            this.WARN = 'Do not \'await\' this promise, it does not support await keyword.';
            var thens = [], catches = [], finallies = [];

            this.then = function (resolve, reject) {
                thens.push(resolve);
                if( !isNull(reject) )
                    catches.push(reject);
                return self;
            }
            this.catch = function (reject, resolve) {
                catches.push(reject);
                if( !isNull(resolve) )
                    thens.push(resolve);
                return self;
            }
            this.finally = function (cb) {
                finallies.push(cb);
                return self;
            }

            function waitAndRun(array, value) {
                function run(funcs, value) {
                    forEach(funcs, function(callback) {
                        callback.call(self, value);    
                    });
                }
                var t = setTimeout(function() {
                    run(array, value);
                    run(finallies);
                    clearTimeout(t);
                }, 0);
                return value;
            }

            promise(function (value) {
                self.status = 'resolved';
                self.value = value;
                return waitAndRun(thens, value);
            }, function (value) {
                self.status = 'rejected';
                return waitAndRun(catches, value);
            });

            return self;
        }

        Promise.resolve = function (value) {
            return new Promise(function (resolve) {
                return resolve(value);
            });
        }
        Promise.reject = function (value) {
            return new Promise(function (_, reject) {
                return reject(value);
            });
        }
    }
    /**
     * A mimic of fetch api for browser compatibilities
     * Note: it was based on angular.js version 1.7.9
     */
    function Fetch(url, options) {
        options = options ? options : {};

        function createXhr(method) {
            if (doc.documentMode && (!method.match(/^(get|post|head|put|delete|options)$/i) || !window.XMLHttpRequest)) {
                return new window.ActiveXObject("Microsoft.XMLHTTP");
            } else if (window.XMLHttpRequest) {
                return new window.XMLHttpRequest();
            }
            throw ({ message: "This browser does not support XMLHttpRequest." });
        }

        var self = this, abortedByTimeout = false;
        options.keys((function (option) {
            if (option === 'body') return;
            this[option] = options[option];
        }).bind(this));

        this.xhrObject = xhr;
        // The default method is get
        options.method = this.method = this.method ? this.method : 'get';
        var xhr = createXhr(this.method), timeoutId;

        // Unchangeable URL, even if it was passed in options
        this.url = url;
        // If timeout is not defined use the default 1 minute
        this.timeout = this.timeout || 6 * 10000;

        return new Promise(function (resolve, reject) {
            xhr.open(self.method, self.url, true);

            self.headers = self.headers ? self.headers : {};
            self.headers.keys(function (key) {
                var value = self.headers[key];
                if (value) {
                    xhr.setRequestHeader(key, value);
                }
            });

            xhr.onload = function requestLoaded() {
                var statusText = xhr.statusText || '';
                var response = ('response' in xhr) ? xhr.response : xhr.responseText;
                var status = xhr.status === 1223 ? 204 : xhr.status;

                if (status === 0) {
                    status = response ? 200 : urlResolve(url).protocol === 'file' ? 404 : 0;
                }

                self.ok = (status >= 200 && status < 400);
                self.status = status;

                completeRequest(status, response, xhr.getAllResponseHeaders(), statusText, 'complete');
            }

            var requestError = function () {
                completeRequest(-1, null, null, '', 'error');
            }

            var requestAborted = function () {
                completeRequest(-1, null, null, '', abortedByTimeout ? 'timeout' : 'abort');
            }

            var requestTimeout = function () {
                completeRequest(-1, null, null, '', 'timeout');
            }

            xhr.onerror = requestError;
            xhr.ontimeout = requestTimeout;
            xhr.onabort = requestAborted;

            self.eventHandlers = self.eventHandlers ? self.eventHandlers : {};
            self.eventHandlers.keys(function (key) {
                var value = self.eventHandlers[key];
                if (value) {
                    xhr.addEventListener(key, value);
                }
            });
            
            self.uploadEventHandlers = self.uploadEventHandlers ? self.uploadEventHandlers : {};
            self.uploadEventHandlers.keys(function (key) {
                var value = self.uploadEventHandlers[key];
                if (value) {
                    xhr.addEventListener(key, value);
                }
            });

            // if (self.timeout) {
            //     timeoutId = setTimeout(function () {
            //         timeoutRequest('timeout');
            //     }, self.timeout);
            // }
            // function timeoutRequest(reason) {
            //     abortedByTimeout = reason === 'timeout';
            //     if (xhr) {
            //         xhr.abort();
            //     }
            // }

            function completeRequest(status, response, headersString, statusText, xhrStatus) {
                xhr = null;
                self.response = response;
                self.responseHeaders = headersString;
                self.statusText = statusText;
                self.statusMessage = xhrStatus;

                if (status === -1) {
                    reject(self);
                } else {
                    resolve(self);
                }
            }

            if (self.withCredentials) {
                xhr.withCredentials = true;
            }

            self.type = self.type || '';

            try {
                xhr.responseType = self.type;
            } catch (e) {
                if (self.type !== 'json') {
                    throw e;
                }
            }
            
            xhr.send(options.body || null);
        });
    }

    function Easy($elSelector, options) {
        if ( !(this instanceof Easy) ){
            Easy.log('Easy is a constructor and should be called with the \'new\' keyword.');
            return this;
        }
        
        this.name = 'Easy';
        this.version = '2.0.0';
        this.data = {};
        var $easy = this, exposed = { /* Store the exposed datas */ },
            webDataRequests = { /* Store web requests data */ }, 
            customEvents = { /* Store 'app.on' events */ }, 
            waitedData = { /* Waited data tracker */ }, 
            componentConfig = {}, skeletonConfig = { background: '#E2E2E2' , wave: '#ffffff5d' },
            fn = new Func();

        var prototype = Object.create(Easy.prototype);
        this.__proto__ = prototype;
        var $$delimiters = [
            { name: 'easy', delimiter: { open: '-e-', close: '-' } }, 
            { name: 'common', delimiter: { open: '{{', close: '}}' } } 
        ];// Default delimiters

        // Setting the default values in options
        options = $objDesigner(options, { config: {}, data: {}, components: {}, mounted: fn.empty, loaded: fn.empty });
        options.data = $objDesigner(options.data, {});
        options.components = $objDesigner(options.components, { elements: {}, config: {} });
        options.components.config = $objDesigner(options.components.config, { usehash: true, base: '/', storeData: false });
        options.config = $objDesigner(options.config, { deepIgnore: false, log: true, useDOMLoadEvent: true, skeleton: { background: '#E2E2E2' , wave: '#ffffff5d' } });
        this.options = options;
        
        skeletonConfig = options.config.skeleton;
        componentConfig = options.components.config;
        this.delimiters = Object.freeze($$delimiters);

        /** Easy Logger */
        Easy.log = function (v, type) {
            if (!type) type = 'error';
            if ( $easy.options.config.log ) console[type]('[Easy '+ type +']:', v);
            if ( !isNull($easy.emit) ) $easy.emit('log', { type: type, msg: v });
            return v;
        }

        var ui = new UIHandler({
            $$delimiters: $$delimiters.slice(),
            $handleWatches: []
        });
        var inc = new Includer(options.components.elements, componentConfig);

        /**
         * Creates an obj (if form is a selector) and send it to the available connector
         * @param {String} path The URL endpoint
         * @param {HTMLElement} form The html element or selector
         */
        prototype.create = function (path, form) {
            try {
                if (isNull($easy.conn)) throw ({ message: error.conn() });
                
                var obj = $easy.toJsObj(form);
                if (!obj) throw ({ message: error.elem('create') });
                return $easy.conn.add(path, obj);
            } catch(error) {
                return Promise.reject($easy.return(false, Easy.log(error), null));
            }
        }
        /**
         * Get all from a path
         * @param {String} path The URL endpoint
         * @param {Function} cb (optional) The callback that will be passed the return
         * @param {String} filter (optional) Some extra string that will be added to the path
         */
        prototype.read = function (path, extra) {
            try {
                if (isNull($easy.conn)) throw ({ message: error.conn() });
                return $easy.conn.list(path, extra);
            } catch(error) {
                return Promise.reject($easy.return(false, Easy.log(error), null));
            }
        }
        /**
         * Creates an obj (if form is a selector) and send to the available connector to updated it
         * @param {String} path The URL endpoint
         * @param {HTMLElement} form The html element or selector
         * @param {string} id The Id of the object that will be updated
         */
        prototype.update = function (path, form, id) {
            try {
                if (isNull($easy.conn)) throw ({ message: error.conn() });
                
                var obj = $easy.toJsObj(form);
                // Checking if the object is valid
                if (!obj) throw ({ message: error.elem('updated') });
                return $easy.conn.update(path, obj, id);
            } catch(error) {
                return Promise.reject($easy.return(false, Easy.log(error), null));
            }
        }
        /**
         * Deletes an obj from a source
         * @param {String} path The URL endpoint
         * @param {String} id The Id of the object that will be deleted
         */
        prototype.delete = function (path, id) {
            try {
                if (isNull($easy.conn)) throw ({ message: error.conn() });
                // Checking the id parameter is null
                if (!id) throw ({ message: error.invalid('id') });
                return $easy.conn.remove(path, id); 
            } catch(error) {
                return Promise.reject($easy.return(false, Easy.log(error), null));
            }
        }
        /**
         * getOne obj from a source
         * @param {string} path The URL endpoint
         * @param {string} id The Id of the object
         * @param {Function} elem (optional) The element that will be filled
         */
        prototype.getOne = function (path, id) {
            try {
                if (isNull($easy.conn)) throw ({ message: error.conn() });
                return $easy.conn.getOne(path, id);
            } catch(error) {
                return Promise.reject($easy.return(false, Easy.log(error), null));
            }
        }
        /**
         * Generates a Javascript Object from an HTML Element
         * Eg.: easy.toJsObj(element, { names: '[prop-name],[name]', values: '[prop-value],[value]' })
         * @param {HTMLElement} input The html element or selector
         * @param {String} options Builder options.
         * **options.names** Defines which attribute will be search for. By default is [name], the order matters!
         * **options.values** Defines which attribute will be taken the value. By default is [value], the order matters!
         * @param {Function} onset Function that will be fired when a property was configured.
         * @returns {Object} Javascript object
         */
        prototype.toJsObj = function (input, options, onset) {
            var elem;
            options = $objDesigner(options, {
                names: '[name]',
                values: '[value]'
            });

            if (!onset) onset = fn.empty;
            if (!input) return null;

            if (input instanceof Element)
                elem = input;
            else if (isObj(input))
                return input;
            else if (isString(input)) {
                try {
                    elem = doc.node(input);
                } catch(error) {
                    return input;
                }
            }

            if (!elem) {
                Easy.log('Element passed in app.toJsObj(...) was not found.');
                return null;
            }

            // Clear [ ] and , and return an array of the names
            function clear(val) {
                return val.split(',').map(function (el) {
                    return trim(el.replaceAll(['[', ']']));
                });
            }

            // Store the build command name
            var cmd = vars.cmds.build;
            var mNames = clear(options.names);
            var mValues = clear(options.values);

            function buildObj(element) {
                var obj = {};
                var t = true;
                // Elements that skipped on serialization process
                var escapes = { BUTTON:t };
                var checkables = { checkbox: t, radio: t };
                // Try to get value from the element
                function tryGetValue(e) {
                    var val = null;
                    mValues.findOne(function (v) {
                        return (val = e.valueIn(v)) ? true : false;
                    });
                    return val;
                }

                (function walker(el) {
                    var attr = fn.attr(el, mNames);
                    if (attr) {
                        var name = attr.value;

                        if ( escapes[el.tagName] === true ) return;
                        if ( checkables[el.type] === true && el.checked === false ) return;

                        var propOldValue = obj[name];
                        var isarray = el.hasAttribute(vars.cmds.array);
                        var value = tryGetValue(el);

                        if (!isarray) {
                            if (propOldValue)
                                obj[name] = extend.array(propOldValue, value);
                            else
                                obj[name] = value;
                        } else{
                            if (propOldValue)
                                obj[name] = extend.array(propOldValue, value);
                            else
                                obj[name] = extend.array(value);
                        }
                        // Calling on set function
                        onset(obj, name, value, el);
                    }
                    toArray(el.children, function (child) {
                        if (!fn.attr(child, [cmd])) walker(child);
                    });
                })(element);
                return obj;
            }

            // Building the base form
            var obj = buildObj(elem);
            // Getting the builds 
            var builds = elem.nodes('[' + cmd + ']');
            // Building builders
            forEach(builds, function (b) {
                // Getting the e-build attr value
                var name = b.valueIn(cmd);
                // Checking if has an attr defined
                var isarray = b.hasAttribute(vars.cmds.array);
                // Building the object
                var value = buildObj(b);
                if (isEmptyObj(value)) return;
                // Build a path to set the value in the main object
                function pathBuilder(fullPath, cb) {
                    var path = '', sections = fullPath.split('.');
                    forEach(sections, function (sec) {
                        path += '.' + sec;
                        var propValue = eval(nameof({ obj: '' }) + path);
                        // Checking the path has a null value
                        if (isNull(propValue)) {
                            eval(nameof({ obj: '' }) + path + '={}');
                            // Checking if it's last section of the path
                            if (sections[sections.length - 1] === sec)
                                cb(path);
                        }
                        // Otherwise, check if the value is an array
                        else if (isArray(propValue)) {
                            var remainPath = toPath(fullPath.substr(path.length));
                            if (remainPath === '')
                                cb(path, propValue);
                            else
                                forEach(propValue, function (e, i) {
                                    // Building new path according the index of the array
                                    pathBuilder(path.substr(1) + '[' + i + ']' + remainPath, cb);
                                });
                            // Breaking the main loop, because every work is done
                            return;
                        } else{
                            // Checking if it's last section of the path
                            if (sections[sections.length - 1] === sec)
                                cb(path, propValue);
                        }
                    });
                }

                pathBuilder(name, function (path, propOldValue) {
                    if (isarray) {
                        // Checking if it already has properties defined
                        if (!isNull(propOldValue)) {
                            // Checking if the old value is also an array
                            if (isArray(propOldValue)) {
                                eval(nameof({ obj: '' }) + path + "=extend.array(propOldValue, value)");
                            } else{
                                eval(nameof({ obj: '' }) + path + "=[ extend.obj(value, propOldValue) ]");
                            }
                        } else
                            eval(nameof({ obj: '' }) + path + "=[ value ]");
                    } else{
                        // Checking if it already has properties
                        if (propOldValue && !isEmptyObj(propOldValue))
                            eval(nameof({ obj: '' }) + path + "=extend.obj(propOldValue, value)");
                        else
                            eval(nameof({ obj: '' }) + path + "=value");
                    }
                });
            });

            return obj;
        } 
        // Helper to add easy css in the DOM
        prototype.css = function (replace) {
            var current = doc.node('[e-style="true"]'); 
            if ( current && replace !== true ) return;

            var style = doc.createElement("style");
            style.valueIn('e-style', 'true');

            var vals = {
                dist: 12,
                opacity: 6,
                dur: 0.2
            }
            // Creates to- animation body
            var toAnim = function (n, dir) {
                return "transform: translate" + dir + "; -webkit-transform: translate" + dir + "; animation:" +
                    n + " " + vals.dur + "s ease-out forwards; -webkit-animation:" + n + " " + vals.dur + "s ease-out forwards;";
            }
            // Creates from- animation body
            var fromAnim = function (n) {
                return "animation:" + n + " " + vals.dur + "s ease-out forwards; -webkit-animation: " + n + " " + vals.dur + "s ease-out forwards;";
            }
            // Creates keyframes animation body
            var keyframes = function (n, dir) {
                return "keyframes " + n + " { to { opacity: 1; transform: translate" + dir + "; } }"
            }

            style.textContent = ".hide-it { display: none !important; }" +
                "inc:not([no-replace]),[inc-src]:not([no-replace]) { display:none!important; }" + 
                ".to-top, .to-bottom, .to-right, .to-left { opacity: 0; }" +
                ".from-top, .from-bottom, .from-right, .from-left" +
                "{ opacity: ."+ vals.opacity +"; transform: translateY(0%); -webkit-transform: translateY(0%); }" +
                ".to-top {" + toAnim('to-top', 'Y(' + vals.dist + '%)') + " }" +
                ".to-bottom { " + toAnim('to-bottom', 'Y(-' + vals.dist + '%)') + " }" +
                ".to-right { " + toAnim('to-right', 'X(-' + vals.dist + '%)') + " }" +
                ".to-left { " + toAnim('to-right', 'X(' + vals.dist + '%)') + " }" +
                ".from-top { " + fromAnim('from-top') + " }" +
                ".from-bottom { " + fromAnim('from-bottom') + " }" +
                ".from-right { " + fromAnim('from-right') + " }" +
                ".from-left { " + fromAnim('from-left') + " }" +
                "@" + keyframes('to-top', 'Y(0%)') +
                "@" + keyframes('to-bottom', 'Y(0%)') +
                "@" + keyframes('to-right', 'Y(0%)') +
                "@" + keyframes('to-left', 'Y(0%)') +
                "@-webkit-" + keyframes('to-top', 'Y(0%)') +
                "@-webkit-" + keyframes('to-bottom', 'Y(0%)') +
                "@-webkit-" + keyframes('to-right', 'Y(0%)') +
                "@-webkit-" + keyframes('to-left', 'Y(0%)') +
                "@" + keyframes('from-top', 'Y(' + vals.dist + '%)') +
                "@" + keyframes('from-bottom', 'Y(-' + vals.dist + '%)') +
                "@" + keyframes('from-right', 'X(-' + vals.dist + '%)') +
                "@" + keyframes('from-left', 'X(' + vals.dist + '%)') +
                "@-webkit-" + keyframes('from-top', 'Y(' + vals.dist + '%)') +
                "@-webkit-" + keyframes('from-bottom', 'Y(-' + vals.dist + '%)') +
                "@-webkit-" + keyframes('from-right', 'X(-' + vals.dist + '%)') +
                "@-webkit-" + keyframes('from-left', 'X(' + vals.dist + '%)') + 
                "[e-skeleton]{ background-color: "+ skeletonConfig.background +"!important;" +
                " position: relative!important; overflow: hidden; }" +
                "[e-skeleton], [e-skeleton] * {  color: transparent!important; }" +
                "[e-skeleton]::before, [e-skeleton]::after" +
                "{ content: '';  position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: block; }" +
                "[e-skeleton]::before { background-color: "+ skeletonConfig.background +"!important; z-index: 1; }" +
                "[e-skeleton]::after {  transform: translateX(-100%);" +
                " background: linear-gradient(90deg, transparent, "+ skeletonConfig.wave +", transparent);" +
                " animation: loading 1.5s infinite; z-index: 2; }" +
                "@keyframes loading {  100% { transform: translateX(100%); } }" +
                "@-webkit-keyframes loading { 100% { transform: translateX(100%); } } ";

            if (replace === true) 
                doc.head.replaceChild(style, current);    
            else
                doc.head.appendChild(style);
        }
        /** Generate some random code according to the length passed, is 25 by default */
        prototype.code = function (len) {
            if (isNull(len)) len = 25;
            var alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_01234567890';
            var lower = false, result = '', i = 0;
            for(i; i < len; i++) {
                var p = Math.floor(Math.random() * alpha.length);
                result += lower ? alpha[p].toLowerCase() : alpha[p];
                lower = !lower;
            }
            return result;
        }
        /** Easy return type */
        prototype.return = function (status, message, result) {
            return {
                status: status,
                msg: message,
                result: result
            };
        }
        /** Sets values in the data */
        prototype.setData = function (input, target) {
            if (isNull(input)) return;
            if (isNull(target)) target = $easy.data;
            var data = new ReactiveObject(input);
            data.keys(function (k) {
                $propTransfer(target, data, k);
            });       
            return target;
        }
        /** Exposes data to be retrived anywhere */
        prototype.expose = function(name, data, force) {
            if (isArray(data) || !isObj(data)) 
                return Easy.log('Invalid data, only Object (non Array one) can be exposed, ' +
                            'try to wrap it into an object literal!. Eg.: { myData: data }.');
            var elements = waitedData[name];
            if( !isNull(elements) ) {
                delete waitedData[name];
                return forEach(elements, function (el) {
                    var $data = new ReactiveObject(data);
                    $data.$scope = Compiler.getUpData(el);
                    Compiler.compile({
                    el: el,
                    data: $data 
                });
                });
            }
            
            if (exposed[name] && (isNull(force) || force === false)) {
                return;
            }
            exposed[name] = function() {
                var $data = data;
                return function() {
                    return $data;
                }
            }
        }
        /** Retrieve the exposed data */
        prototype.retrieve = function(name, remove) {
            var fun = exposed[name], $data;
            if (fun) {
                $data = fun.call(null).call(null);
                if (!isNull(remove) && remove === true) {
                    delete exposed[name];
                }
            }
            return $data;
        }
        /** Get web request value made in e-req, e-tmp, e-fill */
        prototype.request = function (id, callback) {
            if (!callback) return Easy.log('Define a callback in second parameter to get the request.');
            var req = webDataRequests[id];
            if(req) {
                callback(req);
                return;
            }

            webDataRequests.keys(function(_, v) {
                if(v.$id === id || v.$url === id){
                    return callback(v);
                } 
            });
        }
        prototype.on = function (evt, cb) {
            switch (evt) {
                case 'incMounted': inc.mounted.push(cb); break;
                case 'incLoaded': inc.loaded.push(cb); break;
                case 'incDestroyed': inc.destroyed.push(cb); break;
                case 'incBlocked': inc.blocked.push(cb); break;
                case 'incFail': inc.fail.push(cb); break;
                default:
                    var obj = customEvents[evt]; 
                    if (obj){
                        obj.push(cb);
                    } else {
                        customEvents[evt] = [ cb ];
                    }
                    break;
            }
            return { event: evt, callback: cb };
        }
        prototype.off = function (evt, cb) {
            switch (evt) {
                case 'incAdded': inc.mounted.remove(cb); break;
                case 'incLoaded': inc.loaded.remove(cb); break;
                case 'incRemoved': inc.destroyed.remove(cb); break;
                case 'incBlocked': inc.blocked.push(cb); break;
                case 'incFail': inc.fail.remove(cb); break;
                default:
                    var obj = customEvents[evt]; 
                    if (obj) obj.remove(cb);
                    break;
            }
            return { event: evt, callback: cb };
        }
        prototype.emit = function (evt, data, once) {
            if(isNull(once)) once = false;
            forEach(extend.array(customEvents[evt]), function (event) {
                event.call(this, data, event.$target);
                if (once === true)
                    this.off(evt, event);
            }, $easy);
        }
        prototype.set = function (key, value) {
            switch (key) {
                case 'skeleton': {
                    if (isArray(value)) return Easy.log('Invalid object');

                    if (isObj(value) || isNull(value))
                        value = $objDesigner(value, {
                            background: $easy.options.config.skeleton.background,
                            wave: $easy.options.config.skeleton.wave
                        });
                    
                    if (value.keys === 'undefined') return Easy.log('Invalid object');

                    value.keys(function (k, v) { skeletonConfig[k] = v; });
                    return $easy.css(true);                
                } case 'delimiter': {

                    if( isNull(value) || 
                        !trim(value.name) || 
                        ( isNull(value.delimiter) || 
                            !trim(value.delimiter.open) || 
                            !trim(value.delimiter.close) ) ) {
                        return Easy.log('Invalid object, check if the object has this structure and has valid values: ' + 
                                        '\n{ name: \'...\', delimiter: { open: \'...\', close: \'...\' } }');
                    }

                    ui.$$delimiters.push(value);
                    return $easy.delimiters = Object.freeze(ui.$$delimiters);
                } default: break;
            }
        }
        prototype.components = {
            add: inc.setComponent.bind(inc),
            get: function (name) {
                var path = checkIncPath(name);
                if( isNull(path) ) return;
                var res = extend.obj( path );
                delete res.restrictions;
                return res;
            },
            restrictions: {
                add: function (name, rests) {
                    if( !isArray(rests) ) {
                        Easy.log(error.invalid() + ' Try an array!'); 
                        return; 
                    } 
                    var path = checkIncPath(name);
                    if( isNull(path) ) return;
                    inc.skipNoFunction(rests, name);
                    return path.restrictions.push.apply(path.restrictions, rests);
                },
                get: function (name) {
                    var path = checkIncPath(name);
                    if( isNull(path) ) return;
                    return path.restrictions;
                },
                remove: function (name, func) {
                    var path = checkIncPath(name);
                    if( isNull(path) ) return;
                    return path.restrictions.remove(func);
                }
            }
        }
        prototype.lazy = function (callback, wait) {
            var timeout; wait = isNull(wait) ? 500 : wait;
            var immediate = arguments[2];
            return function () {
                var context = $easy, args = arguments;
                var later = function () {
                    timeout = null;
                    if (!immediate) callback.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) callback.apply(context, args);
            };
        }
        prototype.reactive = function(fun) {
            // Creates an object with all properties reactive
            if (typeof fun !== 'function') {
                Easy.log('this.reactive function expects a function as parameter.');
                return;
            } 
            var obj = {};
            getter = function(_, prop) {
                Object.defineProperty(obj, prop.property, prop.descriptor);
            }

            var $return = fun.call($easy); unget();
            if ( !isObj($return) ) return;

            // Adding missing properties that is the primitives
            $return.keys(function (k, v) {
                if (!obj.hasOwnProperty(k))
                    obj[k] = v;
            });
            
            // Removing all the exceeded properties 
            obj.keys(function (k) {
                if ( !$return.hasOwnProperty(k) && k !== '$scope' )
                    delete obj[k];
            });

            new ReactiveObject(obj);
            return obj;
        }
        prototype.compile = Compiler.compile = function (config) {
            var $$el = config.el;
            var $$data = config.data;
            var $$scope = $$data;
            // Defining all the functions in the data
            var $$methods = extractor($$data, 'function');
            var cmds = vars.cmds;

            if (!$$el) return Easy.log('Invalid element passed in the compiler');

            setEasy($$el);
            // Helper functions
            function hasAttr(el, name) {
                return el.hasAttribute && el.hasAttribute(name) 
            }

            function remAttr(el, name) {
                el.removeAttribute(name);
            }

            function walker(el, $scope) {
                var $name = el.nodeName, $value = el.nodeValue;
                // Comment cannot be read
                if ( $name === '#comment' ) return;
                if ( hasAttr(el, 'e-ignore') ) return;

                if ( hasAttr(el, 'wait-data') ) {
                    var attr = fn.attr(el, [ 'wait-data' ], true);
                    if(!trim(attr.value))
                        return Easy.log({ msg: error.invalid('in ' + attr.name), el: el });

                    if ( waitedData[attr.value] )
                        waitedData[attr.value].push(el);
                    else
                        waitedData[attr.value] = [ el ];
                    
                    return;
                }

                // Inline includer
                if ( hasAttr(el, 'inc-tmp') ) {
                    var attr = fn.attr(el, ['inc-tmp'], true);

                    if (trim(attr.value))
                        inc.components[attr.value] = { content: el.outerHTML };
                    else
                        Easy.log({ msg: 'Invalid value in element[inc-tmp]. ', el: el }, 'warn');
                }
                
                // Property definer
                if ( $name === cmds.def ) {
                    remAttr(el.$e.$base, $name);
                    var defs = fn.eval($value, $scope);
                    if (defs) $easy.setData(defs, $scope);
                    return;
                }

                setEasy(el); // setting $e property in the element

                // Getting and Checking condition: if or show
                if( hasAttr(el, cmds.if) || hasAttr(el, cmds.show) ) {
                    var attr = fn.attr(el, [cmds.if, cmds.show], true);
                    if( (trim(attr.value) === '') ) 
                        return Easy.log({ msg: 'Invalid value in ' + attr.value, el: attr })

                    if (attr.name === cmds.show) {
                        var res = ui.cmd.if.prepare(el, attr, attr.name);
                        if (res === true) {
                            Compiler.setValue({ current: el, scope: $scope, methods: $$methods });
                        }
                    } else {
                        var curr = el, chain = [ { attr: attr, el: curr } ]; 

                        do { // Getting the chain of the condition
                            curr = curr.nextElementSibling;
                            if ( !curr ) break;
                            var $attr = fn.attr(curr, ['e-else-if', 'e-else']);
                            if ( !$attr ) break;
                            chain.push({ attr: $attr, el: curr });
                            // Break on else
                            if ( $attr.name === 'e-else' ) break;
                        } while(1);

                        if (ui.cmd.if.prepare(el, attr, cmds.if)) {
                            el.$e.chainObj = {
                                $elseValue: false,
                                chain: chain,
                                trueEl: null
                            }
                            Compiler.setValue({ current: el, scope: $scope, methods: $$methods });
                        }
                    }
                }

                // Scope execution 
                // Includer 
                if ( inc.isInc(el) ) {
                    var source = inc.src(el);
                    //Exposing the data 
                    $easy.expose(source, extend.obj($scope));
                    
                    // For includer dynamic change
                    var delimiters = ui.getDelimiters(source);
                    if( delimiters.length === 1 ) {
                        el.valueIn('no-replace', '');
                        var container = el.parentNode;
                        var dlm = delimiters[0], name = el.nodeName;
                        var attr = fn.attr(el, ['inc-src', 'src']), current = el;
                        var hw = { el: current };
                        source = fn.eval(dlm.exp, $scope);
                        attr.value = source;

                        hw.watch = $easy.watch(dlm.exp, function(val) {
                            var element = doc.createElement(name);
                            element.valueIn('no-replace', '');
                            if(name === 'INC')
                                element.valueIn('src', val);
                            else 
                                element.valueIn('inc-src', val);

                            container.replaceChild(element, current);
                            hw.el = current = element; // New element
                        },  $scope);

                        ui.$handleWatches.push(hw);
                    } else if( delimiters.length >= 1 ) {
                        return Easy.log('Only one delimiter is allowed in element[inc-src] or inc[src].\n  Check the value: \''+ source +'\'.')
                    }
                    // including the component
                    inc.include(source, el);
                    return;
                } else if ( hasAttr(el, cmds.data) ) {
                    // Data
                    var scope = fn.attr(el, [cmds.data], true), $dt;
                    // Getting the data or the default
                    if ( trim(scope.value) === ''){
                        $dt = extend.obj($easy.data); // clone the main data
                    } else {
                        $dt = fn.eval(scope.value, $scope);
                    }

                    $dt.$scope = $scope;
                    walker.call($easy, el, extend.obj($dt, $$methods));
                    
                    EasyEvent.emit({
                        elem: el,
                        type: vars.events.data,
                        scope: extend.obj($scope)
                    });

                    return;
                } else if ( hasAttr(el, cmds.tmp) || hasAttr(el, cmds.fill) || hasAttr(el, cmds.req) ) {
                    // Preparing the element 
                    var attr = fn.attr(el, [cmds.tmp, cmds.fill], true);
                    if (attr) {
                        var tp = attr.name === cmds.tmp ? 'many' : 'one';
                        var id = fn.attr(el, [cmds.id], true); id = id ? id.value : '';
                        el.valueIn('e-req', '{ $url: "'+ attr.value +'", $type: "'+ tp +'", $id: "'+ id +'" }');
                    }
                    // Templates
                    ui.init(el, extend.obj($scope, this.methods));
                    return;
                } else if ( hasAttr(el, cmds.for) ) {
                    // For
                    var helper = ui.cmd.for.read(el), comment;
                    if (!helper.ok) return;
                    
                    var propConfig, desc;
                    // Getting the propConfig value
                    getter = function (_, prop) {
                        propConfig = prop; desc = prop.descriptor;
                    }
                    var v = fn.eval(helper.array, $scope);
                    unget();
                    var array = desc ? $propDefiner({}, 'value', desc) : { value: v };

                    comment = new Filter({
                        array: array,
                        dec: helper.dec,
                        data: $scope,
                        filter: helper.filter,
                        actions: {
                            clean: function () {
                                // Removing every listed elements
                                ReactiveArray.retrieveElems(comment, true);  
                            },
                            run: function (data) {
                                return ui.cmd.for({
                                    el: el, 
                                    array: data, 
                                    comment: comment,
                                    data: extend.obj($scope, $$methods)
                                });
                            }
                        }
                    }).reference;

                    if (!comment) {
                        // No filter defined
                        comment = ui.cmd.for({
                                    el: el, 
                                    array: array.value, 
                                    comment: comment,
                                    data: extend.obj($scope, this.methods)
                                });
                    }

                    if (desc) propConfig.binds.push({ el: comment, isObj: true, obj: extend.obj($scope, $$methods) });
                    return;
                }

                // Loop attrs
                forEach( extend.array(el.$e.$oldAttrs, toArray((el.attributes || [])) ),
                    function (child) {
                        setEasy(child);
                        child.$e.$base = el;
                        // Compilation with the same $scope
                        walker.call($easy, child, $scope);
                    });

                if ($name === cmds.content) {
                    var base = el.$e.$base;
                    remAttr(base, $name);
                    base.innerHTML = $value;
                    return;
                }

                if ($name.startsWith('on:') || $name.startsWith('listen:')) {
                    var evtExpression = $name.split(':')[1].split('.'); // click.preventdefault
                    var eventName = evtExpression[0], base = el.$e.$base;

                    if ( standardEvents[eventName] === true ){
                        var $on = base.listen(eventName, function (evtObject) {
                            if(evtExpression.indexOf('once') !== -1) // If once                        
                                base.removeEventListener(eventName, $on[0].callback, false);
                            // Applying the modifier
                            forEach(evtExpression,function (modifier) {
                                var $modName = eventModifiers[modifier];
                                if ($modName) evtObject[$modName]();
                            });

                            arguments[0].data = { $scope: $scope }
                            // Calling the callback function
                            fn.eval("if (typeof (("+ $value+")) === 'function') ("+$value +").apply(this, arguments);", 
                                extend.obj($scope, $$methods) || {}, false, arguments);
                        });

                    } else {
                        if( !isNull(vars.events[eventName]) ) return;
                        var callback = function() {
                            if(evtExpression.indexOf('once') !== -1) // If once
                                $easy.off(eventName, $on.callback);
                            // Calling the callback function
                            fn.eval("if (typeof (("+$value+")) === 'function') ("+$value+").apply(this, arguments);", 
                                extend.obj($scope, $$methods) || {}, false, arguments);
                        }
                        callback.$target = base;
                        var $on = $easy.on(eventName, callback);
                    }

                    remAttr(base, $name);
                    return;
                }

                if ( $name === 'e-bind' || $name.startsWith('e-bind:') ) {
                    var base = el.$e.$base;
                    var val = $name.split(':'),
                        // By default bind the value property
                        field = val.length === 1 ? 'value' : val[1];

                    base.$e.b = { data: field };
                    // Defining the object for 'setValue' function
                    base.$e.$oldValue = $value;
                    base.$e.$fields = [{ exp: $value, field: $value }];
                    base.$e.$base = base;
                    base._name = field;

                    remAttr(base, $name);

                    if (isNull($value) || trim($value) === '')
                        return Easy.log('e-bind attribule cannot have null or empty value.');

                    Bind.exec(base, $scope, function () {
                        ui.setNodeValue(base, $scope);
                    }, { two: true });
                    return;
                }

                if ( $name.startsWith('e-toggle:') ) {
                    var base = el.$e.$base;
                    var exp = $name.split(':');
                    remAttr(base, $name);

                    if (isNull($value) || trim($value) === '')
                        return Easy.log('e-toggle attribule cannot have null or empty value.');

                    function exec() {
                        var res = fn.eval($value, $scope);
                        if(res)
                            base.valueIn(exp[1], 'true');
                        else
                            base.removeAttribute(exp[1]);
                    }

                    getter = function (obj, prop) {
                        var w = $easy.watch(prop.property, function(){
                            exec();
                        }, obj);
                        ui.$handleWatches.push({ el: base, watch: w });
                    }

                    exec(res); unget();
                    return;
                }

                // alternable attr values
                if($name.startsWith('e-') && !vars.cmds.hasValue($name)) {
                    if(ui.getDelimiters($value).length === 0 && trim($value) !== '') {
                        $value = trim($value);
                        // Testing if the value if object definition
                        if( !($value[0] === '{' && $value[1] !== '{') ) return;

                        var base  = el.$e.$base;
                        remAttr(base, $name);

                        Compiler.setDefault({ attr: el });
                        Compiler.addOldAttr({ el: base, value: el });

                        var name = $name.substr(2);
                        if(!base.hasAttribute(name))
                            base.valueIn(name, '');
                        var $attr = fn.attr(base, [name]);

                        function exec(obj) {
                            if(!obj) return;
                            obj.keys(function(k, v){
                                if(v) {
                                    if(!$attr.value.includes(k))
                                        $attr.value += ' ' + k;
                                } else {
                                    $attr.value = $attr.value.replaceAll(k); 
                                }
                            });
                        }

                        getter = function (obj, prop) {
                            var w = $easy.watch(prop.property, function(){
                                exec(fn.eval(el.$e.$oldValue, obj));
                            }, obj);
                            ui.$handleWatches.push({ el: base, watch: w });
                        }

                        var res = fn.eval($value, $scope);
                        if(!isObj(res)) return; 
                        exec(res);
                        unget();
                        return;
                    }
                }

                // dynamic toggled value in attr
                if (el.nodeValue) {
                    var text = el, fields, base = el.$e.$base;
                    
                    if (text.$e.$fields && text.$e.$fields.length) {
                        fields = text.$e.$fields;
                    } else {
                        fields = ui.getDelimiters(text.$e.$oldValue || text.nodeValue);
                    }

                    if (fields.length) {
                        text.$e.$fields = fields;

                        if($name !== '#text') Compiler.addOldAttr({ el: base, value: el });
                        Compiler.setDefault({ attr: text });
                        Compiler.setValue({ current: text, scope: $$scope, methods: $$methods });
                    }
                }

                if (hasAttr(el, cmds.anm)) {
                    var anm = fn.attr(el, [cmds.anm], true);
                    // Applying animation if needed
                    if (!isNull(anm)) el.niceIn(anm.value);
                }

                // Handling skeleton attribute
                if(($name === cmds.skeleton) && (trim($value) === ''))
                    remAttr(el.$e.$base, $name);

                // Url hash normalizer
                if( $name === ':href' || $name === 'i:href' ) {
                    var base = el.$e.$base;
                    remAttr(base, $name);
                    var $val = componentConfig.usehash === false ? $value : ('/#/' + $value);
                    $val = (componentConfig.base + $val).replaceAll('//', '/');
                    el.$e.$base.valueIn('href', $val);

                    base.addEventListener('click', function (evt) {
                        if ( isNull(RouteHandler.handleLink) ) return;
                        if(componentConfig.usehash === false) {
                            evt.preventDefault();
                            RouteHandler.navegate(evt.target.href);
                        }
                        
                        if ( $name === ':href' )
                            RouteHandler.handleLink(evt.target); 
                    });
                }

                // Getting in the children
                if (!isNull(el.childNodes)) {
                    toArray(el.childNodes, function (child) {
                        $$scope = $scope;
                        setEasy(child);
                        child.$e.$base = el;
                        // Compilation with diferent $scope if it was changed
                        walker.call($easy, child, $scope);
                    });
                }
            }

            // Setting the data function
            var $closure = $$scope;
            $$el.$e.data = function () { return $closure; }

            new Promise(function(resolve, reject) {
                try {
                    $$el.$e.$base = $$el.parentNode || $$el.ownerElement;
                    // Compiling the the element
                    walker.call($easy, $$el, $$scope);
                    if ( !isNull(config.done) ) config.done.call($easy);
                    resolve($easy);
                } catch (error) {
                    reject(Easy.log(error));
                }
            });
        }
        prototype.Fetch = Fetch;
        prototype.extend = extend;

        function checkIncPath(name) {
            var path = inc.paths[name];
            if( isNull(path) ) {
                Easy.log('No \''+ name +'\' component was found, please check if it is defined.');
                return;
            }
            return path;
        }
        
        //#region Classes
        function Compiler() {}
        /** Component includer */
        function Includer(paths, $config) {
            var instance = this;
            if (!paths) paths = {};
            // Includer events store
            this.mounted = [];
            this.loaded = [];
            this.destroyed = [];
            this.blocked = [];
            this.fail = [];
            // Store all the components while the application is running
            this.components = {};
            // It Stores temporarily the path untill the request is complete
            this.webRequests = {};
            this.paths = {};
            this.config = $config;
            this.skipNoFunction = function(list, k){
                var skipped = false;
                toArray(list, function(v, i) {
                    if( typeof v !== 'function' ) {
                        skipped = true;
                        list.splice(i, 1);
                    }
                });
                
                if(skipped) Easy.log('All restrictions must be a function! All non-functions '+
                                    'have been removed from the \'' +k+'\' component restriction list. '+
                                    'Please reset this or these restrictions.', 'warn');
            }
            // Component Setter
            this.setComponent = function (objects) {
                var comps = {};
                objects.keys((function (key, value) {
                    if( !isNull(this.paths[key]) )
                        return Easy.log('Cannot redefine the component \''+ key +'\' ');

                    comps[key] = isString(value) ? {
                        url: value, // the url of the component (optional)
                        title: undefined, // the title that will be placed in the page (optional)
                        route: undefined, // the route that will be shown [beta] (optional)
                        template: undefined, // the component template [hard code component] (optional)
                        data: undefined, // the default data of the include (optional)
                        store: true, // allow to store de component transfered data, by default is true
                    } : value;
                    comps[key].name = key;
                    comps[key].store = isNull(comps[key].store) ? true : comps[key].store;
                    // Transforming data to a reactive one
                    comps[key].data = comps[key].data ? new ReactiveObject(comps[key].data) : undefined; 
                                    
                    if( isNull(comps[key].restrictions) )
                        comps[key].restrictions = [];

                    this.skipNoFunction(comps[key].restrictions, key);                
                    this.paths[key] = comps[key];

                }).bind(this));
                return comps;
            }
            // Includer paths
            this.setComponent(paths);
            /** * Get a HTML file from the server, according to a path */
            this.get = function (path, cb, fail) {
                // fetch function to get the file
                new Fetch(location.origin + $config.base + path, {
                    method: 'get',
                    headers: { 'Content-Type': 'text/plain' }
                }).then(function (data) {
                    if (data.ok) {
                        cb(data.response);
                    } else {
                        throw ({ message: 'Unable to load the file: ' + path + '\nDescription: ' + data.statusText + '.' });
                    }
                }).catch(function (error) {
                    if (fail) fail(error);
                    Easy.log(error);
                });
            }
            /**
             * Html includer main function
             * @param {String} name The file Name or Path of the element that will be included. 
             * @param {HTMLElement} $inc The inc element that the content will be replaced or included. 
             */
            this.include = function (src, $inc) {
                // Checking if the name is not Ok 
                if (isNull(src))
                    return Easy.log("Invalid value of attribute element[inc-src] or inc[src] of '" + $inc.desc() + "'. Or, it's undefined.");
                // Checking if the inc was provided 
                if (isNull($inc))
                    return Easy.log("Invalid element of '" + src + "'. Or, it's undefined.");
                
                // Checking if the replace attribute is defined
                var noReplace = $inc.hasAttribute('no-replace');
                function transferAttributes(src, dest) {
                    toArray(src.attributes, function (attr) {
                        switch (attr.name) {
                            case 'src':
                            case 'inc-src':
                            case 'no-replace':
                            case 'keep-alive':
                                return;

                            case 'class':
                                toArray(src.classList, function (c) {
                                    dest.classList.add(c);
                                });
                                src.removeAttribute(attr.name);
                                return;
                                
                            default:
                                dest.valueIn(attr.name, attr.value);
                                src.removeAttribute(attr.name);
                                return;
                        }
                    });
                }
                // Get element from Page
                if (src[0] === '@') {
                    // Normalizing the name, removing @
                    var nameNormalized = src.substr(1),
                        component = instance.components[nameNormalized];

                    if (!component)
                        return Easy.log("No element[inc-tmp] with this identifier '@" + nameNormalized + "' defined.", 'warn');

                    var temp = doc.createElement('body'), el;
                    temp.innerHTML = component.content;
                    el = temp.children[0];

                    // Generating new element
                    el.$prevent = true;

                    if (!noReplace) {
                        // Defining the name
                        el.inc = nameNormalized;
                        $inc.aboveMe().replaceChild(el, $inc);
                    } else{
                        $inc.inc = nameNormalized;
                        $inc.appendChild(el);
                    }

                    transferAttributes($inc, el);
                    // Reading the added element
                    Compiler.compile({
                        el: el,
                        data: $easy.retrieve(src, true) || Compiler.getUpData(el)
                    });

                    // calling the events
                    forEach(instance.loaded, function (evt) {
                        evt(el, $inc);
                    });
                    return;
                }

                // Prepare and insert the compoment to the DOM
                function Inc(config) {
                    this.name = (src + ' compoment').toUpperCase();
                    this.created = this.mounted = fn.empty;
                    this.loaded = this.destroyed = fn.empty
                    this.scope = $easy.retrieve(src, true);
                    this.Easy = $easy;
                    
                    // In this case the element was removed from the DOM before de compilation
                    // Removing the exposed data of this component
                    if (!$inc.parentNode) return;

                    if (!isNull($path.data)) {
                        this.data = new ReactiveObject($path.data);    
                    } else {
                        // If the data isn't defined take data from scope data 
                        this.data = (this.scope ? this.scope : this.scope = {});
                        if ($config.storeData) $path.data = this.data; 
                    }

                    this.export = function (data) {
                        if (!isObj(data)) 
                            return Easy.log('Invalid object for export, please make sure the object has valid value.');
                        // Transforming to a reactive object
                        new ReactiveObject(data);
                        
                        data.keys((function (k) {
                            $propTransfer(this.data, data, k);  
                        }).bind(this));
                    }

                    var store = config.store,
                        content = config.content,
                        self = this, webRequestedScritps = 0,
                        isKeepAlive = $inc.hasAttribute('keep-alive');
                    var el, styles = [], scripts = [];
                    
                    if ( isKeepAlive && instance.components[src] && instance.components[src]['keep-alive'] ) {
                        var obj = instance.components[src]['keep-alive'];
                        scripts = obj.scripts;
                        styles = obj.styles;
                        el = obj.el;
                    } else {
                        var temp = doc.createElement('body');
                        temp.innerHTML = content;
                        forEach(temp.children, function (child) {
                            switch (child.nodeName) {
                                case 'STYLE': styles.push(child); return;
                                case 'SCRIPT':  scripts.push(child); return;
                                default: el = child; return;
                            }
                        });
        
                        if (!el) return Easy.log("The component '" + src +
                            "' seems to be empty or it has not a root element" +
                            "Eg.: <div></div>, to include. Please, check it!", 'warn');
                        
                        // Helper to get content elements
                        function findContents(el) {
                            var contents = [];
                            forEach(el.children, function (child) {
                                (function exec(elem) {
                                    if (elem.nodeName === 'INC' || elem.hasAttribute('inc-src')) return;
                                    if (elem.nodeName === 'CONTENT') contents.push(elem);
                                    forEach(elem.children, function (c) {
                                        exec(c);
                                    });
                                })(child);
                            });
                            return contents;
                        }
                        // Getting all the mains from the imported component 
                        var contents = findContents(el);
                        if ($inc.children.length) {
                            // Getting all the mains from the current in element
                            var currentContentTags = findContents($inc);
                            // Adding the current content to the imported component
                            forEach(currentContentTags, function (currentTag) {
                                var mark = contents.findOne(function (ctag) {
                                    return ctag.valueIn('ident') === currentTag.valueIn('ident');
                                });
                                if (mark) {
                                    var above = mark.aboveMe();
                                    forEach(toArray(currentTag.children), function (child) {
                                        if (child.nodeName === 'SCRIPT') scripts.push(child);
                                        else above.appendChild(child);
                                    });
                                    above.removeChild(mark);
                                }
                            });
                        }
        
                        var styleIds = [];
                        forEach(styles, function (style) {
                            doc.head.appendChild(style);
                            // For scoped styles
                            if (style.hasAttribute('scoped')) {
                                // Generating some class name for the selectors
                                var value = 'scope-s' + $easy.code(4), $newContent = '';
                                styleIds.push(value);
                                // Changing each selector to avoid conflit
                                forEach(style.sheet.cssRules, function (rule) {
                                    $newContent += '.' + value + ' ' + rule.cssText + ' ';
                                });
                                style.innerText = $newContent;
                            }
                        });
        
                        forEach(styleIds, function (s) {
                            // Redefining the top object class
                            el.classList.add(s);
                        });
        
                        // Storing the content
                        if (store && $path.store === true){
                            instance.components[src] = { content: content };
                            if (isKeepAlive) {
                                instance.components[src]['keep-alive'] = {
                                    el: el,
                                    styles: styles,
                                    scripts: scripts
                                }
                                // Clearing the content
                                instance.components[src].content = null;
                            }
                        }
        
                        el.$e = $inc.$e;
                        el.$prevent = true;
                        // Defining attributes from the inc element 
                        transferAttributes($inc, el);
                        
                        var dataAttribute = fn.attr(el, [ vars.cmds.data ], true);
                        if (dataAttribute) {
                            var data = fn.eval(dataAttribute.value, this.data);
                            if (data){
                                if (isArray(data))
                                    return Easy.log('An array cannot be exposed, try to wrap it into a object literal!. Eg.: { myArray: [...] }.');
                                
                                data.keys(function (k, v) { self.data[k] = v; });
                            }
                        }
                    }

                    this.el = el;
                    var webScriptsContent = '', mainScript, fail = false, failError;
                    forEach(scripts, function (script) {
                        if (script.src !== '') {
                            webRequestedScritps++;
                            // Getting script content from a web request
                            instance.get(script.src.substr(location.origin.length + 1), 
                            function(js) {
                                webScriptsContent += js + '\n\n';
                                webRequestedScritps--;
                            }, function (error) {
                                fail = true;
                                failError = error; 
                            });
                        } else {
                            mainScript = script; 
                        }
                    }, this);

                    // only process when webRequestedScritps === 0;
                    var tId = setInterval((function() {
                        try {
                            if (webRequestedScritps === 0) {
                                clearInterval(tId);
                                // Checking it is still connected
                                if (!$inc.parentNode) return;

                                // In case of dynamic component inserction without exposing some data
                                // to it, get the up component/element data
                                if ( isEmptyObj(this.scope) ) {
                                    this.scope = Compiler.getUpData($inc);
                                    if (isEmptyObj(this.data))
                                        this.data = this.scope;
                                }

                                if (mainScript)
                                    // joining and evaluating the script
                                    Function(webScriptsContent + mainScript.innerHTML).
                                        call(this, $easy);
        
                                // Before add element
                                this.created(el);
                                
                                var destroyable = el;
                                // Adding the element in the DOM
                                if (!noReplace) {
                                    // Defining the name
                                    el.inc = src;
                                    // Adding the attributes to the that will be inserted
                                    $inc.aboveMe().replaceChild(el, $inc);
                                } else{
                                    $inc.inc = src;
                                    $inc.appendChild(el);
                                    destroyable = $inc;
                                }
                                
                                // Adding the destroy method
                                this.destroy = function () {
                                    if (destroyable.parentNode)
                                        destroyable.parentNode.removeChild(destroyable);
                                }

                                // Element was added
                                this.mounted(el, $inc);
                                forEach(instance.mounted, function (evt) { evt.call(self, el, $inc); });
                                
                                // Compiling the added element according the scope data                        
                                Compiler.compile({
                                    el: el,
                                    data: this.data 
                                });
                                
                                // Element was loaded
                                this.loaded(el);
                                forEach(instance.loaded, function (evt) { evt.call(self, el); });
                                // Two parents in case of no-replace inc
                                if (!el.parentNode || !el.parentNode.parentNode) return;
                                var target = el.parentNode;
                                if (instance.isInc(target)) target = target.parentNode;   
                                // Setting the compenent mutation
                                var mut = new MutationObserver(function() {
                                    if(el.isConnected === false){
                                        self.destroyed(el);
                                        forEach(instance.destroyed, function (evt) { evt.call(self, el); });

                                        // Removing every styles 
                                        toArray( styles, function(el) {
                                            doc.head.removeChild(el);
                                        });
                                        mut.disconnect();
                                    }
                                }); mut.observe(target, { childList: true });
                            } else if (fail) {
                                // On fail stop include process
                                clearInterval(tId);
                                forEach(instance.fail, function (evt) { 
                                    evt.call($easy, { 
                                        message: failError.message,
                                        inc: $inc 
                                    }); 
                                });
                            }
                        } catch (error) {
                            error.fileName = this.name;
                            error.message += " in " + error.fileName + ', in line ' +
                            ((el.outerHTML.match(/\r\n|\r|\n/gmi) || '').length + 3 + error.lineNumber ) + ' or near'; 
                            Easy.log(error);
                            clearInterval(tId);
                        }
                    }).bind(this), 0);
                }

                var $path = instance.paths[src], $url;
                if ($path) {
                    if( !isNull($path.restrictions.findOne( function (v) { return v.call($easy) === false; } )) ) {
                        return forEach(instance.blocked, function (evt) { 
                            evt.call($easy, {
                                message: 'The component was blocked by the restrictions verification!',
                                inc: $inc 
                            }); 
                        });
                    }

                    if ($path.template)
                        return new Inc({ content: $path.template });
                    else
                        $url = $path.url;
                    
                    // Changing the title and the url if it needed
                    if ($path.title) {
                        doc.title = $path.title;
                    }
                    if ($path.route && $config.usehash === false) {
                        $global.history.pushState($path.template, $path.title, $path.route);
                    }
                } else {
                    return Easy.log('No \''+ src +'\' component was found, please check if it is defined.');
                }
                // Get element from Server
                var component = instance.components[src];
                // Checking if the component is stored
                if (component) new Inc({ content: component.content });
                // Otherwise, check if we don't have a web request made to this path
                // because we don't wan't request again 
                else if (!instance.webRequests[src]) {
                    // Setting that we have a web request to this path
                    instance.webRequests[src] = true;
                    // Getting the data 
                    instance.get($url += !$url.endsWith('.html') ? '.html' : '', function (content) {
                        delete instance.webRequests[src];
                        new Inc({ content: content, store: true });
                    }, function(error) {
                        forEach(instance.fail, function (evt) { 
                            evt.call($easy, { 
                                message: error.message,
                                inc: $inc 
                            }); 
                        });
                    });
                }
                // Otherwise, wait untill the web request is done 
                else{
                    var t = setInterval(function () {
                        // Checking if the component is configured
                        var component = instance.components[src];
                        if (component) {
                            new Inc({ content: component.content });
                            clearInterval(t);
                        }
                    }, 0);
                }
            }
            /** Helper to get the source value an inc value */
            this.src = function (el) {
                return el.valueIn('src') || el.valueIn('inc-src');
            }
            this.isInc = function (el) {
                return el.nodeName === 'INC' || (el.hasAttribute && el.hasAttribute('inc-src'))
            }
        }
        /** Functions and extensions used by easy */
        function Func() {
            this.empty = function () {}
            /**
             * Execute an expression and returns the value if valid and undefined is not valid.
             * WARNING: It uses the window (globalObject) to store temporarily the properties,
             * but, after that put back all removed properties
             */
            this.eval = function ($exp, $data, $return, $args) {
                if (!$data) $data = {};

                if (isNull($exp) || $exp === '') return;
                
                if (isNull($return) || $return === true) 
                    $exp = 'this.$return=' + $exp; // Allow to return a value

                try {
                    fn.spreadData(function () {
                        Function($exp).apply($easy, $args);
                    }, $data);
                }catch(error) {
                    var v = isArray($data) ? '$array' : v = $data.keys().join(', ');
                    Easy.log(error.message + '.\nAvailable variables in current scope: { ' + v + ' }');
                }
                // Retrieving the returned value
                var $value = $easy.$return; delete $easy.$return;
                return $value;
            }
            /** Evaluate an expression and return empty string if null value */
            this.exec = function (exp, $data, json) {
                try {
                    // Force json conversion
                    if (isNull(json)) json = false;
                    var value = fn.eval(exp, $data);
                    if (isNull(value)) return '';
                    if (json) {
                        if (isObj(value))
                            value = JSON.stringify(value);
                    }
                    return value;
                }catch(error) {
                    return '';
                }
            }
            // Get an attribute of an element in a list and remove it or not
            this.attr = function (elem, attrs, remove) {
                if (!elem) return;
                if (!attrs) return;
                if (isNull(remove)) remove = false;
                if (isNull(elem.attributes)) return;

                var res, i;
                for (i = 0; i < attrs.length; i++)
                    if ( res = elem.attributes[attrs[i]] ) break;

                if (res && remove) elem.removeAttribute(res.name);
                return res;
            }
            /**
             * Define temporary properties in window (globalObject), 
             *  call the main callback and then restore the old properties.
             */
            this.spreadData = function (callback, $dt) {
                var keys = [], oldVars = {};
                if (isObj($dt)) keys = $dt.keys();
                try {
                    // Defining 
                    forEach(keys, function (k) {
                        if ($global.hasOwnProperty(k))
                            $propTransfer(oldVars, $global, k);
                        $propTransfer($global, $dt, k);
                    });
                    callback.call($easy);
                }catch(error) {
                    throw (error);
                }finally{
                    // Cleaning
                    forEach(keys, function (k) { delete $global[k]; });
                    // Redefining the old values
                    forEach(oldVars.keys(), function (k) {
                        $propTransfer($global, oldVars, k);
                    });
                }
            }
            // Extensions
            // Prevents redefinition of the extensions
            if (doc.node !== undefined) return;
            // Extension setter
            function def(key, cb, type) {
                $propDefiner((type || Object).prototype, key, { value: cb });
            }
            // Query one element
            def('node', function (v) {
                if (!v) return null;
                return (v[0] === '#' ? this.getElementById(v.substr(1)) : this.querySelector(v));
            }, Node);
            // Query many elements
            def('nodes', function (v) {
                if (!v) return null;
                return toArray(this.querySelectorAll(v));
            }, Node);
            // get key of an object
            def('keys', function (cb) {
                var self = this;
                var array = Object.keys(self);
                // Calling the callback if it needs
                if (cb) forEach(array, function (e) { cb(e, self[e]); });
                return array;
            });
            // map values from an object to the another one
            def('mapObj', function (input, deep) {
                var self = this;
                if (isNull(deep)) deep = false;
                return input.keys(function (key, value) {
                    var destination = self[key];
                    if (deep && isObj(destination)) {
                        if (!isArray(destination))
                            self[key].mapObj(value);
                    } else{
                        var source = (value ? value : self[key]);
                        if (source != destination)
                            self[key] = source;
                    }
                });
            });
            // Get or Set and Get value from an attribute or content value
            def('valueIn', function (name, set) {
                if (!isNull(set))
                    return this.setAttribute(name, set) || this.getAttribute(name);
                else
                    return name != null ? this[name] || this.getAttribute(name) : this.innerText;
            }, Element);
            // get the elem above the current element
            def('aboveMe', function (selector) {
                // Parent getter
                function parent(elem) {
                    var $node = elem.parentNode;

                    if ( isNull(selector) ) return $node;
                    if ( $node === doc || isNull($node) ) return null;

                    var tester = doc.createElement('body');
                    // Defining the element in some kind of Virtual Element
                    tester.innerHTML = $node.outerHTML;
                    
                    if ( $node.nodeName === tester.nodeName )
                        // Clearing his children
                        tester.innerHTML = '';
                    else 
                        // Clearing his children
                        tester.children[0].innerHTML = '';

                    // And checking the selector
                    if ( !isNull(tester.querySelector(selector)) )
                        return $node;
                    else if ( $node.nodeName === tester.nodeName ) // The element is 
                        return null;
                    else
                        return parent($node);
                }
                // Getting the parent
                return parent(this);
            }, Element);
            // check if an object/primitive has some value or match a value, 
            // and it returns true or false
            def('hasValue', function (value, options) {
                var res, self = this;
                options = $objDesigner(options, {
                    ignoreCase: false,
                    comp: 'equal' 
                });
                function check(v1, v2) {    
                    var s1 = v1, s2 = v2;
                    if( !isObj(s1) && !isObj(s2) ) {
                        s1 = toStr(v1), s2 = toStr(v2);
                        if (options.ignoreCase) {
                            s1 = s1.toLowerCase();
                            s2 = s2.toLowerCase();
                        }
                    }

                    return cmp[options.comp](s1, s2);
                }
                // Finding any property that matches the input value
                if (isObj(self))
                    res = self.keys().findOne(function (x) {
                        return check(self[x], value);
                    });
                else
                    res = check(self, value);

                return isNull(res) ? false : true;
            });
            // Gets any object inn the array that matches the value
            def('get', function (value) {
                var self = this;
                // Finding the object that matches a value or index
                return self.findOne(function (x) {
                    return x === value || (isObj(x) ? x.hasValue(value) : false);
                }) || self[value];
            }, Array);
            // Gets any object that matches the value
            def('findOne', function (cb) {
                var self = this,
                    i = 0,
                    len = self.length,
                    result;
            for(i; i < len; i++) {
                    if (cb(self[i], i)) {
                        result = self[i];
                        break;
                    }
                }
                return result;
            }, Array);
            // Get the index of an object
            def('index', function (value) {
                var index = -1;
                this.findOne(function (x, i) {
                    if ((x === value || x.hasValue(value))) {
                        index = i;
                        return true;
                    }
                    return false;
                });
                return index;
            }, Array);
            // Get the index of all the ocurrencies of an object
            def('indexes', function (value, cb) {
                var array = [];
                // Finding the object that matches a value or index
                forEach(this, function (x, i) {
                    if ((x === value || x.hasValue(value)))
                        array.push(i);
                });
                // Calling the callback if it needs
                if (cb) forEach(array, function (e) {
                    cb(e);
                });
                return array;
            }, Array);
            // Remove element(s) from an array
            def('remove', function (value, allWith) {
                try {
                    if (isNull(allWith)) allWith = false;
                    // Handling the default pop function if the value is not defined
                    if (!value && value != 0) {
                        this.pop();
                    } else{
                        // Otherwise, Handling the costumized remove function
                        // Removing all objects with this value
                        if (allWith === true) {
                            extend.array(this).indexes(value, function (i) {
                                // removing the element
                                this.splice(i, 1);
                            });
                        } else{
                            var index = this.index(value);
                            if (index === -1) {
                                if (Number.isInteger(value * 1))
                                    index = value * 1;
                            }
                            // removing the element
                            this.splice(index, 1);
                        }
                    }
                }catch(error) {
                    Easy.log({ msg: 'Remove function error. ' + error.message, error: error });
                }
                return this;
            }, Array);
            // Animation extension
            // The main animation function for the extension
            function niceShared(elem, direction, key, other) {
                var anm = vars.anm, keyNormalized = key.toLowerCase().split(':');
                // the animations keys, defined by the user
                var keyIn = keyNormalized[0],
                    keyOut = keyNormalized[1] || anm.reverse(keyIn);

                if (other) other.niceOut(keyOut);

                anm['to'].keys(function (k, v) {
                    elem.classList.remove(v);
                });
                anm['from'].keys(function (k, v) {
                    elem.classList.remove(v);
                });
                // Adding the class in the main element
                elem.classList.add(anm[direction][keyIn]);
            }
            // Execute the nice in animation into an element
            def('niceIn', function (key, outElem, cb, delay) {
                var self = this;
                if (isNull(delay)) delay = 80;
                // Executing the main function
                niceShared(self, 'to', key, outElem);
                // Executing the callback
                setTimeout(function () {
                    if (cb) cb(self, outElem);
                }, delay);
            }, HTMLElement);
            // Adds the nice out animation into an element
            def('niceOut', function (key, inElem, cb, delay) {
                var self = this;
                if (isNull(delay)) delay = 80;
                // Executing the main function
                niceShared(self, 'from', key, inElem);
                // Executing the callback
                setTimeout(function () {
                    if (cb) cb(self, inElem);
                }, delay);
            }, HTMLElement);
            // End Animation Extension
            // Generate element description. eg.: form#some-id.class1.class2
            def('desc', function () {
                var self = this;
                if (!self.nodeName) return self.toString();
                return extend.array(self.nodeName.toLowerCase(), (self.id ? '#' + self.id : ''),
                    toArray(self.classList).map(function (x) {
                        return '.' + x;
                    })).join('')
            }, Element);
            // Adds Event listener in an object or a list of it
            def('listen', function (name, cb) {
                var elems = isArray(this) ? this : [this], result = [];
                forEach(elems, function (elem) {
                    // Checking if the element is valid
                    if (!(elem instanceof Node) && (elem !== $global))
                        return Easy.log("Cannot apply '" + name + "'to the element" + elem.desc() + ".")
                    // Event object
                    var evt = {
                        event: name,
                        fnCallback: cb,
                        callback: function () {
                            // base property where will be passed the main object, **not the target**.
                            arguments[0]['base'] = elem;
                            evt.fnCallback.apply(evt.fnCallback, arguments);
                        },
                        options: false
                    }
                    elem.addEventListener(evt.event, evt.callback, evt.options);
                    result.push({
                        el: elem,
                        callback: evt.callback,
                    });
                });

                return result;
            });
            // Helper to replace every ocurrence of a string or a list of strings
            def('replaceAll', function (oldValue, newValue) {
                // The current value
                var self = this;
                if (isNull(newValue)) newValue = '';
                // Replace all ocurrencies tha will be found
                function replace(str, _old_, _new_) {
                    var slen = str.length, len = _old_.length, out = '';;
                    for(var i = 0; i < slen; i++) {
                        if (str[i] === _old_[0] && str.substr(i, len) === _old_) {
                            out += _new_;
                            i += len - 1;
                        } else {
                            out += str[i];
                        }
                    }
                    return out;
                }

                if (!isArray(oldValue))
                    self = replace(self, oldValue, newValue);
                else
                    forEach(oldValue, function (el) {
                        self = replace(self, el, newValue);
                    });

                return self;
            }, String);
            
            if( isNull(String.prototype.startsWith) ) {
                // Helper to check if a string starts with some str
                def('startsWith', function (v) {
                    return (this.substr(0, v.length) === v);
                }, String);
                // Helper to check if a string ends with some str
                def('endsWith', function (v) {
                    return (this.substr(this.length - v.length) === v);
                }, String);
                // Helper to check if a string includes a sequence
                def('includes', function (v) {
                    for(var i = 0; i < this.length; i++)
                    if(this.substr(i, v.length) === v)
                        return true;
                    return false;
                }, String);

            }
            // Helper to clear skeleton with identifier
            def('clearSkeleton', function (id) {
                var self = this, attr = '[e-skeleton="'+ id +'"]';
                self.removeAttribute('e-skeleton');
                if (self.nodes) forEach(self.nodes(attr), function (el) {
                    el.removeAttribute('e-skeleton');
                });
            }, Element);
        }
        /** UI Handler */
        function UIHandler(config) {
            var instance = this;
            this.$$delimiters = config.$$delimiters;
            this.$handleWatches = config.$handleWatches;
            // UI observer functions for tmp/fill
            this.observer = {
                mutation: function (callback) {
                    // remove all desconected elements from temporaly store variables
                    function maintenance() {
                        // Removing non used requests
                        toArray(webDataRequests.keys(), function(idx) {
                            var obj = webDataRequests[idx];
                            if (obj.$type === 'many') {
                                if (obj.$el.$e.com.isConnected === false)
                                    delete webDataRequests[idx];
                            } else {
                                if (obj.$el.isConnected === false)
                                    delete webDataRequests[idx];
                            }
                        });
                        
                        toArray(instance.$handleWatches, function(obj, idx) {
                            if ( obj.el.isConnected === false ) {
                                instance.$handleWatches.splice(idx, 1);
                                obj.watch.destroy();
                            }
                        });
                    }
                    return new MutationObserver(function (mutations) {
                        forEach(mutations, function (mut) {
                            // For added nodes
                            forEach(mut.addedNodes, function (node) {
                                // Ignored node
                                if ( node.aboveMe && node.hasAttribute('e-ignore')) 
                                    return;
                                if ( ( $easy.options.config.deepIgnore === true && node.aboveMe && node.aboveMe('[e-ignore]') ) ) 
                                    return;

                                // Checking if the element needs to be skipped
                                if ( node.$prevent ) return;
                                // Skip if it's a comment
                                if ( isIgnore(node.nodeName) ) return;
                                
                                callback(node);
                            });

                            if (mut.removedNodes.length)
                                maintenance();
                        });
                    });
                }
            }
            // Comments handler
            this.com = {
                // Creates a comment with some identifier
                create: function (id, options) {
                    if (!options) options = {};
                    var c = doc.createComment('e');
                    c.easy = true;
                    c.$id = id || $easy.code(8);
                    options.keys(function (k, v) { c[k] = v; });
                    return c;
                },
                // Gets a comment from an element
                get: function (elem, id) {
                    if (isNull(id)) return;
                    return instance.com.getAll(elem, id).findOne(function (n) {
                        return n.$id === id;
                    });
                },
                getAll: function (elem, id) {
                    if (!elem) return [];
                    var filterNone = function () { return NodeFilter.FILTER_ACCEPT; };
                    var iterator = doc.createNodeIterator(elem, NodeFilter.SHOW_COMMENT, filterNone, false);
                    var nodes = [], node;
                    while (node = iterator.nextNode()) {
                        if (node.$id === id || id === undefined)
                            nodes.push(node);
                    }
                    return nodes;
                }
            }
            // Objtec for ui commands like: if, for, show...
            this.cmd = {
                if: function (elem, $dt) {
                    if (isNull($dt)) $dt = {};
                    var exp = elem.$e.typeValue, res;
                    
                    if ( elem.$e.chainObj.trueEl )
                        // Everyone else is false because there is already a true value    
                        res = false;
                    else if ( elem.$e.typeName === 'e-else' )
                        res = elem.$e.chainObj.$elseValue;                     
                    else
                        res = fn.eval(exp, $dt) ? true : false;

                    if (new String(res).toLowerCase() === 'false') {
                        // Hide element
                        var above = elem.parentNode;
                        if (isNull(above)) return res;

                        if ( elem.com ) {
                            above.replaceChild(elem.com, elem);
                        } else {
                            elem.com = instance.com.create();
                            above.replaceChild(elem.com, elem);
                        }
                    } else if (new String(res).toLowerCase() === 'true') {
                        // Show element
                        if (elem.com && elem.com.parentNode)
                            elem.com.parentNode.replaceChild(elem, elem.com);
                        elem.$e.chainObj.trueEl = elem; // Assing element with the true value
                    }
                    return res;
                },
                show: function (elem, $dt) {
                    if (isNull($dt)) $dt = {};
                    var exp = elem.$e.typeValue;
                    var res = fn.eval(exp, $dt) ? true : false;
                    if (new String(res).toLowerCase() === 'false') 
                        elem.style.display = 'none';
                    else if (new String(res).toLowerCase() === 'true')
                        elem.style.display = '';
                    return res;
                },
                for: function (obj) {
                    var el = obj.el,
                        array = obj.array,
                        comment = obj.comment,
                        $scope = obj.data;
                    try {
                        var name = vars.cmds.for, 
                        attr = fn.attr(el, [name]);
                        
                        if (instance.getDelimiters(attr.value).length > 0) {
                            Easy.log(error.dlm);
                            return undefined;
                        }

                        if (!array) {
                            Easy.log({
                                msg: 'It seems like the array defined in e-for is invalid',
                                elem: el,
                                expression: attr.value
                            });
                            return undefined;
                        }

                        var helper = instance.cmd.for.read(el);
                        // If it has no comment, means that the list was not used yet
                        if (!comment) {
                            var aId = el.aId = $easy.code(10);
                            comment = instance.com.create(aId, {
                                $tmp: el
                            });
                            el.$e.com = comment;
                            // Removing the current element
                            el.aboveMe().replaceChild(comment, el);
                        }

                        var methods = extractor($scope, 'function');
                        // Executes the main actions
                        function exec($array) {
                            forEach($array, function (item, i) {
                                var copy = el.cloneNode(true), data = {};
                                forEach([name, vars.cmds.order], function (p) {
                                    copy.removeAttribute(p);
                                });
                                copy.aId = el.aId;

                                data = ui.cmd.for.item({
                                    item: item,
                                    dec: helper.dec,
                                    data: $scope,
                                    array: $array,
                                    index: i,
                                    extIndex: obj.index
                                });

                                // Compiling the element and stoping the mutation
                                Compiler.compile({
                                    el: copy,
                                    data: extend.obj(data, methods)
                                });
                                // Checking and calling the event if exists
                                EasyEvent.emit({
                                    elem: copy,
                                    type: vars.events.add,
                                    model: data,
                                    scope: extend.obj($scope)
                                });

                                copy.$prevent = true;
                                // interting the DOM
                                comment.parentNode.insertBefore(copy, obj.neighbor || comment);
                            });
                        }

                        // Order if needed
                        new OrderBy({
                            elem: el,
                            data: $scope,
                            reference: comment,
                            array: { value: array },
                            actions: {
                                run: function () {
                                    ReactiveArray.retrieveElems(comment, true);
                                    exec(this.order(extend.array($scope[helper.array])));
                                }
                            }
                        })

                        exec(array);

                        if(array.length === 0)
                            EasyEvent.emit({
                                elem: el,
                                type: vars.events.empty
                            });    
                    } catch (error) {
                        Easy.log(error.message);
                        return undefined;
                    }
                    // This comment will be added to the bind list of the property when it's the fist time
                    return comment;
                }
            }
            this.cmd.if.prepare = function (element, attr, name) {
                setEasy(element);
                if (element.$e.hasOwnProperty('type')) return true;
                // Checking if it has delimiters
                if (ui.getDelimiters(attr.value).length > 0) {
                    Easy.log(error.dlm);
                    return; // fail on preparation
                }

                setEasy(attr); attr.$e.$base = element;
                Compiler.addOldAttr({
                    el: element,
                    value: attr
                });

                attr.value = attr.name === 'e-else' ? '$elseValue' : attr.value; 
                element.$e.type = name; // Name for compilation
                element.$e.typeName = attr.name; // Real prop name
                element.$e.typeValue = attr.value;
                element.$e.$fields = [{ exp: attr.value }];
                return true; // everything was successfully prepared
            }
            /** Reads the e-for property and generate an object */
            this.cmd.for.read = function(el) {
                var scope = fn.attr(el, [vars.cmds.for]);
                if (!scope.value) return { ok: false, msg: Easy.log('Invalid value in e-for') };
                
                function split(str, exp) {
                    var check = str.includes(exp);
                    return check ? str.split(exp) : undefined;
                }

                var body = split(scope.value, ' of ') || split(scope.value, ' in ') || [ scope.value ];
                var dec, array, filter, remain, index = 1, $dec;
                
                if (body.length === 1) index = 0;
                else dec = body[0];

                remain = body[index].split('|');
                array = remain[0];
                filter = remain[1];
                if (dec) {
                    var _ = dec.replaceAll(['(', ')']).split(',');
                    $dec = { first: _[0], sec : _[1] };
                }
                return {
                    ok: true,
                    dec: $dec,
                    array: trim(array),
                    filter: trim(filter)
                }
            }
            this.cmd.for.item = function (config) {
                var obj = {}, dec = config.dec, item = config.item, 
                    data = config.data, array = config.array,
                    index = config.index, extIndex = config.extIndex;
                // If it has not variable in the body of the e-for use the object 
                if (!dec) {
                    if(!isObj(item)) throw ({ message: 'The Array shorthand \'e-for="myArray"\' '+
                                            'only work with object literal, not with primitives.' });
                    obj = extend.obj(item);
                    obj.$scope = data;
                } else {
                    // Getting the declaration expression
                    Object.defineProperty(obj, trim(dec.first), $propDescriptor(array, index));
                    // If if has an index defined in for config obj use it
                    if (!isNull(dec.sec))  obj[trim(dec.sec)] = ( !isNull(extIndex) ? extIndex : index );
                    obj = extend.obj(obj, data);
                }
                return obj;
            }
            /** Check if a string has the delimiter */
            this.getDelimiters = function (str) {
                if (isNull(str) || str === '') return [];
                var check = function (text, flag) {
                    var center = '([\\S\\s]*?)';
                    for (var i = 0; i < instance.$$delimiters.length; i++) {
                        var d = instance.$$delimiters[i], 
                        result = text.match( RegExp( d.delimiter.open + center + d.delimiter.close, flag) );
                        if ( result ) return result; 
                    }
                }

                var res = check(str, 'g');
                if (!res) return [];
                return res.map(function (m) {
                    var matches = check(m);
                    return {
                        field: matches[0],
                        exp: trim(matches[1])
                    }
                });
            }
            /** set value field as #value or #text. */
            this.setNodeValue = function (field, $dt) {
                var origin = field.$e.$base, name = field._name || field.nodeName;
                var value = field.$e.$oldValue;

                forEach(field.$e.$fields, function (f) {
                    value = value.replaceAll( f.field, fn.exec(f.exp, $dt, true) );
                });

                var replaceable = name.startsWith('e-') && !vars.cmds.hasValue(name);
                var oldName = name;
                if (replaceable) name = name.substr(2);
                
                // If the element already has a property with this name,
                // Set the actually value of the field
                if ((name in origin)) {
                    try {
                        if ( !isNull(origin[name]) ) {
                            // Building the type of the object to set
                            var ctorName = origin[name].constructor.name;
                            // In case of Boolean, the constructor does not parse string to boolean
                            // The verification will be manually
                            if (vars.types.indexOf(ctorName) > -1) {
                                // Getting Class from the global
                                var ctor = $global[ctorName];
                                origin[name] = ctor.call(null, value);
                            } else {
                                switch (trim(value)) {
                                    case 'true': origin[name] = true; break;
                                    case 'false': origin[name] = false; break;
                                    default: origin[name] = value; break;
                                }
                            }
                        } else {
                            // Otherwise set the default value 
                            origin[name] = value;
                        }
                    } catch (_) {
                        // Something went wrong, set the default value
                        origin[name] = value;
                    }
                }
                // Setting the value of the field
                field.nodeValue = value;

                // the define the attribute if it's replaceable
                if (replaceable) {
                    origin.valueIn(name, value);
                    origin.removeAttribute(oldName);
                }
            }
            /** Sets value according to type  */
            this.setElemValue = function (elem, $dt) {
                var c = vars.cmds, $$e = elem.$e || {};
                // By default compile as text
                var type = $$e.type || c.field;
                
                switch (type) {
                    case c.field: 
                        instance.setNodeValue(elem, $dt); 
                        return;
                    case c.if:
                        // Executing the whole chain
                        var chainObj = elem.$e.chainObj; 
                        chainObj.trueEl = null;
                        forEach(elem.$e.chainObj.chain, function (cond) {
                            var res = ui.cmd.if.prepare(cond.el, cond.attr, vars.cmds.if);
                            if (res === true) {
                                cond.el.$e.chainObj = chainObj;

                                if ( cond.attr.name === 'e-else' && isNull(chainObj.trueEl) )
                                    chainObj.$elseValue = true;

                                instance.cmd.if(cond.el, $dt);
                                cond.el.$prevent = true;
                            }
                        });
                        return;
                    case c.show:
                        return instance.cmd.show(elem, $dt);
                    default: return;
                }
            }
            /** UI template web request initializer */ 
            this.init = function (elem, $dt) {
                var cmds = vars.cmds,
                    $scope = $dt || $easy.data,
                    attr = fn.attr(elem, [cmds.req], true);

                if (!attr) return;
                setEasy(elem);

                var $value = trim(attr.value), $request = {};

                if(!$value)
                    return Easy.log({ msg: error.invalid('e-req'), el: elem });

                // Repleacing if we got delimiters
                forEach(instance.getDelimiters($value), function (f) {
                    $value = $value.replaceAll( f.field, fn.exec(f.exp, $scope) );
                });

                // Checking if it is an object
                if (($value[0] === '{' && $value[1] !== '{')) {
                    $request = fn.eval($value, $scope);
                } else {
                    $request.$url = $value;
                    $request.$type = 'many';
                }
                
                if(isNull($request.$url))
                    return Easy.log({ msg: 'No $url defined in e-req object', el: elem });
                
                $request.$scope = $scope;
                // Setting the default type if it is not defined
                $request.$type = isNull($request.$type) ? 'many' : $request.$type.toLowerCase();
                // Allow to make a new request
                function watchRequestChanges(props) {
                    // watching $url and/or $id changes
                    forEach(props, function(prop) {
                        var $w = $easy.watch(prop, function() {
                            var el = $request.$el;
                            var above = el.$e.com.parentNode;
                            if(el && el.$e.com){
                                el.$prevent = true;
                                forEach(el.$e.$oldAttrs, function (at) { 
                                    el.valueIn(at.name, at.value); 
                                });
                                // For many
                                if( $request.$type === 'many' ) {
                                    // Removing all the elements listed
                                    ReactiveArray.retrieveElems(el.$e.com, true);
                                    // Removing the e-for attribute defined
                                    el.removeAttribute(vars.cmds.for);
                                    above.insertBefore(el, el.$e.com);
                                    above.removeChild(el.$e.com);
                                }
                                // Setting a new e-req attribute value
                                el.valueIn(vars.cmds.req, JSON.stringify({
                                    $id: $request.$id, 
                                    $url: $request.$url, 
                                    $type: $request.$type 
                                }));
                                // Initializing the element
                                instance.init(el, $request.$scope);
                            }
                            $w.destroy();
                        }, $request); 
                    });
                }

                switch ($request.$type) {
                    case 'many':
                        return $easy.read($request.$url, $request.$id)
                        .then(function(data) {
                            if(!data.status)
                                return Easy.log(data.msg);

                            $request.$data = data.result;
                            new ReactiveObject($request);
                            // It's added after Reactive Call to avoid to be altered too
                            $request.$el = elem;
                            // Storing the data in the request data
                            webDataRequests[$request.$id || 'r' + $easy.code(8)] = $request;

                            // Builing e-for var declaration
                            var $use = fn.attr(elem, [vars.cmds.use], true) || '';
                            if($use) {
                                Compiler.addOldAttr({ el: elem, value: $use });
                                $use = $use.value + ' of ';
                            }
                            // Builing e-for filter
                            var filter = fn.attr(elem, [vars.cmds.filter], true) || '';
                            if(filter) { 
                                Compiler.addOldAttr({ el: elem, value: filter });
                                filter = ' | ' + filter.value;
                            }

                            elem.valueIn('e-for', $use + '$data' + filter);
                            Compiler.compile({
                                el: elem,
                                data: extend.obj($request, $scope)
                            });

                            EasyEvent.emit({
                                elem: elem,
                                type: vars.events.response,
                                model: $request.$data,
                                scope: $scope
                            });

                            watchRequestChanges([ '$id', '$url' ]);
                        })
                        .catch(function(error) {
                            Easy.log(error);
                            EasyEvent.emit({
                                elem: elem,
                                type: vars.events.fail,
                                result: error
                            });
                        });
                    case 'one':
                        return $easy.getOne($request.$url, $request.$id)
                        .then(function(data) {
                            if(!data.status)
                                return Easy.log(data.msg);
                        
                            // If no data from the response, do nothing
                            if(!data.result)
                                EasyEvent.emit({
                                    elem: elem,
                                    type: vars.events.empty,
                                    result: data 
                                });

                            // Builing e-for var declaration
                            var $use = fn.attr(elem, [vars.cmds.use], true) || '';
                            if($use) {
                                Compiler.addOldAttr({ el: elem, value: $use });
                                $use = $use.value;
                            }
                            
                            // Setting the alias variable if was defined
                            if ($use) {
                                $request.$data = {};
                                $request.$data[$use] = data.result; 
                            } else {
                                $request.$data = data.result;
                            }
                            new ReactiveObject($request);
                            // It's added after Reactive Call to avoid to be altered too
                            $request.$el = elem;
                            // Storing the data in the request data
                            webDataRequests[$request.$id || 'r' + $easy.code(8)] = $request;

                            Compiler.compile({
                                el: elem,
                                data: extend.obj($request.$data, $scope)
                            });

                            EasyEvent.emit({
                                elem: elem,
                                type: vars.events.response,
                                model: $request.$data,
                                scope: $scope
                            });

                            watchRequestChanges([ '$id' ]);
                        })
                        .catch(function(error) {
                            Easy.log(error);
                            EasyEvent.emit({
                                elem: elem,
                                type: vars.events.fail,
                                result: error
                            });
                        });
                    default:
                        return Easy.log({ msg: 'No url defined in e-req object', el: elem });
                }
            }
        }
        /** Helper Class that Makes a primitive property reactive on get and set */
        function ReactiveProperty(config) {
            var object = config.object;
            var property = config.property;

            if ($propDescriptor(object, property).writable === false)
                return this;
            
            // If function
            var $prop = object[property];
            if (typeof $prop === 'function') {
                object[property] = $prop.bind($easy);
                return this;
            }

            // Defining the property config
            var propConfig = {
                descriptor: null,
                property: property,
                value: object[property],
                binds: [],
                watches: [],
            }
            // Execute when some primitive changes
            function emitPrimitiveChanges(el, $dt) {
                ui.setElemValue(el, $dt);
            }
            // Execute when some object changes
            function emitArrayChanges(bind, newValue, oldValue) {
                function getType(obj) {
                    if (isArray(obj)) return 'array';
                    return typeof obj;
                }
                var n = getType(newValue), o = getType(oldValue), el = bind.el;
                if (n !== o) return Easy.log('The types of the objects are diferents, Old Type: ' + o + '; New Type: ' + 
                            n + '. ' + 'You need to set the same object types to performe the change in the DOM.');
                
                if (n !== 'array') return;
                // Only run if the element is a #comment 
                if (el.nodeName !== '#comment') return;
                
                ReactiveArray.retrieveElems(el, true);
                // Adding the elments to the DOM
                ui.cmd.for({
                    el: el.$tmp, 
                    array: newValue, 
                    comment: el, 
                    data: bind.obj
                });
            }
            // Setting the default getter and setter
            $propDefiner(object, property, {
                get: function reactive () {
                    if (getter)
                        getter(object, propConfig);
                    return propConfig.value;
                },
                set: function reactive () {
                    var newValue = arguments[0];
                    var oldValue = propConfig.value;
                    if (isObj(newValue)) {
                        if (isArray(newValue)) {
                            var value = forEach(newValue, function (item) {
                                if (isObj(item))
                                    return new ReactiveObject(item);
                                return item; 
                            });

                            propConfig.value.splice(0, propConfig.value.length);
                            propConfig.value.push.apply(propConfig.value, value);
                        } else{
                            object[property].mapObj(newValue);
                        }
                    }
                    else
                        propConfig.value = newValue;
                    
                    // calling binds
                    forEach(toArray(propConfig.binds), function (bind) {
                        if (bind.isObj)
                            emitArrayChanges(bind, newValue, oldValue);
                        else
                            emitPrimitiveChanges(bind.el, bind.obj);

                        // In case of e-if or e-order, etc. check if the linked comment with is still connected
                        if (bind.el.com && bind.el.com.isConnected === true) return;
                        // Maintenance
                        if ((bind.el instanceof Element) && (bind.el.isConnected === false))
                            bind.bind.destroy(); // If it is an Element
                        else if (('ownerElement' in bind.el) && isNull(bind.el.ownerElement))
                            bind.bind.destroy(); // If it is an Element node
                    });
                    // calling watches
                    forEach(toArray(propConfig.watches), function (watch) {
                        watch.callback(newValue, oldValue);
                    });
                }
            });
            propConfig.descriptor = $propDescriptor(object, property);
            // Setting the default value
            object[property] = propConfig.value;
        }
        /** Helper Class that Makes some array methods reactive on the calls */
        function ReactiveArray(config) {
            this.refs = {};
            var self = this, property = config.property, propConfig;
            getter = function (_, prop) { propConfig = prop; }
            var $array = config.object[property]; unget();

            // methods to observe
            var methods = [ 'push', 'pop', 'unshift', 'shift', 'splice' ];
            // Execute when some value changes
            function emitChanges(config) {
                forEach(propConfig.binds, function (bind) {
                    if (!bind.isObj)
                        // Updating bound nodes
                        return ui.setElemValue(bind.el, bind.obj);

                    // This way, clear and add every elements again
                    // Advantage: if the list is ordered, it will always appear ordered.
                    // Disadvantage: Consumes a lot of CPU if there is 10.000.000 or above elements listed, 
                    // there will be a huge work! 
                    // ReactiveArray.retrieveElems(bind.el, true);
                    // ui.cmd.for({
                    //     el: bind.el.$tmp, 
                    //     array: array, 
                    //     comment: bind.el, 
                    //     data: bind.obj
                    // });

                    // This way, it will be applied Array methods in the elements listed.
                    // Advantage: Consumes very less of CPU, because it handle arguments elements everytime.
                    // Disadvantage: if the list is ordered, it will not appear ordered, on add or unshift.
                    var elems = ReactiveArray.retrieveElems(bind.el);
                    function add(args, neighbor) {
                        ui.cmd.for({
                            el: bind.el.$tmp, 
                            array: args.keys().map(function(k){
                                return args[k];
                            }), 
                            comment: bind.el, 
                            data: bind.obj,
                            // The new element will be inserted before de neighbor
                            neighbor: neighbor,
                            index: config.array.length - 1
                        });
                    }
                    switch (config.method) {
                        case 'push': // Perform normal add action
                            add(config.args);
                            break;
                        case 'unshift': // Perform add before the first element
                            add(config.args, elems[0]);
                            break;
                        case 'pop': // Perform the remove action, at the end
                        case 'shift'://                         , ate the beginning
                            var el = elems[config.method]();
                            if(el) el.parentNode.removeChild(el);
                            break;
                        case 'splice': // Perform index removing
                            forEach(elems.splice.apply(elems, config.args),
                            function (el) {
                                el.parentNode.removeChild(el);
                            });
                        default: break;
                    }
                });
                forEach(propConfig.watches, function (watch) {
                    watch.callback.call($easy, config.array, config.oldArray);
                });
            }

            // Changing the prototype
            $array.__proto__ = Object.create(Array.prototype);
            forEach(methods, function (method) {
                // cache original method
                self.refs[ method ] = $array[ method ].bind($array);
                $array.__proto__[ method ] = function reactive () {
                    var oldArray = extend.array($array);
                    // Calling cached original method
                    var res = self.refs[ method ].apply($array, arguments);
                    switch (method) {
                        case 'push':
                        case 'unshift':
                            toArray(arguments, function (arg) { new ReactiveObject(arg); });
                            break;
                        default: break;
                    }
                    // Emiting the changes
                    emitChanges({
                        array: $array,
                        oldArray: oldArray,
                        method: method,
                        args: arguments,
                        return: res,
                    });
                    return res;
                }
            }, this);

            return this;
        }
        /**  Helper Class that Makes an object Reactive, it already includes 'ReactiveProperty' and 'ReactiveArray' */
        function ReactiveObject(object) {
            if (!object) object = {};
            if (!(isObj(object))) return object;
            for(var key in object) {
                // If the property is already a reactive one, skip.
                if(!$propDescriptor(object, key).hasOwnProperty('value')) 
                    continue;
                
                var prop = object[key];
                new ReactiveProperty({
                    object: object,
                    property: key
                });

                if (typeof prop === 'object') {
                    if (isArray(prop)) {
                        new ReactiveArray({
                            object: object,
                            property: key
                        });
                        forEach(prop, function (item, key) {
                            new ReactiveProperty({ object: prop, property: key });
                            new ReactiveObject(item);
                        });
                    } else {
                        new ReactiveObject(prop);
                    }
                }
            }
            return object;
        }
        /** Helper Class that Binds a value to an element and/or element to a value and vice-versa */
        function Bind(config) {
            // The element to be bound
            this.el = config.el;
            // The object that will be in bind object (base object)
            this.layer = config.layer;
            // The object having the property that will be bound
            this.lastLayer = config.lastLayer;
            // The property to be bound
            this.property = config.property;
            // Allow two way data binding, by default is false
            this.two = config.two || false;
            var obj, callback, nodeName;

            if (!isNull(this.property)) {
                // One Way Data Binding
                // Avoiding twice binds
                if (!config.property.binds.findOne(function (bind) {
                        return bind.el === config.el;
                    })) {
                    // In case of * layer1.layer2.prop * -> lastLayer == layer2
                    // But, actually we need layer1, the base bound layer
                    obj = {
                        obj: this.layer,
                        el: this.el,
                        bind: this
                    };
                    this.property.binds.push(obj);
                }

                // Two Way Data Binding
                if ( this.two === true ) {
                    // Configuring the property
                    $propDefiner(this.el.$e.b, 'val',
                        $propDescriptor(this.lastLayer, this.property.property))
                    nodeName = this.el.nodeName;
                    // Node name resolver
                    var resolver = { 'TEXTAREA': 'INPUT', 'DIV' : 'INPUT' };
                    nodeName = resolver[nodeName] || nodeName; 
                    
                    callback = function () {
                        if (!config.el.$e || !config.el.$e.b)
                            return Easy.log('[Bad Definition], Data Binding was not configured in the element, please, ' +
                                'make sure that the element was compiled before binding.');
        
                        var bindConfig = config.el.$e.b;
                        var value = config.el[bindConfig.data];
                        if (!isNull(value) && value !== bindConfig.val) {
                            // Setting the bind config value
                            bindConfig.val = value;
                        }
                    }
                    
                    this.el.addEventListener(nodeName.toLowerCase(), callback, false);
                    this.el.addEventListener('propertychange', callback, false);
                    this.el.addEventListener('change', callback, false);
                }
            }

            this.destroy = function () {
                if (callback) {
                    delete this.el.$e.b;
                    this.el.removeEventListener(nodeName.toLowerCase(), callback, false);
                    this.el.removeEventListener('propertychange', callback, false);
                    this.el.removeEventListener('change', callback, false);
                }
                if (this.property.binds.indexOf(obj) > -1)
                    this.property.binds.remove(obj);
            }
        }
        /** Helper Class that Watch a property from the data */
        function Watch(options) {
            // The property to be bound
            this.property = options.property;
            // The function that will be called when property change
            this.callback = options.callback;
            var obj;
            if (!isNull(this.property)) {
                obj = {
                    property: this.property,
                    callback: this.callback
                };
                this.property.watches.push(obj);
            }

            this.destroy = function () {
                if (this.property.watches.indexOf(obj) > -1)
                    this.property.watches.remove(obj);
            }
        }
        /** Helper class that handle filter actions */
        function Filter(config) {
            // The element that will be linked this filter
            this.reference = undefined;
            var dec = config.dec, array = config.array;
            var filter = config.filter, $data = config.data;
            var watch, self = this;
            if (!filter) return { reference: undefined };

            var exp = filter.split(':');
            // For direct filter. Eg.: :name == 'something'
            if ((filter.indexOf(':') !== -1) && (trim(exp[0]) === '') && (trim(exp[1]) !== '')) {
                array.filtered = forEach(array.value, function (item, i) {
                    var obj = item;
                    // if it is primitive, define an object with a declatation variables
                    if (dec && !isObj(item)) {
                        obj = {};
                        // Cleaning the expression
                        obj[trim(dec.first)] = item;
                        if(dec.sec) obj[trim(dec.sec)] = i;
                    }
                    return fn.eval(exp[1], obj);
                });
                this.reference = config.actions.run(array.filtered || array.value);
            } else {
                var lastValue = array.value, filterType = 'global', condition;

                if ( (filter.indexOf(':') !== -1) ) {
                    filterType = 'targeted';
                } else {
                    var vtrim = trim(filter);
                    condition = $data.hasOwnProperty(vtrim) ? $data[vtrim] : $global[vtrim];
                    if (typeof condition === 'function') filterType = 'function';
                }
                // Executes the filter function
                function execute(value) {
                    if(isNull(value)) value = '';
                    config.actions.clean();
                    if (filterType === 'function') {
                        lastValue = condition.call($easy, array.value, value);
                    } else {
                        // Primitive type filter
                        lastValue = forEach(array.value, function (item) {
                            if (filterType === 'global') {
                                return item.hasValue(value.toLowerCase(), {
                                    ignoreCase: true,
                                    comp: 'match'
                                });
                            } else {
                                var res = false;
                                trim(exp[1]).split(',').findOne(function (p) {
                                    var val = fn.eval(p, item);
                                    if (!val) {
                                        Easy.log(error.invalid(val + ' in ' + p));
                                        return false;
                                    }
                                    // Converting to string and comparing
                                    return res = (val + '').toLowerCase().match(value.toLowerCase());
                                });
                                return res;
                            }
                        });
                    }
                    return config.actions.run(lastValue);
                }
                
                this.reference = execute($data[exp[0]]);
                // Watching the change of property in the filter
                watch = Watch.exec(exp[0], function (value) {
                    if (self.reference.isConnected === false)
                        return self.destroy(); // auto destroy if it does not exits;
                    execute(value);
                }, $data);
            }

            this.destroy = function () {
                if (watch) watch.destroy();
            }
        }
        /** Helper class that handle list order actions of an element */
        function OrderBy(config) {
            // The element that will be linked this filter
            this.reference = config.reference;
            this.elem = config.elem;
            this.array = config.array.value;
            this.data = config.data;
            this.attr = config.attr = fn.attr(config.elem, [vars.cmds.order]) ||
                        // Checking the attribute in the old attributes property
                        (config.elem.$e.$oldAttrs || []).findOne(function (at) {
                            return at.name === vars.cmds.order;
                        });

            if (!this.attr) return;
            // Defining com property to avoid the element to be removed
            // by the bind maintenance
            this.attr.com = this.reference;
            // Getting the delimiter if exists
            var fields = ui.getDelimiters(this.attr.value), exp, watches = [], self = this;
            
            this.order = function(array){
                exp = config.attr.value.split(':');
                return OrderBy.exec(array, exp[0], exp[1]);
            }

            if (fields.length) {
                Compiler.compile({
                    el: config.attr,
                    data: config.data
                });
                
                forEach(fields, function (f) {
                    // Watching the bound properties
                    watches.push(Watch.exec(f.exp, function () {
                        if (self.reference.isConnected === false)
                            return self.destroy(); // auto destroy if it does not exits
                        config.actions.run.call(self);
                    }, config.data));
                });
            } else{
                Compiler.addOldAttr({ el: this.attr, value: this.attr }); 
            }

            this.array = config.array.value = this.order(config.array.value);

            this.destroy = function () {
                forEach(watches, function (w) { w.destroy(); });
            }
        }
        /**
         * Helper Class that creates an event object
         * @param {String} type The type or name of the event
         * @param {HTMLElement} element The element that was attached the event
         */
        function EasyEvent(type, element, options) {
            var self = this;
            this.name = 'Easy event';
            this.type = type;
            this.base =  element;
            this.target = element;
            if (options) options.keys(function (k, v) { self[k] = v; });
        }
        
        /** Helper to handle the Routes. Dependencies: Easy, Includer */
        function RouteHandler(config) {
            this.currentRoute = null;
            this.routeView = config.el;
            this.routeView.removeAttribute('route-view');
            var msg = function(n, f, s) {
                return ({ message: 'It is not allowed to defined more than one '+ n +' page.' + 
                '\n  Please, choose between \''+ f +'\' and \''+ s +'\' in components definition.' });
            }
            var inc = config.includer;

            try {
                for (var key in inc.paths) {
                    var path = inc.paths[key];
                    if(path.isDefault === true) {
                        if(isNull(this.defaultPage))
                            this.defaultPage = path;
                        else throw ( msg('default', this.defaultPage.name, key) );
                    } else if (path.isNotFound === true) {
                        if(isNull(this.notFoundPage))
                            this.notFoundPage = path;
                        else throw ( msg('notFound', this.notFoundPage.name, key) );
                    }
                }
            } catch (error) {
                return Easy.log(error.message);
            }

            this.clear = function () {
                this.routeView.innerHTML = '';
            }
            this.getPath = function(url) {
                var $url = urlResolve(url);
                var value = inc.config.usehash === true ? $url.hash : $url.pathname; 
                value = value.split('?')[0]; // Clearing the queryStrings
                
                if ( value === '' || value === '/' )
                    return this.defaultPage;

                for (var key in inc.paths) {
                    var path = inc.paths[key];
                    if( path.route === value )
                        return path;
                }

                return this.notFoundPage;
            }
            this.navegate = function (url) {
                this.clear();
                var path = this.getPath(url);
                if (!path) return Easy.log('🛸 404 Page not found!!!');

                var el = doc.createElement('inc');
                el.valueIn('src', path.name);
                //el.valueIn('keep-alive', '');
                this.routeView.appendChild(el);
            }

            this.navegate(location.href);
            $global.addEventListener('hashchange', (function () {
                this.navegate(location.href);
            }).bind(this));
            
            RouteHandler.handleLink = function (a) {
                var cls = 'active-link';
                if (this.activeLink) 
                    this.activeLink.classList.remove(cls);
                
                this.activeLink = a;
                this.activeLink.classList.add(cls);
            }
            RouteHandler.navegate = this.navegate.bind(this);
        }
        //#endregion

        //#region Static functions
        /** Bind all the properties that was read */
        Bind.exec = function (elem, object, callback, options) {
            try {
                // Defining the getter to object in the dt
                getter = function (obj, prop) {
                    if (!options) options = {};
                    var config = {
                        el: elem,
                        layer: object,
                        lastLayer: obj,
                        property: prop
                    }
                    // Adding the options to the config
                    options.keys(function (k, v) { config[k] = v; });
                    // Binding the element
                    new Bind(config);
                }
                callback();
            } catch(error) {
                throw (error);
            } finally {
                unget(); // Destroying the stored function
            }
        }
        /** watch a property from data */
        prototype.watch = Watch.exec = function (prop, cb, object) {
            if (!object) object = $easy.data;
            if ( !object.hasOwnProperty(prop) ) return;
            var watch;
            // Defining the getter
            getter = function (_, prop) {
                watch = new Watch({
                    property: prop,
                    callback: cb
                });
            }; 
            var _ = object[prop];
            unget();
            return watch;
        }
        // Get listed array html elements from a comment
        ReactiveArray.retrieveElems = function (comment, remove) {
            if (!comment) return [];
            if (isNull(remove)) remove = false;
            var elems = [], current = comment.previousElementSibling;
            while(current) {
                if (current && isNull(current.aId) && comment.$id !== current.aId)
                    break;
                elems.unshift(current);
                current = current.previousElementSibling;
            }

            if (remove === true) 
                forEach(elems, function (remove) {
                    remove.aboveMe().removeChild(remove);
                });
            return elems;
        }
        /** Order an array. type -> asc , des  */
        OrderBy.exec = function (array, type, prop) {
            if (!type) type = 'asc';
            return array.sort(function (a, b) {
                function comp(asc, des) {
                    if (isNull(asc) || isNull(des)) {
                        return 0;
                    }
                    switch(type.toLowerCase()) {
                        case 'asc': return asc ? 1 : -1;
                        case 'des': return des ? -1 : 1;
                        default: 
                            Easy.log('\''+ type +'\' is invalid type of order by. Avaliable types are: ' +
                                '\'asc\' for order ascendent and \'des\' for order descendent.');
                            return 0;
                    }
                }
                
                if (!prop) return comp(a > b, b < a);
                else return comp(a[prop] > b[prop], b[prop] < a[prop]);
            });
        }
        /** Initialize and handle an easy event */ 
        EasyEvent.emit = function (options) {
            var type = options.type,
                name = 'on:' + type,
                event = new EasyEvent(type, options.elem, {
                data: { $model: options.model, $scope: options.scope },
                result: options.result
            });

            if(!options.elem.hasAttribute(name)) return;
            var attr = fn.attr(options.elem, [ name ], true);
            Compiler.addOldAttr({ el: options.elem, value: attr });      
            var eventDesc = $propDescriptor($global, 'event'); 
            // Defining to the global object
            $propTransfer($global, { event: event }, 'event');        
            // Calling the function, it is evaluated based on $model data not the scope
            fn.eval("if (typeof (" + attr.value + ") === 'function') " +
                attr.value + ".apply(this, arguments);", options.scope || {}, false, [event]);

            // Defining the old value in the global object
            $propDefiner($global, 'event', eventDesc);
        }
        Compiler.setDefault = function(config) {
            var attr = config.attr;
            if (!attr._name) {
                attr._name = attr.nodeName;
            }
            if (!attr.$e.$oldValue) {
                attr.$e.$oldValue = attr.nodeValue;
            }
        }
        Compiler.addOldAttr = function(config) {
            setEasy(config.el);
            var el = config.el,
                value = config.value;
            if (!el.$e.$oldAttrs) {
                el.$e.$oldAttrs = [ value ];
            } else {
                if (el.$e.$oldAttrs.findOne(function (x) { return x == value; }))
                    return value;
                el.$e.$oldAttrs.push(value);
            }
        }
        Compiler.setValue = function(obj) {
            // Binding and setting the value in the element
            // Only the primitives and objects are bindable
            var data = extend.obj(obj.scope, obj.methods), $return;
            Bind.exec(obj.current, obj.scope, function () {
                $return = ui.setElemValue(obj.current, data);
            });
            return $return;
        }
        Compiler.getUpData = function(el) {
            do {
                if(!el.$e) continue;
                var curr = el.$e.data
                if(typeof curr === 'function')
                    return extend.obj( curr() );
            } while(el = el.parentNode)
        }
        //#endregion

        try {
            // Setting the begin data
            this.setData(options.data);
            this.data = options.data;
            // Initializing easy animation css
            this.css();

            function $$init(){
                // Defining the root elem
                this.el = doc.node($elSelector || '');
                // Checking if the app element is set
                if (!this.el)
                    return Easy.log('Element with selector \''+ $elSelector +'\' not found, please check it.');

                options.mounted.call(this, this.el);
                Compiler.compile({
                    el: $easy.el,
                    data: $easy.data,
                    done: function () {
                        options.loaded.call($easy, $easy.el);
                        // Setting the ui observer
                        ui.observer.mutation(function (elem) {
                            Compiler.compile({
                                el: elem,
                                data: Compiler.getUpData(elem)
                            });
                        }).observe($easy.el, {
                            childList: true,
                            subtree: true,
                        });
                    }
                });
                // Initialize routes if needed
                var rv = this.el.node('[route-view]');
                if(rv){
                    new RouteHandler({
                        el: rv, 
                        includer: inc
                    });
                }
            }
    
            if ( options.config.useDOMLoadEvent )
                doc.addEventListener('DOMContentLoaded', $$init.bind(this), false);
            else 
                $$init.call(this);
        } catch(error) {
            Easy.log({ msg: 'Error while initializing. Description: ' + error.message, error: error });
        }
    }
    return Easy;
})));
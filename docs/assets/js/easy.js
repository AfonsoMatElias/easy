/**
 * Easy.js @version v2.3.0 Release
 * Released under the MIT License.
 * (c) 2019 @author Afonso Matumona
 */
(function(global, factory){
    (typeof exports === 'object' && typeof module !== 'undefined') ? module.exports = factory() :
    (typeof define === 'function' && define.amd) ? define(factory) : (global.Easy = factory());
}(window, (function(){ 'use strict';
    // Shared variables
    var standardEvents = {}, 
        eventModifiers = {
            'stoppropagation': 'stopPropagation', 
            'preventdefault': 'preventDefault' 
        };
    // methods to observe
    var methods = [ 'push', 'pop', 'unshift', 'shift', 'splice' ];
    var getter, $global = window, doc = $global.document;

    // Helper variables to resolve url issues, based on Angular.js version 1.7.9
    var urlParsingNode = doc.createElement('a');
    urlParsingNode.href = 'http://[::1]';
    var ipv6InBrackets = urlParsingNode.hostname === '[::1]';
    
    // Get all default events registed in the DOM Elements
    for ( var key in doc.createElement('input') ) {
        if( key[0] + key[1] === 'on' )
            standardEvents[key.substr(2)] = true;
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
            reverse: function (value) {
                switch (value) {
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
            compiled: 'compiled',
            add: 'add',
            empty: 'empty',
            response: 'response', 
            fail: 'fail',
            data: 'data' 
        }
    }
    // Error messages
    var error = {
        delimiter: function (v) {return "The command '"+ v +"' cannot contain a delimiter in " +
             "expression value... The value is compiled without a delimiter." },
        conn: function () {
            return "It seems that there is not any easy connector available. " +
                "Please make sure easy.[ajax|free|something].js is imported.";
        },
        invalid: function (v) { return "Invalid value" + (v ? ' ' + v : '') + "." },
        elem: function (v) { return "The selector or object passed for '" + v + "' is invalid, please check it." }
    }
    // Join objects. Can be used as object/array copier 
    var extend = {
        /** join objects into one */
        obj: function () {
            var out = {};
            arguments.keys(function (_, value) {
                if (isNull(value)) return;
                value.keys(function (prop) {
                    $propTransfer(out, value, prop);
                });
            });
            return out;
        },
        /** Add properties to the first object extracting from the next arguments */
        addToObj: function (destination) {
            arguments.keys(function (idx, value) {
                if (idx == 0) return;
                if (isNull(value)) return; 
                value.keys(function (prop) {
                    $propTransfer(destination, value, prop);
                });
            });
            return destination;
        },
        /** join arrays into one */
        array: function () {
            var out = [];
            arguments.keys(function (_, v) {
                if (isNull(v)) return;
                if (isArray(v)) 
                    [].push.apply(out, v);
                else
                    out.push(v);
            });
            return out;
        }
    }

    function unget() { getter = undefined; }
    function $objDesigner(obj, options) {
        if (!obj) obj = {};
        if (!options) options = {};
        options.keys(function (key, value) {
            if (isNull(obj[key])) obj[key] = value;
        });
        return obj;
    }
    function $propTransfer(dest, src, name) {
        $propDefiner(dest, name, $propDescriptor(src, name));
    }
    function $propDefiner(obj, prop, desc) {
        Object.defineProperty(obj, prop, desc); return obj;
    }
    function $propDescriptor(obj, prop, withConfig) {
        if (!withConfig)
            return Object.getOwnPropertyDescriptor(obj, prop); 

        var args; getter = function () { args = arguments; }
        var _ = obj[prop]; unget();
        return {
            descriptor: Object.getOwnPropertyDescriptor(obj, prop),
            config: args ? args[1] : null 
        };
    }
    function isObj(value) {
        return value instanceof Object; 
    }
    function isArray(value) {
        return Array.isArray(value); 
    }
    function isNull(value) {
        return (typeof value === 'undefined') || (value === undefined || value === null);
    }
    function isString(value) {
        return (typeof value !== 'undefined') && (typeof value === 'string');
    }
    function isEmptyObj(obj) {
        if(!obj) return true;
        return obj.keys().length === 0;
    }
    function toArray(obj, callback, context) {
        if (!obj) return [];
        var array = [].slice.call(obj);
        if (callback) forEach(array, callback, context);
        return array;
    }
    function toStr(value) { 
        return value ? value + '' : ''; 
    }
    function forEach(obj, callback, context) {
        // Array iterator
        if (!obj || !obj.length) return [];

        var len = obj.length, index, result = [];
        for(index = 0; index < len; index++) {
            if (callback.call(context, obj[index], index))
                result.push(obj[index]);
        }
        return result;
    }
    function trim(value) {
        return value ? value.trim() : value; 
    }
    function easyProperty(el) {
        // Sets $easy property in a element where will be stored configurations used by easy
        if ( !el.$e ) el.$e = {};
        return el;
    }
    function extractor(obj, name) {
        // Extracts and generate a new object having only value of the extraction type  
        var out = {};     
        if (obj) obj.keys(function(key, value) {
            if (typeof value === name) out[key] = value;
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

        var $return = {
            href: urlParsingNode.href,
            protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
            host: urlParsingNode.host,
            search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
            hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
            hostname: hostname,
            port: urlParsingNode.port,
            pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname : '/' + urlParsingNode.pathname,
            anchor: urlParsingNode
        };

        $return.origin = $return.protocol + '://' + $return.host;
        $return.hrefb = (function(url){
            if (!url) return urlParsingNode.baseURI;            
            return urlParsingNode.baseURI + 
                   urlParsingNode.href.substr(urlParsingNode.origin.length + 1);
          })($return.href)
          
        return $return;
    }
    function toElement(str) {
        if (isNull(str)) return null;
        var temp = doc.createElement('body');
        temp.innerHTML = str;
        return temp.children[0];
    }

    // Adding the extensions
    (function () {
        if ( !isNull(Node.prototype.node) ) return;
        // Extension definer
        function def(key, callback, type) {
            $propDefiner((type || Object).prototype, key, { value: callback });
        }
        // Query one element
        def('node', function (value) {
            if (!value) return null;
            return (value[0] === '#' && this.getElementById ? this.getElementById(value.substr(1)) : this.querySelector(value));
        }, Node);
        // Query many elements
        def('nodes', function (value) {
            if (!value) return null;
            return toArray(this.querySelectorAll(value));
        }, Node);
        // get key of an object
        def('keys', function (callback) {
            var self = this;
            var array = Object.keys(self);
            // Calling the callback if it needs
            if (callback && typeof callback === 'function') forEach(array, function (key) { callback(key, self[key]); });
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
                        self[key].mapObj(value, deep);
                } else {
                    var source = (!isNull(value) ? value : self[key]);
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
                tester.innerHTML = $node.outerHTML;
                
                if ( $node.nodeName === tester.nodeName )
                    tester.innerHTML = '';
                else 
                    tester.children[0].innerHTML = '';

                if ( !isNull(tester.querySelector(selector)) )
                    return $node;
                else if ( $node.nodeName === tester.nodeName )
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
                switch (options.comp) {
                    case 'match': return s1.match(s2)
                    case 'equal': return s1 === s2;
                }
            }
            // Finding any property that matches the input value
            if (isObj(self))
                res = self.keys().findOne(function (key) {
                    return check(self[key], value);
                });
            else
                res = check(self, value);

            return isNull(res) ? false : true;
        });
        // Gets any object inn the array that matches the value
        def('get', function (value) {
            var self = this;
            // Finding the object that matches a value or index
            return self.findOne(function (item) {
                return item === value || (isObj(item) ? item.hasValue(value) : false);
            }) || (Number.isInteger(value) || isString(value) ? self[value] : null);
        }, Array);
        // Gets any object that matches the value
        def('findOne', function (cb) {
            var self = this, len = self.length, result;
        for(var i = 0; i < len; i++) {
                if (cb(self[i], i)) {
                    result = self[i];
                    break;
                }
            }
            return result;
        }, Array);
        // Get the index of an object
        def('index', function (value) {
            var index = this.indexOf(value);
            if (index === -1)
                this.findOne(function (item, $index) {
                    if ((item === value || item.hasValue(value))) {
                        index = $index;
                        return true;
                    }
                    return false;
                });
            return index;
        }, Array);
        // Get the index of all the ocurrencies of an object
        def('indexes', function (value, callback) {
            var array = [];
            // Finding the object that matches a the value
            forEach(this, function (item, index) {
                if ((item === value || item.hasValue(value)))
                    array.push(index);
            });
            // Calling the callback if it needs
            if (callback) forEach(array, function (item) {
                callback(item);
            });
            return array;
        }, Array);
        // Remove element(s) from an array
        def('remove', function (value, allWith) {
            try {
                if (isNull(allWith)) allWith = false;
                // Handling the default pop function if the value is not defined
                if (!value && value !== 0) {
                    this.pop();
                } else {
                    // Otherwise, Handling the costumized remove function
                    // Removing all objects with this value
                    if (allWith === true) {
                        extend.array(this).indexes(value, function (i) {
                            this.splice(i, 1);
                        });
                    } else{
                        var index = this.index(value);
                        if (index === -1) {
                            if (Number.isInteger(value * 1))
                                index = value * 1;
                        }
                        this.splice(index, 1);
                    }
                }
            }catch(error){
                Easy.log({ message: '[InternalError]: Remove function error. ' + error.message, error: error });
            }
            return this;
        }, Array);
        // The main animation function for the extension
        function niceAnimatiomFunctionShared(elem, direction, key) {
            var anm = vars.anm, keyNormalized = key.toLowerCase().split(':');
            var keyIn = keyNormalized[0];

            anm['to'].keys(function (k, v) {
                elem.classList.remove(v);
            });
            anm['from'].keys(function (k, v) {
                elem.classList.remove(v);
            });

            elem.classList.add(anm[direction][keyIn]);
            return keyNormalized[1] || anm.reverse(keyIn);
        }
        // Execute the nice in animation into an element
        def('niceIn', function (key, outElem, callback, delay) {
            var self = this;
            if (isNull(delay)) delay = 100;
            // Executing the main function
            var keyOut = niceAnimatiomFunctionShared(self, 'to', key);
            if (outElem) outElem.niceOut(keyOut);
            // Executing the callback
            setTimeout(function () {
                if (callback) callback(self, outElem);
            }, delay);
        }, HTMLElement);
        // Adds the nice out animation into an element
        def('niceOut', function (key, inElem, callback, delay) {
            var self = this;
            if (isNull(delay)) delay = 100;
            // Executing the main function
            var keyOut = niceAnimatiomFunctionShared(self, 'from', key);
            if (inElem) inElem.niceIn(keyOut);
            // Executing the callback
            setTimeout(function () {
                if (callback) callback(self, inElem);
            }, delay);
        }, HTMLElement);
        // Generate element description. eg.: form#some-id.class1.class2
        def('desc', function () {
            var self = this;
            if (!self.nodeName) return self.toString();
            return extend.array(self.nodeName.toLowerCase(), (self.id ? '#' + self.id : ''),
                toArray(self.classList).map(function (cls) {
                    return '.' + cls;
                })).join('')
        }, Element);
        // Adds Event listener in an object or a list of it
        def('listen', function (name, cb) {
            var elems = isArray(this) ? this : [this], result = [];
            forEach(elems, function (elem) {
                // Checking if the element is valid
                if (!(elem instanceof Node) && (elem !== $global))
                    return Easy.log("[BadDefinition]: Cannot apply '" + name + "'to the element" + elem.desc() + ".")
                // Event object
                var evt = {
                    event: name,
                    fnCallback: cb,
                    callback: function () {
                        // base property where will be passed the main event element.
                        arguments[0]['base'] = elem;
                        evt.fnCallback.apply(evt.fnCallback, arguments);
                    },
                    options: false
                }
                elem.addEventListener(evt.event, evt.callback, evt.options);
                result.push({
                    el: elem,
                    event: name,
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
                var strLen = str.length, oldLen = _old_.length, out = '';;
                for(var i = 0; i < strLen; i++) {
                    if (str[i] === _old_[0] && str.substr(i, oldLen) === _old_) {
                        out += _new_;
                        i += oldLen - 1;
                    } else {
                        out += str[i];
                    }
                }
                return out;
            }

            if (!isArray(oldValue))
                self = replace(self, oldValue, newValue);
            else
                forEach(oldValue, function (seq) {
                    self = replace(self, seq, newValue);
                });

            return self;
        }, String);
        
        if( isNull(String.prototype.startsWith) ) {
            // Helper to check if a string starts with some str
            def('startsWith', function (value) {
                return (this.substr(0, value.length) === value);
            }, String);
            // Helper to check if a string ends with some str
            def('endsWith', function (value) {
                return (this.substr(this.length - value.length) === value);
            }, String);
            // Helper to check if a string includes a sequence
            def('includes', function (value) {
                for(var i = 0; i < this.length; i++)
                    if(this.substr(i, value.length) === value)
                        return true;
                return false;
            }, String);

        }
        // Helper to clear the skeleton(s) with identifier
        def('clearSkeleton', function (id) {
            var self = this, attr = '[e-skeleton="'+ id +'"]';
            self.removeAttribute('e-skeleton');
            if (self.nodes) forEach(self.nodes(attr), function (el) {
                el.removeAttribute('e-skeleton');
            });
        }, Element);
    })();
    
    // Classes for Browsers compatibility
    if (typeof Promise === 'undefined') {
        /** Represents the completion of an asynchronous operation. by easy.js */
        $global.Promise = function (promise) {
            var self = this;
            this.status = 'pending';
            this.WARN = 'Do not \'await\' this promise, it does not support await keyword.';
            var thens = [], catches = [], finallies = [];

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
    $global.UrlParams = function(url) {
        if (!url) url = location.href;
        var compare = arguments[1];
        if ( compare && isString(compare) ) {
            // Building from url
            var $url = url.split('/').reverse();
            if ($url[0] === '') $url.shift();
            var $compare = compare.split('/').reverse();
            forEach($compare, (function(value, index) {
                if (value[0] === ':')
                    this[value.substr(1)] = $url[index];     
            }).bind(this));
        } else {
            // Building from query string
            var queryStr = url.split('?')[1];
            if (!queryStr) return this;
            var keys = queryStr.split('&');
            forEach(keys, (function(key) {
                var pair = key.split('=');
                this[pair[0]] = (pair[1] || '').split('#')[0]
            }).bind(this));
        }
    }
    /**
     * A mimic of fetch api for browsers compatibilities
     * Note: it was based on angular.js version 1.7.9
     */
    function http(url, options) {
        if (!url) return Easy.log('[BadDefinition]: Invalid url');

        function createXhr(method) {
            if (doc.documentMode && (!method.match(/^(get|post|head|put|delete|options)$/i) || !window.XMLHttpRequest)) {
                return new window.ActiveXObject("Microsoft.XMLHTTP");
            } else if (window.XMLHttpRequest) {
                return new window.XMLHttpRequest();
            }
            throw ({ message: "This browser does not support XMLHttpRequest." });
        }

        var self = {}, abortedByTimeout = false;
        (options || {}).keys(function (key, value) { self[key] = value; });

        // Setting the default method as get
        self.method ? self.method : 'get';
        var xhr = createXhr(self.method);

        self.url = url;
        // If timeout is not defined use the default 2 minute
        self.timeout = self.timeout || 120000;

        return new Promise(function (resolve, reject) {
            xhr.open(self.method, self.url, self.async || true);
            xhr.timeout = self.timeout; 

            (options.headers || {}).keys(function (key, value) {
                if (value) xhr.setRequestHeader(key, value);
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

            var completeRequest = function (status, response, headersString, statusText, xhrStatus) {
                xhr = null;
                self.response = response;
                self.responseHeaders = headersString;
                self.statusText = statusText;
                self.statusMessage = xhrStatus;
                
                resolve(self);
            }

            xhr.onerror = function () {
                completeRequest(-1, null, null, '', 'error');
            }

            xhr.onabort = function () {
                completeRequest(-1, null, null, '', abortedByTimeout ? 'timeout' : 'abort');
            }

            xhr.ontimeout = function () {
                completeRequest(-1, null, null, '', 'timeout');
            }

            // (self.eventHandlers || {}).keys(function (key, value) {
            //     if (value) xhr.addEventListener(key, value);
            // });
            
            // (self.uploadEventHandlers || {}).keys(function (key, value) {
            //     if (value) xhr.addEventListener(key, value);
            // });

            if (self.withCredentials)
                xhr.withCredentials = true;

            self.type = self.type || '';

            try {
                xhr.responseType = self.type;
            } catch (err) {
                if (self.type !== 'json') throw err;
            }
            
            xhr.send(options.body || null);
            return self;
        });
    }
    function Easy($elSelector, options) {
        if ( !(this instanceof Easy) ){
            Easy.log('[BadDefinition]: Easy is a constructor and should be called with the \'new\' keyword.');
            return this;
        }

        this.name = 'Easy';
        this.version = '2.3.0';
        this.data = {};
        this.dependencies = {};
        var $easy = this, exposed = { /* Store the exposed datas */ },
            webDataRequests = { /* Store web requests data */ }, 
            customEvents = { /* Store 'app.on' events */ }, 
            waitedData = { /* Waited data tracker */ }, 
            componentConfig = {}, skeletonConfig = { background: '#E2E2E2' , wave: '#ffffff5d' },
            functionManager = new Func();

        var prototype = Object.create(Easy.prototype);
        this.__proto__ = prototype;
        // NOREACTIVE: Allow to skip this object when caught in reactive transformation process 
        this.__proto__.NOREACTIVE = true;

        var $$delimiters = [
            { name: 'easy', delimiter: { open: '-e-', close: '-' } }, 
            { name: 'common', delimiter: { open: '{{', close: '}}' } },
            { name: 'html', delimiter: { open: '{html{', close: '}}' } },
        ];// Default delimiters

        // Setting the default values in options
        options = $objDesigner(options, { 
            config:{}, data:{}, components:{}, mounted: functionManager.empty, loaded: functionManager.empty, dependencies: [] 
        });
        options.data = $objDesigner(options.data, {});
        options.components = $objDesigner(options.components, { 
            elements:{}, config:{} 
        });
        options.components.config = $objDesigner(options.components.config, { 
            usehash: true, keepData: false, preload: false 
        });
        options.config = $objDesigner(options.config, { 
            deepIgnore: false, rerenderOnArrayChange: false, log: true, useDOMLoadEvent: true, 
            skeleton: { background: '#E2E2E2' , wave: '#ffffff5d' } 
        });
                                        
        skeletonConfig = extend.obj(options.config.skeleton);
        componentConfig = options.components.config;
        this.delimiters = Object.freeze($$delimiters);
        this.options = options;

        /** Easy Logger */
        Easy.log = function (log, type) {
            if (!type) type = 'error';
            if ( $easy.options.config.log ) console[type]('[Easy '+ type +']', EasyLog(log, type));
            if ( !isNull($easy.emit) ) $easy.emit('log', { type: type, message: log });
            return log;
        }
        
        if (!isNull(options.components.config.base))
            Easy.log('The property component.config.`base` is deprecated, use only the <base href="..."/> element at the top of the <head> children.', 'warn');

        var uiHandler = new UIHandler({
            $$delimiters: $$delimiters.slice(),
            $handleWatches: []
        });
        var includerManager = new Includer(options.components.elements, componentConfig);

        /**
         * Creates an obj (if form is a selector) and send it to the available connector
         * @param {String} path The URL endpoint
         * @param {HTMLElement} form The html element or selector
         */
        prototype.create = function (path, form) {
            try {
                var connector = this.dependencies['Connector'];
                if (isNull(connector)) throw ({ message: error.conn() });
                
                var obj = $easy.toJsObj(form);
                if (!obj) throw ({ message: error.elem('create') });
                return connector.conn.add(path, obj);
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
                var connector = this.dependencies['Connector'];
                if (isNull(connector)) throw ({ message: error.conn() });

                var obj = $easy.toJsObj(form);
                if (!obj) throw ({ message: error.elem('updated') });
                return connector.conn.update(path, obj, id);
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
                var connector = this.dependencies['Connector'];
                if (isNull(connector)) throw ({ message: error.conn() });
                if (!id) throw ({ message: error.invalid('id') });

                return connector.conn.remove(path, id); 
            } catch(error) {
                return Promise.reject($easy.return(false, Easy.log(error), null));
            }
        }
        /**
         * Get all from a path
         * @param {String} path The URL endpoint
         * @param {String} extra (optional) Some extra string that will be added to the path
         */
        prototype.get = function (path, extra) {
            try {
                var connector = this.dependencies['Connector'];
                if (isNull(connector)) throw ({ message: error.conn() });
                
                return connector.conn.list(path, extra);
            } catch(error) {
                return Promise.reject($easy.return(false, Easy.log(error), null));
            }
        }
        /**
         * getOne obj from a source
         * @param {string} path The URL endpoint
         * @param {string} id The Id of the object
         */
        prototype.getOne = function (path, id) {
            try {
                var connector = this.dependencies['Connector'];
                if (isNull(connector)) throw ({ message: error.conn() });

                return connector.conn.getOne(path, id);
            } catch(error) {
                return Promise.reject($easy.return(false, Easy.log(error), null));
            }
        }
        /**
         * Perform the read function
         */
        prototype.read = prototype.get;

        /**
         * Generates a Javascript Object from a HTML Element
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

            if (!onset) onset = functionManager.empty;
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
                Easy.log('[NotFound]: Element passed in app.toJsObj(...) was not found.');
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

            function objBuilder(element) {
                var obj = {};
                // Elements that skipped on serialization process
                var escapes = { BUTTON: true };
                var checkables = { checkbox: true, radio: true };
                // Try to get value from the element
                function tryGetValue($el) {
                    var val = null;
                    mValues.findOne(function (value) {
                        return (val = $el.valueIn(value)) ? true : false;
                    });
                    return val;
                }

                (function walker(el) {
                    var attr = functionManager.attr(el, mNames);
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
                                obj[name] = [ value ];
                        }
                        // Calling on set function
                        onset(obj, name, value, el);
                    }
                    toArray(el.children, function (child) {
                        if (!functionManager.attr(child, [cmd])) walker(child);
                    });
                })(element);
                return obj;
            }

            // Building the base object
            var obj = objBuilder(elem);
            // Getting the builds
            var builds = elem.nodes('['+cmd+']');

            forEach(builds, function ($build) {
                // Getting the e-build attr value
                var fullPath = $build.valueIn(cmd);
                var isarray = $build.hasAttribute(vars.cmds.array);
                var value = objBuilder($build);

                if (isEmptyObj(value)) return;

                (function objStructurer(remainPath, lastLayer) {
                    var splittedPath = remainPath.split('.');
                    var part = splittedPath[0];
                    splittedPath.shift();

                    var propertyValue = lastLayer[part];

                    if (isNull(propertyValue))
                        lastLayer[part] = {};

                    // If it's the last part
                    if (splittedPath.length === 0) {
                        if (!isarray) {
                            // Handle Object
                            if (isNull(propertyValue))
                                lastLayer[part] = value;
                            else
                                // Build array if the object already exists
                                lastLayer[part] = extend.array( (isEmptyObj(propertyValue) ? null : propertyValue), value);
                        } else {
                            // Handle Array
                            if ( isObj(propertyValue) && !isEmptyObj(propertyValue)) {
                                lastLayer[part] = [ extend.obj(propertyValue, value) ];
                            } else if ( isArray(propertyValue) ) {
                                propertyValue.push(value);
                            } else {
                                lastLayer[part] = [ value ];
                            }
                        }
                        return onset(lastLayer, part, value, $build);
                    }

                    if (isArray(propertyValue)) {
                        return forEach(propertyValue, function (item) {
                            objStructurer(splittedPath.join('.'), item);
                        });
                    }

                    objStructurer(splittedPath.join('.'), lastLayer[part]);
                })(fullPath, obj);
            });

            return obj;
        }
        // Helper to add easy css in the DOM
        prototype.css = function (isReplace) {
            var current = doc.node('[e-style="true"]'); 
            if ( current && isReplace !== true ) return;

            var style = doc.createElement("style");
            style.valueIn('e-style', 'true');

            var vals = { distance: 12, opacity: 6, duration: 0.35 }
            // Creates to- animation body
            var toAnim = function (n, dir) {
                return "transform: translate" + dir + "; -webkit-transform: translate" + dir + "; animation:" +
                    n + " " + vals.duration + "s ease-out forwards; -webkit-animation:" + n + " " + vals.duration + "s ease-out forwards;";
            }
            // Creates from- animation body
            var fromAnim = function (n) {
                return "animation:" + n + " " + vals.duration + "s ease-out forwards; -webkit-animation: " + n + " " + vals.duration + "s ease-out forwards;";
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
                ".to-top {" + toAnim('to-top', 'Y(' + vals.distance + '%)') + " }" +
                ".to-bottom { " + toAnim('to-bottom', 'Y(-' + vals.distance + '%)') + " }" +
                ".to-right { " + toAnim('to-right', 'X(-' + vals.distance + '%)') + " }" +
                ".to-left { " + toAnim('to-right', 'X(' + vals.distance + '%)') + " }" +
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
                "@" + keyframes('from-top', 'Y(' + vals.distance + '%)') +
                "@" + keyframes('from-bottom', 'Y(-' + vals.distance + '%)') +
                "@" + keyframes('from-right', 'X(-' + vals.distance + '%)') +
                "@" + keyframes('from-left', 'X(' + vals.distance + '%)') +
                "@-webkit-" + keyframes('from-top', 'Y(' + vals.distance + '%)') +
                "@-webkit-" + keyframes('from-bottom', 'Y(-' + vals.distance + '%)') +
                "@-webkit-" + keyframes('from-right', 'X(-' + vals.distance + '%)') +
                "@-webkit-" + keyframes('from-left', 'X(' + vals.distance + '%)') + 
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

            if (isReplace === true) 
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
                var pos = Math.floor(Math.random() * alpha.length);
                result += lower ? alpha[pos].toLowerCase() : alpha[pos];
                lower = !lower;
            }
            return result;
        }
        /** Sets values in the data */
        prototype.setData = function (input, target) {
            if (isNull(input)) return;
            if (isNull(target)) target = $easy.data;
            var inputReactive = new ReactiveObject(input);
            input.keys(function (key) {
                var srcDescriptor = $propDescriptor(inputReactive, key, true);
                var destDescriptor = $propDescriptor(target, key, true);
                
                if ( srcDescriptor.config && destDescriptor.config )
                {
                    var dstConfig = destDescriptor.config;
                    var srcConfig = srcDescriptor.config;
                    [].push.apply(dstConfig.binds, srcConfig.binds);
                    [].push.apply(dstConfig.watches, srcConfig.watches);

                    function distinct(value, index, array) {
                        return array.indexOf(value) === index;
                    }
                    
                    dstConfig.binds = dstConfig.binds.filter(distinct);
                    dstConfig.watches = dstConfig.watches.filter(distinct);
                } else {
                    $propTransfer(target, inputReactive, key);
                }

                target[key] = inputReactive[key]; // Updates the UI already
            }); 
            return target;
        }
        /** Exposes data to be retrived anywhere */
        prototype.expose = function(name, data, force) {
            if (isArray(data) || !isObj(data)) 
                return Easy.log('[BadDefinition]: Invalid data, only Object (non Array one) can be exposed, ' +
                            'try to wrap it into an object literal!. Eg.: { myData: data }.');
            var elements = waitedData[name];
            if( !isNull(elements) ) {
                delete waitedData[name];
                return forEach(elements, function (el) {
                    var $data = new ReactiveObject(data);
                    $data.$scope = extend.obj(Compiler.getUpData(el));
                    Compiler.compile({
                        el: el,
                        data: extend.addToObj($data, extractor($data.$scope, 'function')) 
                    });
                });
            }
            
            if (exposed[name] && (isNull(force) || force === false))return;

            exposed[name] = function() {
                var $data = data;
                return function() { return $data; }
            }
        }
        /** Retrieve the exposed data */
        prototype.retrieve = function(name, remove) {
            var fun = exposed[name], $data;
            if (fun) {
                $data = fun.call(null).call(null);
                if (!isNull(remove) && remove === true)
                    delete exposed[name];
            }
            return $data;
        }
        /** Get web request value made in e-req, e-tmp, e-fill */
        prototype.request = function (code, callback) {
            if (!callback) return Easy.log('[Request]: Define a callback in second parameter to get the request.');
            var req = webDataRequests[code];
            if(req) {
                callback(req);
                return;
            }
            webDataRequests.keys(function(_, value) {
                if(value.$code === code || value.$url === code){
                    return callback(value);
                } 
            });
        }
        prototype.on = function (evt, callback) {
            if (evt.startsWith('inc')) {
                var incEventContainer = evt.substr('inc'.length).toLowerCase();
                includerManager[incEventContainer].push(callback);
            } else {
                var obj = customEvents[evt];
                if (!obj) customEvents[evt] = [ callback ];
                else obj.push(callback);
            }
            return { event: evt, callback: callback };
        }
        prototype.off = function (evt, callback) {
            if (evt.startsWith('inc')) {
                var incEventContainer = evt.substr('inc'.length).toLowerCase();
                includerManager[incEventContainer].remove(callback);
            } else {
                var obj = customEvents[evt]; 
                if (obj) obj.remove(callback);
            }
            return { event: evt, callback: callback };
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
                    if (isArray(value)) return Easy.log('[BadDefinition]: Invalid object');

                    if (isObj(value) || isNull(value))
                        value = $objDesigner(value, {
                            background: $easy.options.config.skeleton.background,
                            wave: $easy.options.config.skeleton.wave
                        });
                    
                    if (value.keys === 'undefined') return Easy.log('[BadDefinition]: Invalid object');
                    value.keys(function (key, value) { skeletonConfig[key] = value; });
                    return $easy.css(true);                
                } case 'delimiter': {

                    if( isNull(value) || !trim(value.name) || 
                      ( isNull(value.delimiter) || 
                        !trim(value.delimiter.open) || 
                        !trim(value.delimiter.close) ) ) {
                        return Easy.log('[BadDefinition]: Invalid object, check if the object has this structure and has valid values: ' + 
                                        '\n{ name: \'...\', delimiter: { open: \'...\', close: \'...\' } }');
                    }

                    uiHandler.$$delimiters.push(value);
                    return $easy.delimiters = Object.freeze(uiHandler.$$delimiters);
                } default: break;
            }
        }
        prototype.components = {
            add: includerManager.setComponent.bind(includerManager),
            get: function (name) {
                var path = checkIncPath(name);
                if( isNull(path) ) return;
                var res = extend.obj( path );
                delete res.restrictions;
                return res;
            },
            restrictions: {
                add: function (name, restrs) {
                    if( !isArray(restrs) ) {
                        Easy.log('[BadDefinition]: ' + error.invalid() + ' Try an array!'); 
                        return; 
                    } 
                    var path = checkIncPath(name);
                    if( isNull(path) ) return;
                    includerManager.skipNoFunction(restrs, name);
                    return path.restrictions.push.apply(path.restrictions, restrs);
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
            if (typeof fun !== 'function') {
                Easy.log('[BadDefinition]: this.reactive function expects a function as parameter.');
                return;
            }
            var obj = {}; // Creates an object with all properties reactive
            getter = function(_, prop) {
                Object.defineProperty(obj, prop.property, prop.descriptor);
            }

            var $return = fun.call($easy); unget();
            if ( !isObj($return) ) return;

            // Adding missing properties that is the primitives
            $return.keys(function (key, value) {
                if (!obj.hasOwnProperty(key))
                    obj[key] = value;
            });
            
            // Removing all the exceeded properties 
            obj.keys(function (key) {
                if ( !$return.hasOwnProperty(key) && key !== '$scope' )
                    delete obj[key];
            });

            new ReactiveObject(obj);
            return obj;
        }
        prototype.compile = Compiler.compile = function (config) {
            var $$el = config.el;
            var $$data = config.data;
            var $$scope = $$data;
            // Extracting all the functions from the data prop
            var $$methods = extractor($$data, 'function');
            var cmds = vars.cmds;

            if (!$$el) return Easy.log('[BadDefinition]: Invalid element passed in the compiler');
            easyProperty($$el);

            function includerHandler($config) {
                var el = $config.el;
                var $scope = extend.obj($config.$scope);
                var $name = el.nodeName;
                var base = $name == 'INC' ? el : el.$e.$base;
                var source = includerManager.src(base);

                base.$$data = isEmptyObj($scope) ? null : extend.obj($scope);
                // For includer dynamic change
                var delimiters = uiHandler.getDelimiters(source);
                if( delimiters.length === 1 ) {
                    base.valueIn('no-replace', '');
                    
                    var container = base.parentNode;
                    var dlm = delimiters[0], name = base.nodeName;
                    var attr = functionManager.attr(base, ['inc-src', 'src']), current = base;
                    var hw = { el: current };

                    var $getterArg;
                    getter = function () { $getterArg = arguments; }

                    source = functionManager.eval(dlm.exp, $scope);
                    attr.value = source;

                    if ($getterArg) {
                        hw.watch = $easy.watch($getterArg[1].property, function(val) {
                            var element = doc.createElement(name);
                            element.valueIn('no-replace', '');
                            if(name === 'INC')
                                element.valueIn('src', val);
                            else 
                                element.valueIn('inc-src', val);
    
                            container.replaceChild(element, current);
                            hw.el = current = element; // New element
                        },  $getterArg[0]);
                        uiHandler.$handleWatches.push(hw);
                    }

                } else if( delimiters.length >= 1 ) {
                    Easy.log('[BadDefinition]: Only one delimiter is allowed in element[inc-src] or inc[src].\n  Check the value: \''+ source +'\'.')
                    return base;
                }
                // including the component
                includerManager.include(source, base);
                return base;
            }

            function walker(el, $scope) {
                var $name = el.nodeName, $value = el.nodeValue;
                easyProperty( el ); // setting easy property in the element
                // Add the old attributes if the compilation is forced
                if (config.force === true && el.$e.$oldAttrs) {
                    forEach(el.$e.$oldAttrs, function (attr) {
                        el.attributes.setNamedItem(attr);
                    });
                }
                
                switch ($name) {
                    // Compilation to be skipped
                    case '#comment': return;
                    case 'e-compile': el.removeAttribute('e-compile'); break;
                    case 'wait-data': {
                        var base = el.$e.$base;
                        var attr = functionManager.attr(base, [ 'wait-data' ], true);
                        if(!trim(attr.value))
                            return Easy.log({ message: error.invalid('in ' + attr.name), el: base });
                            
                        if (exposed[attr.value]) {
                            var $$data = new ReactiveObject($easy.retrieve(attr.value, true));
                            $$data.$scope = extend.obj($scope);
                            Compiler.compile({ el: base, data: extend.addToObj($$data, $$methods) });
                        } else {
                            if ( waitedData[attr.value] )
                                waitedData[attr.value].push(base);
                            else
                                waitedData[attr.value] = [ base ];                 
                        }
                        return base.ignoreBaseCompilation = true;
                    }
                    case 'inc-tmp': {
                        var base = el.$e.$base;
                        var attr = functionManager.attr(base, ['inc-tmp'], true);

                        if (trim(attr.value))
                            includerManager.components[attr.value] = { content: base.outerHTML };
                        else
                            Easy.log({ message: 'Invalid value in element[inc-tmp]. ', el: base }, 'warn');
                        return;
                    }
                    case cmds.def: {
                        var obj = functionManager.eval($value, $scope);
                        if (obj) $easy.setData(obj, $scope);
                        return el.$e.$base.removeAttribute($name);
                    }
                    case cmds.if: case cmds.show: {
                        var base = el.$e.$base;
                        var attr = functionManager.attr(el.$e.$base, [cmds.if, cmds.show], true);

                        if( (trim(el.value) === '') ) 
                            return Easy.log({ message: 'Invalid expression in ' + attr.value, el: el })
                        
                        // Checking if it has delimiters
                        if (uiHandler.getDelimiters(el.value).length > 0) 
                            return Easy.log(error.delimiter($name));
                        
                        if (el.name === cmds.show) {
                            el.$e.$base = base;
                            Compiler.addOldAttr({ el: base, value: el });

                            // Toggle `display: none` in the element according the value result
                            var verifyShowValue = function () {
                                var check = functionManager.eval(el.nodeValue, $scope);
                                if (check) base.style.display = '';
                                else base.style.display = 'none';
                            }
                            
                            var $getterArg = []; // [0] -> obj; [1] -> prop
                            getter = function () { $getterArg.push(arguments); }
                            verifyShowValue(); unget();

                            forEach($getterArg, function (arg) {
                                var watch = $easy.watch(arg[1].property, function () {
                                    verifyShowValue();
                                    if (!base.isConnected) watch.destroy();
                                }, arg[0]);
                            })
                        } else {
                            var curr = base, container = base.parentNode, chainCondition = [];
                            var hideChainCondition = function () {
                                forEach(chainCondition, function (item) {
                                    var container = item.element.parentNode;
                                    if (container) container.replaceChild(item.element.com, item.element);
                                })
                            }
                            var addToChainConditionList = function (element, attr) {
                                element.com = uiHandler.com.create();
                                element.removeAttribute(attr.nodeName);
                                chainCondition.push({ 
                                    attr: attr, 
                                    element: element,
                                    comment: element.com,
                                    value: attr.nodeValue,
                                    type: attr.nodeName
                                });

                                easyProperty(attr).$e.$base = base;
                                Compiler.addOldAttr({ el: element, value: attr });
                            }
                            var verifyChainCondition = function () {
                                hideChainCondition(); // Hiding all elements
                                for (let i = 0; i < chainCondition.length; i++) {
                                    var check, chain = chainCondition[i];
                                    // Evaluating the element value
                                    if (chain.value) check = functionManager.eval(chain.value, $scope);

                                    if (check || chain.type == 'e-else') {
                                        chain.element.$e.$oldAttrs.remove(chain.attr); // Avoid self-looping
                                        container.replaceChild(chain.element, chain.comment);
                                        Compiler.compile({
                                            el: chain.element,
                                            data: $scope,
                                            force: true,
                                            done: function () { chain.element.$e.$oldAttrs.push(chain.attr); }
                                        });
                                        break;
                                    }
                                }
                            }

                            addToChainConditionList(curr, el);

                            do { // Getting the chain conditions
                                curr = curr.nextElementSibling;
                                if ( !curr ) break;
                                var $attr = functionManager.attr(curr, ['e-else-if', 'e-else']);
                                if ( !$attr ) break;
                                addToChainConditionList(curr, $attr);
                                if ( $attr.name === 'e-else' ) break; // Break on else
                            } while(1);

                            var $getterArg = []; // [0] -> obj; [1] -> prop
                            getter = function () { $getterArg.push(arguments); }
                            verifyChainCondition(); unget();

                            forEach($getterArg, function (arg) {
                                var watch = $easy.watch(arg[1].property, function () {
                                    verifyChainCondition();
                                    var  isDestroy = true;
                                    forEach(chainCondition, function (item) {
                                        if (isDestroy == true && (item.comment.isConnected || item.element.isConnected)) 
                                            isDestroy = false;
                                    });
                                    if (isDestroy) watch.destroy();
                                }, arg[0]);
                            })
                        }
                        return;
                    }
                    case 'inc-src': {
                        var base = includerHandler({ el: el, $scope: $scope });
                        return base.ignoreBaseCompilation = true;
                    }
                    case cmds.data: {
                        var base = el.$e.$base;
                        if (includerManager.isInc(base)) return; // Ignore scope criation in Includer Element
                        var attr = functionManager.attr(base, [cmds.data], true), $dt;
                        // Getting the data or the default
                        if ( trim(attr.value) === '' )
                            $dt = extend.obj($easy.data); // clone the main data
                        else
                            $dt = functionManager.eval(attr.value, $scope) || {};

                        $dt.$scope = extend.obj($scope);
                        walker.call($easy, base, extend.addToObj($dt, $$methods));
                        
                        EasyEvent.emit({
                            elem: base,
                            type: vars.events.data,
                            scope: $scope
                        });
                        return base.ignoreBaseCompilation = true;
                    }
                    case cmds.tmp: case cmds.fill: case cmds.req: {
                        var base = el.$e.$base;
                        // Preparing the element 
                        var attr = functionManager.attr(base, [cmds.tmp, cmds.fill], true);
                        if (attr) {
                            var type = attr.name === cmds.tmp ? 'many' : 'one';
                            var id = functionManager.attr(base, [cmds.id], true); id = id ? id.value : '';
                            base.valueIn('e-req', '{ $url: "'+ attr.value +'", $type: "'+ type +'", $id: "'+ id +'" }');
                        }
                        // Templates
                        uiHandler.initConnectorRequest(base, extend.obj($scope, this.methods));
                        return base.ignoreBaseCompilation = true;
                    }
                    case cmds.for: {
                        var base = el.$e.$base;
                        // Reading the for expression
                        var helper = uiHandler.cmd.for.read(base), comment;
                        if (!helper.ok) return;
                        
                        var $getterArg; // [0] -> obj; [1] -> prop
                        getter = function () { $getterArg = arguments; }
                        var v = functionManager.eval(helper.array, $scope); unget();
                        var desc = $getterArg ? $getterArg[1].descriptor : null;
                        
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
                                    return uiHandler.cmd.for({
                                        el: base, 
                                        array: data, 
                                        comment: comment,
                                        data: extend.obj($scope, $$methods)
                                    });
                                }
                            }
                        }).reference;

                        if (!comment) {
                            // No filter defined
                            comment = uiHandler.cmd.for({
                                        el: base, 
                                        array: array.value, 
                                        comment: comment,
                                        data: extend.obj($scope, this.methods),
                                        read: helper
                                    });
                        }

                        if (desc) $getterArg[1].binds.push({ el: comment, isObj: true, obj: extend.obj($scope, $$methods) });
                        return base.ignoreBaseCompilation = true;
                    }
                    case cmds.content: {
                        var base = el.$e.$base;
                        base.innerHTML = $value;                        
                        return base.removeAttribute($name);
                    }
                    case cmds.anm: {
                        var base = el.$e.$base;
                        if (!isNull($value)) base.niceIn($value);
                        return base.removeAttribute($name);
                    }
                    default:
                        var base = el.$e.$base;
                        if ($name.startsWith('on:') || $name.startsWith('listen:')) {
                            if (trim($value) === '') return Easy.log('[BadDefinition]: Invalid expression in ' + $name);
                            var evtExpression = $name.split(':')[1].split('.'); // click.preventdefault
                            var eventName = evtExpression[0];
        
                            if ( standardEvents[eventName] === true ) {
                                var $event = base.listen(eventName, function (evtObject) {
                                    if(evtExpression.indexOf('once') !== -1) // If once                        
                                        base.removeEventListener(eventName, $event[0].callback, false);
                                    // Applying the modifier
                                    forEach(evtExpression,function (modifier) {
                                        var $modifierName = eventModifiers[modifier];
                                        if ($modifierName) evtObject[$modifierName]();
                                    });
                                    arguments[0].$data = { scope: $scope };
                                    // Calling the callback function
                                    var $$result = functionManager.eval($value, extend.addToObj($scope, $$methods) || {});
                                    if (typeof $$result === 'function') $$result.apply($easy, arguments);
                                });
                            } else {
                                if( !isNull(vars.events[eventName]) ) return;
                                var callback = function() {
                                    if(evtExpression.indexOf('once') !== -1) // If once
                                        $easy.off(eventName, $event.callback);
                                    // Calling the callback function
                                    var $$result = functionManager.eval($value, extend.addToObj($scope, $$methods) || {});
                                    if (typeof $$result === 'function') $$result.apply($easy, arguments);
                                }
                                callback.$target = base;
                                var $event = $easy.on(eventName, callback);
                            }
                            return base.removeAttribute($name);
                        } else if ( $name === 'e-bind' || $name.startsWith('e-bind:') ) {
                            var val = $name.split(':'),
                                // By default bind the value property
                                field = val.length === 1 ? 'value' : val[1];
        
                            base.$e.b = { data: field };
                            // Defining the object for 'setValue' function
                            base.$e.$oldValue = $value;
                            base.$e.$fields = [{ exp: $value, field: $value }];
                            base.$e.$base = base;
                            base._name = field;
        
                            if (isNull($value) || trim($value) === '')
                                return Easy.log('[BadDefinition]: e-bind attribute cannot have null or empty value.');
        
                            Bind.exec(base, $scope, function () {
                                uiHandler.setNodeValue(base, $scope);
                            }, { two: true });
                            return base.removeAttribute($name);
                        } else if ( $name.startsWith('e-toggle:') ) {
                            var exp = $name.split(':');
                            if (isNull($value) || trim($value) === '')
                                return Easy.log('[BadDefinition]: e-toggle attribute cannot have null or empty value.');
        
                            function exec() {
                                var res = functionManager.eval($value, $scope);
                                if(res) base.valueIn(exp[1], 'true');
                                else base.removeAttribute(exp[1]);
                            }
        
                            var $getterArg; // [0] -> obj; [1] -> prop
                            getter = function () { $getterArg = arguments; }
                            exec(res); unget();
                            
                            if ($getterArg) {
                                var w = $easy.watch($getterArg[1].property, function(){
                                    exec();
                                }, $getterArg[0]);
                                uiHandler.$handleWatches.push({ el: base, watch: w });
                            }

                            return base.removeAttribute($name);
                        } else if($name.startsWith('e-') && !vars.cmds.hasValue($name)) {
                            // alternable attr values
                            if(uiHandler.getDelimiters($value).length === 0 && trim($value) !== '') {
                                $value = trim($value);
                                // Testing if the value if object definition
                                if( !($value[0] === '{' && $value[1] !== '{') ) return;
        
                                Compiler.setDefault({ attr: el });
                                Compiler.addOldAttr({ el: base, value: el });
        
                                var name = $name.substr(2);
                                if(!base.hasAttribute(name))
                                    base.valueIn(name, '');
                                var $attr = functionManager.attr(base, [name]);
                                base.removeAttribute($name);
        
                                function exec(obj) {
                                    if(!obj) return;
                                    obj.keys(function(key, value){
                                        if(value) {
                                            if(!$attr.value.includes(key))
                                                $attr.value += ' ' + key;
                                        } else
                                            $attr.value = $attr.value.replaceAll([' '+ key, key]); 
                                    });
                                }
        
                                var $getterArg; // [0] -> obj; [1] -> prop
                                getter = function () { $getterArg = arguments; }

                                var res = functionManager.eval($value, $scope);        
                                if(!isObj(res)) return; 
                                exec(res); unget();

                                if ($getterArg) {
                                    var w = $easy.watch($getterArg[1].property, function() {
                                        exec(functionManager.eval(el.$e.$oldValue, $scope));
                                    }, $getterArg[0]);
    
                                    uiHandler.$handleWatches.push({ el: base, watch: w });
                                }
                            }
                        }
                        break;
                }

                // Loop attrs
                var singleAttrCompilation, $attributes = [];
                // Attributes Priorities
                if (el.attributes) 
                    singleAttrCompilation = el.attributes[cmds.data] || el.attributes[cmds.fill] || 
                    el.attributes[cmds.for] || el.attributes[cmds.req] || el.attributes[cmds.tmp] || 
                    el.attributes[cmds.fill] || el.attributes['wait-data'];

                $attributes = singleAttrCompilation ? [ singleAttrCompilation ] : toArray((el.attributes || []));
                forEach($attributes, function (child) {
                    easyProperty(child).$e.$base = el;

                    if (isNull($propDescriptor(child, 'isConnected')))
                        // Connecting the isConnected property to the main element property
                        $propDefiner(child, 'isConnected', {
                            get: function () { return el.isConnected; },
                            set: function () {}
                        });
  
                    // Compilation with the same $scope
                    walker.call($easy, child, $scope);
                });

                // Skip element if it was marked
                if (el.hasAttribute && el.hasAttribute('e-ignore')) return;

                if (el.ignoreBaseCompilation === true)
                    return delete el.ignoreBaseCompilation;
    
                    // after checking the attrs, check the element node name
                if ($name == 'INC')
                    return includerHandler({ el: el, $scope: $scope })
                            .ignoreBaseCompilation = true;

                // dynamic toggled value in attr
                if (el.nodeValue) {
                    var text = el, base = el.$e.$base, 
                        fields = uiHandler.getDelimiters(text.nodeValue);

                    if (fields.length) { 
                        text.$e.$fields = fields;
                        if($name !== '#text') Compiler.addOldAttr({ el: base, value: el });
                        Compiler.setDefault({ attr: text });
                        Compiler.setValue({ current: text, scope: $$scope, methods: $$methods });
                    }
                }

                // Handling skeleton attribute
                if(($name === cmds.skeleton) && (trim($value) === ''))
                    el.$e.$base.removeAttribute($name);

                // Url "hash" normalizer
                if( $name === ':href' || $name === 'i:href' ) {
                    var base = el.$e.$base;
                    var path = RouteHandler.findPath(el.value || '/');
                    
                    base.valueIn('href', RouteHandler.normalizeRoute(el.value || '/'));
                    if (path && $name === ':href') path.links.push(base);

                    base.removeAttribute($name);
                    base.addEventListener('click', function (evt) {
                        evt.preventDefault();
                        if (RouteHandler.navegate)
                            RouteHandler.navegate(base.href);
                        else
                            $global.location.href = base.href;
                    });
                }

                // Getting in the children
                if (!isNull(el.childNodes)) {
                    toArray(el.childNodes, function (child) {
                        $$scope = $scope;
                        easyProperty(child).$e.$base = el;
                        walker.call($easy, child, $scope);
                    });
                }
                
                EasyEvent.emit({ // Emitting the event
                    elem: el,
                    type: vars.events.compiled,
                    scope: $scope
                });
            }
            // Setting the data function
            var $closure = $$scope;
            $$el.$e.data = function () { return $closure; }
            $$el.$prevent = config.skipAutoCompile || undefined;
            
            new Promise(function(resolve, reject) {
                try {
                    $$el.$e.$base = $$el.ownerElement || $$el.parentNode;
                    // Compiling the the element
                    walker.call($easy, $$el, $$scope);
                    if ( !isNull(config.done) ) config.done.call($easy, $$el);
                    resolve($easy);
                } catch (error) {
                    reject(Easy.log(error));
                }
            });
        }
        prototype.toElement = toElement;
        prototype.use = function use(dependencies) {
            if (!isArray(dependencies))
                return Easy.log('The method \'app.use\' expects an array having all the dependencies');

            forEach(dependencies, function (dep) {
                if (isNull(dep)) return;
                dep.attachedEasyInstance = this;
                this.dependencies[dep.dependencyId || dep.constructor.name] = dep;
            }, this);
        }
        prototype.call = function call(calls, ignoreIfNull) {
            if (!isArray(calls))
                return Easy.log('Invalid value, try an array. Eg.: app.call([ ... ])');
            return forEach(calls, function (func, index) {
                if (typeof func !== 'function' && ignoreIfNull !== true)
                    return Easy.log('The item-'+ index +' at app.call([ ... ]), is not a `function`, ' +
                                    'try: [ function(easy){ ... } ] or app.call([ ... ], true) to ignore the null items', 'warn');
                if (func) func.call(this);
            }, this)
        }

        function checkIncPath(name) {
            var path = includerManager.paths[name];
            if( isNull(path) ) {
                Easy.log('[NotFound]: No \''+ name +'\' component was found, please check if it is defined.');
                return;
            }
            return path;
        }

        /// Classes
        function Compiler() {}
        /** Component Includer Manager */
        function Includer(paths, $config) {
            var includerManager = this;
            if (!paths) paths = {};
            // Includer events storages
            this.requested = []; 
            this.mounted = []; 
            this.loaded = [];
            this.destroyed = [];
            this.blocked = [];
            this.fail = [];
            // Store all the components while the application is running
            this.components = {};
            // It Stores temporarily the path untill the request is complete
            this.componentRequests = {};
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
                
                if(skipped) Easy.log('[BadDefinition]: All restrictions must be a function! All non-functions '+
                                    'have been removed from the \'' +k+'\' component restriction list. '+
                                    'Please reset this or these restrictions.', 'warn');
            }
            // Component Setter
            this.setComponent = function (objects, onset) {
                var comps = {};
                objects.keys((function (key, value) {
                    if( !isNull(this.paths[key]) )
                        return Easy.log('[BadDefinition]: Cannot redefine the component \''+ key +'\' ');

                    comps[key] = isString(value) ? {
                        url: value, // the url of the component (optional)
                        title: undefined, // the title that will be placed in the page (optional)
                        route: undefined, // the route that will be shown [beta] (optional)
                        template: undefined, // the component template [hard code component] (optional)
                        data: undefined, // the default data of the include (optional)
                        store: true, // allow to store de component transfered data, by default is true (optional)
                    } : value;
                    comps[key].name = key;
                    comps[key].store = isNull(comps[key].store) ? true : comps[key].store;
                    // Transforming data to a reactive one
                    comps[key].data = comps[key].data ? new ReactiveObject(comps[key].data) : undefined;
                    comps[key].links = [];

                    var urlWBase = urlResolve( comps[key].url ).hrefb;
                    urlWBase += urlWBase.endsWith('.html') ? '' : '.html';

                    comps[key].url = urlWBase;

                    if( isNull(comps[key].restrictions) )
                        comps[key].restrictions = [];

                    this.skipNoFunction(comps[key].restrictions, key);                
                    this.paths[key] = comps[key];

                    if ( !isNull(onset) && typeof onset === 'function' )
                        onset.call(this, comps[key], key);

                    if (options.components.config.preload)
                        this.get({
                            componentKey: key,
                            path: comps[key].url,
                            callback: function (content, options) {
                                includerManager.components[options.componentKey] = { content: content };
                            }
                        })
                    
                    if ( isObj(value) && isObj(value.children) ) {
                        this.setComponent(value.children, function ($comp, $key) {
                            $comp.route = value.route + $comp.route;
                            comps[$key] = $comp;
                        });
                    }
                }).bind(this));
                return comps;
            }
            /* Get a HTML file from the server, according to a path */
            this.get = function (options) {
                http(options.path, {
                    method: 'get',
                    headers: { 'Content-Type': 'text/plain' }
                }).then(function (data) {
                    if (data.ok) {
                        if (options.callback) options.callback(data.response, options);
                    } else {
                        throw ({ message: 'Unable to load the file: ' + options.path + '\nDescription: ' + data.statusText + '.' });
                    }
                }).catch(function (error) {
                    if (options.fail) options.fail(error, options);
                    Easy.log(error);
                });
            }
            /* Transfer attrs from a source to a destination */
            this.transferAttributes = function(src, dest){
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
                            return src.removeAttribute(attr.name);
                            
                        default:
                            dest.valueIn(attr.name, attr.value);
                            return src.removeAttribute(attr.name);
                    }
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
                    return Easy.log("[BadDefinition]: Invalid value of attribute element[inc-src] or inc[src] of '" + $inc.desc() + "'. Or, it's undefined.");
                // Checking if the inc was provided 
                if (isNull($inc))
                    return Easy.log("[BadDefinition]: Invalid element of '" + src + "'. Or, it's undefined.");
                                
                forEach(includerManager.requested, function (evt) { evt.call($easy, $inc); });
                // Inline inclusion
                if (src[0] === '@') {
                    // Removing @
                    var nameNormalized = src.substr(1),
                        component = includerManager.components[nameNormalized];

                    if (!component)
                        return Easy.log("[NotFound]: No element[inc-tmp] with this identifier '@" + nameNormalized + "' defined.", 'warn');
                    
                    var el = toElement(component.content);
                    if (!$inc.hasAttribute('no-replace')) {
                        // Defining the name
                        el.inc = nameNormalized;
                        $inc.aboveMe().replaceChild(el, $inc);
                    } else{
                        $inc.inc = nameNormalized;
                        $inc.appendChild(el);
                    }

                    includerManager.transferAttributes($inc, el);
                    // Compiling the added element
                    Compiler.compile({
                        el: el,
                        skipAutoCompile: true,
                        data: $easy.retrieve(src, true) || $inc.$$data || Compiler.getUpData(el)
                    });

                    // calling the events
                    forEach(includerManager.loaded, function (evt) { evt.call($easy, el); });
                    return;
                }
                var $path = includerManager.paths[src], $url;
                if ($path) {
                    if( !isNull($path.restrictions.findOne( function (v) { return v.call($easy) === false; } )) ) {
                        return forEach(includerManager.blocked, function (evt) { 
                            evt.call($easy, {
                                message: 'The component was blocked by the restrictions verification!',
                                inc: $inc 
                            }); 
                        });
                    }

                    if ($path.template)
                        return new Inc({ 
                            component: { content: $path.template },
                            src: src,
                            inc: $inc, 
                            path: $path,
                            store: $path.store,
                            componentConfig: $config
                        });
                    else
                        $url = $path.url;
                } else {
                    var message = 'No \''+ src +'\' component was found, please check if it\'s defined.';
                    forEach(includerManager.fail, function (evt) { 
                        evt.call($easy, {
                            message: message,
                            inc: $inc 
                        });
                    });
                    return Easy.log(message);
                }
                var component = includerManager.components[src];
                // Checking if the component is stored
                if (component) new Inc({ 
                    component: component,
                    src: src,
                    inc: $inc, 
                    path: $path,
                    store: $path.store,
                    componentConfig: $config
                });
                // Otherwise, check if there is not a web request made to this path 
                else {
                    var hasRequestWaiting = !isNull(includerManager.componentRequests[$url]);
                    includerManager.componentRequests[$url] = hasRequestWaiting ? includerManager.componentRequests[$url] : []; 

                    if (hasRequestWaiting == false){
                        // Getting the data 
                        includerManager.get({
                            path: $url,
                            callback: function (content, options) {
                                forEach(includerManager.componentRequests[options.path], function (componentRequest) {
                                    new Inc({
                                        component: { content: content },
                                        src: componentRequest.src,
                                        inc: componentRequest.$inc, 
                                        path: componentRequest.$path,
                                        store: componentRequest.$path.store,
                                        componentConfig: $config
                                    });
                                });
    
                                delete includerManager.componentRequests[options.path];
                            },
                            fail:  function(error) {
                                forEach(includerManager.fail, function (evt) { 
                                    evt.call($easy, { 
                                        message: error.message,
                                        inc: $inc 
                                    }); 
                                });
                            }
                        });
                    }

                    includerManager.componentRequests[$url].push({
                        src: src,
                        $inc: $inc,
                        $path: $path
                    });
                }
            }
            /** Helper to get the source value an inc value */
            this.src = function (el) {
                return el.valueIn('src') || el.valueIn('inc-src');
            }
            /** Check if an element is a includer type */
            this.isInc = function (el) {
                return el.nodeName === 'INC' || (el.hasAttribute && el.hasAttribute('inc-src'))
            }
            // Includer paths
            this.setComponent(paths);
        }
        /* Component Instance Object */
        function Inc(config) {
            this.src = config.src;
            this.name = (config.src + ' component').toUpperCase();
            this.created = this.mounted = functionManager.empty;
            this.loaded = this.destroyed = functionManager.empty
            this.scope = extend.obj($easy.retrieve(config.src, true) || config.inc.$$data);
            this.Easy = $easy;
            this.__proto__.NOREACTIVE = true;
            
            // In this case the element was removed from the DOM before de compilation
            if (!config.inc.parentNode) return;

            if (!isNull(config.path.data)) {
                this.data = new ReactiveObject(config.path.data); 
            } else {
                this.data = {};
                // Link the datas if was asked to 
                if (config.componentConfig.keepData) config.path.data = this.data; 
            }

            this.export = function (data) {
                if (!isObj(data))
                    return Easy.log('[BadDefinition]: Invalid object for export, please make sure the object has valid value.');
                // Transforming into a reactive object
                new ReactiveObject(data);

                data.keys((function (key) {
                    $propTransfer(this.data, data, key);
                    this.data[key] = data[key]; // Updates the UI already
                }).bind(this));
            }

            this.getParams = (function () {
                return new UrlParams(location.href, (!location.href.includes('?') ? this.route : null))
            }).bind(config.path)

            var store = config.store,
                componentStored = config.component,
                incInstance = this, isKeepAlive = config.inc.hasAttribute('keep-alive');
            var el, styles = [], scripts = [];
            
            if ( isKeepAlive && componentStored['keep-alive'] ) {
                var obj = componentStored['keep-alive'];
                scripts = obj.scripts;
                styles = obj.styles;
                el = obj.el;
            } else {
                var temp = doc.createElement('body');
                temp.innerHTML = componentStored.content;
                forEach(temp.children, function (child) {
                    switch (child.nodeName) {
                        case 'STYLE': styles.push(child); return;
                        case 'LINK': styles.push(child); return;
                        case 'SCRIPT':  scripts.push(child); return;
                        default: el = child; return;
                    }
                });

                if (!el) return Easy.log("[BadDefinition]: The component '" + config.src +
                    "' seems to be empty or it has not a root element, " +
                    "eg.: <div></div>, to be included. Please, check it!");
                
                // Helper to get content elements
                function findContents(el) {
                    var contents = [];
                    forEach(el.children, function (child) {
                        (function exec(elem) {
                            if (elem.nodeName === 'INC' || elem.hasAttribute('inc-src')) return;
                            if (elem.nodeName === 'CONTENT') contents.push(elem);
                            forEach(elem.children, function (c) { exec(c); });
                        })(child);
                    });
                    return contents;
                }
                // Getting all the mains from the imported component 
                var contents = findContents(el);
                if (config.inc.children.length && config.inc.node('content')) {
                    // Getting all the mains from the current in element
                    var currentContentTags = findContents(config.inc);
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
                var rootElementClassRules = {};
                forEach(el.classList, function (rule) { rootElementClassRules[rule] = true; });
                forEach(styles, function (style) {
                    doc.head.appendChild(style);
                    // For scoped styles
                    if (style.hasAttribute('scoped')) {
                        // Generating some class name for the selectors
                        var value = 'easy-s' + $easy.code(7);
                        styleIds.push(value);

                        function changeSelector($style) {
                            // Changing each selector to avoid conflits
                            var isStyle = ($style.nodeName === 'STYLE'), rules = [];  
                            forEach($style.sheet.cssRules, function (rule) {
                                var space = ' ';
                                if (rootElementClassRules[rule.selectorText.substr(1)]) space = '';
                                rule.selectorText = '.' + value + space + rule.selectorText; 
                                rule.cssText = '.' + value + space + rule.cssText;
                                if (isStyle) rules.push(rule.cssText);
                            });
                            if (isStyle) $style.innerText = rules.join('\n');
                        }
                        
                        if (style.nodeName === 'LINK') {
                            style.onload = function (evt) {
                                changeSelector(evt.target);
                            }
                        } else {
                            changeSelector(style);
                        }
                    }
                });

                forEach(styleIds, function (id) { el.classList.add(id); });

                // Storing the content
                if (store && config.path.store === true) {
                    if (!includerManager.components[config.src])
                        includerManager.components[config.src] = { content: componentStored.content };
                    
                    if (isKeepAlive) {
                        includerManager.components[config.src]['keep-alive'] = {
                            el: el,
                            styles: styles,
                            scripts: scripts
                        }
                        // Clearing the content
                        includerManager.components[config.src].content = null;
                    }
                }

                el.$e = config.inc.$e;
                // Defining attributes from the inc element 
                includerManager.transferAttributes(config.inc, el);

                var dataAttribute = functionManager.attr(el, [ vars.cmds.data ], true);
                if (dataAttribute) {
                    var data = functionManager.eval(dataAttribute.value, this.scope);
                    if (data) {
                        if (isArray(data))
                            return Easy.log('[BadDefinition]: An array cannot be exposed, try to wrap it into an object literal. Eg.: { myArray: [...] }.');
                        
                        data.keys(function (k, v) { incInstance.data[k] = v; });
                    }
                }
            }

            this.el = el;
            var execIncluder = function (scriptsContent) {
                // Checking it is still connected
                if (!config.inc.parentNode) return;
                
                try {
                    // In case of empty scope get the up component data
                    if ( isEmptyObj(this.scope) ) 
                        this.scope = extend.obj(Compiler.getUpData(config.inc));
                    // Add the scope object if it isn't empty
                    if ( !isEmptyObj(this.scope) ) {
                        delete this.data.$scope;
                        this.data.$scope = this.scope;
                    }

                    Function(scriptsContent).call(this, $easy);

                    // Before adding the element
                    this.created(el);
                    
                    var destroyable = el;
                    // Adding the element in the DOM
                    if (!config.inc.hasAttribute('no-replace')) {
                        el.inc = config.src;
                        config.inc.parentNode.replaceChild(el, config.inc);
                    } else {
                        config.inc.inc = config.src;
                        config.inc.appendChild(el);
                        destroyable = config.inc;
                    }
                    
                    // Adding the destroy method
                    this.destroy = function () {
                        if (destroyable.parentNode)
                            destroyable.parentNode.removeChild(destroyable);
                    }

                    // Element was added
                    this.mounted(el, config.inc);
                    forEach(includerManager.mounted, function (evt) { evt.call($easy, el); });
                    
                    // Compiling the added element according the scope data                        
                    Compiler.compile({
                        el: el,
                        data: this.data,
                        skipAutoCompile: true
                    });
                    
                    // Element was loaded
                    this.loaded(el);
                    forEach(includerManager.loaded, function (evt) { evt.call($easy, el); });
                    // Two parents in case of no-replace inc
                    if (!el.parentNode || !el.parentNode.parentNode) return;
                    var target = el.parentNode;
                    if (includerManager.isInc(target)) target = target.parentNode;
                    // Setting the component mutation
                    var mut = new MutationObserver(function() {
                        var containerChild = target.children[0];
                        if (includerManager.isInc(el) && !isKeepAlive && el != containerChild)
                            el = containerChild;
                        
                        if(el.isConnected === false){
                            incInstance.destroyed(el);
                            forEach(includerManager.destroyed, function (evt) { evt.call($easy, el); });
                            // Removing every styles 
                            toArray( styles, function(el) {
                                doc.head.removeChild(el);
                            });
                            mut.disconnect();
                        }
                    }); mut.observe(target, { childList: true });
                } catch (error) {
                    error.file = config.path.url || config.src;
                    Easy.log(error);
                }
            }

            if (scripts.length === 0){
                return execIncluder.call(this);
            } else {
                var localScriptsContent = [], webRequestChecker = {}, onlineScriptsUrls = [];
                // Grouping the online scripts and collecting the online url
                forEach(scripts, function (script) { 
                    if (script.src == '' || script.innerHTML)
                        localScriptsContent.push(script.innerHTML);
                    else
                        onlineScriptsUrls.push(script.src);
                });
                
                // If there are not online scripts run with the local and stop the execution
                if ( onlineScriptsUrls.length == 0 )
                    return execIncluder.call(this, localScriptsContent.join('\n\n'));

                // Load the online scripts and run it
                return forEach(onlineScriptsUrls, function (url) {
                    var scriptRequestUrl = url.substr(location.origin.length + 1);
                    webRequestChecker[scriptRequestUrl] = true;
                    // Getting script content from a web request
                    includerManager.get({
                        path: scriptRequestUrl,
                        callback: function(jsContent, options) {
                            delete webRequestChecker[options.path];
                            // Adding in the beginning of the script list
                            localScriptsContent.unshift(jsContent);
                            // if there are not web requests run the Includer Compiler
                            if (webRequestChecker.keys().length == 0)
                                return execIncluder.call(incInstance, localScriptsContent.join('\n\n'));
                        },
                        fail: function (error) {
                            forEach(includerManager.fail, function (evt) {
                                evt.call($easy, { message: error.message, inc: config.inc }); 
                            });
                            throw (error);
                        }
                    });
                });
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
                    functionManager.spreadData(function () {
                        Function($exp).apply($easy, $args);
                    }, $data);
                }catch(error) {
                    Easy.log({ message: error.message, scope: $data });
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
                    var value = functionManager.eval(exp, $data);
                    if (isNull(value)) return '';
                    if (json && isObj(value)) {
                        value = JSON.stringify(value);
                    }
                    return value;
                }catch(error) {
                    return '';
                }
            }
            // Get an attribute of an element in a list and remove it or not
            this.attr = function (elem, attrs, remove) {
                if (!elem || !attrs) return;
                if (isNull(remove)) remove = false;
                if (isNull(elem.attributes)) return;

                var res;
                for (var i = 0; i < attrs.length; i++)
                    if ( res = elem.attributes[attrs[i]] ) break;

                if (res && remove) elem.removeAttribute(res.name);
                return res;
            }
            /**
             * Define temporary properties in window (globalObject), 
             * call the main callback and then restore the old properties.
             */
            this.spreadData = function (callback, $dt) {
                var keys = [], oldVars = {}, nonConfigurable = {};
                if (isObj($dt)) keys = $dt.keys();
                try {
                    forEach(keys, function (key) {
                        if ($global.hasOwnProperty(key)) {
                            if ( $propDescriptor($global, key).configurable === true )
                                $propTransfer(oldVars, $global, key);
                            else
                                nonConfigurable[key] = $global[key]; // In case of non-configurable props
                        }

                        if (nonConfigurable.hasOwnProperty(key))
                            $global[key] = $dt[key];
                        else
                            $propTransfer($global, $dt, key);
                    });
                    callback.call($easy);
                } catch(error) {
                    throw (error);
                } finally {
                    nonConfigurable.keys(function (key, value) {
                        // Changing the value if they are differents
                        if ($dt[key] !== $global[key]) $dt[key] = $global[key];
                        // Restoring the non configs props
                        $global[key] = value;
                    });
                    
                    forEach(keys, function (key) {
                        if (!nonConfigurable.hasOwnProperty(key)) delete $global[key]; 
                    });
                    // Redefining the old values
                    forEach(Object.keys(oldVars), function(key) {
                        $propTransfer($global, oldVars, key);
                    });
                }
            }
        }
        /** UI Handler */
        function UIHandler(config) {
            var uiHandler = this;
            this.$$delimiters = config.$$delimiters;
            this.$handleWatches = config.$handleWatches;
            // UI observer functions for tmp/fill
            this.observer = {
                mutation: function (callback) {
                    // remove all desconected elements from temporaly store variables
                    function maintenance() {
                        // Removing non used requests
                        toArray(webDataRequests.keys(), function(key) {
                            var obj = webDataRequests[key];
                            if (obj.$type === 'many') {
                                if (obj.$el.$e.com.isConnected === false)
                                    delete webDataRequests[key];
                            } else {
                                if (obj.$el.isConnected === false)
                                    delete webDataRequests[key];
                            }
                        });
                        
                        toArray(uiHandler.$handleWatches, function(obj, index) {
                            if ( obj.el.isConnected === false ) {
                                uiHandler.$handleWatches.splice(index, 1);
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
                                switch (node.nodeName) { case "#comment": case "SCRIPT": case "#text": case "STYLE": return; }
                                
                                if (includerManager.isInc(node) || (node.hasAttribute && node.hasAttribute('e-compile')))
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
                    var comment = easyProperty(doc.createComment('e'));
                    comment.easy = true;
                    comment.$id = id || $easy.code(8);
                    options.keys(function (key, value) { comment[key] = value; });
                    return comment;
                },
                // Gets a comment from an element
                get: function (elem, id) {
                    if (isNull(id)) return;
                    return uiHandler.com.getAll(elem, id).findOne(function (com) {
                        return com.$id === id;
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
            this.cmd = {
                for: function (obj) {
                    var el = obj.el, 
                        array = obj.array,
                        comment = obj.comment,
                        $scope = obj.data;
                    try {
                        var name = vars.cmds.for, 
                            attr = functionManager.attr(el, [name]);
                        
                        if (uiHandler.getDelimiters(attr.value).length > 0) {
                            Easy.log(error.delimiter(vars.cmds.for));
                            return undefined;
                        }

                        if (!array) {
                            Easy.log({
                                message: 'It seems like the array defined in e-for has invalid value',
                                elem: el,
                                expression: attr.value
                            });
                            return undefined;
                        }

                        var helper = uiHandler.cmd.for.read(el);
                        // If it has no comment, means that the list was not used yet
                        if (!comment) {
                            var arrayId = el.aId = $easy.code(10);
                            comment = uiHandler.com.create(arrayId, { $tmp: el });
                            el.$e.com = comment;
                            // Removing the current element
                            el.aboveMe().replaceChild(comment, el);
                        }

                        var methods = extractor($scope, 'function');
                        // Executes the main action
                        function exec($array) {
                            forEach($array, function (item, index) {
                                var copy = el.cloneNode(true), data = {};
                                forEach([name, vars.cmds.order], function (p) {
                                    copy.removeAttribute(p);
                                });
                                copy.aId = el.aId;

                                data = uiHandler.cmd.for.item({
                                    item: item,
                                    dec: helper.dec,
                                    data: $scope,
                                    array: $array,
                                    index: index,
                                    extIndex: obj.index
                                });
                                var itemData = extend.addToObj(data, methods);
                                // Compiling the element and stoping the mutation
                                Compiler.compile({
                                    el: copy,
                                    data: itemData,
                                    skipAutoCompile: true
                                });
                                EasyEvent.emit({
                                    elem: copy,
                                    type: vars.events.add,
                                    model: data,
                                    scope: itemData
                                });
                                comment.parentNode.insertBefore(copy, obj.neighbor || comment);
                            });
                        }

                        // Order if needed
                        var orderBy = OrderBy({
                            elem: el,
                            data: $scope,
                            reference: comment,
                            array: { value: array },
                            actions: {
                                run: function () {
                                    ReactiveArray.retrieveElems(comment, true);
                                    exec(this.order(this.array));
                                }
                            }
                        })

                        exec(orderBy.array);

                        if(orderBy.array.length === 0)
                            EasyEvent.emit({
                                elem: el,
                                type: vars.events.empty
                            });    
                    } catch (error) {
                        Easy.log(error.message);
                        return undefined;
                    }
                    // This comment will be added to the bind list of the property when it's the first time
                    return comment;
                }
            }
            /** Reads the e-for property and generate an object */
            this.cmd.for.read = function(el) {
                var scope = functionManager.attr(el, [vars.cmds.for]);
                if (!scope.value) return { ok: false, msg: Easy.log('[BadDefinition]: Invalid expression in e-for') };
                
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
                    var $variables = dec.replaceAll(['(', ')']).split(',');
                    $dec = { first: $variables[0], sec : $variables[1] };
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
                    obj = item;
                    obj.$scope = data;
                } else {
                    // Getting the declaration expression
                    Object.defineProperty(obj, trim(dec.first), $propDescriptor(array, index));
                    // If if has an index defined in for config obj use it
                    if (!isNull(dec.sec)) {
                        obj[trim(dec.sec)] = ( !isNull(extIndex) ? extIndex : index );
                        new ReactiveProperty({ object: obj, property: trim(dec.sec) });
                    }
                    obj = extend.addToObj(obj, data);
                }
                return obj;
            }
            /** Check if a string has the delimiter */
            this.getDelimiters = function (str) {
                if (isNull(str) || str === '') return [];
                var check = function (text, flag) {
                    var center = '([\\S\\s]*?)';
                    for (var i = 0; i < uiHandler.$$delimiters.length; i++) {
                        var dlm = uiHandler.$$delimiters[i], 
                        result = text.match( RegExp( dlm.delimiter.open + center + dlm.delimiter.close, flag) );
                        if ( result ) return result; 
                    }
                }

                var res = check(str, 'g');
                if (!res) return [];
                return res.map(function (item) {
                    var matches = check(item);
                    return {
                        field: matches[0],
                        exp: trim(matches[1])
                    }
                });
            }
            /** set value field as #value or #text. */
            this.setNodeValue = function (field, $data) {
                var origin = field.$e.$base, name = field._name || field.nodeName;
                var value = field.$e.$oldValue, htmlData;

                forEach(field.$e.$fields, function (f) {
                    if (!isNull(htmlData)) return;
                    var fieldValue = functionManager.exec(f.exp, $data, true);
                    if (f.field.startsWith('{html{'))
                        htmlData = fieldValue;  
                    value = value.replaceAll( f.field, fieldValue );
                });

                // If has html delimiter set as html
                if (htmlData) {
                    var $$$el = toElement(htmlData);
                    origin.innerHTML = '';
                    Compiler.compile({
                        el: $$$el,
                        data: $data
                    });
                    return origin.appendChild($$$el);
                }

                var replaceable = name.startsWith('e-') && !vars.cmds.hasValue(name);
                var oldName = name;
                if (replaceable) name = name.substr(2);
                
                // If the element already has a property with this name,
                // Set the actually value of the field
                if ((name in origin)) {
                    try {
                        if ( !isNull(origin[name]) ) {
                            var ctorName = origin[name].__proto__.constructor.name;
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

                // If is a :href or i:href
                if (name == ':href' || name == 'i:href')
                    origin.valueIn('href', RouteHandler.normalizeRoute(value));
                
                return value;
            }
            /** UI template web request initializer */ 
            this.initConnectorRequest = function (elem, $$data) {
                var cmds = vars.cmds,
                    $scope = $$data || $easy.data,
                    attr = functionManager.attr(elem, [cmds.req], true);

                if (!attr) return;
                easyProperty(elem);

                var $value = trim(attr.value), $request = {};
                if(!$value) return Easy.log({ message: error.invalid('e-req'), el: elem });

                // Repleacing if we got delimiters
                forEach(uiHandler.getDelimiters($value), function (f) {
                    $value = $value.replaceAll( f.field, functionManager.exec(f.exp, $scope) );
                });

                // Checking if it is an object
                if (($value[0] === '{' && $value[1] !== '{')) {
                    $request = functionManager.eval($value, $scope);
                } else {
                    $request.$url = $value;
                    $request.$type = 'many';
                }
                
                if(isNull($request.$url))
                    return Easy.log({ message: 'The property `$url` is mandatory in e-req attribute.', el: elem });
                
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
                                uiHandler.initConnectorRequest(el, $request.$scope);
                            }
                            $w.destroy();
                        }, $request); 
                    });
                }

                function prepareMany(data) {
                    $request.$data = data;
                    new ReactiveObject($request);

                    // Emitting the response event
                    EasyEvent.emit({
                        elem: elem,
                        type: vars.events.response,
                        model: $request.$data,
                        scope: $scope
                    });

                    // It's added after Reactive Call to avoid to be altered too
                    $request.$el = elem;
                    // Storing the data in the request data
                    webDataRequests[$request.$code || 'r' + $easy.code(8)] = $request;

                    // Building e-for var declaration
                    var $use = functionManager.attr(elem, [vars.cmds.use], true) || '';
                    if($use) {
                        Compiler.addOldAttr({ el: elem, value: $use });
                        $use = $use.value + ' of ';
                    }
                    // Builing e-for filter
                    var filter = functionManager.attr(elem, [vars.cmds.filter], true) || '';
                    if(filter) { 
                        Compiler.addOldAttr({ el: elem, value: filter });
                        filter = ' | ' + filter.value;
                    }

                    elem.valueIn('e-for', $use + '$data' + filter);
                    Compiler.compile({
                        el: elem,
                        data: extend.addToObj($scope, { $data: $request.$data })
                    });

                    watchRequestChanges([ '$id', '$url' ]);
                }

                function prepareOne(data) {
                    // Building e-for var declaration
                    var $use = functionManager.attr(elem, [vars.cmds.use], true) || '';
                    if($use) {
                        Compiler.addOldAttr({ el: elem, value: $use });
                        $use = $use.value;
                    }
                    
                    // Setting the alias variable if was defined
                    if ($use) {
                        $request.$data = {};
                        $request.$data[$use] = data; 
                    } else {
                        $request.$data = data;
                    }
                    new ReactiveObject($request);
                    
                    // Emitting the response event
                    EasyEvent.emit({
                        elem: elem,
                        type: vars.events.response,
                        model: $request.$data,
                        scope: $scope
                    });

                    // It's added after Reactive Call to avoid to be altered too
                    $request.$el = elem;
                    // Storing the data in the request data
                    webDataRequests[$request.$code || 'r' + $easy.code(8)] = $request;

                    Compiler.compile({
                        el: elem,
                        data: extend.addToObj($request.$data, $scope)
                    });

                    watchRequestChanges([ '$id' ]);
                }

                switch ($request.$type) {
                    case 'many':
                        return $easy.read($request.$url, $request.$id)
                        .then(function(data) {
                            if(!data.status)
                                return Easy.log(data.message);
                            prepareMany(data.result);
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
                                return Easy.log(data.message); 
                            prepareOne(data.result);
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
                        return Easy.log({ message: 'Unknown `$type` in e-req', el: elem });
                }
            }
        }
        /** Helper Class that Makes a primitive property reactive on get and set */
        function ReactiveProperty(config) {
            var object = config.object;
            var property = config.property;
            var $prop = object[property];

            if ($propDescriptor(object, property).writable === false) return this;
            if (($prop instanceof Element) || (isObj($prop) && $prop.__proto__.NOREACTIVE)) return this;
            if(!isNull($propDescriptor(object, property).get)) return this;
            
            // If it's a function
            if (typeof $prop === 'function') {
                object[property] = $prop.bind($easy);
                return this;
            }

            // Defining the property config
            var propConfig = {
                descriptor: null,
                property: property,
                value: $prop,
                binds: [],
                watches: []
            }
            // Execute when some primitive changes
            function emitPrimitiveChanges(el, $dt) {
                uiHandler.setNodeValue(el, $dt);
            }
            // Execute when some object changes
            function emitArrayChanges(bind, newValue, oldValue) {
                function getType(obj) {
                    if (isArray(obj)) return 'array';
                    return typeof obj;
                }
                var newType = getType(newValue), oldType = getType(oldValue), el = bind.el;
                if (newType !== oldType) return Easy.log('[BadDefinition]: The types of the objects are diferents, Old Type: ' + oldType + '; New Type: ' + 
                            newType + '. ' + 'You need to set the same object types to performe the change in the DOM.');
                
                if (newType !== 'array') return;
                // Only run if the element is a #comment 
                if (el.nodeName !== '#comment') return;
                
                ReactiveArray.retrieveElems(el, true);
                // Adding the elments to the DOM
                uiHandler.cmd.for({
                    el: el.$tmp, 
                    array: newValue, 
                    comment: el, 
                    data: bind.obj
                });
            }
            // Setting the default getter and setter
            $propDefiner(object, property, {
                get: function reactive () {
                    if (getter) getter(object, propConfig);
                    return propConfig.value;
                },
                set: function reactive () {
                    var newValue = arguments[0];
                    var oldValue = propConfig.value;
                    // The values are the same do nothing
                    if (newValue === oldValue) return;
                    if (isObj(newValue)) {
                        if (isArray(newValue)) {
                            var value = forEach(newValue, function (item) {
                                if (isObj(item)) return new ReactiveObject(item);
                                return item; 
                            });
                            propConfig.value.splice(0, propConfig.value.length);
                            propConfig.value.push.apply(propConfig.value, value);
                        } else{
                            if (!isNull(object[property]) && !(newValue instanceof Element)){
                                object[property].mapObj(newValue, true);
                                new ReactiveObject(object[property]);
                            } else {
                                object[property] = newValue;
                            }
                        }
                    } else {
                        // The values are the same do nothing
                        propConfig.value = newValue;
                    }
                    
                    // calling binds
                    toArray(propConfig.binds, function (bind) {
                        if (bind.isObj)
                            emitArrayChanges(bind, newValue, oldValue);
                        else
                            emitPrimitiveChanges(bind.el, bind.obj);

                        // In case of e-if or e-order, etc. check if the linked comment with is still connected
                        if ((bind.el.com && bind.el.com.isConnected === true)) return;
                        // If the owner element is connected do nothing
                        if (bind.el.$e.$base && bind.el.$e.$base.isConnected === true) return;
                        // Maintenance
                        if ((bind.el instanceof Element) && (bind.el.isConnected === false))
                            bind.bind.destroy(); // If it is an Element
                        else if (('ownerElement' in bind.el) && isNull(bind.el.ownerElement))
                            bind.bind.destroy(); // If it is an Element node
                    });
                    // calling watches
                    toArray(propConfig.watches, function (watch) {
                        watch.callback(newValue, oldValue);
                    });
                }
            });
            propConfig.descriptor = $propDescriptor(object, property);
            object[property] = propConfig.value;
        }
        /** Helper Class that Makes some array methods reactive on the calls */
        function ReactiveArray(config) {
            this.refs = {};
            var self = this, property = config.property, $getterArg;
            getter = function () { $getterArg = arguments; }
            
            var $array = config.object[property]; unget();
            var propConfig = $getterArg[1];

            // Execute when some value changes
            function emitChanges(config) {
                forEach(propConfig.binds, function (bind) {
                    if (!bind.isObj)
                        // Updating bound nodes
                        return uiHandler.setNodeValue(bind.el, bind.obj);
                    // Rerender all the array on change
                    if (options.config.rerenderOnArrayChange === true) {
                        ReactiveArray.retrieveElems(bind.el, true);
                        uiHandler.cmd.for({
                            el: bind.el.$tmp, 
                            array: config.array, 
                            comment: bind.el, 
                            data: bind.obj
                        });
                    } else {
                        // Make the change on the value changed
                        var elems = ReactiveArray.retrieveElems(bind.el);
                        function add(args, neighbor) {
                            uiHandler.cmd.for({
                                el: bind.el.$tmp, 
                                array: args.keys().map(function(key){
                                    return args[key];
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
                    // Emitting the changes
                    emitChanges({
                        array: $array,
                        oldArray: oldArray,
                        method: method,
                        args: arguments,
                        return: res,
                    });
                    
                    if (!isNull($array.done))
                        $array.done(method, arguments);
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
                var prop = object[key];

                if ( (prop instanceof Element) || (isObj(prop) && prop.__proto__.NOREACTIVE)) continue;
                // If the property is already a reactive one, skip.
                if(!isNull($propDescriptor(object, key).get)) continue;
                
                new ReactiveProperty({
                    object: object,
                    property: key
                });

                if (typeof prop === 'object' && !isNull(prop)) {
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
                        if (prop.constructor.name === 'Inc' || prop.constructor.name === 'Easy' || prop instanceof Node)
                            continue;
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
                    // Node name resolver: if 'key' treat as 'value'
                    var resolver = { 'TEXTAREA': 'INPUT', 'DIV' : 'INPUT' };
                    nodeName = resolver[nodeName] || nodeName; 
                    
                    callback = function () {
                        if (!config.el.$e || !config.el.$e.b)
                            return Easy.log('[Bad Definition], Data Binding was not configured in the element, please, ' +
                                'make sure that the element was compiled before binding.');
        
                        var bindConfig = config.el.$e.b;
                        var value = config.el[bindConfig.data];
                        if (!isNull(value) && value !== bindConfig.val) {
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
                array.filtered = forEach(array.value, function (item, index) {
                    var obj = item;
                    // if it is primitive, define an object with a declatation variables
                    if (dec && !isObj(item)) {
                        obj = {};
                        // Cleaning the expression
                        obj[trim(dec.first)] = item;
                        if(dec.sec) obj[trim(dec.sec)] = index;
                    }
                    return functionManager.eval(exp[1], obj);
                });
                this.reference = config.actions.run(array.filtered || array.value);
            } else {
                var lastValue = array.value, filterType = 'global', condition;

                if ( (filter.indexOf(':') !== -1) ) {
                    filterType = 'targeted';
                } else {
                    var vtrim = trim(filter);
                    condition = functionManager.eval(vtrim, $data);
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
                                trim(exp[1]).split(',').findOne(function (part) {
                                    var val = functionManager.eval(part, item);
                                    if (!val) {
                                        Easy.log(error.invalid(val + ' in ' + part));
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

                var $getterArgs = []; // [0] -> obj; [1] -> prop
                getter = function () { $getterArgs.push(arguments); }
                var $value = functionManager.eval(exp[0], $data); unget();

                this.reference = execute($value);
                // Watching the change of property in the filter
                forEach($getterArgs, function (arg) {
                    watch = Watch.exec(arg[1].property, function (value) {
                        if (self.reference.isConnected === false)
                            return self.destroy(); // auto destroy if it does not exits;
                        execute(value);
                    }, arg[0]);
                })
            }

            this.destroy = function () {
                if (watch) watch.destroy();
            }
        }
        /** Helper class that handle list order actions of an element */
        function OrderBy(config) {
            var self = {};
            // The element that will be linked this filter
            self.reference = config.reference;
            self.elem = config.elem;
            self.data = config.data;
            self.array = config.array.value;
            self.attr = config.attr = functionManager.attr(config.elem, [vars.cmds.order]) ||
                        // Checking the attribute in the old attributes property
                        (config.elem.$e.$oldAttrs || []).findOne(function (at) {
                            return at.name === vars.cmds.order;
                        });

            if (!self.attr) return self;
            // Defining com property to avoid the element to be removed by the bind maintenance
            self.attr.com = self.reference;
            // Getting the delimiter if exists
            var fields = uiHandler.getDelimiters(self.attr.value), exp, watches = [];
            
            self.order = function(array) {
                exp = config.attr.value.split(':');
                return OrderBy.exec(array, exp[0], exp[1]);
            }

            if (fields.length) {
                Compiler.compile({
                    el: config.attr,
                    data: config.data
                });
                
                forEach(fields, function (field) {
                    // Watching the bound properties
                    watches.push(Watch.exec(field.exp, function () {
                        if (self.reference.isConnected === false)
                            return self.destroy(); // auto destroy if it does not exits
                        config.actions.run.call(self);
                    }, config.data));
                });
            } else{
                Compiler.addOldAttr({ el: self.attr, value: self.attr }); 
            }

            self.array = self.order(extend.array(config.array.value));
            
            if (!config.array.value.__proto__.done)
                config.array.value.__proto__.done = function (method, args) {
                    self.array[ method ].apply(self.array, args);
                }

            self.destroy = function () {
                forEach(watches, function (w) { w.destroy(); });
            }
            return self;
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
            this.base = element;
            this.target = element;
            if (options) options.keys(function (key, value) { self[key] = value; });
        }
        /** Helper to handle the Routes. Dependencies: Easy, Includer */
        function RouteHandler(config) {
            this.routeView = config.el;
            this.routeView.removeAttribute('route-view');
            this.manuallyMarkedAsActive = null;
            var inc = config.includer;
            var msg = function(codeName, firstPage, secPage) {
                return ({ message: 'It is not allowed to define more than one '+ codeName +' page.' + 
                '\n  Please, choose between \''+ firstPage +'\' and \''+ secPage +'\' in components definition.' });
            }

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
            var getPath = function(url, rewriteUrl) {
                var urlResolver = urlResolve(url);
                var navegateTo = urlResolver.href.replaceAll(urlResolver.anchor.baseURI);
                var usehash = inc.config.usehash;
                
                rewriteUrl.url = urlResolver.href;
                // Removing the hash if necessary
                var ruleHome = /(^#$)|(^\/#$)|(^#\/$)|(^\/#\/$)/g;
                var ruleOtherPage = /(^#)|(^\/#)|(^#\/)|(^\/#\/)/g;

                if (usehash && urlResolver.hash.match(ruleHome))
                    navegateTo = '/';
                else if (usehash && navegateTo.match(ruleOtherPage) )
                    navegateTo = urlResolver.hash;
                    
                navegateTo = (navegateTo[0] === '/' ? navegateTo : '/' + navegateTo).trim();
                navegateTo = navegateTo.split('?')[0];
                // If it is an empty path load the default page
                if ( navegateTo === '' || navegateTo === '/' || navegateTo === '/index.html' )
                    return this.defaultPage;

                return RouteHandler.findPath(navegateTo) || this.notFoundPage;
            }
            this.navegate = function (url, isPopState) {
                var rewriteUrl = {}; // Store the url the needs to be wrote
                var path = getPath.call(this, url, rewriteUrl);
                
                this.clear();
                if (!path) return Easy.log('[NotFound]: 🛸 404 Page not found!!!');

                // Changing the title and the url if it needed
                if (path.title)
                    doc.title = path.title;

                // Changing the title and the url if it needed
                if (isNull(isPopState) && path.route)
                    this.pushState(rewriteUrl.url, path.title);

                var el = doc.createElement('inc');
                el.valueIn('src', path.name);
                if ( path.keepAlive === true )
                    el.valueIn('keep-alive', '');
                this.routeView.appendChild(el);

                if (this.manuallyMarkedAsActive){
                    this.manuallyMarkedAsActive.classList.remove('active-link');
                    this.manuallyMarkedAsActive = null;
                }

                forEach((RouteHandler.lastActivePath || {}).links, function (a) {
                    a.classList.remove('active-link');
                });

                forEach(path.links, function (a) {
                    a.classList.add('active-link');
                });

                RouteHandler.lastActivePath = path;
            }
            this.pushState = function (url, title) {
                $global.history.pushState({ url: url }, title, url);
            }
            this.popState = function (number) {
                if ( isNull(number) ) number = -1;
                $global.history.go(number);
            }
            this.markActive = function (anchor) {
                if (!(anchor instanceof HTMLAnchorElement)) return;

                if (this.manuallyMarkedAsActive)
                    this.manuallyMarkedAsActive.classList.remove('active-link');
                
                forEach((RouteHandler.lastActivePath || {}).links, function (a) {
                    a.classList.remove('active-link');
                });

                anchor.classList.add('active-link');
                this.manuallyMarkedAsActive = anchor;
            }
            this.go = (function go(route) {
                if (isNull(route)) return;
                if (route < 0) return this.popState(route);
                var incConfig = config.includer.config;
                var urlResolver = urlResolve(route);
                return location.href = ((incConfig.usehash ? '/#/' : '/') + urlResolver.pathname).replaceAll('//', '/');
            }).bind(this);

            $global.addEventListener('popstate', (function (evt) {
                evt.preventDefault();
                this.navegate((evt.state || {}).url || location.href, true);
            }).bind(this));

            this.navegate(location.href);
            RouteHandler.navegate = this.navegate.bind(this);
        }
        
        // Static functions
        /** Bind all the properties that was read */
        Bind.exec = function (elem, object, callback, options) {
            try {
                // Defining the getter to object in the dt
                var $getterArg; // [0] -> obj; [1] -> prop
                getter = function () { $getterArg = arguments; }
                callback();

                if ($getterArg) {
                    if (!options) options = {};
                    var config = {
                        el: elem,
                        layer: object,
                        lastLayer: $getterArg[0],
                        property: $getterArg[1]
                    };
                    // Adding the options to the config
                    options.keys(function (key, value) { config[key] = value; });
                    // Binding the element
                    new Bind(config);
                }
            } catch(error) {
                throw (error);
            } finally {
                unget(); // Destroying the stored function
            }
        }
        /** Finds a path from include elements */
        RouteHandler.findPath = function (input) {
            // Searching for the path
            for (var key in includerManager.paths) {
                var path = includerManager.paths[key];
                if (!path.route) continue;

                // rebuilding the route
                var route = path.route.split('/').map(function(sec) {
                    return sec[0] === ':' ? '[\\S\\s]{1,}' : sec; 
                }).join('/');

                if( isArray(new RegExp('^'+ route +'$', 'gi').exec(input)) )
                    return path;
            }
        }
        /** Normalizes a route according to the baseURI and/or hash */
        RouteHandler.normalizeRoute = function(input) {
            var resolver = urlResolve(input);
            var builtUrl = resolver.anchor.baseURI;

            if (componentConfig.usehash)
                builtUrl += '#';
            else
                resolver.pathname = resolver.pathname.substr(1);
            
            builtUrl += resolver.pathname;
            return builtUrl;
        }
        /** watch a property from data */
        prototype.watch = Watch.exec = function (prop, callback, object) {
            if (!object) object = $easy.data;
            if ( !object.hasOwnProperty(prop) ) return;
            var $getterArg; // [0] -> obj; [1] -> prop
            getter = function () { $getterArg = arguments; };
            var _ = object[prop]; unget();

            return new Watch({
                property: $getterArg[1],
                callback: callback
            });;
        }
        /** Get listed array html elements from a comment */
        ReactiveArray.retrieveElems = function (comment, remove) {
            if (!comment) return [];
            if (isNull(remove)) remove = false;
            var elems = [], current = comment.previousElementSibling;
            while(current) {
                if (current && isNull(current.aId) && comment.$id !== current.aId) break;
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
                    if (isNull(asc) || isNull(des))
                        return 0;
                        
                    switch(type.toLowerCase()) {
                        case 'asc': return asc ? 1 : -1;
                        case 'des': return des ? -1 : 1;
                        default: 
                            Easy.log('[BadDefinition]: \''+ type +'\' is invalid type of order by. Avaliable types are: ' +
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
            var type = options.type, name = 'on:' + type;
            if(!options.elem.hasAttribute || !options.elem.hasAttribute(name)) return;
            var attr = functionManager.attr(options.elem, [ name ], true);
            if (trim(attr.value) === '') return Easy.log('[BadDefinition]: Invalid expression in ' + attr.name);
            var event = new EasyEvent(type, options.elem, {
                $data: { model: options.model, scope: options.scope },
                result: options.result
            });
            Compiler.addOldAttr({ el: options.elem, value: attr });      
            var eventDesc = $propDescriptor($global, 'event');
            // Defining to the global object
            $propTransfer($global, { event: event }, 'event');        
            // Calling the function, it is evaluated based on model data not the scope
            var $$result = functionManager.eval(attr.value, options.scope || {});
            if (typeof $$result === 'function') $$result.apply($easy, [event]);
            // Defining the old value in the global object
            $propDefiner($global, 'event', eventDesc);
        }
        Compiler.setDefault = function(config) {
            var attr = config.attr;
            if (!attr._name)
                attr._name = attr.nodeName;
            if (!attr.$e.$oldValue)
                attr.$e.$oldValue = attr.nodeValue;
        }
        Compiler.addOldAttr = function(config) {
            easyProperty(config.el);
            var el = config.el, value = config.value;
            if (!el.$e.$oldAttrs) {
                el.$e.$oldAttrs = [ value ];
            } else {
                if (el.$e.$oldAttrs.findOne(function (old) { return old == value; }))
                    return value;
                el.$e.$oldAttrs.push(value);
            }
        }
        Compiler.setValue = function(obj) {
            var data = extend.addToObj(obj.scope, obj.methods);
            uiHandler.setNodeValue(obj.current, data);
            // Binding all the fields
            return forEach(obj.current.$e.$fields, function (field) {
                Bind.exec(obj.current, obj.scope, function () { functionManager.eval(field.exp, data); });
            });
        }
        Compiler.getUpData = function(el) {
            do {
                if(!el.$e) continue;
                var curr = el.$e.data
                if(typeof curr === 'function')
                    return curr();
            } while(el = el.parentNode)
        }
        try {
            // Setting the initial data
            this.setData(options.data);
            this.data = options.data;
            // Initializing easy animations css
            this.css();

            // Registing the  dependencies
            this.use(options.dependencies);

            function $$init(){
                this.el = doc.node($elSelector || '');

                if (!this.el)
                    return Easy.log('[NotFound]: Element with selector \''+ $elSelector +'\' not found, please check it.');
                
                options.mounted.call(this, this.el);
                Compiler.compile({
                    el: $easy.el,
                    data: $easy.data,
                    done: function () {
                        options.loaded.call($easy, $easy.el);
                        // Setting the ui observer
                        uiHandler.observer.mutation(function (elem) {
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

                var routeView = this.el.node('[route-view]');
                if(routeView){
                    $easy.routing = RouteHandler.instance = new RouteHandler({
                        el: routeView, 
                        includer: includerManager
                    });
                }
            }
            if ( options.config.useDOMLoadEvent )
                doc.addEventListener('DOMContentLoaded', $$init.bind(this), false);
            else 
                $$init.call(this);
        } catch(error) {
            Easy.log({ message: '[InternalError]: Error while initializing. Description: ' + error.message, error: error });
        }
    }
    function EasyLog(log, type) {
        var $logInstance = {};
        $logInstance.__proto__ = Object.create(EasyLog.prototype, {
            constructor: { value: EasyLog, writable: true, configurable: true }
        });
        $logInstance.type = type;
        $logInstance.thrownAt = new Date().toLocaleString();
        if (isString(log))
            $logInstance.message = log;
        else if (isObj(log)) {
            for (var key in log)
                $propTransfer($logInstance, log, key);
            Object.defineProperties($logInstance, {
                message: { enumerable: true, value: log.message }, 
                file: { enumerable: true, value: log.file || './index.html' }
            });
        }
        
        $logInstance.name = log.name || 'Error';
        $logInstance.__proto__.toString = function(){ return $logInstance.message; };
        return $logInstance;
    }
    EasyLog.prototype = Object.create(Error.prototype, {
        constructor: { value: EasyLog, writable: true, configurable: true }
    });
    // Default proto methods
    Easy.prototype.http = http;
    Easy.prototype.extend = extend;
    Easy.prototype.return = function (status, message, result, extra) {
        return extend.addToObj({ status: status, message: message, result: result }, extra);
    }
    return Easy;
})));
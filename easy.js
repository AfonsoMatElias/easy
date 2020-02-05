/**
 * @author Afonso Matumona Elias
 * @version v2.0.0
 *
 * # easy.js
 * Released under the MIT License.
 * Easy.js 'easy and asynchronous js' is a javascript library that helps the designer or programmer
 * to build web application faster without writting too many lines of js codes.
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
function Easy(elem = '', {
    data = {},
    component = {}
} = {}) {

    const self = this;
    /** DOM Shortcut */
    const doc = document;
    /** Easyjs Variables */
    const vars = {
        template: [], // Templates
        stored: [], // all removed elements on initialization
        components: {}, // Includer component
        events: [], // Events
        hidden: {}, // Hidden
        calls: [], // UI Calls
        proxy: [], // Proxies
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
            for: 'e-for',
            tag: 'e-tag',
            data: 'data',
            def: 'e-def'
        }, // Commands
        keyboard: {
            ENTER: 13,
            ESC: 27
        }, // keyboard keys
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
            reverse: (v) => {
                switch (v) {
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
        } // easy animations keys
    };
    /** helpers */
    const helpers = {
        /**
         * Active all easy extensions
         */
        extensions() {

            // Prevents redefinition of the extensions
            if(!helpers.isInvalid(doc.node)) return;

            // Extension setter
            const def = function (key, cb, type) {
                Object.defineProperty((type || Object).prototype, key, {
                    value: cb,
                    writable: true,
                    configurable: true
                });
            };

            // Query one element
            def('node', function (v) {
                if (helpers.isInvalid(v)) return null;

                const result = v[0] === '#' ?
                    this.getElementById(v.substr(1)) :
                    this.querySelector(v);
                return result;

                //return UI.stored.find(v);
            });
            // Query many elements
            def('nodes', function (v) {
                if (helpers.isInvalid(v)) return null;

                const result = this.querySelectorAll(v).toArray();
                return result;

                //return UI.stored.findAll(v);
            });
            // get key of an object
            def('keys', function (cb) {
                const array = Object.keys(this);
                // Calling the callback if it needs
                if (cb) array.filter(e => cb(e, this[e]));
                return array;
            });
            // map values from an object to the current one
            def('mapObj', function (input, deep = false) {
                return input.keys((p, v) => {
                    let destination = this[p];
                    if (deep && destination instanceof Object) {
                        if (!Array.isArray(destination)) {
                            this[p].mapObj(v);
                        }
                    } else {
                        let source = (v ? v : this[p]);
                        if (source != destination)
                            this[p] = source;
                    }
                });
            });
            // transform any static array to a dynamic one
            def('toArray', function (cb) {
                let array = [].slice.call(this);
                // Calling the callback if it needs
                if (cb) array.filter(cb);
                return array;
            });
            // Get or Set and Get value from an attribute or content value
            def('valueIn', function (name, set) {
                // To Set and Get the same value
                if (set)
                    return this.setAttribute(name, set) || this.getAttribute(name);
                // Only get value
                else
                    return name != null ? this[name] || this.getAttribute(name) : this.innerText;
            }, Element);
            // copy a HTML Node
            def('copyNode', function () {
                return this.cloneNode(true);
            });
            // get the elem above the current element
            def('aboveMe', function (selector) {
                // Parent getter
                const parent = (elem, name) => {
                    const parentObject = elem.parentNode;
                    if (parentObject === doc) return null;
                    // Checking if the search must
                    if (name) {
                        if (parentObject.tagName && parentObject.tagName.toUpperCase() != name.toUpperCase()) {
                            const normalizedName = name.replace('#', '').replace('.', '');
                            if (name.startsWith(".")) {
                                const containClass = parentObject.classList.contains(normalizedName);
                                if (!containClass) return parent(parentObject, name);
                            } else if (name.startsWith("#")) {
                                if (parentObject.valueIn('id') != normalizedName) return parent(parentObject, name);
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
            def('has', function (value) {
                // Finding any property that matches the input value
                return this.keys().find(x => this[x] === value);
            });
            // Gets any object that matches the value
            def('get', function (value) {
                // Finding the object that matches a value or index
                return this.find(x => x === value || x.has(value)) || this[value];
            }, Array);
            // Get the index of an object
            def('index', function (value) {
                let index = -1;
                this.find((x, i) => {
                    if ((x === value || x.has(value))) {
                        index = i;
                        return true;
                    }
                    return false;
                });
                return index;
            }, Array);
            // Get the index of all the ocurrencies of an object
            def('indexes', function (value, cb) {
                let array = [];
                // Finding the object that matches a value or index
                this.filter((x, i) => {
                    if ((x === value || x.has(value)))
                        array.push(i);
                });
                // Calling the callback if it needs
                if (cb) array.filter(e => cb(e));
                return array;
            }, Array);
            // Remove element(s) from an array
            def('remove', function (value, allWith = false) {
                try {
                    // Handling the default pop function if the value is not defined
                    if (!value && value != 0) {
                        this.pop();
                    } else {
                        // Otherwise, Handling the costumized remove function
                        // Removing all objects with this value
                        if (allWith === true) {
                            const indexes = [...this].indexes(value, i => {
                                // removing the element
                                this.splice(i, 1);
                            });

                            if (indexes.length === 0)
                                self.log(`Element '${value}' does not exist in the array.`);

                        } else {
                            let index = this.index(value);
                            if (index === -1) {
                                if (Number.isInteger(value * 1))
                                    index = value * 1;
                                else
                                    self.log(`Element '${value}' does not exist in the array.`);
                            }
                            // removing the element
                            this.splice(index, 1);
                        }
                    }
                } catch (error) {
                    self.log({
                        msg: 'Remove function error. ',
                        error
                    });
                }

                return this;
            }, Array);
            // Animation extension
            // The main function for the animation extension to be shared between them
            const niceShared = (elem, direction, key, other) => {
                // Adding a style elem in the DOM
                easy.css();

                const anm = vars.anm;
                const keyNormalized = key.toLowerCase().split(':');

                // the animations keys, defined by the user
                const keyIn = keyNormalized[0];
                const keyOut = keyNormalized[1] || anm.reverse(keyIn);

                if (other) {
                    // TODO: Redefine this peace of code
                    other.niceOut(keyOut);
                }

                anm['to'].keys((k, v) => elem.classList.remove(v));
                anm['from'].keys((k, v) => elem.classList.remove(v));

                // Adding the class in the main element
                elem.classList.add(anm[direction][keyIn]);
            }
            // Execute the nice in animation into an element
            def('niceIn', function (key, outElem, cb, delay = 80) {
                // Executing the main function
                niceShared(this, 'to', key, outElem);
                // Executing the callback
                setTimeout(_ => {
                    if (cb) cb(this, outElem);
                }, delay);
            }, HTMLElement);
            // Adds the nice out animation into an element
            def('niceOut', function (key, inElem, cb, delay = 80) {
                // Executing the main function
                niceShared(this, 'from', key, inElem);
                // Executing the callback
                setTimeout(_ => {
                    if (cb) cb(this, inElem);
                }, delay);
            }, HTMLElement);
            // End Animation Extension
            // Generate element description. eg.: form#some-id.class1.class2
            def('desc', function () {
                let elem = this;
                return [elem.nodeName.toLowerCase(), (elem.id ? '#' + elem.id : ''), ...elem.classList.toArray().map(x => '.' + x)].join('')
            }, Element);
            // Adds Event listener in a object or a list of it
            def('listen', function (name, cb) {
                let elems = Array.isArray(this) ? this : [this];

                // Looping the elements
                for (const elem of elems) {
                    // Checking if the element is valid
                    if (!(elem instanceof Element || elem === document|| elem === window))
                        return self.log(`Cannot apply '${name}' to the element ${elem.nodeName ? elem.nodeName : elem.toString()}.`)

                    // Event object
                    const evt = {
                        event: name,
                        func: cb,
                        options: false
                    }

                    elem._events_ = elem._events_ ? [...elem._events_, evt] : [evt];
                    elem.addEventListener(evt.event, function () {
                        // base property where will be passed the main object, **not the target**.
                        arguments[0]['base'] = elem;
                        evt.func(...arguments);
                    }, evt.options);
                }
            });
            // Helper to replace every ocurrence of a string or a list of strings
            def('replaceAll', function (vl, rvl = '') {
                let count = 0;
                let curr = this;
                do { 
                    if(!Array.isArray(vl))
                        curr = curr.replace(vl, rvl);
                    else
                        vl.filter(el => curr = curr.replaceAll(el, rvl));
                count++;
                if(count === 1000) break;
                } while(curr.includes(vl));
                return curr;
            }, String);
        },
        /**
         * Check if a value is null/undefined
         * @param {*} input The input value
         */
        isInvalid: input => (typeof input === 'undefined') || (input === undefined || input === null),
        /**
         * Check if a value is a string
         * @param {String} input The input value
         */
        isString: input => (typeof input !== 'undefined') && (typeof input === 'string'),
        /**
         * Gets a description 'name, id, classes' of an element
         * @param {Element} elem The element to get de description
         */
        desc: elem => (elem instanceof Element ? elem.desc() : elem),
        /**
         * Gets a string template name and normalize it, cleanning [] or :
         *  Eg.: **[Product]** -> *Product*;
         *       **Product:Id0011** -> *Product*;
         *       **[Product:Id0011]** -> *Product*.
         * @param {String} name - the string to be normalized
         */
        tmpNameNormalizer: name => {
            if (!name) return '';
            // Product:P0001
            return name[0] === '[' ? 'scoped' : name.split(':')[0];
        },
        /**
         * Change access type from reference one to index one.
         * @param {String} path - The path
         * @param {String} exp - The expression to combined
         * @param {Object} dt - The data model
         */
        fieldPathNormalizer: (path, exp, dt) => {
                    
            if(exp.includes('$this'))
                path = '';
            
            if(!helpers.isInvalid(dt.$index))
                exp = exp.replaceAll(dt.$name, `['${dt.$index}']`); 
            
            return helpers.toPath(path, exp);
        },
        /**
         * Execute an expression and returns the value if valid and undefiened is not valid
         * @param {String} exp The expression to be evaluated
         * @param {Object} $data The model to get the value if needed, by default is empty object
         * @param {Object} _return_ Allow to define if the function needs to have a return value or not
         */
        eval(exp, $data = {}, _return_ = true) {
            let fields = $data.keys().join(', ');
            try {
                let value = undefined;
                if(helpers.isInvalid(exp) || exp === '') return;
                eval(`let $this = self.data; 
                      let { ${ fields } } = $data;
                      ${ _return_ ? 'value =' : '' } ${exp}`);
                return value;
            } catch (error) {
                self.log(`${error.message} . \nExpression: {{ ${ exp } }} .\nAvailable variables: { ${fields} }.`);
                return undefined;
            }
        },
        /**
         * Execute an expression and returns the value if an primitive or a JSON if an object, 
         * and an empty string if is not valid
         * @param {String} exp The expression to be evaluated
         * @param {Object} $data The model to get the value if needed, by default is empty object
         * @param {Boolean} json Allow to convert the result to json if it's an object, by default is false
         */
        exec(exp, $data = {}, json = false) {
            try {
                let value = helpers.eval(exp, $data);
                if (helpers.isInvalid(value)) return '';
                if (json){
                    if (value instanceof Object) 
                        value = JSON.stringify(value);
                }

                return value;
            } catch (error) {
                return '';
            }
        },
        /**
         * Builds arguments to array accesable one. 
         *  Eg.: 'Person.Name' => ['Person']['Name']
         */
        toPath() {
            let path = '';
            for (const key in arguments) {
                const el = arguments[key];
                if (!helpers.isInvalid(el) && el !== '') {
                    if (Array.isArray(el))
                        path += el.map(m => `['${m}']`).join('');
                    else if (helpers.isString(el)) {
                        path += el.split('.')
                            .filter(f => f)
                            .map(m => !m.includes('[') && !m.includes('$this') ? `['${m}']` : m)
                            .join('');
                    }
                }
            }
            return path;
        },
        /**
         * Get 'toPath' value and clear the first ['...']
         *  Eg.: ['Person']['Name'] => Person['Name']
         */
        fromPath: input => { 
            let test = input.match(/\['(.*?)'\]/);

            if(test) {
                if(input.startsWith(test[0]))
                input = test[1] + input.substr(test[0].length);
            }
            return input;
        },
        /**
         * Transform any code to string
         */
        codeToString: _ => `(${ _.toString() })()`,
        /**
         * Helper to loop an array
         * @param {Array} array The array to be looped
         * @param {Function} cb The callback function
         */
        for (array, cb) {
            for (let i = 0; i < array.length; i++)
                cb(array[i], i);
        },
        /**
         * Get an attribute of an element
         * @param {Element} elem The element to be searched
         * @param {Array} attrs The attributes, the order matter 
         * @param {Boolean} remove Allow to remove the attribute if was found
         */
        attr(elem, attrs = [], remove = false) {
            let attr = elem.attributes.toArray()
                            .find(at => attrs.find(a => at.name === a) ? true : false);

            if(attr && remove)
                elem.removeAttribute(attr.name);

            return attr;
        },
    };
    // UI Handler
    const UI = {
        // UI observer functions
        observer: {
            /**
             * Subcribe get and read requests
             * @param {Object} obj - The call object
             */
            subscribe(obj) {
                vars.calls.push(obj);
                return {
                    id: obj.id,
                    run: obj.call
                };
            },
            // emit add action to the UI
            emitAdd(r, path) {
                if (r.status)
                    vars.calls.forEach(function (c) {
                        if (c.flag === path && c.meth === 'list')
                            c.call(r.result);
                    });
            },
            // emit update action to the UI
            emitUpdate(id, model, path) {

                vars.template.filter(m => {
                    const bool = m.model.has(id) &&
                        (path === helpers.tmpNameNormalizer(m.tmp.tmpAttr.value));
                    if (!bool) return;

                    // Mapping the object
                    m.model.mapObj(model, true);

                    // Filling the element
                    self.html.fill(m.tmp, m.model);
                });
            },
            // emit remove action to the UI
            emitRemove(id, path) {
                [...vars.template.filter(m => m.model.has(id) &&
                    (path === helpers.tmpNameNormalizer(m.tmp.tmpAttr.value)))]
                .filter(m => {

                    if (m.tmp.tmpAttr.name === vars.cmds.fill)
                        // Cleaning the element
                        self.html.fill(m.tmp);
                    else
                        // Removing the child
                        m.tmp.aboveMe().removeChild(m.tmp);
                });
            },
            // Proxy handler
            proxy(target, cb, baseKeys = []) {
                for (const key in target) {
                    if (typeof target[key] === 'object') {
                        target[key] = UI.observer.proxy(target[key], cb, [...baseKeys, key])
                    }
                }

                return new Proxy(target, {
                    set(target, key, value) {
                        if (typeof value === 'object') value = UI.observer.proxy(value, cb, [...baseKeys, key]);
                        const old = typeof target[key] === 'object' ? { ...target[key] } : target[key];
                        const curr = target[key] = value;
                        cb([...baseKeys, key], curr, key, old);
                        return target;
                    },
                    get(target, key) {
                        if (key === '_isProxy') return true;
                        return target[key];
                    }
                });
            }
        },
        // Handle the stored elements
        stored: {
            // Add element to stored array
            add: (e) => {
                e._easyId = e._easyId || self.code(10);
                if (!vars.stored.find(x => x._easyId === e._easyId))
                    vars.stored.push(e);
            },
            // Find if an element is in stored array
            find: (selector) => {
                return vars.stored.find(s => {
                    const body = doc.createElement('body');
                    body.appendChild(s.copyNode());
                    return body.querySelector(selector);
                });
            },
            findAll: (selector) => {
                return vars.stored.filter(s => {
                    const body = doc.createElement('body');
                    body.appendChild(s.copyNode());
                    return body.querySelector(selector);
                });
            }
        },
        // Comments handler
        comment: {
            // Creates a comment with some identifier
            create: (id) => {
                const comment = document.createComment(' e ');
                comment._id_ = id || self.code();
                return comment;
            },
            // Gets a comment from an element
            get: (elem, id) => {
                if(!elem) return undefined;
                
                const filterNone = () => NodeFilter.FILTER_ACCEPT; 
                const iterator = document.createNodeIterator(elem, NodeFilter.SHOW_COMMENT, filterNone, false); 
                
                let node = undefined; 
                while (node = iterator.nextNode()){
                    if(node._id_ === id) 
                        return node;
                }

                return undefined; 
            }
        },
        /**
         * handle a string to see if it gots easy commands written
         * @param {String} str The input string that needs to be checked
         */
        hasField(str) {
            if (helpers.isInvalid(str) || str === '') return [];

            const res = str.match(/-e-[^-]*-/g) || str.match(/{{(.*?)}}/g);
            if (!res) return [];

            return res.map(m => {
                const elem = m.match(/-e-(.*?)-/) || m.match(/{{(.*?)}}/);
                return {
                    field: elem[0],
                    exp: elem[1].trim()
                };
            });
        },
        /**
         * Reads an element to find easy commands
         * @param {HTMLElement} elem The element to be read
         * @param {Object} data The object model having the data 
         * @param {Function} cb The callback for each element found
         * @param {Object} path The path to get the data
         */
        read(elem, data = {}, cb, path) {
            if (helpers.isInvalid(elem)) return [];

            // Defines some reading scopes
            const cmds = vars.cmds;
            const scopes = [cmds.tmp, cmds.fill, cmds.data, cmds.for, 'INC', 'inc-src'];

            // Data attribute value
            path = path || (elem.tmpAttr ? elem.tmpAttr.value : null);
            
            // Sets the old value of the attr and the element where it belongs
            const setBaseProps = (attr, elem) => {
                attr.$oldValue = attr.$oldValue || attr.nodeValue;
                attr.$baseElement = attr.$baseElement || elem;
            }

            // Adds attrs having easy definition  
            const addOldAttrs = (elem, value) => {
                if(!elem.$oldAttrs){
                    elem.$oldAttrs = [value]
                }else{
                    if(elem.$oldAttrs.find(x => x == value)) return value;
                    elem.$oldAttrs.push(value);
                }
                return value;
            }

            const exec = (elem, dt, path = '') => {
                // Checking if it's a scope element
                const scope = scopes.find(s => s === elem.nodeName) ? elem : undefined ||
                    helpers.attr(elem, scopes);

                if (scope) {
                    // For 'e-tmp' and 'e-fill' scope
                    if (scope.name === cmds.tmp || scope.name === cmds.fill) {
                        UI.init(elem);
                    }
                    // For inc
                    else if (scope.name === 'inc-src' || scope.nodeName === 'INC') {
                        inc.include(elem.valueIn('src') || elem.valueIn('inc-src'), elem);
                    }
                    // For 'data' scope
                    else if (scope.name === cmds.data) {

                        // Gettind and removing the attr
                        elem.tmpAttr = helpers.attr(elem, [cmds.data], true);
                        let source = null;
                        // Getting the object
                        
                        try {
                            const dataPath = helpers.toPath(elem.tmpAttr.value);
                            source = helpers.eval(helpers.fromPath(dataPath), dt);
                            
                            if(helpers.isInvalid(source)) throw ('get other data');
                        } catch {
                            // Building the path or getting the getting the object
                            source = helpers.eval(elem.tmpAttr.value) || dt;
                        }
                        
                        let pxy = true;
                        // Checking if it's inline object build
                        if(elem.tmpAttr.value && 
                            ( elem.tmpAttr.value.includes('{') || 
                              elem.tmpAttr.value.includes('[') ))
                            // Storing the inline build object
                            pxy = false;
                        else
                            path += '.' + elem.tmpAttr.value;

                        self.html.fill(elem, source, pxy);
                    }
                    // For 'for' scope
                    else if (scope.name === cmds.for) {

                        if(helpers.isInvalid(cb)) return;

                        const parts = scope.value.split(' of ');
                        const left = parts[0], right = parts[1];
                        const array = helpers.eval(right, dt);

                        if(array) {

                            elem.forId = elem.forId || self.code();
                            let comment = UI.comment.create(elem.forId);

                            // Checking is not inline array definition
                            if(!right.includes('['))
                                path += '.' + right;
                            
                            // Removing the current element
                            elem.aboveMe().replaceChild(comment, elem);
                            
                            for (let index = 0; index < array.length; index++) {
                                const item = array[index];
                                
                                let copy = elem.copyNode();
                                copy.removeAttribute(scope.name);
                                
                                const trim = input => {
                                    if (input) return input.trim();
                                }

                                // filling all the compontent
                                const declaration = left.replace('(', '').replace(')', '').split(',');

                                // The object that will be passed 
                                let obj =  {
                                    [trim(declaration[0])]: item,
                                    [trim(declaration[1]) || 'index']: index,
                                };
                                
                                // Property definer
                                const def = (name, val) => {
                                    Object.defineProperty(obj, name, {
                                        configurable: false,
                                        enumerable: true,
                                        writable: false,
                                        value: val
                                    });
                                }
                                
                                def('$index', index);
                                def('$name', trim(declaration[0]));

                                if(!helpers.isInvalid(declaration[1])) 
                                    def(declaration[1], index);
                                // Defining an index in the element
                                copy.$index = index;
                                UI.read(copy, obj, cb, path);
                                comment.parentElement.insertBefore(copy, comment);
                            }

                        }
                    }

                    return;
                }

                // checkin var definer
                const vdef = helpers.attr(elem, [cmds.def], true);
                if(vdef) {
                    // Evaluating the object that needs to be created
                    const defs = helpers.eval(vdef.value, dt);
                    // Defining it in the easy data property
                    if(defs) defs.keys((k, v) => self.data[k] = v);
                }

                // Calls the default UI.read callback
                const mainAction = (attr, fields, type = cmds.field, aditional = {}) => {
                    fields = fields.map(fl => Object({ ...fl, 
                        path: helpers.fieldPathNormalizer(path, fl.exp, dt) }));
                    // Setting the path in field 
                    attr.$fields = fields;
                    
                    if (cb) cb({
                        elem: attr,
                        fields: fields,
                        type: type,
                        ...aditional
                    }, dt);
                }

                // checking attributes
                [ ...(elem.$oldAttrs || []), ...elem.attributes.toArray() ]
                .filter(attr => {
                    // Event attr
                    if (attr.name.startsWith('listen:') || attr.name.startsWith('on:')) {
                        elem.listen(attr.name.split(':')[1], function () {
                            path = path.includes('{') || path.includes('[') ? '' : path;
                            const __m__ = dt || {}, exp = attr.value;
                            try {
                                eval(`let $this = self.data;
                                let { ${ __m__.keys().join(', ') } } = __m__; 
                                let res = typeof ${exp} === 'function';
                                if(res) ${exp}.call(${exp}, ...arguments);`);
                            } catch (error) {
                                helpers.eval(`self.data${helpers.toPath(path)}.${exp}`, __m__, false);
                            }
                        });
                    }

                    // if attr
                    if (attr.name === cmds.if) {
                        addOldAttrs(elem, attr);
                        // Storing the if value into a field and removing it
                        elem[cmds.if] = elem[cmds.if] || attr.value;
                        elem.removeAttribute(cmds.if);

                        if(!helpers.isInvalid(attr.value) && attr.value.trim() === '') return;
                        
                        // Checking if has some properties defined in the attribute 
                        let fields = attr.value.match(eval(`/${dt.keys().join('|')}/g`)) || [];
                        
                        // Buiild the fields
                        fields = fields.map(f => Object({ exp: f, field: f }));

                        mainAction(elem, fields, cmds.if, { isIf: true });
                    }

                    // Checking if the it has -e-[Something]- or {{ Something }}
                    const fields = UI.hasField(attr.$oldValue || attr.value);
                    if(fields.length > 0){
                        setBaseProps(attr, elem);
                        addOldAttrs(elem, attr);
                        mainAction(attr, fields);
                    }
                });

                // Checking the textcontent
                if (elem.firstChild) {
                    const attr = elem.firstChild;
                    const fields = UI.hasField(elem.firstChild.$oldValue || elem.firstChild.nodeValue);
                    if(fields.length > 0) {

                        setBaseProps(attr, elem);
                        mainAction(attr, fields);
                    }
                }

                // Getting in the children
                elem.children.toArray(child => {
                    if(child.tagName === 'BR'){
                        if(child.nextSibling){
                            const fields = UI.hasField(child.nextSibling.$oldValue || child.nextSibling.nodeValue);

                            if(fields.length > 0 && helpers.isInvalid(attr.$fields)){
        
                                setBaseProps(child.nextSibling, elem);
                                mainAction(child.nextSibling, fields);
                            }
                        }
                    }else{
                        exec(child, dt, path);
                    }
                });
            };


            // Checking if the template is already in the list of it
            if (helpers.isInvalid(vars.template.find(t => t.tmp === elem))) {
                vars.template.push({
                    tmp: elem,
                    model: data
                });
            }
            // Begining the reading
            exec(elem, data, path);
        },
        /**
         * Fills an element field, such as #value, #text, etc.
         * @param {HTMLComponet} field The field to be filled 
         * @param {Object} $dt The data object 
         * @param {HTMLDataElement} copy The original copy of the element having the firat values 
         */
        fillField(elem, $dt) {

            const origin = elem.$baseElement;
            const name = elem.nodeName;

            // Getting the value
            let value = elem.$oldValue;

            elem.$fields.filter(f => {
                const val = helpers.exec(helpers.fromPath(f.exp), $dt, true);
                value = value.replaceAll(f.field, val);
            });

            if (name === 'value' || name === 'id')
                // Setup of value and id this way
                origin[name] = value;
            else
                // Other can be this way
                elem.nodeValue = value;
            if (name.startsWith('e-') && !vars.cmds.has(name)) {

                origin.valueIn(name.substr(2), elem.nodeValue);
                origin.removeAttribute(name);
            }
        },
        // Sets the atached to the current element
        setEvents(element, events) {
            if (events) events.filter(evt => {
                element.addEventListener(evt.event, function () {
                    arguments[0]['base'] = element;
                    evt.func(...arguments);
                }, evt.options)
            });
        },
        /**
         * UI initiator
         * @param {HTMLElement} element The element to be initialized
         */
        async init(element) {
            const cmds = vars.cmds;
            const attr = helpers.attr(element, [cmds.fill, cmds.tmp, cmds.data], true);
            element.tmpAttr = attr;
            if(attr === undefined) 
                return;

            // tmp/fill actions
            const actions = {
                'e-tmp': {
                    wait(cb, sec = 1) {
                        let t = setTimeout(_ => {
                            cb();
                            clearTimeout(t);
                        }, sec * 40);
                    },
                    // Main action
                    async main(e, parts, container) {
                        let counter = 1;
                        const rvs = e.valueIn(cmds.rvs) === 'true' ? true : false;

                        await self.read(parts[0], data => {
                            const insert = _ =>
                                self.html.add(container, data, {
                                    reverse: rvs
                                });

                            // Wait a bit to insert the element to de DOM
                            if (e.hasAttribute(cmds.anm))
                                actions[cmds.tmp].wait(_ => insert(), counter++);
                            else
                                insert();

                        }, e.valueIn(cmds.filter));
                    },

                    // Sec action
                    async sec(e, parts, container) {
                        let counter = 1;
                        const rvs = e.valueIn(cmds.rvs) === 'true' ? true : false;

                        await self.source(eval(parts[0])).read(data => {
                            // Checking if all the content needs to removed
                            const insert = _ => {
                                self.html.add(container, data, {
                                    reverse: rvs
                                });
                            }

                            // Wait a bit to insert the element to de DOM
                            if (e.hasAttribute(cmds.anm))
                                actions[cmds.tmp].wait(_ => insert(), counter++);
                            else
                                insert();

                        }, e.valueIn(cmds.filter));
                    }
                },
                'e-fill': {
                    // Main action
                    async main(e, parts) {
                        await self.getOne(parts[0], parts[1], e, parts[2]);
                    },
                    // Secondary action
                    async sec(e, parts) {
                        await self.source(eval(parts[0])).getOne(parts[1], e, parts[2]);
                    }
                }
            }

            let container = null;
            
            if (attr.name === cmds.data) {
                const source = helpers.eval(attr.value);
                self.html.fill(element, source, true);
            } else {

                switch (attr.name) {
                    // For fill template 
                    case cmds.fill:
                        // In case of fill without value
                        if (helpers.isInvalid(attr.value) || attr.value === '') {
                            self.html.fill(element);
                            return;
                        }
                        break;
                        // For tmp template
                    case cmds.tmp:

                        container = element.aboveMe();

                        // Setting the template value in the container
                        container.valueIn(cmds.tmp, attr.value);

                        // Setting his template                
                        container.$tmp = element;
                        container.removeChild(element);

                        UI.stored.add(element);

                        if (element.valueIn('e-auto') === 'true') return;
                        break;
                }

                // Checking if it matches the brackets
                const match = attr.value.match(/\[(.*?)\]/);

                if (!match) {
                    // Product:P001:Code
                    // Spliting the value
                    const parts = attr.value.split(':');
                    // Checking if any connector is available
                    if (!helpers.isInvalid(self.conn))
                        await actions[attr.name].main(element, parts, container);
                    else
                        self.log(error.conn());
                } else {
                    // Product:P001:Code
                    // Spliting the value
                    const parts = match[1].split(':');

                    try {
                        if (!Array.isArray(eval(parts[0]))) throw ({
                            message: `The obj '${parts[0]}' is not an array.`
                        });
                        await actions[name].sec(element, parts, container);
                    } catch (error) {
                        self.log(error.message);
                    }
                }
            }
        },
    };
    // Error messages
    const error = {
        conn: _ => `It seems that there is not any easy connector available. please check if any easy.[ajax|free|something].js is imported.
    \nOr instead, use easy.source([MyArray])..., and define e-tmp="[MyArray]" | e-fill="[MyArray:MyId]."`,
        notFound: (v = '') => `Element '${v}' not found.`,
        invalid: (v = '') => `Invalid value${ v ? ': ' + v : '' }.`,
        invalidField: (v = '') => `Invalid field${ v ? ': ' + v : '' }.`,
        ds: _ => `The Data Source is invalid, please, make sure it is an Array.`,
        elem: (v = '') => `The selector or object passed for '${v}' is invalid, please check it.`
    };

    // Store the first connector
    const conn_temp = !helpers.isInvalid(self.conn) ? {
        ...self.conn
    } : undefined;

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
        add: function (container, data = {}, {
            elem,
            reverse = false
        } = {}) {
            // Filling the element
            const template = self.html.fill(container.$tmp.copyNode(), data);

            if (helpers.isInvalid(container._callId))
                container._callId = data._callId;

            // Cleaning the template
            vars.cmds.keys((k, v) => template.removeAttribute(v));

            // Defining a tmp attr
            template.tmpAttr = template.tmpAttr || helpers.attr(container, [vars.cmds.tmp]);

            // Setting the events attached to his origin element
            UI.setEvents(template, container.$tmp._events_);

            if (!elem) {
                // Default insertion
                if (reverse) container.insertBefore(template, container.children[0]);
                else container.appendChild(template);
            } else {
                // Insertion in some point
                if (reverse) container.insertBefore(template, elem);
                else container.insertBefore(template, elem.nextElementSibling);
            }
        },
        /**
         * Allow to fill an element
         * @param {HTMLElement} element The html element or string selector
         * @param {Object} data The object model to get the values to fill
         * @returns {HTMLElement} The element filled
         */
        fill: function (element, data = {}) {
            const cmds = vars.cmds;
            let addProxy = arguments[2] || false;

            // Setting the template name
            element.tmpAttr = element.tmpAttr ||
            helpers.attr(element, [cmds.fill, cmds.tmp, cmds.data], true);

            // Reading the UI element
            UI.read(element, data, function (comp, dt) {
                
                switch (comp.type) {
                    case cmds.field: {
                        
                        if(comp.fields.find(x => x.exp.includes('$this')))
                            addProxy = true;
                        
                        if(addProxy) {
                            comp.base = element;
                            vars.proxy.push(comp);
                        }

                        UI.fillField(comp.elem, dt);
                        break;
                    }

                    case cmds.if: {
                        if(comp.elem[cmds.if].includes('$this'))
                            addProxy = true;
                        
                        if(addProxy){
                            vars.proxy.push(comp);
                        }

                        self.html.toggle(comp.elem, dt);
                        break;
                    }
                }

            }, element.tmpAttr ? element.tmpAttr.value : undefined);

            const anm = element.valueIn(vars.cmds.anm);
            // Applying animation if needed
            if (!helpers.isInvalid(anm)) element.niceIn(anm);
            return element;
        },
        /**
         * Hides (Or show, if it was used in a model with a model property) an element from the DOM
         * @param {Element} elem The element to toggled according easy show attribute 
         * @param {Object} data The object model to get the values
         */
        toggle: function (elem, data = {}) {
            const exp = elem[vars.cmds.if];
            const res = helpers.exec(exp, data);
            const prop = vars.cmds.id;

            if (res === false) {
                const id = easy.code();
                const above = elem.aboveMe();

                if (helpers.isInvalid(above))
                    return self.log(`It seems like the element having e-if 
                    '${helpers.desc(elem)}' does not exist in the DOM anymore.`, 'warn');

                vars.hidden[id] = elem;
                const comment = UI.comment.create(id);

                above.replaceChild(comment, elem);
                elem.valueIn(prop, id);

            } else if (res === true) {

                const id = elem.valueIn(prop);
                if (helpers.isInvalid(id)) return;

                const commet = UI.comment.get(self.elem, id);
                
                if (helpers.isInvalid(commet))
                    return self.log(`It seems like the element having e-if 
                    '${helpers.desc(elem)}' has been removed manually.`, 'warn');

                // Restoring the
                elem.removeAttribute(prop);
                commet.parentElement.replaceChild(elem, commet);

                delete vars.hidden[id];
            }
        }
    };
    // Helper to add easy css in the DOM
    this.css = () => {
        let easyStyle = doc.node('[e-style="true"]');
        if (easyStyle) return;

        let style = doc.createElement("style");
        style.valueIn('e-style', 'true');

        const val = {
            dist: 15,
            opacity: 1,
            dur: 0.2
        };

        // Creates to- animation body
        const toAnim = (name, dir) => `transform: translate${dir}; -webkit-transform: translate${dir};
        animation: ${name} ${val.dur}s ease-out forwards; -webkit-animation: ${name} ${val.dur}s ease-out forwards;`;
        // Creates from- animation body
        const fromAnim = (name) => `animation: ${name} ${val.dur}s ease-out forwards; -webkit-animation: ${name} ${val.dur}s ease-out forwards;`;
        // Creates keyframes animation body
        const keyframes = (name, opacity, dir) => `keyframes ${name} { to { opacity: ${opacity}; transform: translate${dir}; } }`;

        style.textContent = `
            .hide-it { display: none !important; }
            .to-top, .to-bottom, .to-right, .to-left { opacity: 0; }
            .from-top, .from-bottom, .from-right, .from-left
            { opacity: 1; transform: translateY(0%); -webkit-transform: translateY(0%); }

            .to-top { ${toAnim('to-top', 'Y(' + val.dist +'%)')} }
            .to-bottom { ${toAnim('to-bottom', 'Y(-' + val.dist +'%)')} }
            .to-right { ${toAnim('to-right', 'X(-' + val.dist +'%)')} }
            .to-left { ${toAnim('to-right', 'X(' + val.dist +'%)')} }

            .from-top { ${fromAnim('from-top')} }
            .from-bottom { ${fromAnim('from-bottom')} }
            .from-right { ${fromAnim('from-right')} }
            .from-left { ${fromAnim('from-left')} }

            @${keyframes('to-top', val.opacity, 'Y(0%)')}
            @${keyframes('to-bottom', val.opacity, 'Y(0%)')}
            @${keyframes('to-right', val.opacity, 'X(0%)')}
            @${keyframes('to-left', val.opacity, 'X(0%)')}

            @-webkit-${keyframes('to-top', val.opacity, 'Y(0%)')}
            @-webkit-${keyframes('to-bottom', val.opacity, 'Y(0%)')}
            @-webkit-${keyframes('to-right', val.opacity, 'X(0%)')}
            @-webkit-${keyframes('to-left', val.opacity, 'X(0%)')}

            @${keyframes('from-top', 0, 'Y(' + val.dist +'%)')}
            @${keyframes('from-bottom', 0, 'Y(-' + val.dist +'%)')}
            @${keyframes('from-right', 0, 'X(-' + val.dist +'%)')}
            @${keyframes('from-left', 0, 'X(' + val.dist +'%)')}

            @-webkit-${keyframes('from-top', 0, 'Y(' + val.dist +'%)')}
            @-webkit-${keyframes('from-bottom', 0, 'Y(-' + val.dist +'%)')}
            @-webkit-${keyframes('from-right', 0, 'X(-' + val.dist +'%)')}
            @-webkit-${keyframes('from-left', 0, 'X(' + val.dist +'%)')}`;

        doc.head.appendChild(style);
    };
    /**
     * Creates an obj (if form is a selector) and send it to the available connector
     * @param {String} path The URL endpoint
     * @param {HTMLElement | HTMLSelector} form The html element or string selector
     * @return The easy return type
     */
    this.create = async (path, form) => {
        try {
            // Checking the connector
            if (helpers.isInvalid(self.conn)) throw ({
                message: error.conn()
            });

            // Getting the object js object
            let obj = helpers.isString(form) ? self.toJsObj(form) : form;
            if (!obj) throw ({
                message: error.elem('create')
            });
            // Sending and Getting the data from the data source
            let r = await self.conn.add(path, obj);
            if (helpers.isInvalid(r.result)) return r;

            UI.observer.emitAdd(r, path);
            return r;
        } catch (error) {
            return self.return(false, self.log(error), null);
        }
    }
    /**
     * Get all from a path
     * @param {String} path The URL endpoint
     * @param {Function} cb (optional) The callback that will be passed the return
     * @param {String} filter (optional) The string filter for the returned values
     * @return The easy return type
     */
    this.read = async (path, cb, filter) => {
        try {
            // Checking the connector
            if (helpers.isInvalid(self.conn)) throw ({
                message: error.conn()
            });

            // Sending and Getting the data from the data source
            let r = await self.conn.list(path, filter);
            if (helpers.isInvalid(r.result)) return r;

            if (!helpers.isInvalid(cb)) {
                // Subscribing the event
                const sub = UI.observer.subscribe({
                    id: `${helpers.tmpNameNormalizer(path)}:${self.code()}`,
                    meth: 'list',
                    flag: path,
                    call: cb
                });

                r.result.forEach(e => {
                    e._callId = sub.id;
                    sub.run(e);
                });
            }

            return r;
        } catch (error) {
            return self.return(false, self.log(error), null);
        }
    }
    /**
     * Creates an obj (if form is a selector) and send to the available connector to updated it
     * @param {String} path The URL endpoint
     * @param {HTMLElement} form The html element or string selector
     * @param {string} id The Id of the object that will be updated
     * @return The easy return type
     */
    this.update = async (path, form, id) => {
        try {
            // Checking the connector
            if (helpers.isInvalid(self.conn)) throw ({
                message: error.conn()
            });

            // Checking the id parameter is null
            if (!id) throw ({
                message: error.invalid('id')
            });

            // Getting the object js object
            let obj = helpers.isString(form) ? self.toJsObj(form) : form;
            // Checking if the object is valid
            if (!obj) throw ({
                message: error.elem('updated')
            });
            // Sending and Getting the data from the data source
            let r = await self.conn.update(path, obj, id);
            if (helpers.isInvalid(r.result)) return r;

            UI.observer.emitUpdate(id, r.result,
                helpers.tmpNameNormalizer(path));
            return r;
        } catch (error) {
            return self.return(false, self.log(error), null)
        }
    }
    /**
     * Deletes an obj from a source
     * @param {String} path The URL endpoint
     * @param {String} id The Id of the object that will be deleted
     * @return The easy return type
     */
    this.delete = async (path, id) => {
        try {
            // Checking the connector
            if (helpers.isInvalid(self.conn)) throw ({
                message: error.conn()
            });

            // Checking the id parameter is null
            if (!id) throw ({
                message: error.invalid('id')
            });

            // Sending and Getting the data from the data source
            let r = await self.conn.remove(path, id);
            if (helpers.isInvalid(r.result)) return r;

            // Adding the event to the DOM updater
            UI.observer.emitRemove(id,
                helpers.tmpNameNormalizer(path));
            return r;
        } catch (error) {
            return self.return(false, self.log(error), null);
        }
    }
    /**
     * getOne obj from a source
     * @param {string} path The URL endpoint
     * @param {string} id The Id of the object
     * @param {Function} cb (optional) The callback that will be passed the return
     * @return The easy return type
     */
    this.getOne = async (path, id, elem) => {
        try {
            // Checking the connector
            if (helpers.isInvalid(self.conn)) throw ({
                message: error.conn()
            });

            // Checking the id parameter is null
            if (!id) throw ({
                message: error.invalid('id')
            });

            // Sending and Getting the data from the data source
            let r = await self.conn.getOne(path, id);
            // Checking if the result is not valid
            if (helpers.isInvalid(r.result)) throw ({
                message: r.msg
            });

            if (!helpers.isInvalid(elem)) {
                // Subscribing the event
                const sub = UI.observer.subscribe({
                    id: `${helpers.tmpNameNormalizer(path)}:${self.code()}`,
                    meth: 'get',
                    flag: path,
                    call: (elem, mdl) => {
                        if (elem) {
                            // Getting the element
                            let mElem = helpers.isString(elem) ? self.elem.node(elem) : elem;
                            if (mElem) {
                                mElem._callId = sub.id;
                                self.html.fill(mElem, mdl);
                            } else
                                self.log(error.notFouded(helpers.desc(elem)));
                        }
                    }
                });

                sub.run(elem, r.result);
            }

            return r;
        } catch (error) {
            return self.return(false, self.log(error), null);
        }
    }
    /**
     * easy function that allows the user to pass an array as data source and manage with the main actions (CRUD).
     * It doesnt modify the main data source
     * @param {Array} ds The data source
     * @returns {Easy} The main easy object
     */
    this.source = (ds) => {
        const path = 'scoped';
        self.conn = {
            async add(r, mdl) {
                try {
                    let last = ds[ds.push(mdl) - 1];
                    return self.return(true, 'Ok', last);
                } catch (error) {
                    return self.return(false, error, null)
                }
            },
            async remove(r, id) {
                try {
                    if (!id) throw ({
                        message: error.invalid(id)
                    });

                    let obj = ds.get(id);
                    ds.remove(id);

                    return self.return(true, 'Ok', obj);
                } catch (error) {
                    return self.return(false, error, null)
                }
            },
            async update(r, obj, id) {
                try {
                    let index = ds.index(id);
                    ds[index].mapObj(obj);

                    return self.return(true, 'Ok', ds[index]);
                } catch (error) {
                    return self.return(false, error, null)
                }
            },
            async list(r, filter) {
                try {
                    return self.return(true, 'Ok', self.filter(ds, filter));
                } catch (error) {
                    return self.return(false, error, null)
                }
            },
            async getOne(r, id) {
                try {
                    return self.return(true, 'Ok', ds.get(id));
                } catch (error) {
                    return self.return(false, error, null)
                }
            },
        };
        return {
            create: async (form) => {
                let res = await self.create(path, form);
                self.conn = conn_temp ? {
                    ...conn_temp
                } : undefined;
                return res;
            },
            read: async (cb, filter) => {
                let res = await self.read(path, cb, filter);
                self.conn = conn_temp ? {
                    ...conn_temp
                } : undefined;
                return res;
            },
            update: async (form, id) => {
                let res = await self.update(path, form, id);
                self.conn = conn_temp ? {
                    ...conn_temp
                } : undefined;
                return res;
            },
            delete: async (id) => {
                let res = await self.delete(path, id);
                self.conn = conn_temp ? {
                    ...conn_temp
                } : undefined;
                return res;
            },
            getOne: async (id, elem) => {
                let res = await self.getOne(path, id, elem);
                self.conn = conn_temp ? {
                    ...conn_temp
                } : undefined;
                return res;
            },
        };
    }
    /**
     * Generates an Javascript Object from an HTML Element
     * Eg.: easy.toJsObj(element, { names: '[name],[nm]', values: '[value],[vl]' })
     * @param {HTMLElement} input The html element or string selector
     * @param {Object} name Defines which attribute will be search for. By default is [name], the order matters!
     * @param {Object} value Defines which attribute will be taken the value. By default is [value], the order matters!
     * @returns {Object} Javascript object
     */
    this.toJsObj = (input, {
        names = '[name]',
        values = '[value]'
    } = {}) => {

        if (!input) return null;

        const elem = helpers.isString(input) ? doc.node(input) : input;

        if (!elem) {
            self.log(error.notFound(input));
            return null;
        }

        // Store the build command name
        const cmd = vars.cmds.build;

        const buildObj = (element) => {
            // Elements that it needs to escape on serialization
            const escapes = ['BUTTON', 'DIV', 'SPAN'];
            const clear = val => val.split(',').map(el => el.replace('[', '').replace(']', '').trim()); 

            const obj = {};

            const tryGetValue = e => {
                let val = null;
                clear(values).find(v => (val = e.valueIn(v)) ? true : false);
                return val;
            }

            (function exec(el) {

                const mNames = clear(names);
                const attr = helpers.attr(el, mNames);
                if(attr){

                    name = attr.value;

                    if (escapes.find(f => f === el.tagName)) return;
                    if (el.type === 'checkbox' && el.checked === false) return;
    
                    const prop_value = obj[tryGetValue(el)];
                    const isArray = el.hasAttribute(vars.cmds.array);

                    if (!isArray) {
                        if (prop_value)
                            eval(`obj[name] = [ ...prop_value, tryGetValue(el) ]`);
                        else
                            obj[name] = tryGetValue(el);
                    } else {
                        if (prop_value)
                            eval(`obj[name] = [ ...prop_value, tryGetValue(el) ]`);
                        else
                            eval(`obj[name] = [ tryGetValue(el) ]`);
                    }
                }

                el.children.toArray(c => (!helpers.attr(c, [cmd]) ? exec(c) : false));
            })(element);

            return obj;
        }

        // Building the base form
        const obj = buildObj(elem);

        // Getting the builds cleaned of inner builds
        const builds = elem.nodes(`[${cmd}]`);

        // Building builders
        builds.filter(b => {
            // Getting the e-build attr value
            const name = b.valueIn(cmd);
            // Checking if has an attr defined
            const isArray = b.hasAttribute(vars.cmds.array);
            // Building the object
            const value = buildObj(b);

            if(value.keys().length === 0) return;

            // Build a path to set the value in the main object
            const pathBuilder = (fullPath, cb) => {
                let path = '';
                // Looping the path
                const sections = fullPath.split('.');
                for (const sec of sections) {
                    path += `.${sec}`;
                    const prop_value = eval(`obj${path}`);
                    // Checking the path has a null value
                    if (helpers.isInvalid(prop_value)) {
                        eval(`obj${path}={}`);
                        // Checking if it's last section of the path
                        if (sections[sections.length - 1] === sec)
                            cb(path);
                    }
                    // Otherwise, check if the value is an array
                    else if (Array.isArray(prop_value)) {
                        const remainPath = helpers.toPath(fullPath.substr(path.length));
                        if(remainPath === '')
                            cb(path, prop_value);
                        else
                            prop_value.filter((e, i) => {
                                // Building new path according the index of the array
                                pathBuilder(`${path.substr(1)}[${i}]${remainPath}`, cb);
                            });
                        // Breaking the main loop, because every work is done
                        break;
                    }else{
                        // Checking if it's last section of the path
                        if (sections[sections.length - 1] === sec)
                            cb(path, prop_value);
                    }
                }
            }

            pathBuilder(name, (path, prop_value) => {

                if (isArray) {
                    // Checking if it already has properties defined
                    if (!helpers.isInvalid(prop_value))
                        eval(`obj${path}=[ ...prop_value, value ]`);
                    else
                        eval(`obj${path}=[ value ]`);
                } else {
                    // Checking if it already has properties
                    if (prop_value && prop_value.keys().length > 0)
                        eval(`obj${path}={ ...prop_value, ...value }`);
                    else
                        eval(`obj${path}=value`);
                }
            });
        });

        return obj;
    }

    /**
     * Message logger
     * @param {Object} input The object to console and return
     * @param {String} fun The console function name, by default is 'error'
     */
    this.log = (input, fun = 'error') => {
        return console[fun]('Easy:', input) || input;
    }

    // Includes Handler
    const inc = {
        /**
         * The a file from the server
         * @param {String} path The of the element 
         * @param {Function} cb The callback if it is ok
         */
        async get(path, cb) {
            // let base = location.pathname;
            // let array = base.split("/");
            // let last = array[array.length - 1];
            // base = base.replace(last, "");
            
            // fetch function to get the file
            let result = await fetch( `${location.origin}/${path}.html` , {
                // setting the method
                method: 'get',
                // the default header content type
                headers: {
                    'Content-Type': 'text/plain'
                }
            });

            // Checking if the response is ok
            if (result.ok) {
                // Calling the callback
                cb(await result.text());
            } else {
                self.log(`Unable to load the file: ${path}. \nDescription: ${ result.statusText }`);
            }
        },
        /**
         * Html includer main function
         * @param {String} name The file Name or Path of the element that will be included. 
         * @param {HTMLElement} inc The inc element that the content will be included. 
         */
        async include(name, elem) {

            // Checking if the name is not Ok 
            if (helpers.isInvalid(name))
                return self.log(`Invalid value of attribute 'src' or 'inc-src' of '${elem.desc()}'. Or, it's undefiened. `);
           
            // Checking if the name is not Ok 
            if (helpers.isInvalid(elem))
                return self.log(`Invalid value element of '${name}'. Or, it's undefiened. `);

            // Set has includer done
            elem.idone = true;

            // Checking if the replace attribute is defined
            const no_replace = elem.hasAttribute('no-replace');
            // Page Get
            if (name[0] === '@') {
                // Normalizing the name, removing @
                const nameNormalized = name.substr(1);

                let el = vars.components[nameNormalized];

                if (!el) {
                    // Getting the template
                    el = self.elem.node(`[inc-tmp='${nameNormalized}']`);
                    // Storing the inc
                    if (el) {
                        const div = doc.createElement('div');
                        el.removeAttribute('inc-tmp');

                        div.innerHTML = el.outerHTML;

                        el = div.children[0];
                        vars.components[nameNormalized] = el;
                    }
                }

                // Checking if the template was found
                if (!el) return self.log(`No element[inc-tmp] was found with this identifier '@${nameNormalized}'`, 'warn');

                if (helpers.isString(el)) return self.log(`Wrong 'src' or 'inc-src', try to set to outer include removing '@' sign in '${name}'.`, 'warn');

                el = el.copyNode();

                const dt = elem.valueIn('data');
                const fill = (el) => {
                    const source = helpers.eval(helpers.fromPath(helpers.toPath(dt))) || helpers.eval(dt);
                    self.html.fill(el, source, true);
                }

                if (!no_replace){
                    elem.aboveMe().replaceChild(el, elem);
                    fill(el);
                }
                else{
                    elem.innerHTML = el.outerHTML;
                    fill(elem.children[0]);
                }

                return;
            }

            // Getting the path
            let path = self.component[name]
            if (!path) path = name;

            // Server Get
            // Inserts the content to the DOM
            const insert = (content, store = false) => {
                // Storing the content
                if (store) vars.components[name] = content;

                // Creating a temporary element to transform the result
                // to a HTML Node
                const temp = doc.createElement('body');
                temp.innerHTML = content;

                const el = temp.children[0];
                const dt = elem.valueIn('data');

                if (!el) return self.log(`The component '${name}' seems to be empty. Please, check it!`, 'warn');

                el.tmpAttr = dt;

                // Adding inner elements
                const main = el.node('main');
                if (main) main.outerHTML = elem.innerHTML;

                const fill = (el) => {
                    const source = helpers.eval(helpers.fromPath(helpers.toPath(dt))) || helpers.eval(dt);
                    self.html.fill(el, source, true);
                }

                if (!no_replace){
                    elem.aboveMe().replaceChild(el, elem);
                    fill(el);
                }
                else{
                    elem.innerHTML = el.outerHTML;
                    fill(elem.children[0]);
                }

                // Looping the scripts
                for (let s of temp.nodes('script'))
                    // Evalueting them
                    eval(s.innerHTML);
            }

            let compContent = vars.components[name];
            // Checking if the component is stored
            if (compContent) {
                insert(compContent);
            }
            // Otherwise, check if we don't have a web request made to this path
            // because we don't wan't request again 
            else if (!inc.webRequest[name]) {
                // Setting that we have a web request to this path
                inc.webRequest[name] = true;
                // Getting the data
                await inc.get(path, function (content) {
                    delete inc.webRequest[name];
                    insert(content, true);
                });
            }
            // Otherwise, wait untill the web request is done 
            else {
                let t = setInterval(_ => {
                    // Checking if the component is configured
                    const content = vars.components[name];
                    if (content) {
                        insert(content);
                        clearInterval(t);
                    }
                }, 0);
            }
        },
        /**
         * Helper to get the source value a inc value 
         * @param {HTMLElement} elem The inc element
         */
        src: elem => elem.valueIn('src') || elem.valueIn('inc-src'),
        /**
         * Helper to check if a request to a path is on.
         * It Stores temporaty the path untill the is complete
         */
        webRequest: {}
    }

    /**
     * A code generator
     * @param {Number} length The length of chars to generate
     * @returns Some random code
     */
    Easy.prototype.code = (length = 25) => {
        const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_01234567890';
        let alt = false,
            result = '';
        for (let i = 0; i < length; i++) {
            let p = Math.floor(Math.random() * alpha.length);
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
    Easy.prototype.return = (status, message, result) => {
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
    Easy.prototype.filter = (array, expression) => {
        try {
            if (!array || !Array.isArray(array)) throw ({
                message: 'Bad array definition passed in easy filter function, it seems that is not an Array'
            });
            if (!expression) return array;
        } catch (error) {
            self.log(error);
            return array;
        }

        try {
            return array.filter(model => {
                let value = helpers.exec(expression, model) || false;
                return value;
            });
        } catch (error) {
            self.log('Something is wrong with the expression!: ' + expression, 'warn');
            return [];
        }
    };
    
    // Initializing Easy
    try {
        // Setting all the extensions
        helpers.extensions();

        // Setting the proxy
        self.data = UI.observer.proxy({
            ...data
        }, function (props, value) {

            const isObject = (typeof value === 'object');
            const path = helpers.toPath(props);
            const rootPath = isObject ? path : helpers.toPath([...props].remove());

            const data = eval(`self.data${ rootPath }`);

            for (const comp of vars.proxy) {
                if(comp.fields && 
                   comp.fields.find(p => p.path === path || p.exp.startsWith('$this'))) {
                    if (comp.isIf === true) {
                        self.html.toggle(comp.elem, data);
                        continue;
                    }
    
                    UI.fillField(comp.elem, data);
                }
                else if(isObject && comp.path.startsWith(rootPath)){
                    self.html.fill(comp.base, data);
                }
            }
        });

        // Observing the DOM
        const observer = cb => new MutationObserver(mutations => {
            const cmds = vars.cmds;
            mutations.filter(mut => {
                // For show attribute changes
                if (mut.attributeName === cmds.if)
                    if (helpers.exec(mut.target.valueIn(vars.cmds.if)) === false) {
                        let above = mut.target.aboveMe();
                        if (above && !mut.target.attributes.hasAttribute(vars.cmds.id))
                            above.removeChild(mut.target);
                    }

                // For added nodes
                for (let node of mut.addedNodes) {
                    if (node.hasAttribute && helpers.attr(node, [cmds.tmp, cmds.tmp])){
                        cb(node);
                    }

                    if(node.tagName === 'INC' || 
                    (node.hasAttribute && node.hasAttribute('inc-src'))){
                        const src = node.valueIn('src') || node.valueIn('inc-src'); 
                        if(!node.idone)
                            inc.include(src, node);
                    }
                }

                // For attributes tmp attribute changes
                if ((mut.attributeName === cmds.tmp || mut.attributeName === cmds.fill)) {
                    const target = mut.target;
                    const attr = helpers.attr(target, [cmds.tmp, cmds.tmp]);

                    if (helpers.isInvalid(attr)) return;

                    switch (mut.attributeName) {
                        case cmds.tmp:
                            if (!mut.oldValue) return;

                            // Removing the call attached to this container
                            vars.calls.remove(target._callId);
                            target._callId = null;
                            target.innerHTML = '';
                            target.$tmp.valueIn(cmds.tmp, attr.value);

                            UI.init(target.$tmp);
                            break;
                        case cmds.fill:
                            // Removing the call attached to this element
                            vars.calls.remove(target._callId);
                            UI.init(target);
                            break;
                    }
                }

            });
        });

        
        // Listening the DOM
        doc.listen('DOMContentLoaded', () => {
            
            // Defining the root elem
            self.elem = document.node(elem);
            self.component = component;

            // Checking if the app element is set
            if (helpers.isInvalid(self.elem)) {
                self.log('Root element not found, please check it.', 'warn');
                return self;
            }

            // Initializing easy animation css
            if (self.elem.node('[e-anm]')) self.css();

            UI.read(self.elem, self.data);

            // Init... the observer
            observer(elem => UI.init(elem)).
            observe(self.elem, {
                attributes: true,
                attributeOldValue: true,
                attributeFilter: [vars.cmds.tmp, vars.cmds.fill, vars.cmds.if, 'inc-src'],
                childList: true,
                subtree: true,
                characterData: false
            });

        });

    } catch (error) {
        self.log({
            msg: 'Error while initializing.',
            error
        });
    }

    return this;
}
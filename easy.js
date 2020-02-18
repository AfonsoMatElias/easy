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
/**
 * Easy main object
 * @param {Element} elem The root element where easy.js will have control 
 * @param {Object} options Options to define data and components of the page 
 */
function Easy(elem = '', options = {}) {
    // The main object reference
    const $e = this;
    
    // Store every objects of the 
    $e.data = {};
    // Defining the $this reference
    const $this = $e.data; 

    /* Object address */
    // Store adddress of every property defined in the 'data' 
    const propertiesAddress = {};
    
    /**
     * Message logger
     * @param {Object} input The object to console and return
     * @param {String} fun The console function name, by default is 'error'
     */
    this.log = function (input, fun = 'error') {
        return console[fun]('Easy:', input) || input;
    }

    if(typeof document === 'undefined' || typeof window === 'undefined')
        return $e.log('Document Element or Window element is undefined');

    /** DOM Shortcut */
    const doc = document;
    this.global = window;

    /** Easyjs Variables */
    const vars = {
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
            reverse: function (v) {
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

    // Easy Dependencies
    // Function and Extensions used by easy
    const funcs = new Func();
    // UI Handler
    const ui = new UIHandler();
    // Includer
    const inc = new Includer(options.components || {});

    // Error messages
    const error = {
        conn: _ => `It seems that there is not any easy connector available. please check if any easy.[ajax|free|something].js is imported."`,
        notFound: (v = '') => `Element '${v}' not found.`,
        invalid: (v = '') => `Invalid value${ v ? ': ' + v : '' }.`,
        invalidField: (v = '') => `Invalid field${ v ? ': ' + v : '' }.`,
        elem: (v = '') => `The selector or object passed for '${v}' is invalid, please check it.`
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
        add: function (container, data = {}, {
            elem,
            reverse = false
        } = {}) {
            // Filling the element
            const template = $e.html.fill(container.$tmp.copyNode(), data);

            if (funcs.isInvalid(container._callId)) {
                container._callId = data._callId;
                // Setting the element in web calls
                vars.webCalls[data._callId].elem = container;
            }

            // Cleaning the template
            vars.cmds.keys((k, value) => template.removeAttribute(value));

            // Defining a tmp attr
            template.tmpAttr = template.tmpAttr || funcs.attr(container, [vars.cmds.tmp]);

            // Setting the events attached to his origin element
            ui.setEvents(template, container.$tmp._events_);

            template.$preventMutation = true;

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
         * @param {HTMLElement} element The html element or selector
         * @param {Object} data The object model to get the values to fill
         * @returns {HTMLElement} The element filled
         */
        fill: function (element, data = {}) {
            const cmds = vars.cmds;

            // Setting the template name
            element.tmpAttr = element.tmpAttr ||
            funcs.attr(element, [cmds.fill, cmds.tmp, cmds.data], true);

            // Reading the UI element
            ui.read(element, data, element.tmpAttr ? element.tmpAttr.value : undefined);

            const anm = element.valueIn(vars.cmds.anm);
            // Applying animation if needed
            if (!funcs.isInvalid(anm)) element.niceIn(anm);
            return element;
        }
    };
    
    /**
     * Creates an obj (if form is a selector) and send it to the available connector
     * @param {String} path The URL endpoint
     * @param {HTMLElement} form The html element or selector
     * @return The easy return type
     */
    this.create = async function (path, form) {
        try {
            // Checking the connector
            if (funcs.isInvalid($e.conn)) throw ({
                message: error.conn()
            });

            // Getting the object js object
            const obj = $e.toJsObj(form);
            if (!obj) throw ({
                message: error.elem('create')
            });
            // Sending and Getting the data from the data source
            const r = await $e.conn.add(path, obj);
            if (funcs.isInvalid(r.result)) return r;

            ui.observer.emitAdd(r, path);
            return r;
        } catch (error) {
            return $e.return(false, $e.log(error), null);
        }
    }
    /**
     * Get all from a path
     * @param {String} path The URL endpoint
     * @param {Function} cb (optional) The callback that will be passed the return
     * @param {String} filter (optional) The string filter for the returned values
     * @return The easy return type
     */
    this.read = async function (path, cb, filter) {
        try {
            // Checking the connector
            if (funcs.isInvalid($e.conn)) throw ({
                message: error.conn()
            });

            // Sending and Getting the data from the data source
            const r = await $e.conn.list(path, filter);
            if (funcs.isInvalid(r.result)) return r;

            if (!funcs.isInvalid(cb)) {
                // Subscribing the event
                const sub = ui.observer.subscribe({
                    meth: 'list',
                    flag: path,
                    call: cb
                });

                r.result.forEach(function (e) {
                    e._callId = sub.id;
                    sub.run(e);
                });
            }

            return r;
        } catch (error) {
            return $e.return(false, $e.log(error), null);
        }
    }
    /**
     * Creates an obj (if form is a selector) and send to the available connector to updated it
     * @param {String} path The URL endpoint
     * @param {HTMLElement} form The html element or selector
     * @param {string} id The Id of the object that will be updated
     * @return The easy return type
     */
    this.update = async function (path, form, id) {
        try {
            // Checking the connector
            if (funcs.isInvalid($e.conn)) throw ({
                message: error.conn()
            });

            // Getting the object js object
            const obj = $e.toJsObj(form);
            // Checking if the object is valid
            if (!obj) throw ({
                message: error.elem('updated')
            });
            // Sending and Getting the data from the data source
            const r = await $e.conn.update(path, obj, id);
            if (funcs.isInvalid(r.result)) return r;

            ui.observer.emitUpdate(id, r.result,
                funcs.tmpNameNormalizer(path));
            return r;
        } catch (error) {
            return $e.return(false, $e.log(error), null)
        }
    }
    /**
     * Deletes an obj from a source
     * @param {String} path The URL endpoint
     * @param {String} id The Id of the object that will be deleted
     * @return The easy return type
     */
    this.delete = async function (path, id) {
        try {
            // Checking the connector
            if (funcs.isInvalid($e.conn)) throw ({
                message: error.conn()
            });

            // Checking the id parameter is null
            if (!id) throw ({
                message: error.invalid('id')
            });

            // Sending and Getting the data from the data source
            const r = await $e.conn.remove(path, id);
            if (funcs.isInvalid(r.result)) return r;

            // Adding the event to the DOM updater
            ui.observer.emitRemove(id,
                funcs.tmpNameNormalizer(path));
            return r;
        } catch (error) {
            return $e.return(false, $e.log(error), null);
        }
    }
    /**
     * getOne obj from a source
     * @param {string} path The URL endpoint
     * @param {string} id The Id of the object
     * @param {Function} cb (optional) The callback that will be passed the return
     * @return The easy return type
     */
    this.getOne = async function (path, id, elem) {
        try {
            // Checking the connector
            if (funcs.isInvalid($e.conn)) throw ({
                message: error.conn()
            });

            // Sending and Getting the data from the data source
            const r = await $e.conn.getOne(path, id);
            // Checking if the result is not valid
            if (funcs.isInvalid(r.result)) return r;

            if (!funcs.isInvalid(elem)) {
                // Subscribing the event
                const sub = ui.observer.subscribe({
                    meth: 'get',
                    flag: path,
                    call: function (elem, mdl) {
                        if (elem) {
                            // Getting the element
                            let mElem = funcs.isString(elem) ? $e.elem.node(elem) : elem;
                            if (mElem) {
                                mElem._callId = sub.id;

                                // Adding to the call
                                vars.webCalls[sub.id].elem = mElem; 

                                $e.html.fill(mElem, mdl);
                            } else
                                $e.log(error.notFouded(funcs.desc(elem)));
                        }
                    }
                });

                sub.run(elem, r.result);
            }

            return r;
        } catch (error) {
            return $e.return(false, $e.log(error), null);
        }
    }
    /**
     * Generates an Javascript Object from an HTML Element
     * Eg.: easy.toJsObj(element, { names: '[name],[nm]', values: '[value],[vl]' })
     * @param {HTMLElement} input The html element or selector
     * @param {Object} name Defines which attribute will be search for. By default is [name], the order matters!
     * @param {Object} value Defines which attribute will be taken the value. By default is [value], the order matters!
     * @returns {Object} Javascript object
     */
    this.toJsObj = function (input, {
        names = '[name]',
        values = '[value]'
    } = {}) {

        if (!input) return null;

        let elem;

        if(input instanceof Element)
            elem = input;
        else if (input instanceof Object)
            return input;
        else if (funcs.isString(input)){
            try { elem = doc.node(input); } 
            catch { return input; }
        }

        if (!elem) {
            $e.log(error.notFound(input));
            return null;
        }

        // Store the build command name
        const cmd = vars.cmds.build;

        const buildObj = function (element) {
            // Elements that it needs to escape on serialization
            const escapes = ['BUTTON', 'DIV', 'SPAN'];
            const clear = val => val.split(',').map(el => el.replaceAll(['[', ']']).trim()); 

            const obj = {};

            function tryGetValue(e) {
                let val = null;
                clear(values).find(v => (val = e.valueIn(v)) ? true : false);
                return val;
            }

            (function exec(el) {

                const mNames = clear(names);
                const attr = funcs.attr(el, mNames);
                
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

                el.children.toArray(c => (!funcs.attr(c, [cmd]) ? exec(c) : false));
            })(element);

            return obj;
        }

        // Building the base form
        const obj = buildObj(elem);

        // Getting the builds cleaned of inner builds
        const builds = elem.nodes(`[${cmd}]`);

        // Building builders
        builds.filter(function(b) {
            // Getting the e-build attr value
            const name = b.valueIn(cmd);
            // Checking if has an attr defined
            const isArray = b.hasAttribute(vars.cmds.array);
            // Building the object
            const value = buildObj(b);

            if(value.keys().length === 0) return;

            // Build a path to set the value in the main object
            const pathBuilder = function (fullPath, cb) {
                let path = '';
                // Looping the path
                const sections = fullPath.split('.');
                for (const sec of sections) {
                    path += `.${sec}`;
                    const prop_value = eval(`obj${path}`);
                    // Checking the path has a null value
                    if (funcs.isInvalid(prop_value)) {
                        eval(`obj${path}={}`);
                        // Checking if it's last section of the path
                        if (sections[sections.length - 1] === sec)
                            cb(path);
                    }
                    // Otherwise, check if the value is an array
                    else if (Array.isArray(prop_value)) {
                        const remainPath = funcs.toPath(fullPath.substr(path.length));
                        if(remainPath === '')
                            cb(path, prop_value);
                        else
                            prop_value.filter(function (e, i) {
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

            pathBuilder(name, function (path, prop_value) {
                if (isArray) {
                    // Checking if it already has properties defined
                    if (!funcs.isInvalid(prop_value)){
                        // Checking if the old value is also an array
                        if(Array.isArray(prop_value))
                            eval(`obj${path}=[ ...prop_value, value ]`);
                        else {
                            // If it's not, só spread it
                            eval(`obj${path}=[ { ...value, ...prop_value } ]`);
                        }
                    }
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
     * Run every time an includer element is added in the DOM
     * @param {Function} The callback that will be run
     */
    this.incAdded = function(cb) {
        inc.events.push(cb);
    }

    // Helper to add easy css in the DOM
    Easy.prototype.css = function () {
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
     * A code generator
     * @param {Number} length The length of chars to generate
     * @returns Some random code
     */
    Easy.prototype.code = function (len = 25) {
        const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_01234567890';
        let alt = false,
            result = '';
        for (let i = 0; i < len; i++) {
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
    Easy.prototype.return = function (status, message, result) {
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
    Easy.prototype.filter = function (array, expression) {
        try {
            if (!array || !Array.isArray(array)) throw ({
                message: 'Bad array definition passed in easy filter function, it seems that is not an Array'
            });
            if (!expression) return array;
        } catch (error) {
            $e.log(error);
            return array;
        }

        try {
            return array.filter(function(model) {
                let value = funcs.exec(expression, model) || false;
                return value;
            });
        } catch (error) {
            $e.log('Something is wrong with the expression!: ' + expression, 'warn');
            return [];
        }
    };

    /**
     * Sets values in the data 
     */
    Easy.prototype.setData = function (input) {

        if(typeof input === 'function') {
            const data = input($this);
            if(data) new ObserveObject(data);
            else $e.log('Returned object is needed configure the new data object', 'warn');
        } else {
            input.keys(function (key, value) {
                // Adding the property
                $this[key] = value;
                
                new ObservableProperty({
                    object: $this,
                    property: key
                });

                if(typeof value === 'object'){
                    if(Array.isArray(value)){
                        new ObservableArray({
                            object: $this,
                            property: key
                        });
                        $this[key].filter(item => new ObserveObject(item));
                    }
                    else{
                        new ObserveObject($this[key]);
                    }
                }
            });
        }
        return $this;
    }

    // Classes
    /**
     * Component includer
     */
    function Includer(paths = {}) {
        this.paths = (function (paths) {
            let components = {};
            
            paths.keys(function(key, value) {
                components[key] = funcs.isString(value) ? {
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
        this.events = []
        /**
         * Helper to check if a request to a path is on.
         * It Stores temporarily the path untill the is complete
         */
        this.webRequest =  {}
        /**
         * The a file from the server
         * @param {String} path The of the element 
         * @param {Function} cb The callback if it is ok
         */
        this.get = async function(path, cb) {
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
                $e.log(`Unable to load the file: ${path}. \nDescription: ${ result.statusText }`);
            }
        }
        /**
         * Html includer main function
         * @param {String} name The file Name or Path of the element that will be included. 
         * @param {HTMLElement} inc The inc element that the content will be included. 
         */
        this.include = async function(name, elem) {

            // Checking if the name is not Ok 
            if (funcs.isInvalid(name))
                return $e.log(`Invalid value of attribute 'src' or 'inc-src' of '${elem.desc()}'. Or, it's undefiened. `);
           
            // Checking if the name is not Ok 
            if (funcs.isInvalid(elem))
                return $e.log(`Invalid value element of '${name}'. Or, it's undefiened. `);

            // Set has includer done
            elem.idone = true;

            // Checking if the replace attribute is defined
            const no_replace = elem.hasAttribute('no-replace');
            // Get from Page
            if (name[0] === '@') {
                // Normalizing the name, removing @
                const nameNormalized = name.substr(1);

                let el = inc.components[nameNormalized];

                if (!el) {
                    // Getting the template
                    el = $e.elem.node(`[inc-tmp='${nameNormalized}']`);
                    // Storing the inc
                    if (el) {
                        el.removeAttribute('inc-tmp');
                        el = inc.newElem(el);

                        inc.components[nameNormalized] = el;
                    }
                }

                // Checking if the template was found
                if (!el) return $e.log(`No element[inc-tmp] was found with this identifier '@${nameNormalized}'`, 'warn');

                if (funcs.isString(el)) return $e.log(`Wrong 'src' or 'inc-src', try to set to outer include removing '@' sign in '${name}'.`, 'warn');

                el = inc.newElem(el);

                if (!no_replace)
                    elem.aboveMe().replaceChild(el, elem);
                else
                    elem.appendChild(el);

                // Calling every events added
                inc.events.filter(evt => evt(el));

                return;
            }

            let compObj = inc.paths[name];
            // Getting the path
            let path = compObj ? compObj.url : undefined;
            if (!path) path = name;

            // Get from Server
            // Inserts the content to the DOM
            const insert = function (content, store = false) {
                // Storing the content
                if (store) inc.components[name] = content;

                const temp = doc.createElement('body');
                temp.innerHTML = content;
                
                let el;
                let styles = [];
                let scripts = [];
                for (const child of temp.children) {
                    switch (child.nodeName) {
                        case 'STYLE':
                            styles.push(child);
                            break;
                        case 'SCRIPT':
                            scripts.push(child);
                            break;
                        default:
                            el = child;
                            break;
                    }
                }
                
                if (!el) return $e.log(`The component '${name}' seems to be empty or it has not an root element, \
                Eg.: DIV, to include. Please, check it!`, 'warn');

                // Adding inner elements
                const main = el.node('main');
                if (main) {
                    let above = main.aboveMe();
                    main.outerHTML = elem.innerHTML;
                    scripts.push.apply(scripts, above.nodes('script'));
                }
                let scopedStyles;
                // Looping the scripts
                styles.filter(function(style) {
                    doc.head.appendChild(style);
                    // For scoped styles
                    if(style.hasAttribute('scoped')) {
                        // Generating some class for the selectors
                        let value = 'scope-style-s'+$e.code(7);
                        if(!scopedStyles) scopedStyles = [];
                        
                        scopedStyles.push(value);

                        // Changing each selector to avoid conflit
                        for (const rule of style.sheet.cssRules) {
                            rule.selectorText = `.${value} ${rule.selectorText}`; 
                        }
                    }
                });

                if(scopedStyles){
                    scopedStyles.filter(function(s) { 
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
                if (!no_replace){
                    // Adding the attributes to the that will be inserted
                    elem.attributes.toArray(function(attr) {
                        switch (attr.name) {
                            case 'src':
                            case 'inc-src':
                            case 'no-replace':
                                return;
                            
                            case 'class':
                                elem.classList.toArray(function (c) {
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
                scripts.filter(function (script) {
                    //doc.body.appendChild(script);
                    // Evalueting them
                    eval(script.innerHTML);
                });
                
                // Calling every events added
                inc.events.filter(evt => evt(el));
            }

            let compContent = inc.components[name];
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
                let t = setInterval(function() {
                    // Checking if the component is configured
                    const content = inc.components[name];
                    if (content) {
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
        this.src = function (elem) {
            return elem.valueIn('src') || elem.valueIn('inc-src');
        } 
        /**
         * Creates new element from the input element
         * @param {Element} The element to based on
         */
        this.newElem = function(el) {
            const e = doc.createElement('body');
            e.innerHTML = funcs.isString(el) ? el : el.outerHTML;
            return e.children[0];
        }
    }

    /**
     * Functions and extensions used by easy
     */
    function Func() {
        /**
         * Check if a value is null/undefined
         * @param {*} input The input value
         */
        this.isInvalid = function (input) {
            return (typeof input === 'undefined') || (input === undefined || input === null);
        }
        /**
         * Check if a value is a string
         * @param {String} input The input value
         */
        this.isString = function (input) {
            return (typeof input !== 'undefined') && (typeof input === 'string');
        }
        
        /**
         * Gets a description 'name, id, classes' of an element
         * @param {Element} elem The element to get de description
         */
        this.desc = function (elem) {
            return (elem instanceof Element ? elem.desc() : elem);
        }
        /**
         * Gets a string template name and normalize it, cleanning [] or :
         *  Eg.: **[Product]** -> *Product*;
         *       **Product:Id0011** -> *Product*;
         *       **[Product:Id0011]** -> *Product*.
         * @param {String} name - the string to be normalized
         */
        this.tmpNameNormalizer = function (name) {
            if (!name) return '';
            // Product:P0001
            return name.split(':')[0];
        }
        /**
         * Execute an expression and returns the value if valid and undefiened is not valid.
         * WARNING: It uses the window (globalObject)
         * @param {String} exp The expression to be evaluated
         * @param {Object} $data The model to get the value if needed, by default is empty object
         * @param {Boolean} $return Allows you to define if the function needs to have a return value or not
         * @param {Boolean} escape Allows you to escape showing message error
         */
        this.eval = function (exp, $data = {}, $return = true, $args) {
            let value = undefined;
            try {
                if(funcs.isInvalid(exp) || exp === '') return;
                eval(`funcs.useDataGlobalVar(function() { ${ $return ? 'value =' : '' } ${exp} }, $data, $args); `);
            } catch (error) {
                $e.log(`${error.message}. \nExpression: << ${ exp } >>.\nAvailable variables: { ${$data.keys().join(', ')} }.`);
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
        this.exec = function (exp, $data = {}, json = false) {
            try {
                let value = funcs.eval(exp, $data);
                if (funcs.isInvalid(value)) return '';
                if (json){
                    if (value instanceof Object) 
                        value = JSON.stringify(value);
                }

                return value;
            } catch (error) {
                return '';
            }
        }
        /**
         * Builds arguments to array accesable one. 
         *  Eg.: 'Person.Name' => ['Person']['Name']
         */
        this.toPath = function () {
            let path = '';
            for (const key in arguments) {
                const el = arguments[key];
                if (!funcs.isInvalid(el) && el !== '') {
                    if (Array.isArray(el))
                        path += el.map(m => `['${m}']`).join('');
                    else if (funcs.isString(el)) {
                        path += el.split('.')
                            .filter(f => f)
                            .map(m => !m.includes('[') && !m.includes('$this') ? `['${m}']` : m)
                            .join('');
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
        this.attr = function (elem, attrs = [], remove = false) {
            if(funcs.isInvalid(elem.attributes)) return;

            let attr = elem.attributes.toArray()
                            .find(at => attrs.find(a => at.name === a) ? true : false);

            if(attr && remove) elem.removeAttribute(attr.name);
            return attr;
        }

        /**
         * Compiles a string, checking if it has some replacable parts
         * @param {String} str The expression do compile
         * @param {String} str The data to base on
         */
        this.compile = function (str = '', $dt = {}) {
            // Getting the value
            let value = str;

            ui.hasField(value).filter(function (field) {
                const val = funcs.exec(field.exp, $dt, true);
                value = value.replaceAll(field.field, val);
            });

            return value;
        }

        /**
         * Define temporary properties in window (globalObject), 
         * call the main callback and removes all the properties define.
         * @param {Function} cb The main object that will use the  
         */
        this.useDataGlobalVar = function(cb, $dt, $args){
            const keys = ($dt || $this).keys();
            // Calling the callback
            try { 
                // Defining 
                keys.filter(k => 
                    Object.defineProperty($e.global, k, 
                    Object.getOwnPropertyDescriptor($dt || $this, k)));
                
                cb($args); // Calling the main function
            } 
            catch (error) { throw({ message: error.message });}
            finally{
                // Cleaning
                keys.filter(k => delete $e.global[k]);
            }
        }

        // Extensions
        // Prevents redefinition of the extensions
        if(doc.node !== undefined) return;

        // Extension setter
        function def(key, cb, type) {
            Object.defineProperty((type || Object).prototype, key, {
                configurable: true,
                writable: true,
                value: cb,
            });
        };
        // Query one element
        def('node', function (v) {
            if (!v) return null;

            const result = v[0] === '#' ?
                this.getElementById(v.substr(1)) :
                this.querySelector(v);
            return result;
        });
        // Query many elements
        def('nodes', function (v) {
            if (!v) return null;

            const result = this.querySelectorAll(v).toArray();
            return result;
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
            return input.keys(function(key, value) {
                let destination = this[key];
                if (deep && destination instanceof Object) {
                    if (!Array.isArray(destination)) {
                        this[key].mapObj(value);
                    }
                } else {
                    let source = (value ? value : this[key]);
                    if (source != destination)
                        this[key] = source;
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
            function parent(elem, name) {
                const parentObject = elem.parentNode;
                if (parentObject === doc) return null;
                // Checking if the search must
                if (name) {
                    if (parentObject.tagName && parentObject.tagName.toUpperCase() != name.toUpperCase()) {
                        const normalizedName = name.replaceAll(['#', '.']);
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
            this.find(function (x, i) {
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
            this.filter(function(x, i) {
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
                        const indexes = [...this].indexes(value, function (i) {
                            // removing the element
                            this.splice(i, 1);
                        });

                        if (indexes.length === 0)
                            $e.log(`Element '${value}' does not exist in the array.`);

                    } else {
                        let index = this.index(value);
                        if (index === -1) {
                            if (Number.isInteger(value * 1))
                                index = value * 1;
                            else
                                $e.log(`Element '${value}' does not exist in the array.`);
                        }
                        // removing the element
                        this.splice(index, 1);
                    }
                }
            } catch (error) {
                $e.log({
                    msg: 'Remove function error. ',
                    error
                });
            }

            return this;
        }, Array);
        // Animation extension
        // The main function for the animation extension to be shared between them
        const niceShared = function (elem, direction, key, other) {
            // Adding a style elem in the DOM
            $e.css();

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
            setTimeout(function() {
                if (cb) cb(this, outElem);
            }, delay);
        }, HTMLElement);
        // Adds the nice out animation into an element
        def('niceOut', function (key, inElem, cb, delay = 80) {
            // Executing the main function
            niceShared(this, 'from', key, inElem);
            // Executing the callback
            setTimeout(function() {
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
                    return $e.log(`Cannot apply '${name}' to the element ${elem.nodeName ? elem.nodeName : elem.toString()}.`)

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
        def('replaceAll', function (oldValue, newValue = '') {
            let currentValue = this;

            // Replace all ocurrencies tha will be found
            const replace = function (str, _old_, _new_) {
                let slen = str.length, 
                len = _old_.length;
                let out = '';
                for(let i = 0; i < slen; i++){
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
                currentValue = replace(currentValue, oldValue, newValue);
            else
                oldValue.filter(el => currentValue = replace(currentValue, el, newValue));

            return currentValue;
        }, String);
    }

    /**
     * Handler 
     */
    function UIHandler() {
        // UI observer functions
        this.observer = {
            /**
             * Subcribe get and read requests
             * @param {Object} obj - The call object
             */
            subscribe: function (obj) {
                const id = `${funcs.tmpNameNormalizer(obj.flag)}:${$e.code()}`;
                vars.webCalls[id] = obj;
                return {
                    id: id,
                    run: obj.call
                };
            },
            // emit add action to the UI
            emitAdd: function (r, path) {
                if (r.status){
                    vars.webCalls.keys(function (key, value) {
                        if (value.flag === path && value.meth === 'list')
                            value.call(r.result);
                    });
                }
            },
            // emit update action to the UI
            emitUpdate: function (id, model, path) {
                vars.temps.keys(function (k, value) {
                    const bool = value.model.has(id) &&
                        (path === funcs.tmpNameNormalizer(value.tmp.tmpAttr.value));
                    if (!bool) return;

                    // Mapping the object
                    value.model.mapObj(model, true);

                    // Filling the element
                    $e.html.fill(value.tmp, value.model);
                });
            },
            // emit remove action to the UI
            emitRemove: function (id, path) {
                vars.temps.keys(function (k, value) {
                    const bool = value.model.has(id) &&
                    (path === funcs.tmpNameNormalizer(value.tmp.tmpAttr.value));

                    if(!bool) return;

                    if (value.tmp.tmpAttr.name === vars.cmds.fill)
                        // Cleaning the element
                        $e.html.fill(value.tmp);
                    else
                        // Removing the child
                        value.tmp.aboveMe().removeChild(value.tmp);
                });
            },
            mutation: function (cb) {
                const maintenance = function () {
                    const clean = function (object, cb) {
                        for (const key in object) 
                            if (object.hasOwnProperty(key))
                                cb(key);
                    }

                    clean(vars.temps, function(key) {
                        const e = vars.temps[key];
                        if(e.tmp.isConnected === false) delete vars.temps[key];
                    });
                    
                    clean(vars.webCalls, function(key) {
                        const e = vars.webCalls[key];
                        if(e.elem && e.elem.isConnected === false) delete vars.webCalls[key];
                    });
                }

                return new MutationObserver(function (mutations) {
                    const cmds = vars.cmds;
                    mutations.filter(function (mut) {
                        // For show attribute changes
                        if (mut.attributeName === cmds.if)
                            if (funcs.eval(mut.target.getAttribute(vars.cmds.if)) === false) {
                                let above = mut.target.aboveMe();
                                if (above && !mut.target.attributes.hasAttribute(vars.cmds.id))
                                    above.removeChild(mut.target);
                            }
        
                        // For added nodes
                        for (let node of mut.addedNodes) {

                            // Checking if the element needs to be skipped
                            if(node.$preventMutation) continue;

                            // Skip if it's a comment
                            if(node.nodeName === "#comment") continue;

                            switch (node.nodeName) {
                                case 'SCRIPT':
                                case 'STYLE':
                                    continue;
                            
                                default:
                                    cb(node);                                    
                                    continue;
                            }
                        }

                        if(mut.removedNodes.length > 0) {
                            maintenance();
                        }
        
                        // For attributes tmp attribute changes
                        if ((mut.attributeName === cmds.tmp || mut.attributeName === cmds.fill)) {
                            const target = mut.target;
                            const attr = funcs.attr(target, [cmds.tmp, cmds.tmp]);
        
                            if (funcs.isInvalid(attr)) return;
        
                            switch (mut.attributeName) {
                                case cmds.tmp:
                                    if (!mut.oldValue) return;
        
                                    // Removing the call attached to this container
                                    delete vars.webCalls[target._callId];
                                    target._callId = null;
                                    target.innerHTML = '';
                                    target.$tmp.valueIn(cmds.tmp, attr.value);
        
                                    ui.init(target.$tmp);
                                    break;
                                case cmds.fill:

                                    // Removing the call attached to this element
                                    delete vars.webCalls[target._callId];
                                    ui.init(target);
                                    break;
                                default: break;
                            }

                            maintenance();
                        }
                    });
                });
            }
        };
        // Comments handler
        this.comment = {
            // Creates a comment with some identifier
            create: function(id, options = {}) {
                const comment = document.createComment(' e ');
                comment.$id = id || $e.code();
                options.keys(function (k, value) {
                    comment[k] = value;
                });
                return comment;
            },
            // Gets a comment from an element
            get: function (elem, id) {
                if(funcs.isInvalid(id)) return;
                return ui.comment.getAll(elem, id).find(n => n.$id === id); 
            },
            getAll: function(elem, id) {
                if(!elem) return undefined;
                
                const filterNone = () => NodeFilter.FILTER_ACCEPT; 
                const iterator = document.createNodeIterator(elem, NodeFilter.SHOW_COMMENT, filterNone, false); 
                
                let nodes = [], node; 
                while (node = iterator.nextNode()){
                    if(node.$id === id || id === undefined) 
                        nodes.push(node);
                }

                return nodes;
            }
        };
        /**
         * handle a string to see if it gots easy commands written
         * @param {String} str The input string that needs to be checked
         */
        this.hasField = function (str) {
            if (funcs.isInvalid(str) || str === '') return [];

            const res = str.match(/-e-[^-]*-/g) || str.match(/{{(.*?)}}/g);
            if (!res) return [];

            return res.map(function(m) {
                const elem = m.match(/-e-(.*?)-/) || m.match(/{{(.*?)}}/);
                return {
                    field: elem[0],
                    exp: elem[1].trim()
                };
            });
        };
        /**
         * Reads an element to find easy commands
         * @param {HTMLElement} elem The element to be read
         * @param {Object} data The object model having the data 
         * @param {Object} path The path to get the data
         */
        this.read = function (elem, $data = {}, path) {
            if (funcs.isInvalid(elem)) return [];

            // Defines some reading scopes
            const cmds = vars.cmds;
            const scopes = [
                cmds.tmp, 
                cmds.fill, 
                cmds.data, 
                cmds.for, 
                cmds.if, 
                cmds.show, 
                'INC', 
                'inc-src'
            ];

            // Data attribute value
            path = path || (elem.tmpAttr ? elem.tmpAttr.value : null);
            
            // Sets the old value of the attr and the element where it belongs
            const setBaseProps = function (attr, elem) {
                attr.$oldValue = attr.$oldValue || attr.nodeValue;
                attr.$baseElement = attr.$baseElement || elem;
            }

            // Adds attrs having easy definition  
            const addOldAttrs = function (elem, value) {
                if(!elem.$oldAttrs){
                    elem.$oldAttrs = [value]
                }else{
                    if(elem.$oldAttrs.find(x => x == value)) return value;
                    elem.$oldAttrs.push(value);
                }
                return value;
            }

            const exec = function (elem, $iData, path = '') {

                if(elem.nodeName === "#comment") return;

                // Calls the default UI.read callback
                const mainAction = function (el, fields) {
                    // Setting the path in field 
                    el.$fields = fields;
                    
                    // Defining the getter to object in the dt
                    propertiesAddress.getter = function (obj, prop) {
                        obj.$bind(prop.property, el, $iData, false);
                    };

                    ui.compileElem(el, $iData);
                    // Destroying the stored function
                    delete propertiesAddress.getter;
                }

                // Checking if it's a scope element
                const scope = scopes.find(s => s === elem.nodeName) ? elem : undefined ||
                    funcs.attr(elem, scopes);

                if (scope) {
                    switch (scope.name) {
                        case cmds.tmp:
                        case cmds.fill:
                            ui.init(elem);
                            return;

                        case cmds.data:
                            // Gettind and removing the attr
                            elem.tmpAttr = funcs.attr(elem, [cmds.data], true);
                            // Getting the data or the default
                            let $dt = funcs.eval(elem.tmpAttr.value, $iData) || $iData;
                            $e.html.fill(elem, $dt);    
                            return;

                        case cmds.for:
                            if(!scope.value) return $e.log('Invalid value in e-for');
                            // Spliting the content
                            const body = scope.value.split(' of ');
                            const array = funcs.eval(body[1], $iData);

                            ui.for.fill(elem, array);
                            return;

                        case cmds.if:
                        case cmds.show:

                            const name = scope.name,
                            value = scope.value;
                            if(!funcs.isInvalid(value) && value.trim() === '') return;
                            
                            addOldAttrs(elem, scope);
                            // Storing the if value into a field and removing it
                            elem[name] = elem[name] || value;
                            elem.removeAttribute(name);

                            mainAction(elem, [{ exp: value }]);
                            return;

                        default:
                            // For includers
                            if (scope.name === 'inc-src' || scope.nodeName === 'INC')
                                inc.include(inc.src(elem), elem);
                            
                            return;
                    }
                }

                // checkin var definer
                const vdef = funcs.attr(elem, [cmds.def], true);
                if(vdef) {
                    // Evaluating the object that needs to be created
                    const defs = funcs.eval(vdef.value, $iData);
                    // Defining it in the easy data property
                    if(defs) $e.setData(defs);
                }

                // checking attributes
                if(!funcs.isInvalid(elem.attributes)){
                    [ ...(elem.$oldAttrs || []), ...elem.attributes.toArray() ]
                    .filter(function (attr) {
                        switch (attr.name) {
                            case cmds.content:
                                elem.removeAttribute(attr.name);
                                elem.innerText = attr.value;
                                break;
                        
                            default:
                                // Event attr
                                if (attr.name.startsWith('listen:') || attr.name.startsWith('on:')) {
                                    elem.listen(attr.name.split(':')[1], function () {
                                        funcs.eval(`if(typeof (${attr.value}) === 'function')
                                            ${attr.value}.call(${attr.value}, ...$args);`, $iData || {}, false, arguments);
                                    });
                                } else {
                                    // Checking if the it has -e-[Something]- or {{ Something }}
                                    const fields = ui.hasField(attr.$oldValue || attr.value);
                                    if(fields.length > 0){
                                        setBaseProps(attr, elem);
                                        addOldAttrs(elem, attr);
                                        mainAction(attr, fields);
                                    }
                                }
                                break;
                        }
                    });
                }

                // Checking the textcontent
                if (elem.firstChild) {
                    const attr = elem.firstChild;
                    const fields = ui.hasField(elem.firstChild.$oldValue || elem.firstChild.nodeValue);
                    if(fields.length > 0) {

                        setBaseProps(attr, elem);
                        mainAction(attr, fields);
                    }
                }

                // Getting in the children
                if(!funcs.isInvalid(elem.children)){
                    elem.children.toArray(function (child) {
                        if(child.tagName === 'BR'){
                            if(child.nextSibling){
                                const fields = ui.hasField(child.nextSibling.$oldValue || child.nextSibling.nodeValue);

                                if(fields.length > 0 && funcs.isInvalid(attr.$fields)){
            
                                    setBaseProps(child.nextSibling, elem);
                                    mainAction(child.nextSibling, fields);
                                }
                            }
                        }else{
                            exec(child, $iData, path);
                        }
                    });
                }
            };

            // Skipping the root element
            // Checking if the template is already in the list of it
            
            if (funcs.isInvalid(vars.temps[elem.tmpid]) && elem !== $e.elem) {   
                elem.tmpid = elem.tmpid || $e.code();
                const obj = {
                    tmp: elem,
                    model: $data
                };
                vars.temps[elem.tmpid] = obj;
            }

            // Begining the reading
            exec(elem, $data, path);
        };
        
        // Sets the atached to the current element
        this.setEvents = function (element, events) {
            if (events) events.filter(function (evt) {
                element.addEventListener(evt.event, function () {
                    arguments[0]['base'] = element;
                    evt.func(...arguments);
                }, evt.options)
            });
        };
        /**
         * Fills an element field, such as #value, #text, etc.
         * @param {HTMLComponet} field The field to be filled 
         * @param {Object} $dt The data object 
         * @param {HTMLDataElement} copy The original copy of the element having the firat values 
         */
        this.setValue = function (elem, $dt) {

            const origin = elem.$baseElement;
            const name = elem.nodeName;

            // Getting the value
            let value = elem.$oldValue;

            elem.$fields.filter(function (field) {
                const val = funcs.exec(field.exp, $dt, true);
                value = value.replaceAll(field.field, val);
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
        };
        /**
         * Hide Or Show an element from the DOM.
         *  if => removes and add again
         *  show => add or remove a style attribute in the element  
         * @param {Element} elem The element to toggled according easy show attribute 
         * @param {Object} data The object model to get the values
         */
        this.toggle = {
            if: function (elem, $dt = {}) {
                const exp = elem[vars.cmds.if];
                const prop = vars.cmds.id; 
                // Evaluating the value of the element
                let res = funcs.eval(exp, $dt);
                
                // Hide
                if (String(res).toLowerCase() === 'false') {
                    res = false;
                    const above = elem.aboveMe();
    
                    if (funcs.isInvalid(above)) {
                        $e.log(`It seems like the element having e-if '${funcs.desc(elem)}' does not exist in the DOM anymore.`, 'warn');
                        return res;
                    }

                    const id = $e.code();
                    const comment = ui.comment.create(id);
                    
                    above.replaceChild(comment, elem);
                    elem.valueIn(prop, id);
    
                } else
                // Show
                if (String(res).toLowerCase() === 'true') {
                    res = true;
                    const id = elem.valueIn(prop);
                    if (funcs.isInvalid(id)) return res;
                    
                    // Getting the comment having the id
                    const commet = ui.comment.get($e.elem, id);
                    
                    if (funcs.isInvalid(commet)){
                        $e.log(`It seems like the element having e-if 
                        '${funcs.desc(elem)}' has been removed manually.`, 'warn');
                        return res;
                    }
    
                    // Restoring the
                    elem.removeAttribute(prop);
                    commet.parentElement.replaceChild(elem, commet);
                }
                return res;
            },
            show: function (elem, $dt = {}) {
                const exp = elem[vars.cmds.show];
                let res = funcs.eval(exp, $dt);
                
                const styleValue = elem.getAttribute('style') || '';
                const value = 'display:none!important;';

                // Hide
                if (String(res).toLowerCase() === 'false') {
                    res = false;
                    if(!styleValue.includes(value))
                        elem.setAttribute('style',  value + styleValue)
                } else 
                // Show
                if (String(res).toLowerCase() === 'true') {
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
        this.compileElem = function (el, $dt) {
            let c = vars.cmds;
            // By default compile as text
            let type = c.field;
            
            if(el[c.if])
                type = c.if;
            else if(el[c.show])
                type = c.show;

            switch (type) {
                case c.field: 
                    ui.setValue(el, $dt);
                    return;
                case c.if: 
                case c.show:
                    
                    const res = ui.toggle[type.replaceAll('e-')](el, $dt);
                    
                    // Reading the elem only if th
                    if(res === true) ui.read(el, $dt);

                    if(!el.$preventMutation) 
                        el.$preventMutation = true;
                    return;
                default: return;
            }
        };

        // Function for 'e-for' scope
        this.for = {
            fill: function (elem, array, before) {
                const name = vars.cmds.for,
                      attr = funcs.attr(elem, [name]);

                if(!attr.value) {
                    return $e.log({
                        message: 'Invalid value on e-for',
                        elem: elem
                    });
                }
                
                if(!array) {
                    return $e.log({
                        message: 'It seems like the array defined in e-for is invalid',
                        elem: elem,
                        expression: attr.value 
                    });
                }

                const body = attr.value.split(' of '),
                      len = array.length;

                let comment = ui.comment.getAll($e.elem)
                                .find(n => n.$arrayid && n.$arrayid === elem.$arrayid);
                if(!comment){
                    const arrayId = $e.code();
                    comment = ui.comment.create(array._lid || $e.code(), {
                        $tmp: elem,
                        $arrayid: arrayId
                    });
                    elem.$arrayid = arrayId;
                    // Removing the current element
                    elem.aboveMe().replaceChild(comment, elem);
                } 
                
                for (let i = 0; i < len; i++) {
                    const item = array[i];
                    
                    let copy = elem.copyNode();
                    copy.removeAttribute(name);

                    const trim = s => s ? s.trim() : s;
                    // Getting the declaration
                    const dec = body[0].replaceAll(['(', ')']).split(',');

                    // Defining an index in the element
                    copy._lid = array._lid;

                    // Reading the element that needs to be added
                    ui.read(copy, {
                        [trim(dec[0])] : item,
                        [trim(dec[1]) || '$index']: i
                    });

                    copy.$preventMutation = true;

                    comment.parentElement.insertBefore(copy, before || comment);
                }
            }
        };
        /**
         * UI initiator
         * @param {HTMLElement} element The element to be initialized
         */
        this.init = async function (elem) {
            const cmds = vars.cmds;
            const attr = funcs.attr(elem, [cmds.fill, cmds.tmp, cmds.data], true);
            elem.tmpAttr = attr;
            if(attr === undefined) 
                return;

            // tmp/fill actions
            const actions = {
                'e-tmp': {
                    wait(cb, sec = 1) {
                        let t = setTimeout(function () {
                            cb();
                            clearTimeout(t);
                        }, sec * 40);
                    },
                    // Main action
                    async main(e, expression, container) {
                        let counter = 1;
                        const rvs = e.valueIn(cmds.rvs) === 'true' ? true : false;

                        await $e.read(expression, function(data) {
                            const insert = function(){
                                $e.html.add(container, data, {
                                    reverse: rvs
                                });
                            }

                            // Wait a bit to insert the element to de DOM
                            if (e.hasAttribute(cmds.anm))
                                actions[cmds.tmp].wait(_ => insert(), counter++);
                            else
                                insert();

                        }, funcs.compile(e.valueIn(cmds.id), $this));
                    }
                },
                'e-fill': {
                    // Main action
                    async main(e, expression) {
                        await $e.getOne(expression, funcs.compile(e.valueIn(cmds.id), $this), e);
                    }
                }
            }

            let container = null;
            
            if (attr.name === cmds.data) {
                const source = funcs.eval(attr.value);
                $e.html.fill(elem, source, true);
            } else {

                switch (attr.name) {
                    // For fill template 
                    case cmds.fill:
                        // In case of fill without value
                        if (funcs.isInvalid(attr.value) || attr.value === '') {
                            $e.html.fill(elem);
                            return;
                        }
                        break;
                        // For tmp template
                    case cmds.tmp:

                        container = elem.aboveMe();

                        // Setting the template value in the container
                        container.valueIn(cmds.tmp, attr.value);

                        // Setting his template                
                        container.$tmp = elem;
                        container.removeChild(elem);

                        // Defining the elem

                        if (elem.valueIn('e-auto') === 'true') return;
                        break;
                    default: break;
                }

                const expression = funcs.compile(attr.value, $this);
                // Checking if any connector is available
                if (!funcs.isInvalid($e.conn))
                    await actions[attr.name].main(elem, expression, container);
                else
                    $e.log(error.conn());
            }
        }
    }

    /**
     * Makes a primitive property observable
     * @param {Object} object The object having the property to observe
     * @param {String} property The primitive property to observe
     */
    function ObservableProperty({ object, property }) {
        // Execute when some value changes
        function emitChanges(el, val, $dt) {         
            ui.compileElem(el, $dt);
        }

        // Property definer
        function def(el, name, value) {
            Object.defineProperty(el, name, {
                value: value
            });
        }
        // Getting the value of the property
        const value = object[property];

        // Getting the 
        let address = object._aid; 
        if(!address) {
            // Generating an address
            address = 'c' + $e.code(15);
            // Adding the address in the object
            def(object, '_aid', address);    
            propertiesAddress[address] = {};
        }
        // Setting the values in the in the address
        propertiesAddress[address][property] = { property, value: value, binds: [] };

        // Setting the default getter and setter
        Object.defineProperty(object, property, {
            get: function () {
                const prop = propertiesAddress[address][property];
                if (propertiesAddress.getter) { propertiesAddress.getter(object, prop); }
                return prop.value;
            },
            set: function (val) {
                const prop = propertiesAddress[address][property];
                prop.value = val;
                prop.binds.filter(function (bind) {
                    emitChanges(bind.el, val, bind.obj);
                });
            }
        });
        
        // Defining bind function only once
        if(!object.$bind){
            Object.defineProperty(object, '$bind', {
                value: function (exp, attrl, bindObj, set = true) {
                    // Getting the real value from varAddress
                    const prop = propertiesAddress[address][exp];
                    // Getting the binded object 
                    const fillObj = bindObj || object;
                    if(!funcs.isInvalid(prop)){
                        // Avoiding twice binds
                        if(!prop.binds.find(x => x === attrl))
                            // Addind the bind array
                            prop.binds.push({
                                obj: fillObj,
                                el: attrl
                            });
                    }
                    // Only set if set is true
                    if(set) emitChanges(attrl, (prop ? prop.value : null), fillObj);
                }
            });
        }

        // Setting the default value
        object[property] = propertiesAddress[address][property].value;
    }

    /**
     * Makes some array methods observable
     * @param {Object} object The object having the property to observe
     * @param {String} property The array property of the object to observe
     * @param {Array} value The value of the property
     */
    function ObservableArray({ object, property, value }) {

        // Execute when some value changes
        function emitChanges({ currArray, oldArray, method, args }) {
            
            function getListedElements (com) {
                let elems = [], len = oldArray.length;
                let current = com.previousElementSibling;
                for(let i = 0; i < len; i++) {
                    elems.unshift(current);
                    current = current.previousElementSibling;
                }
                return elems;
            }
            // Helper that allows to remove all elements
            function removeAll(els) {
                els.filter(remove => remove.aboveMe().removeChild(remove));
            }

            switch (method) {
                case 'push':
                case 'unshift':
                    if(!args) throw({ message: `Invalid argument of ${method}.` });
                    // Making Observable the new elements added
                    args.toArray(arg => {
                        if(!arg._aid)new ObserveObject(arg)
                    }); 
                    break;
                default: break;
            }

            ui.comment.getAll($e.elem, currArray._lid).
            filter(function (com) {
                removeAll(getListedElements(com));
                ui.for.fill(com.$tmp, currArray);
            });
        }

        let id = object[property]._lid;
        
        function defId(obj, val) {
            const id = val || 'l' + $e.code(15);
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
        let original = [ ...object[property] ];
        
        defId(original, id); 
        // Push, addes to the end
        // Unshift, addes to the begining
        // Pop, removes from the end
        // Shift, removes from the begining
        // Splice, removes in some point and amount of elements
    
        // methods to observe
        this.methods = ['push', 'pop', 'shift', 'unshift', 'splice'];
        
        // Applying the methods
        for (const method of this.methods) {
            object[property][method] = function () {
                let oldArray = [ ...original ];
                // Calling the method and getting the result
                let res = original[method].call(original, ...arguments);
                let value = [ ...original ];
                defId(value, id); 
                // Redefing the shown array
                new ObservableArray({
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
        }
        return this;
    }

    /**
     * Makes an object observable, it already includes 'ObservableProperty' and 'ObservableArray'  
     * @param {Object} object The object to observe
     */
    function ObserveObject(obj = {}) { 
        // Looping all the properties of the object
        for (const key in obj) {
            const prop = obj[key];

            // Applying to the property
            new ObservableProperty({
                object: obj,
                property: key
            });

            if(typeof prop === 'object') {
                if(Array.isArray(prop)){
                    new ObservableArray({
                        object: obj,
                        property: key
                    });
                    prop.filter(item => new ObserveObject(item));
                }
                else{
                    new ObserveObject(prop);
                }
            }
        }
        return obj;
    }

    // Global Object functions
    $e.global.$e = function(selector = '') {
        let result = [];
        if(selector[0] === '#') result = [ doc.node(selector) ].filter(x => x && x.isConnected);
        else result = doc.nodes(selector).filter(x => x && x.isConnected);

        Object.defineProperty(result, 'on', {
            value: function (event, cb) {
                doc.addEventListener(event, function (e) {
                    doc.nodes(selector).find(function (el) {
                        if(el === e.target || e.target.aboveMe(selector)){
                            arguments[0]['base'] = el;
                            cb(...arguments);
                            return true;
                        }
                        return false;
                    });
                });
            }
        });
        return result;
    } 
    
    // Initializing Easy
    try {
        // Setting the begin data
        $e.setData(options.data || {});

        // Listening the DOM
        doc.listen('DOMContentLoaded', function () {
            
            // Defining the root elem
            $e.elem = document.node(elem);

            // Checking if the app element is set
            if (!$e.elem) {
                $e.log('Root element not found, please check it.', 'warn');
                return $e;
            }

            // Initializing easy animation css
            if ($e.elem.node('[e-anm]')) $e.css();

            ui.read($e.elem, $this);

            ui.observer.mutation(function(elem) {
                ui.read(elem, $this);
            }).observe($e.elem, {
                attributes: true,
                attributeOldValue: true,
                attributeFilter: [vars.cmds.tmp, vars.cmds.fill, vars.cmds.if, 'inc-src'],
                childList: true,
                subtree: true,
                characterData: false
            });

        });

    } catch (error) {
        $e.log({
            msg: 'Error while initializing. Description: ' + error.message,
            error
        });
    }

    return this;
}
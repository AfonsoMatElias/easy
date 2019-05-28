/**
 * @author Afonso Matumona Elias
 * @version v1.0.0
 * Released under the MIT License.
 * easy.js 'easy and asynchronous js' is a javascript ramework that helps the designer or programmer 
 * build an application fast without writting too many lines of js codes.
 * Copyright 2019 Afonso Matumona <afonsomatumona@hotmail.com>
 * # Be Happy ;-)  
 */

// easy 
const easy = {
    /**
     * Creates an obj and insert it in a source
     * @param {string} ref - The reference / document in db
     * @param {object} frm - The html form, { jquery, javascript or js object }
     * @param {boolean} gId {optional} - flag to generate Id or not {true or false}
     * @return The easy return type with the db result in the prop result  
     */
    create: async function (ref, frm, gId) {
        try {
            if (gId == undefined || gId == null) gId = false; // Assuming not to generate an Id value
            
            let obj = e_createObj(e_formReader(frm), gId); // Creating an anonymous object
            if (obj == null) throw ({ message: e_error_msg.notCreated('inserted') });
            
            let r = await e_data.add(ref, obj); // Calling the function to add in server
            if (r == null) throw ({ message: e_error_msg.connectorError() });
            
            if (r.result == null) throw ({ message: r.msg });
            if (r.status) e_calls.forEach(function (c) {
                if (c.flag == ref && c.meth == 'list') { c.call(r.result); }
            });
            return r;
        } catch (er) {
            return e_return(false, e_error(er.message != undefined ? er.message : er), null); // Error
        }
    },
    /**
     * Read or list obj from a source
     * @param {string} ref - The reference / document in db
     * @param {string} ft {optional} - The filter of the returned values
     * @param {Function} cb {optional} - the function / callback that will be passed the returned values
     * @param {string} s {optional} - The input param (for api and db)
     * @return The easy return type with the db result in the prop result  
     */
    read: async function (ref, cb, ft, s) {
        try {
            let r = await e_data.list(ref, ft, s); // Calling the function to read in server
            if (r == null) throw ({ message: e_error_msg.connectorError() });
            
            if (r.result == null) throw ({ message: r.msg });
            if (cb != undefined && cb != null){
                if (r.status) {
                    if (s == null || s == undefined)
                        e_calls.push({ meth: 'list', flag: ref, call: cb });
                    r.result.forEach(function (e) { cb(e); });
                } 
            }
            return r;
        } catch (er) {
            return e_return(false, e_error(er.message != undefined ? er.message : er), null);
        }
    },
    /**
     * Updates an obj of a source
     * @param {string} ref - The reference / document in db
     * @param {object} form - the html form targeted, can be using jquery or javascript
     * @param {string} id - The Id of the document in db
     * @return The easy return type with the db result in the prop result  
     */
    update: async function (ref, frm, id, fld) {
        try {
            if (id == null || id == undefined) throw ({ message: e_error_msg.notValidValue('id') });
            
            id = e_handler.e_m(id); // Handlin param id
            let rg = await easy.getOne(ref, id); // Getting the object to be updated 
            
            if (rg == null) { throw ({ message: e_error_msg.connectorError() }); }
            
            if (!rg.status) { throw ({ message: rg.msg }); }
            if (rg.result == null) throw ({ message: e_error_msg.notFoudedElem(id) });
            
            let obj = e_createObj(e_formReader(frm), false, rg.result); // Creating an anonymous object
            if (obj == null) { throw ({ message: e_error_msg.notCreated('updated') }); }
            
            let r = await e_data.update(ref, obj, id, fld); // Calling the function to update in server
            if (r.result == null) throw ({ message: r.msg });
            if (r.status) 
            { e_handler.getHTMLElems(r.result).forEach(function (el) { easy.fillHtml(el, r.result, true); }); }
            return r;
        } catch (er) {
            return e_return(false, e_error(er.message != undefined ? er.message : er), null); // Error            
        }
    },
    /**
     * Deletes an obj from a source
     * @param {string} ref - The reference / document in db
     * @param {string} id - The Id of the document in db
     * @param {string} fld {optional} - The field to match the id
     * @return The easy return type with the db result in the prop result  
     */
    delete: async function (ref, id, fld) {
        try {
            if (id == null || id == undefined) throw ({ message: e_error_msg.notValidValue(id) });
            
            id = e_handler.e_m(id);
            let r = await e_data.remove(ref, id, fld); // Calling the function to remove in server
            if (r == null) throw ({ message: e_error_msg.connectorError() });
            
            if (r.result == null) throw ({ message: r.msg });
            if (r.status) {
                let elems = e_handler.getHTMLElems(r.result);
                elems.forEach(function (el) {
                    if (!el.e_attr(e_cmds.e_fill)) { getParent(el).removeChild(el); }
                });
                e_calls.forEach(async function (c) {
                    if (c.flag == ref && c.meth == 'get') {
                        elems.forEach(function (el) {
                            if (el.e_attr(e_cmds.e_fill)) {
                                let obj = JSON.parse(JSON.stringify(r.result));
                                e_for(getKeys(obj), function (v) { obj[v] = `--${v}--`; });
                                easy.fillHtml(el, obj, true);
                            }
                        });
                    }
                });
            }
            return r;
        } catch (er) {
            return e_return(false, e_error(er.message != undefined ? er.message : er), null);
        }
    },
    /**
     * getOne obj from a source
     * @param {string} ref - The reference / document in db
     * @param {string} id - The Id of the document in db
     * @param {Function} cb {optional} - the function that will be passed the returned values
     * @param {string} fld {optional} - The field to match the id
     * @return The easy return type with the db result in the prop result 
     */
    getOne: async function (ref, id, elem, fld) {
        try {
            if (id == null || id == undefined) throw ({ message: e_error_msg.notValidValue(id) });
            
            id = e_handler.e_m(id);
            let r = await e_data.getOne(ref, id, fld); // Calling the function to getOne item in server
            if (r == null) throw ({ message: e_error_msg.connectorError() });
            
            if (r.result == null) throw ({ message: r.msg });
            if (r.status && r.result != null) {
                function cb(elem, mdl) {
                    if (elem) {
                        let e = typeof elem === 'string' ? e_sltr(elem) : elem;
                        if (e) easy.fillHtml(e, mdl); // Seting the elem;
                        else e_error(e_error_msg.notFoudedElem(elem)); // Showing error
                        return elem;
                    }
                }
                if (cb(elem, r.result)) e_calls.push({
                    meth: 'get',
                    flag: ref,
                    call: cb
                })
            }
            return r;
        } catch (er) {
            return e_return(false, e_error(er.message != undefined ? er.message : er), null); // Error
        }
    }
};

// Easy ajax header setter
/**
 * @param {Object} v - the header object
 */
easy.header = function (v) {
    e_data.header = v ? v : e_data.head;
    return easy;
};

/**
 * easy function that allow the user to pass an array as data source and manage with the main actions (CRUD).
 * It doesnt modify the main data source
 * @param {Array} ds - the data source 
 */
easy.source = function (ds) {
    e_data = {
        add: async function (r, mdl) {
            try {
                let ref = ds;
                if (ref == null || ref == undefined) { throw ({ message: e_error_msg.nullDs() }); }
                
                ref.push(mdl);
                let last = ref[ref.length - 1];
                return e_return(true, 'Ok', last);
            } catch (error) {
                return e_return(false, error.message, null);
            }
        },
        remove: async function (r, id, field) {
            try {
                if (id == null || id == undefined) throw ({ message: e_error_msg.notValidValue(id) });
                
                let ref = ds;
                if (ref == null || ref == undefined) { throw ({ message: e_error_msg.nullDs() }); }
                
                let obj = null;
                field = field == null ? 'Id' : field;
                ref.filter(function (item) {
                    let res = item[field] == id;
                    if (res) {
                        obj = item;
                        ref.splice(ref.indexOf(item), 1);
                    }
                });
                return e_return(true, 'Ok', obj);
            } catch (error) {
                return e_return(false, error.message, null);
            }
        },
        update: async function (r, obj, id, field) {
            try {
                if (id == null || id == undefined) throw ({ message: e_error_msg.notValidValue(id) });
                
                let ref = ds;
                if (ref == null || ref == undefined) { throw ({ message: e_error_msg.nullDs() }); }
                field = field == null ? 'Id' : field;
                for (let i = 0; ref.length; i++) {
                    let o = field ? ref[i][field] : ref[i];
                    if (o == id) {
                        o = obj;
                        break;
                    }
                }
                return e_return(true, 'Ok', obj);
            } catch (error) {
                return e_return(false, error.message, null);
            }
        },
        list: async function (r, filter, search) {
            try {
                let ref = ds;
                if (ref == null || ref == undefined) { throw ({ message: e_error_msg.nullDs() }); }
                
                let _ref = e_data_filter(ref, filter);
                if (search != null) { _ref = e_data_search(_ref, search); }
                
                return e_return(true, 'Ok', _ref);
            } catch (error) {
                return e_return(false, error.message, null);
            }
        },
        getOne: async function (r, id, field) {
            try {
                if (id == null || id == undefined) throw ({ message: e_error_msg.notDefinedField(id) });
                
                let ref = ds;
                if (ref == null || ref == undefined) { throw ({ message: e_error_msg.nullDs() }); }
                
                let obj = null;
                field = field == null ? 'Id' : field;
                for (let i = 0; i < ref.length; i++) {
                    let o = field ? ref[i][field] : ref[i];
                    if (o == null || o == undefined)
                        throw ({ message: e_error_msg.notDefinedField(field) });
                    if (o == id) {
                        obj = ref[i];
                        break;
                    }
                }
                if (obj == null)
                    throw ({ message: e_error_msg.notFoundedObj() });
                return e_return(true, 'Ok', obj);
            } catch (error) {
                return e_return(false, error.message, null);
            }
        },
    };
    return {
        create: async function (r, frm, gId) {
            let res = await easy.create(r, frm, gId);
            e_data = e_data_old;
            return res;
        },
        read: async function (r, cb, ft, s) {
            let res = await easy.read(r, cb, ft, s);
            e_data = e_data_old;
            return res;
        },
        update: async function (r, frm, id, fld) {
            let res = await easy.update(r, frm, id, fld);
            e_data = e_data_old;
            return res;
        },
        delete: async function (r, id, fld) {
            let res = await easy.delete(r, id, fld);
            e_data = e_data_old;
            return res;
        },
        getOne: async function (r, id, elem, fld) {
            let res = await easy.getOne(r, id, elem, fld);
            e_data = e_data_old;
            return res;
        },
    };
}
/**
 * Helper to fill an HTMLElement
 * @param {HTMLElement} el - the html element 
 * @param {Object} mdl - the database model 
 * @returns {HTMLElement} - the elem filled
 */
easy.fillHtml = function(el) {
    // Selectiong the elem that matchs the e-field
    el = typeof el === 'string' ? e_sltr(el) : el;

    if(!el){ e_error(e_error_msg.notFoudedElem()); return null };
    // Adding some key to the elem
    let id = el.e_attr(e_cmds.e_id);
    id = id ? id : 'Id'; // Setting the default value 'Id' if it was not assigned
    let mdl = arguments[1], rep = arguments[2];
    let value = el.e_attr(e_cmds.e_tmp);
    if (!value) { value = el.e_attr(e_cmds.e_m_tmp); }
    if (!value) { value = el.e_attr(e_cmds.e_fill) ? el.e_attr(e_cmds.e_fill).split(':')[0] : null; }
    if (!value) { console.log(`You haven't defined: ${e_cmds.e_tmp}, ${e_cmds.e_m_tmp}, or ${e_cmds.e_fill}... the auto update will not work!`); }
 
    // Elem setter
    function e_setter(a) {
        let v = a.value || a.data; 
        let value = e_handler.e_checker(v); // Checking the value
        if(value){

            if(!Array.isArray(value))
                value = value[0].split(',');
            
            value.filter(function (e) {
                let res = e_propGetter(e, mdl);
                if(res != null){ 
                    if(a.data == null) { a.value = a.value.replace(e, res); } // Setting value
                    else if(a.value == null) { a.data = a.data.replace(e, res); } // Setting Container
                    if(a.name){ // Checking if is valid
                        if(a.name.startsWith('e-')){ // Checking if it's easy-repleacer
                            let o = a.ownerElement; // Getting the owner
                            if(a.value) o.e_attr(a.name.substr(2), a.value); // Setting the 
                            o.removeAttribute(a.name); // Removing the easy-repleacer attr
                        }
                    }
                }
            });
        }
    }

    let aux = el;
    if(rep){ // Elem must be Replaced 
        let isFill = el.e_attr(e_cmds.e_fill) ? true : false; // Checking type
        let cnt_code = isFill ? el.e_attr(e_cmds.e_code) : getParent(el).e_attr(e_cmds.e_code);
        let e_cnt = e_cnts.find(function (x) {
            if(isFill)
            { return x.e.e_attr(e_cmds.e_code) == cnt_code; }
            else { return x.p.e_attr(e_cmds.e_code) == cnt_code; }
        }); // Getting the e container
        
        if(isFill) { aux = e_cnt.e; }
        else { aux = e_handler.unlinkElem(e_cnt.e); }
    }

    let flds = e_handler.e_elems(aux);
    if (flds.length == 0) { flds = e_handler.e_elem(aux); }
    
    e_for(flds, function (v) {
        e_setter(v);
    });
    
    aux.e_attr(e_cmds.e_key, value + ':' + mdl[id]);
    if(rep) el.parentElement.replaceChild(aux, el); // Replacing
    return aux;
}

// easy aditionnal function
easy.addHtml = function (cnt, el, rvs) {
    let _cnt_ = typeof cnt === 'string' ? e_sltr(cnt) : cnt;
    if (_cnt_ == null) { e_error(e_error_msg.notFoudedElem(cnt)); return; }

    let cnt_code = _cnt_.e_attr(e_cmds.e_code); // Getting the code of the container
    if (cnt_code == undefined) {
        e_error('The current element has not the e-code prop. Please, check the selector.');
        return;
    }

    let e_cnt = e_cnts.find(function (x) { return x.p.e_attr(e_cmds.e_code) == cnt_code; }); // Getting the e container
    if (e_cnt == null) {
        e_error('The container "' + cnt + '" must have a template "e-tmp" or "e-m-tmp. And the "template" must have a valid value"');
        return;
    }

    let cnt_tmp = e_cnt.e.e_attr(e_cmds.e_tmp) != null ? e_handler.unlinkElem(e_cnt.e) : null;
    if (cnt_tmp == undefined) cnt_tmp = e_cnt.e.e_attr(e_cmds.e_m_tmp) ? e_handler.unlinkElem(e_cnt.e) : null;

    let anm = cnt_tmp.e_attr(e_cmds.e_anm);
    if (anm != null) {
        e_handler.css(); // Adding a style elem in the DOM
        cnt_tmp.classList.add(e_animation[anm.toLowerCase()]);
        cnt_tmp.removeAttribute(e_cmds.e_anm);
    }
    // Filling the element
    let filled = easy.fillHtml(cnt_tmp, el);
    // Adding into container
    if(rvs == null) rvs = false;
    if(rvs){
        _cnt_.insertBefore(filled, _cnt_.children[0]);
    }else{
        _cnt_.appendChild(filled);
    }
}
// Easy html handlers
let e_handler = {
    // Easy elems getter
    e_elems: function (cnt) {
        let result = [].slice.call(cnt.querySelectorAll('*'));
        let r = [];
        let inner = cnt.querySelector(`[${e_cmds.e_tmp}]`);

        if(inner) // Checking if it got a e-tmp inside
            result = result.filter(function(x) {
                
                if(([].slice.call(inner.querySelectorAll('*'))).find(function(y){ return y == x; }))
                { return false; } // Not to be added
                else if(x == inner)	{ return false; } // Not to be added
                else { return true; } // To be Added

            });
        result.filter(function (x) {  
            r.push.apply(r, e_handler.e_elem(x)); 
        });
        r.push.apply(r, e_handler.e_elem(cnt));
        return r;
    },
    // Easy value checker
    e_checker(v){
        return v ? v.match(/-e-[^-]*-/g) : null; // Checker function
    },
    // Easy element checker
    e_elem:function (v) {
        let r = [];
        ([].slice.call(v.attributes)).filter(function(y) { 
            let s = e_handler.e_checker(y.value);
            if(s) r.push(y);
            return s;
        });

        if(v.firstChild){
            if((e_handler.e_checker(v.firstChild.data)))
                r.push(v.firstChild); 
        }       
        return r;
    },
    // Easy key restore
    e_m: function (v) {
        try {
            return v.includes(':') ? v = v.split(':')[1] : v;
        } catch (e) { return v; }
    },
    // Helper to add a css style in the DOM
    css: function () {
        var r = e_sltr('[e-style]');
        if (r == null) {
            let time = 3, duration = 1,
                opacity = 1, value = 15;
            var s = document.createElement("style");
            s.e_attr("e-style", "true");
            s.textContent = `.e-toTop, .e-toBottom, .e-toRight, .e-toLeft { opacity: .${opacity}; }
                .e-toTop{ transform: translateY(${value}%); -webkit-transform: translateY(${value}%);
                animation: toTop .${time}s .${duration}s ease-out forwards;-webkit-animation: toTop .${time}s .${duration}s ease-out forwards; }
                .e-toBottom{ transform: translateY(-${value}%); -webkit-transform: translateY(-${value}%); 
                animation: toBottom .${time}s .${duration}s ease-out forwards;-webkit-animation: toBottom .${time}s .${duration}s ease-out forwards;}
                .e-toRight{ transform: translateX(-${value}%); -webkit-transform: translateX(-${value}%);
                animation: toRight .${time}s .${duration}s ease-out forwards; -webkit-animation: toRight .${time}s .${duration}s ease-out forwards; }
                .e-toLeft{ transform: translateX(${value}%); -webkit-transform: translateX(${value}%); 
                animation: toLeft .${time}s .${duration}s ease-out forwards;-webkit-animation: toLeft .${time}s .${duration}s ease-out forwards; }
                @keyframes toTop{ from{ opacity: .${opacity}; transform: translateY(${value}%); }
                to{ opacity: 1; transform: translateY(0%); } }
                @keyframes toBottom{ from{ opacity: .${opacity}; transform: translateY(-${value}%); }
                to{ opacity: 1; transform: translateY(0%); } }
                @keyframes toRight{ from{ opacity: .${opacity}; transform: translateX(-${value}%); }
                to{ opacity: 1; transform: translateX(0%); } }
                @keyframes toLeft{ from{ opacity: .${opacity}; transform: translateX(${value}%); }
                to{ opacity: 1; transform: translateX(0%); } }
                @-webkit-keyframes toTop{ from{ opacity: .${opacity}; transform: translateY(${value}%); }
                to{ opacity: 1; transform: translateY(0%); } }
                @-webkit-keyframes toBottom{ from{ opacity: .${opacity}; transform: translateY(-${value}%); }
                to{ opacity: 1; transform: translateY(0%); } } 
                @-webkit-keyframes toRight{ from{ opacity: .${opacity}; transform: translateX(-${value}%); }
                to{ opacity: 1; transform: translateX(0%); } }
                @-webkit-keyframes toLeft{ from{ opacity: .${opacity}; transform: translateX(${value}%); }
                to{ opacity: 1; transform: translateX(0%); } }`;
            document.head.appendChild(s);
        }
    },
    // Helper to unlink an element from the DOM
    unlinkElem: function (v) {
        let aux = document.createElement('tbody');
        aux.appendChild(v);
        let div = document.createElement('tbody');
        div.innerHTML = aux.innerHTML;
        return div.children[0]; // # Disconnecting the elem from the DOM
    },
    // Get the elems according the data base elem passed in the parameter
    getHTMLElems: function (v) {
        try {
            let elems = [].slice.call(e_sltrAll(`[${e_cmds.e_key}]`));
            return elems.filter(function (x) { // Looping them
                let key = 'Id'; // Setting the default Id
                let id = x.e_attr(e_cmds.e_id); // Getting the e-id value
                if (id) key = id; // Setting it if it's valid
                let _v_ = x.e_attr(e_cmds.e_key).split(':')[1]; // Gettting the e-key value
                return _v_ == v[key]; // Checking the data
            });
        } catch (e) { return []; }
    },
    getHtml: function(v){ return v.outerHTML; }
}
/**
 * Helper to serialize form to an array list
 * @param {object} v - the html form selector 
 * @return the form serialized 
 */
function e_formReader(v) {
    let type = typeof v;
    switch (type) {
        case 'string':
            return { result: v, type: e_types.selector };
        case 'object':
            return { result: v, type: e_types.obj };
        default:
            return { result: v, type: e_types.unknown };
    }
}
/**
 * Helper to create an object according the form and/or fill it in case of update funciton 
 * @param {e_formReader} obj - the expect e_formReader return
 * @return the updated object
 */
function e_createObj(f) {
    let gId = arguments[1], mdl = arguments[2];
    if (f.type == e_types.unknown) return f.result; // Unknown obj
    if (f.type == e_types.obj) {
        if (gId) f.result["Id"] = e_code();
        return f.result;
    } // Js obj
    return e_generateObj(f.result, gId, mdl);
}
/**
 * Helper function to serialize and create an object according the form (with or not easy proprerties)
 * @param {HTMLElement} frm - The form selector 
 * @returns {Object} - A structed Object or a simple one
 */
function e_generateObj(frm) {

    if(typeof frm !== 'string') return frm;
    let elem = e_sltr(frm), gId = arguments[1], 
    mdl = arguments[2];
    if (!elem) return frm;
    // Builder
    function builder(obj, str, p) {
        let res = eval(`obj${str}`);
        let value = p.value == '' ? null : p.value;
        if (mdl) { try { value = value ? value : eval(`mdl${str}`); } catch(e){} }
        
        if (res != null) {
            if (mdl) { eval(`obj${str}=value`); } // Updating
            else
                writeProp(obj, res, str.substr(1), value, (p.e_attr('e-array') == 'true')); // Writting prop
        } else { // Creating or Updating
            eval(`obj${str}=value`);
        }
    }
    // Element builder getter
    function getBuilders(el, elem) {
            let els = []; 
            while (el) {
                let v = el.e_attr(e_cmds.e_build); // Getting the attr
                if (v) els.unshift(v); // Adding elements
                if (elem == el) break; // Breaking the loop
                el = el.parentNode;
            }
            let build = ''; // Building the path
            els.filter(function (e) {
                let l = e.split('.');
                build += '.' + l[l.length - 1];
            });
            return build.substr(1); // Removing the . and returning
    }
    // Write a prop in obj
    function writeProp(obj, res, str, value, arr) {
        if (arr == true && eval(`obj.${str}`) == null) eval(`obj.${str}=[]`); // Setting the Object to array
        if (Array.isArray(res) || arr == true){ // Checking if its an array
            let aux = ''; 
            if(!Array.isArray(obj)) // Checking if the isn't an array 
                aux = '.' + str;
            eval(`obj${aux}.push(value)`); // pushing the value
        }else if (res != null){ // Checking the result
            eval(`obj.${str}=[]`); // Setting the Object to array
            eval(`obj.${str}.push(res)`);
            eval(`obj.${str}.push(value)`);
        }
        else{
            eval(`obj.${str}=value`); // Setting the prop
        }
    }
    // Object structer
    function structObj(p_obj, str, value, arr) {

        let auxStr = '', 
            obj = p_obj, 
            lst = str.split('.'), 
            res = undefined;

        if(lst.length > 1){ // Checking the builder is a complex one
            lst.filter(function (v) { // Looping the builders
                auxStr = v;
                let test = eval(`obj.${v}`);
                res = test; // Setting the result object
                if (Array.isArray(test)){ // Checking if it's an array
                    if(lst[lst.length - 1] == v) // Checking if is the last
                        obj = test; // Getting the object
                    else
                        obj = test[test.length-1]; // Getting the last object of the array
                }
                else if (test != null && lst[lst.length - 1] != v){
                    obj = test; // Getting the obj
                }
            });
        }else{
            auxStr = str; // Getting the string buider
            res = eval(`obj.${str}`); // Setting the result object
        }
        writeProp(obj, res, auxStr, value, arr); // Writting prop
    }
    // Object pre-builder
    function e_preBuildObj(elem, o) { 
        if(mdl == null){ if (gId) o["Id"] = e_code(); }
        let elems = elem.querySelectorAll('[name]');
        e_for(elems, function (p) {
            if (getBuilders(p, elem) == '') {
                builder(o, `.${p.name}`, p);                    
            }
        });
        return o;
    }
    // Pre-building the object
    let aux = mdl ? JSON.parse(JSON.stringify(mdl)) : {};
    let obj = e_preBuildObj(elem, aux);
    // Looping the builder
    for (const el of elem.querySelectorAll(`[${e_cmds.e_build}]`)) {
        let str = getBuilders(el, elem); // Getting the builders
        let attr = el.e_attr(e_cmds.e_build); // Getting the e-build value
        el.removeAttribute(e_cmds.e_build);

        if(mdl) { aux = eval(`mdl.${str}`); }
        else { aux = {}; }

        let value = e_preBuildObj(el, aux);
        el.e_attr(e_cmds.e_build, attr);
        if(mdl){ eval(`obj.${str}=value`); }
        else { structObj(obj, str, value, (el.e_attr('e-array') == 'true')); }
    }
    return obj;

}
// Object value getter
function e_propGetter(v, m) {
    let value = "";
    if (v.includes(e_cmds._e_)) {
        value += v;
        value = value.replace(e_cmds._e_, ''); // Removing cmd
        value = value.substr(0, value.length - 1); // Removing the delimiter 
        try 
        { value = eval(`m.${value}`); } // Rebuilding the value
        catch (e) 
        { try { value = eval(`m.${value.split('.')[0]}`); } catch(e){ value = 'null'; } } // Rebuilding the value
    } else {
        value = eval(`m.${v}`); // Executing the value
    }
    return value;
}
// Helper to get the parent value
function getParent(v) { return v.parentElement; }
/**
 * Helper to generate some random e_code
 * @returns a random e_code
 */
function e_code() {
    let a = 65, z = a + 25, zero = 48, 
    nine = zero + 9, alt = 0; // Default vars
    function rng(v, b, e) { // Code range chars
        for (let i = b; i <= e; i++) { v += String.fromCharCode(i); }
        return v;
    }
    let r = rng(rng('', zero, nine), a, z), v = '';
    for (let i = 0; i < 25; i++) {
        let p = Math.floor(Math.random() * r.length);
        v += alt == 1 ? r[p].toLowerCase() : r[p];
        alt = alt == 1 ? 0 : 1;
    }
    return v;
}
/**
 * The return type of the easy.js function
 * @param {boolean} s - The status of the operation {true or false}
 * @param {string} m - The message of the operation
 * @param {object} r - The result or result value of the operation
 * @returns The easy return type such as {status:..., msg:..., result:...}
 */
function e_return(s, m, r) { return { status: s, msg: m, result: r }; }
/**
 * Helper to filter data according to the string of filter
 * @param {Array} v - The array of data to be filtered
 * @param {string} ft - The string to filter. Ex: Name==easy
 * @returns The data filtered
 */
function e_data_filter(v, ft) {
    let _op_ = ["==", "!=", "<", ">", "<=", ">="]; // logic operators
    if (ft != null && ft != undefined && ft != '') { // Checking if we got filter
        let tst = false;
        for (let i = 0; i < _op_.length; i++) //Looping the operators
            if (ft.includes(_op_[i])) {
                tst = true;
                break;
            } //Looking for an operator
        if (!tst) { e_error('Invalid filter compare operator "' + ft + '"'); return v; }
        v = v.filter(function (item) { // Looping and filtering the data
            let result = true, op = "", exp = [];
            e_for(_op_, function (o) {
                if (ft.includes(o)) {
                    op = o; exp = ft.split(op);
                }
            });
            let left = item[exp[0].trim()];
            if (left == undefined) {
                throw ({ message: `The field "${exp[0].trim()}" on easy.read filter is not a field Reference or object` });
            }
            let right = exp[1].trim();
            switch (op) {
                case '==': result = left == right; break;
                case '!=': result = left != right; break;
                case '<': result = left < right; break;
                case '>': result = left > right; break;
                case '>=': result = left == right; break;
                case '<=': result = left == right; break;
            }
            return result;
        });
    }
    return v;
}
/**
 * Helper to search value that matches the in value
 * @param {Array} v - The array of data to be filtered
 * @param {string} f - The string to search. Ex: Afonso
 * @returns The data according the search
 */
function e_data_search(v, f) {
    return v.filter(function (x) {
        return getKeys(x).find(function(k) 
        { return x[k].toString().toLowerCase().includes(f.toLowerCase()); });        
    });
}
/**
 * Helper to loop through items
 * @param {Array} v - the list of the items
 * @param {Function} cb - the callback of each items
 */
function e_for(v, cb) {
    for (let i = 0; i < v.length; i++){ if (cb) { cb(v[i]); } }
}
// Error msg
function e_error(v) { console.error('Error:', v); return v; }
// Get the keys of an object
function getKeys(v) {
    let r = Object.keys(v);
    return r ? r : [];
}
/**
 * Easy Event handler
 * @param {string} v - the selector 
 * @param {string} ev - the event to be called - 'click, dlbclick, etc'
 * @param {Function} cb - the callback to execute
 */
function e(v, ev, cb) {
    if(!ev && !cb) return e_sltrAll(v);
    document.addEventListener(ev, function (e) {
        let elem = e.target;
        let parent = getParent(elem);
        let html = e_sltr('html');
        do { // Find the elem
            let _this_ = [];
            if (!parent) return undefined;

            if(typeof v === 'string')
            { _this_ = [].slice.call(parent.querySelectorAll(v)); }
            else { _this_.push(v); }

            if (_this_.find(function (x) { return x == elem; })) {
                cb(e, elem);
                return elem;
            } else if (html == elem) {
                return undefined;
            } else {
                elem = parent;
                parent = getParent(parent);
            } // Getting the parent
        } while (true);
    }, false);
}
// DOM Selector all helper
function e_sltrAll(v) { try { return document.querySelectorAll(v); } catch(e){} }
// DOM Selector One helper
function e_sltr(v) { try { return document.querySelector(v); } catch(e){} }

// Extensions
if (typeof Object.prototype.fullTyping !== 'function') {
    // Adding into Javascript object
    Object.defineProperty(Object.prototype, "fullTyping", {
        value: function (cb) {
            let el = this;
            let elems = Array.isArray(el) ? el : [el]; // transforming jquery target element to js

            for (const elem of elems) {
                if (elem.tagName != 'INPUT' && elem.tagName != 'TEXTAREA') {
                    e_error('Element ' + elem.type + ' cannot be applied the fullTyping function'); return;
                }
                let delay = 1500, w = false, t_out = null;
                let enter = false, c = ''; 
                elem.onkeyup = function (e) {
                    enter = false;
                    if (e.keyCode == e_keys.ENTER) { // Enter key pressed
                        enter = true; w = false; // Assuming that the user finish to type
                        if (t_out != null) clearTimeout(t_out);
                        cb(e.target); // Executing the callback
                        return;
                    }
                    if (!w) {
                        w = true; // Assuming that the user is typing            
                        t_out = waitCompleteText(function () { cb(e.target); }, e);
                    }
                }
                function waitCompleteText(cb, e) { 
                    let t = setTimeout(function () { // Delaying the execution
                        if (w) {              
                            clearTimeout(t); // Clearing the timeout
                            waitCompleteText(cb, e); // Waitng again because the user is still typing
                        } else {
                            if (c != e.target.value) {
                                if (enter == false) { cb(e.target); return t; }
                                c = e.target.value;
                            }
                            clearTimeout(t); // Clearing the timeout
                        }
                        w = false; // Assuming that the user finish to type
                    }, delay);
                    return t;
                }
            }
        }
    });
}

if (typeof Object.prototype.e_attr !== 'function') {
    Object.defineProperty(Object.prototype, "e_attr", {
        value: function(e, v) { // Setter and Getter
            if (v == null) 
            { return (e == 'value') ? value = this.value || this.getAttribute(e) : this.getAttribute(e); } 
            else { this.setAttribute(e, v); return v; }
        }
    });
}
// Global Variables
const e_calls = []; // Easy calls
const e_cnts = []; // Easy containers
//let e_elems = []; // Easy elements
const e_types = { 
    obj: 'object',
    selector: 'form-array',
    unknown: 'unknown'
};// Easy obj types
const e_cmds = { 
    e_tmp: "e-tmp",
    e_m_tmp: "e-m-tmp",
    e_key: "e-key",
    e_id: "e-id",
    e_filter: "e-filter",
    e_anm: 'e-anm',
    _e_: "-e-",
    e_code: 'e-code',
    e_fill: 'e-fill',
    e_build: 'e-build',
    e_rvs: 'e-rvs',
    e_array: 'e-array' 
};// Easy controls
// Helper to store the old e_data
let e_data_old = typeof e_data !== 'undefined' ? e_data : undefined;

const e_animation = {
    up: 'e-toTop',
    down: 'e-toBottom',
    left: 'e-toLeft',
    right: 'e-toRight'
}; // Animations keys
// Keyboard key
const e_keys = { ENTER: 13, ESC: 27, LEFT: 37, RIGHT: 39 };
// Error custom messages
const e_error_msg = {
    connectorError: function () {
        return "Something went wrong when I was trying to get data from the server. please check your connection.";
    },
    notFoudedElem: function (v) {
        v = v ? v : ''; return `Element ${v} not found. Please, check the selector.`;
    },
    notDefinedField: function (v) {
        v = v ? v : ''; return `Reference, object or field ${v} not defined`;
    },
    notValidValue: function (v) {
        v = v ? v : ''; return `${v} has invalid value`;
    },
    notCreated: function (v) {
        v = v ? v : ''; return `Couldn't prepare the object to be ${v}, please check the 2 parameter of easy.update.
                                \nNote: The parameter must be a 'element selector' or a 'js object'`;
    },
    notFoundedObj: function (v) { v = v ? v : ''; return `Obj ${v} not founded`; },
    nullDs: function () { return 'Data Source is NULL, please initialize the it as Array.'; }
};

document.addEventListener('DOMContentLoaded', function () {

    const initEasy = async function () {
        let v = arguments[0] || document;
        let elems = v.querySelectorAll(`[${e_cmds.e_tmp}]`);
        let m_elems = v.querySelectorAll(`[${e_cmds.e_m_tmp}]`);
        let e_fills = v.querySelectorAll(`[${e_cmds.e_fill}]`);
    
        for (const el of m_elems) {
            if (el.e_attr(e_cmds.e_m_tmp).trim() != '') {
                let p = el.parentElement;
                p.e_attr(e_cmds.e_code, e_code());
                e_cnts.push({ p: p, e: e_handler.unlinkElem(el) });
            }
        }

        for (const el of elems) {
            let tmp = el.e_attr(e_cmds.e_tmp);
            if (tmp.trim() != ''){
                let p = el.parentElement;
                p.e_attr(e_cmds.e_code, e_code());
                e_cnts.push({ p: p, e: e_handler.unlinkElem(el) });
                let rvs = el.e_attr(e_cmds.e_rvs) == 'true' ? true : false;
                let src = tmp.includes('[') && tmp.includes(']');
               
                if(typeof e_data !== 'undefined' && !src){ // Init filling
                    await easy.read(tmp, function (e) { // Getting data and setting
                        easy.addHtml(p, e, rvs);
                    }, el.e_attr(e_cmds.e_filter));
                }

                if(src){ // Init filling by source
                    try {
                        let _ds_ = eval(tmp.substr(1, tmp.length - 2)); // Getting the source 
                        if(Array.isArray(_ds_)) // Checking if the source is valid
                            await easy.source(_ds_).read(tmp, function (e) { // Getting data and setting
                                easy.addHtml(p, e, rvs);
                            }, el.e_attr(e_cmds.e_filter));    
                    } catch (er) {
                        e_error(e_error_msg.notFoundedObj(tmp));
                    }
                }
            }
        }

        for (const el of e_fills) {
            let tmp = el.e_attr(e_cmds.e_fill);
            if (tmp.trim() != ''){
                let src = tmp.includes('[') && tmp.includes(']');
                el.e_attr(e_cmds.e_code, e_code());
                let n = document.createElement('div');
                n.innerHTML = e_handler.getHtml(el);
                e_cnts.push({ p: null, e: n.children[0] });
                let value = tmp.split(':');
                if(typeof e_data !== 'undefined' && !src){
                    await easy.getOne(value[0], value[1], el, value[2]); // Getting data and setting
                }

                if(src){ // Checking if it must be taken in the source
                    try {
                        let _ds_ = eval(value[0].substr(1, value[0].length - 2)); // Getting the source 
                        if(Array.isArray(_ds_)) // Checking if its valid
                            await easy.source(_ds_).getOne(value[0], value[1], el, value[2]); // Getting data and setting
                    } catch (er) {
                        e_error(e_error_msg.notFoundedObj(tmp));
                    }
                }
            }
        }

    };

    // Running easy default funciton 
    initEasy();

    // Easy observer
    const e_observeTmp = function (s, cb) {
        var observer = new MutationObserver(function (ms) {
            ms.forEach(function (m) {
                if (m.addedNodes && m.addedNodes.length > 0) {
                    let obj = m.addedNodes[0];
                    if(obj.attributes)
                        if(obj.e_attr(e_cmds.e_m_tmp) || obj.e_attr(e_cmds.e_tmp)) { cb(obj); }
                }
            });
        });
        observer.observe(e_sltr(s), { childList: true, subtree: true, });
    }
    // An Easy observer e-tmp
    e_observeTmp('body', function (m) { initEasy(m); });

});  
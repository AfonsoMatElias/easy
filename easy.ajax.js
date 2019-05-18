/**
 * @author Afonso Matumona Elias
 * @version v1.0.0
 * Released under the MIT License.
 * easy.js 'easy and asynchronous js' is a javascript ramework that helps the designer or programmer 
 * build an application fast without writting too many lines of js codes.
 * Copyrigth 2019 Afonso Matumona <afonsomatumona@hotmail.com>
 * # Be Happy ;-) 
 */

// This is the root url of the your API or The Data Source url 
// *** Modify as you will ***
let e_url = 'http://myServer.com/api/';

let e_data = {
    baseUrl: e_url,
    add: async function (r, o) {
        return await ajaxCall(e_data.baseUrl + r, o, 'post');
    },
    remove: async function (r, id, fld) {
        fld = fld == undefined ? 'Id' : fld;
        let cnd = '?' + fld + '=' + id;
        if (id.includes('?')) cnd = id;
        return await ajaxCall(e_data.baseUrl + r + cnd, null, 'delete');
    },
    update: async function (r, o, id) {
        return await ajaxCall(e_data.baseUrl + r + '/' + id, o, 'put');
    },
    list: async function (r, f, s) {
        return await ajaxCall(e_data.baseUrl + r, s, 'get', f);
    },
    getOne: async function (r, id, fld) {
        fld = fld == undefined ? 'Id' : fld;
        let cnd = '?' + fld + '=' + id;
        if (id.includes('?')) cnd = id;
        return await ajaxCall(e_data.baseUrl + r + cnd, null, 'get');
    }
};

// Aux var to store the ajax request
let ajax_res;

/**
 * An ajax call function 
 * @param {string} u - The url to send or recieve teh request
 * @param {object} d - The object to be sent
 * @param {string} m - The method of the request {post, put, get, delete}
 * @param {string} f - The filter to the returned list of objects. Ex: Name==easy
 */
async function ajaxCall(u, d, m, f) {
    let result = null;

    const webResquest = (url, m, d) => {
        return fetch(url, {
            credentials: 'same-origin', // '', default: 'omit'
            method: m,
            body: d,
            headers: { "Content-Type": "application/json" }
        }).then(r => {             
            if(r.ok){
                return r.json();
            }else{
                return r; 
            }
        }, r => { 
            return r;
        });
    }

    try {
        let r = await webResquest(u, m, d); // Requesting...
        if(checkResponse(r)) throw(r);
        if (f) r = e_data_filter(r, f); // Checking if the return must to be checked
        result = e_return(true, 'Ok', r); // Setting the return
    } catch (e) {
        result = e_return(false, e, null);
    }

    window.onkeyup = function (e) {
        if(e.keyCode == e_keys.ESC)
            if(ajax_res) abortRequest();
    }
    return result;
};

function checkResponse(r){
    return (typeof r === 'undefined') || 
            (r.message == "Failed to fetch") ||
            (typeof r.ok !== 'undefined' &&
            r.ok != false &&
            r.redirected != undefined && 
            r.status != undefined);
}
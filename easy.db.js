/**
 * @author Afonso Matumona Elias
 * @version v2.0.0
 * Released under the MIT License.
 * This is easy.js object like database connector
 * 
 * # Salute 😉
 */

/* It's Only For Testing!!! */

 //The _database reference
 var ds = {
    Product: [
        {
            Id: 'P0001',
            Name: 'Dell Computer e72740',
            Price: 800,
            Stock: 10,
            Description: 'Dell e72740, HD SSD 2TB, 32GB RAM',
            Aditionals: 'Workstation Computer',
            Color: '#ccc',
            Category: {
                Name: "Electronic"
            }
        },
        {
            Id: 'P0002',
            Name: 'Surface',
            Price: 1100,
            Stock: 10,
            Description: 'HP, HD SSD 2TB, 32GB RAM',
            Aditionals: 'Laptop',
            Color: '#333',
            Category: {
                Name: "Electronic"
            }
        },
        {
            Id: 'P0003',
            Name: 'Macbook Pro',
            Price: 1300,
            Stock: 10,
            Description: 'HD SSD 2TB, 32GB RAM',
            Aditionals: 'Laptop',
            Color: '#eee',
            Category: {
                Name: "Electronic"
            }
        },
    ],
    Product2: [
        {
            Id: 'P0001',
            Name: 'Dell Computer e72740',
            Price: 800,
            Stock: 10,
            Description: 'Dell e72740, HD SSD 2TB, 32GB RAM',
            Aditionals: 'Workstation Computer',
            Color: '#cbc',
            Category: {
                Name: "Electronic"
            }
        },
        {
            Id: 'P0002',
            Name: 'Surface',
            Price: 1100,
            Stock: 10,
            Description: 'HP, HD SSD 2TB, 32GB RAM',
            Aditionals: 'Laptop',
            Color: '#33f',
            Category: {
                Name: "Electronic"
            }
        },
        {
            Id: 'P0003',
            Name: 'Macbook Pro',
            Price: 1300,
            Stock: 10,
            Description: 'HD SSD 2TB, 32GB RAM',
            Aditionals: 'Laptop',
            Color: '#fee',
            Category: {
                Name: "Electronic"
            }
        },
    ]
};

new EasyConnector();

function EasyConnector() {
    // Checking EasyJs definition
    if (typeof Easy === 'undefined') return;

    // Easy object
    var $e = Easy.prototype;

    // Easy connector
    Easy.prototype.conn = {
        add: function(r, mdl) {
            try {
                mdl.Id = mdl.Id || $e.code(5);
                var last = ds[r][ds[r].push(mdl) - 1];
                return Promise.resolve($e.return(true, 'Ok', last));
            } catch (error) {
                return Promise.reject($e.return(false, error, null));
            }
        },
        remove: function(r, id) {
            try {
                var obj = ds[r].get(id);
                ds[r].remove(id);
    
                return Promise.resolve($e.return(true, 'Ok', obj));
            } catch (error) {
                return Promise.reject($e.return(false, error, null));
            }
        },
        update: function(r, obj, id) {
            try {
                var index = ds[r].index(id);
                if(index === -1) throw({ message: 'Element '+ id +' not found' });
                ds[r][index].mapObj(obj);
    
                return Promise.resolve($e.return(true, 'Ok', ds[r][index]));
            } catch (error) {
                return Promise.reject($e.return(false, error, null));
            }
        },
        list: function(r, filter) {
            try {
                return Promise.resolve($e.return(true, 'Ok', $e.filter(ds[r], filter)));
            } catch (error) {
                return Promise.reject($e.return(false, error, null));
            }
        },
        getOne: function(r, id) {
            try {
                return Promise.resolve($e.return(true, 'Ok', ds[r].get(id)));
            } catch (error) {
                return Promise.reject($e.return(false, error, null));
            }
        },
    };
}
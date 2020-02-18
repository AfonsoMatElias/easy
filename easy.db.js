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
const ds = {
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
    ]
};

new EasyConnector();

function EasyConnector() {
    // Checking EasyJs definition
    if (typeof Easy === undefined)
        return console.error(`Easy: Could not found Easy Object, it seems like is not imported. Please, make sure easy.js is imported!.`); 
    
    // Easy object
    const $e = Easy.prototype;

    // Easy connector
    Easy.prototype.conn = {
        async add(r, mdl) {
            try {
                mdl.Id = mdl.Id || $e.code(5);
                let last = ds[r][ds[r].push(mdl) - 1];
                return $e.return(true, 'Ok', last);
            } catch (error) {
                return $e.return(false, error, null)
            }
        },
        async remove(r, id) {
            try {
                let obj = ds[r].get(id);
                ds[r].remove(id);
    
                return $e.return(true, 'Ok', obj);
            } catch (error) {
                return $e.return(false, error, null)
            }
        },
        async update(r, obj, id) {
            try {
                let index = ds[r].index(id);
                ds[r][index].mapObj(obj);
    
                return $e.return(true, 'Ok', ds[r][index]);
            } catch (error) {
                return $e.return(false, error, null)
            }
        },
        async list(r, filter) {
            try {
                return $e.return(true, 'Ok', [ ...$e.filter(ds[r], filter).map(x => Object({ ...x })) ]);
            } catch (error) {
                return $e.return(false, error, null);
            }
        },
        async getOne(r, id) {
            try {
                return $e.return(true, 'Ok', { ...ds[r].get(id) });
            } catch (error) {
                return $e.return(false, error, null);
            }
        },
    };
}
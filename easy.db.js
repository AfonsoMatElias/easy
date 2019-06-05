/**
 * @author Afonso Matumona Elias
 * @version v1.0.0
 * Released under the MIT License.
 * easy.js 'easy and asynchronous js' is a javascript lib that helps the designer or programmer 
 * build an application fast without writting too many lines of js codes.
 * Copyright 2019 Afonso Matumona <afonsomatumona@hotmail.com>
 * # Be Happy ;-)  
 */

// *** It's for testing... ***

//The _database reference
var _database = {
    Product:[
        {
            Id:'P0001',
            Name:'Dell Computer e72740',
            Price:1400,
            Stock:10,
            Description:'Dell e72740, HD SSD 2TB, 32GB RAM',
            Aditionals:'Workstation Computer',
            Color:'#dfa',
            Category:{
                Name:"Electronic"
            }
        },
        {
            Id:'P0002',
            Name:'Dell Computer e72740',
            Price:1400,
            Stock:10,
            Description:'Dell e72740, HD SSD 2TB, 32GB RAM',
            Aditionals:'Workstation Computer',
            Color:'#ea1',
            Category:{
                Name:"Electronic"
            }
        },
        {
            Id:'P0003',
            Name:'Dell Computer e72740',
            Price:1400,
            Stock:10,
            Description:'Dell e72740, HD SSD 2TB, 32GB RAM',
            Aditionals:'Workstation Computer',
            Color:'#c4a',
            Category:{
                Name:"Electronic"
            }
        },
    ]
};

// Manager
let e_data = {
    
    /**
     * Helper do insert into _database
     * @reference - The reference / document in _database
     * @model - The model or obj the will be inserted in _database
     * @return the updated object or an error message
     */
    add:async function(reference, model){

        try{
            // Getting the _database reference
            var ref = _database[reference];

            if(ref == null)
                _database[[reference]] = [];

            if(ref == null || ref == undefined)
                throw({message:'Reference or table "'+reference+'" not defined'});

            ref.push(model);// Inserting data into _database   
            var last = ref[ref.length-1];

            return e_return(true, 'Ok', last); // Returning the data
        }catch(error){
            return e_return(false, error.message, null); // Error
        }

    },

    /**
     * Helper to remove an item from datbase
     *
     * @reference - The reference / document in _database
     * @id - The Id of the document in _database
     * @return true or an error message
     */
    remove:async function (reference, id, field){
        try{

            if(id == null || id == undefined) throw({message:'id parameter must have a valid value'});

            // Setting the value in the fielt
            field = field == null ? 'Id' : field;

            // Getting the database reference
            var ref = _database[reference];

            // Checking if the ref has a valid value             
            if(ref == null || ref == undefined)
                throw({message:'Reference or table "'+reference+'" not defined'});

            // Checking if the id value is an command to remove all the data
            if(id.toLocaleLowerCase() == 'rem-all'){
                
                // Removing the data
                ref = ref.splice(0, ref.length);

                return e_return(true, 'Ok', true); // Return the removed data
            }

            // Aux list to store all the removed data
            var removedData = null;

            // Filtering the data
            _database[reference] = ref.filter(item => {
                // Checking the values matchs
                var boolResult = item[field] != id;

                // Checking if is not false
                if(!boolResult) removedData = item;

                // Returnin the new list
                return boolResult;
            });
            return e_return(true, 'Ok', removedData); // Return the removed data
            
        }catch(error){
            return e_return(false, error.message, null);
        }
    },

    /**
     * Helper to update data into _database
     * @reference - The reference / document in _database
     * @id - The Id of the document in _database
     * @obj - The obj the will be updated
     * @return true or an error message
     */
    update:async function(reference, obj, id){ 
        try{ 

            // Checking if the id has a valid value 
            if(id == null || id == undefined) throw({message:'id parameter must have a valid value'});

            // Getting the _database reference
            var ref = _database[reference];
            if(ref == null || ref == undefined) throw({message:'Reference or table "'+reference+'" not defined'});

            for(var i = 0; ref.length; i++){
                if(ref[i]['Id'] == id){
                    ref[i] = obj; break;
                }
            }
            return e_return(true, 'Ok', obj); // Returning obj
        }catch(error){
            return e_return(false, error.message, null); // Error
        }
    },

    /**
     * Helper to get the list of the items into a document
     *
     * @reference - The reference / document in _database
     */
    list:async function(reference, filter, search){
        try{

            // Getting the database reference
            var ref = _database[reference];
            // Checking if the ref has a valid value             
            if(ref == null || ref == undefined)
                throw({message:'Reference or table "'+reference+'" not defined'});

            let _ref = e_data_filter(ref, filter);
            if(search != null){
                _ref = e_data_search(_ref, search)
            }
            return e_return(true, 'Ok', _ref); // Returning the list of the objs
        }catch(error){
            return e_return(false, error.message, null); // Error

        }
    },

    /**
     * Helper to get only one  item from _database
     *
     * @reference - The reference / document in _database
     * @id - The Id of the document in _database
     * @field - The feild to compare its value with the id value 
     * @return the _database result or error
     */
    getOne:async function(reference, id, field){

        try{
            if(id == null || id == undefined) throw({message:'id parameter must have a valid value'});
            // Setting the value in the fielt
            field = field == null ? 'Id' : field;

            // An helper to store the value
            var ref = _database[reference];
            
            // Checking if the ref has a valid value             
            if(ref == null || ref == undefined)
                throw({message:'Reference or table "'+reference+'" not defined'});

            var obj = null;
                
            // Looing all the data
            for (var i = 0; i < ref.length; i++){

                // Checking if the ref has a valid value             
                if(ref[i][field] == null || ref[i][field] == undefined)
                    throw({message:'Reference or table field "'+field+'" not defined'});

                // Checking the values of the fields
                if(ref[i][field] == id){ obj = ref[i]; break; }
            }

            // Checking if the ref has a valid value             
            if(obj == null)
                throw({message:'Obj not founded'});

            return e_return(true, 'Ok', obj);

        }catch(error){
            return e_return(false, error.message, null);

        }
    },
        
};
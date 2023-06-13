//+------------------------------------------------------------------+
//|  Import libraries.     6s83KEWiqlusi5S6                                          |
//+------------------------------------------------------------------+
const express = require('express'); //express
const bodyParser = require('body-parser');//body-parser
const mongoose = require('mongoose');//mongoose
const path = require('path');//path
const _ = require('lodash');//lodash
//+------------------------------------------------------------------+
//|  Import local js files.                                          |
//+------------------------------------------------------------------+
const date = require(__dirname + '/date.js');

const app = express();

app.set('view engine', 'ejs'); //ejs

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

//+------------------------------------------------------------------+
//|  Global variables.                                               |
//+------------------------------------------------------------------+
let numberOfDocuments = 0;
let collection_Item;
let collection_List;
let fakeItems;
let items = [];
// const workItems = [];

//+------------------------------------------------------------------+
//|  Database.                                                       |
//+------------------------------------------------------------------+
main().catch(err => console.log(err));

async function main() {
    //Step 1: Create new database/ Connect to existing one.
    //await mongoose.connect('mongodb://127.0.0.1:27017/toDoListDB');
    await mongoose.connect('mongodb+srv://timkabue:6s83KEWiqlusi5S6@cluster0.ospbfjl.mongodb.net/toDoListDB');

    //Step 2: Create schema.
    const itemSchema = new mongoose.Schema({
        name: String,
    });

    const listSchema = new mongoose.Schema({
        name: String,
        items: [itemSchema], //Relationship with a list of itemSchema(Item) documents
    });

    //Step 3: Create Model/collection.
    const Item = mongoose.model('Item', itemSchema);
    collection_Item = Item; //State management.

    const List = mongoose.model('List', listSchema);
    collection_List = List; //State management.

    //Step 4: Create document/s.
    const item1 = new Item({
        name: 'Lorem ipsum Item 1',
    });

    const item2 = new Item({
        name: 'Lorem ipsum Item 2',
    });

    const item3 = new Item({
        name: 'Lorem ipsum Item 3',
    });

    const defaultItems = [item1, item2, item3];
    fakeItems = defaultItems;
    //Step 4.1: Find number of documents in collection.
    await countDocuments();

    async function countDocuments(){
        try {
            numberOfDocuments = await Item.countDocuments({});
            console.log(`There are ${numberOfDocuments} document(s) in the collection.`);
        } catch (error) {
            console.error('Error counting documents: ', error);
        }
    }

    //Step 5: Insert documents into Model.
    if (numberOfDocuments === 0) { await insertDocuments(); }

    async function insertDocuments() {
        try {
            const result = await Item.insertMany(defaultItems);
            console.log('Documents inserted: ', result);
        } catch (error) {
            console.error('Multiple document insertion error: ', error);
        }
    }

    
}//---End of 'main' function.


//+------------------------------------------------------------------+
//|  GET '/' route                                                   |
//+------------------------------------------------------------------+
app.get('/', async (req, res) => {
    //Step 1: 
    // let dayOfWeek = date.getDate();
    let dayOfWeek = 'Today';
    //Step 2: Find all the documents
    await findAllDocuments();

    async function findAllDocuments() {
        try {
            items = await collection_Item.find({});
            //console.log('Found all documents: ', items);
        } catch (error) {
            console.error('Finding all documents error: ', error);
        }
    }
    //Step 3: Render the page
    res.render('list', { listTitle: dayOfWeek, itemsList: items }); //itemsList - template variable | items - local variable
});

//+------------------------------------------------------------------+
//|  GET '/favicon.ico'                                              |
//+------------------------------------------------------------------+
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
  });


//+------------------------------------------------------------------+
//|  GET '/:variable'                                                |
//+------------------------------------------------------------------+
app.get('/:dynamicRoute',async function(req,res){
    //---Step 0
    const dynamicRoute = _.capitalize(req.params.dynamicRoute);
    console.log(`Dynamic route variable == ${dynamicRoute}`); //TODO:Remove

    //---Step 0.1: Find if a List document with  a name path of value 'dynamicRoute' exists
    let query;
    try {
        query = await collection_List.findOne({name: dynamicRoute}).exec();
        //console.log(`Result of searching for a List document of name path value ${dynamicRoute} exists:`, query); //TODO:Remove
    } catch (error) {
        console.error(`Error locating List document of name path value ${dynamicRoute}: `, error); //TODO:Remove
    }

    //---Step 1.1: If a List document with a name path == 'dynamicRoute' does not exist:
    if(!query){
        //Step 1: Create document/s for List model.
        const list = new collection_List({
            name: dynamicRoute,
            items: fakeItems,
        }); 

        //---Step 2: Save 'list' document.
        list.save();

        //---Step 3: Render 'list.ejs' and pass these parameters to it.
        res.render('list',{listTitle: dynamicRoute, itemsList: list.items});
        //---Step 3.1: Redirect to the same route:
        //res.render(`/${dynamicRoute}`);
    }
    else{
        console.log(`Document with a name path value of ${dynamicRoute} exists`);//TODO:Remove
        //---Step 1: Render 'list.ejs' and pass these parameters to it.
        res.render('list',{listTitle: dynamicRoute, itemsList: query.items}); //itemsList - template variable | query.items - local variable
    }
});


//+------------------------------------------------------------------+
//|  POST '/' route                                                  |
//+------------------------------------------------------------------+
app.post('/', async function (req, res) { 
    //Get value of the submit button from list.ejs
    const listName = req.body.submitButton; //Provides a string value usable for the name path of collection_Item document

    async function createSaveDocument(){
        //---Step 1: Create document
        const item = new collection_Item({
            name: req.body.listItem,
        });
        //---Step 2: Save document
        await item.save();
        //---Step 3: Add document to list
        items.push(item);
        //---Step 4: Return created document.
        return item;
    }

    
    let query;
    try {
        query = await collection_List.findOne({name: listName}).exec();
        if(query){
            let item = await createSaveDocument();
            query.items.push(item);
            query.save();
            res.redirect(`/${listName}`);
        }
        else{
            console.log('YABA DABA DOO!!!!!!!!!!!!!');
            await createSaveDocument();
            res.redirect('/');  
        }     
        //console.log(`Query successful. 'findOne' for collection 'collection_list' query result is: ${query}`); //TODO:Remove
    } catch (error) {
        console.error(`Error in 'try' block for 'findOne' method for collection 'collection_list': ${error}`); //TODO:Remove
    }
    
});


//+------------------------------------------------------------------+
//|  POST '/delete'                                                  |
//+------------------------------------------------------------------+
app.post('/delete',async function(req,res){
    //console.log(`req.body /delete route == ${JSON.stringify(req.body.checkbox)}`);
    const checkedItemID = req.body.checkbox; //Contains the _id path value of a 'collection_Item' document.
    const listName = req.body.listName; //Contains the name path value of a 'collection_List' document.

    //Step 1: Deletion of documents in the 'main' list/ Homepage.
    if(listName === 'Today'){
        await deleteDocument();
    }
    else{
        const query = collection_List.findOneAndUpdate(
            {name: listName},
            {$pull: {items: {_id: checkedItemID}}},
            {new: true}
        );

        try {
            const updatedList = await query.exec();
            res.redirect(`/${listName}`);
            console.log(updatedList);
        } catch (error) {
            console.error('An error occured while updating the document: ',error);
        }
    }

    async function deleteDocument(){
        try {
            //---Step 1: Delete document.
            const result = await collection_Item.deleteOne({_id: checkedItemID}); 
            //---Step 2: Redirect to the '/' route.
            res.redirect('/');
            console.log('Document deleted successfully ', result);
        } catch (error) {
            console.error('Document deletion failed ', error);
        }
        
    }
});


//+------------------------------------------------------------------+
//|  |
//+------------------------------------------------------------------+
app.get('/work', function (req, res) {
    res.render('list', { listTitle: 'Work list', itemsList: workItems });
});

//+------------------------------------------------------------------+
//|  |
//+------------------------------------------------------------------+
app.post('/work', function (req, res) {
    let item = req.body.listItem;
    workItems.push(item);
    res.redirect('/work');
});

//+------------------------------------------------------------------+
//|  |
//+------------------------------------------------------------------+
app.get('/about', function (req, res) {
    res.render('about');
});

//+------------------------------------------------------------------+
//|  |
//+------------------------------------------------------------------+
app.listen(3000, () => {
    console.log('Server started on port 3000');
});

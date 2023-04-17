//+------------------------------------------------------------------+
//|  |
//+------------------------------------------------------------------+
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');


const app = express();

app.set('view engine', 'ejs'); //ejs

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

//+------------------------------------------------------------------+
//|  |
//+------------------------------------------------------------------+
app.get('/', (req, res) => {
    let today = new Date();
    let options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    };
    let dayOfWeek = today.toLocaleString('en-US',options);
    let day = '';

    res.render('list',{kindOfDay: dayOfWeek}); //kindOfDay - template day - server
});

//+------------------------------------------------------------------+
//|  |
//+------------------------------------------------------------------+
app.post('/',function(req,res){
    res.render('list',{itemList: req.listItem});
});


//+------------------------------------------------------------------+
//|  |
//+------------------------------------------------------------------+
app.listen(3000, () => {
  console.log('Server started on port 3000');
});

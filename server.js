// import depedencies
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// set up express and port
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/upload.html');
  });
  
  app.get('/upload', (req, res) => {
    res.sendFile(__dirname + '/public/upload.html');
  });
  app.get('/list', (req, res) => {
    res.sendFile(__dirname + '/public/list.html');
  });
  app.get('/query', (req, res) => {
    res.sendFile(__dirname + '/public/query.html');
  });

// MongoDB Connection
mongoose.connect('mongodb://root:example@mongo:27017/ServiceDB?authSource=admin')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('DB connection error:', err));

// Mongoose Schema & Model
const Car = mongoose.model('ServiceInfo', new mongoose.Schema({
    lname: String,
    carMdl: String,
    year: Number,
    mainDate: Date
}));

// REST API Routes
app.post('/car', async (req, res) => {
    console.log('Received body:', req.body); 

    try {
        const newCar = new Car(req.body);
        await newCar.save();
        res.status(201).json({ message: 'Car saved successfully!' });
    } catch (err) {
        console.error(err); 

        res.status(400).json({ error: err.message });
    }
});

// for list and query, return the condition query result back
app.get('/cars', async (req, res) => {
    const { start, end } = req.query;
    const query = {};
  
    // for looking in between years
    const startYear = parseInt(start);
    const endYear = parseInt(end);

    // looking for last name
    if (req.query.lname) {
        query.lname = new RegExp(req.query.lname, 'i'); // case insensitive
    }
    // looking for model
    if (req.query.carMdl) {
      query.carMdl = new RegExp(req.query.carMdl, 'i');
    }
    
    // looking for date
    if (req.query.mainDate) {
      const inputDate = new Date(req.query.mainDate);
      const nextDate = new Date(inputDate);
      nextDate.setDate(inputDate.getDate() + 1);
    
      query.mainDate = {
        $gte: inputDate,
        $lt: nextDate
      };
    }
      
      
    // if both are numbers
    if (!isNaN(startYear) && !isNaN(endYear)) {
      query.year = { $gte: startYear, $lte: endYear };
    }
    // search query in database
    try {
      const cars = await Car.find(query);
      res.json(cars);
    } catch (err) {
      console.error('Search Error：', err);
      res.status(500).json({ error: 'Search Failed' });
    }
  });

// Start server
// app.listen(PORT, () => {
//     console.log(`Server running at http://localhost:${PORT}`);
// });
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

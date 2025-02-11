const express=require('express')
const mongoose = require('mongoose');
const {engine} =require('express-handlebars')
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); 
const router = require('./routes/Userroute');
const services=require('./routes/ServiceRoute')
const { loginProvider } = require('./Controllers/authController');

dotenv.config(); 

const app = express();
app.engine('hbs', engine({extname:"hbs" ,defaultLayout:false ,runtimeOptions:{allowProtoPropertiesByDefault:true},helpers: {
  json: (context) => JSON.stringify(context, null, 2),
} })); 
app.set('view engine', 'hbs');
app.use(cors());
app.use(express.json()); 
app.use(express.json());
//to get photo from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//route to store user details
app.use('/login/:provider',loginProvider)
app.use('/', router);
app.use('/wedding_services',services)
app.use('/matches',router)


const mongodb_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/matrimony_demo';
mongoose.connect(mongodb_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
 
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port:http://localhost:${port}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

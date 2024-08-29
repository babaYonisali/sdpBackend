const express = require('express');
const app = express();
const connectDB = require('./config/db');
connectDB();
const port = process.env.PORT || 3001;
const {expressjwt:jwt}=require('express-jwt')
const jwksRsa=require('jwks-rsa')
const cors= require('cors')
app.use(express.json());
const testModel=require("./models/testModel")
const restaurantModel=require("./models/restaurantModel")
const menuItemModel=require("./models/menuItemModel")

const allowedOrigins = [
    'http://localhost:3000'  // If your local frontend runs on a different port, add it here
  ];
  const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
  };
  app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 
//getting jwt token from auth0
const jwtCheck = jwt({
      secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://dev-vd2n3gc57jtwv2md.us.auth0.com/.well-known/jwks.json`
    }),
    audience: 'http://sdpbackend-c3akgye9ceauethh.southafricanorth-01.azurewebsites.net/',
    issuer: `https://dev-vd2n3gc57jtwv2md.us.auth0.com/`,
    algorithms: ['RS256']
  });
  
 


  // app.post('/signUp', async (req, res) => {
    //   const {userID} = req.body;
    //   try {
    //       await testModel.insertMany([req.body]); // Using an array as insertMany expects an array
    //       res.status(201).json({ message: 'User added successfully' });
    //   } catch (error) {
    //       res.status(500).json({ message: 'Error adding user', error: error.message });
    //   }
    // });
    
app.get('/', (req, res) => {
  res.send('This is about as far as you are getting to our data!');
});


app.use(jwtCheck);

app.get('/viewRestaurants', async (req, res) => {
  try{
    const restaurants= await restaurantModel.find({});
    res.status(200).send(restaurants);
  }catch(error){
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});

app.post('/addRestaurants',async (req,res)=>{
  try{
    //console.log(req.body)
    await restaurantModel.insertMany(req.body);
    res.status(200).send({ message: 'Restaurants added successfully'});
  }catch (error){
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});

app.post('/addMenuItems',async (req,res)=>{
  try{
    //console.log(req.body)
    await menuItemModel.insertMany(req.body);
    res.status(200).send({ message: 'Items added successfully'});
  }catch (error){
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});

app.post('/viewMenuItems', async (req, res) => { // Change to POST request
  try {
    const { restaurant } = req.body; // Get the restaurant name from the request body
    const menuItems = await menuItemModel.find({restaurant}); // Find the menu items matching the query
    res.status(200).send(menuItems); // Send the found menu items
  } catch (error) {
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
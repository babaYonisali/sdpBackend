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
const reviewModel=require("./models/reviewModel")
const reservationModel=require("./models/reservationModel")
const orderModel=require("./models/orderModel")
const userModel=require("./models/userModel")
const cron = require('node-cron');
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
app.post('/signUp', async (req, res) => {
  const { userID} = req.body;
  try {
      // Check if the user already exists
      const existingUser = await userModel.findOne({ userID });
      if (existingUser) {
          return res.status(200).json({ message: 'User already exists' });
      }

      // Insert the new user if they don't exist
      await userModel.insertMany([req.body]); // Using an array as insertMany expects an array
      res.status(201).json({ message: 'User added successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Error adding user', error: error.message });
  }
});

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
app.post('/addReview', async (req, res) => {
  try {
    const { restaurant, review, comment } = req.body;
    await reviewModel.insertMany([req.body]);
    const reviews = await reviewModel.find({ restaurant });
    const totalReviews = reviews.length;
    let averageRating = 5; // Default rating if there are no reviews
    if (totalReviews > 0) {
      const sumRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = Math.round(sumRatings / totalReviews);
    }
    await restaurantModel.findOneAndUpdate(
      { name: restaurant },
      { rating: averageRating },
      { new: true } // Return the updated document
    );
    res.status(200).send({ message: 'Review added and restaurant rating updated', averageRating });
  } catch (error) {
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});
app.post('/addReservation',async (req,res)=>{
  try{
    //console.log(req.body)
    await reservationModel.insertMany(req.body);
    res.status(200).send({ message: 'Items added successfully'});
  }catch (error){
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});
app.post('/addOrder',async (req,res)=>{
  const { userID, total } = req.body;
  try {
    const user = await userModel.findOne({ userID });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    if (user.credits < total) {
      return res.status(400).send({ message: 'Insufficient credits' });
    }
    user.credits -= total;
    await user.save(); // Save the updated user document
    // Insert the new order
    await orderModel.insertMany(req.body);
    res.status(200).send({ message: 'Items added successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});
app.post('/viewOrders', async (req, res) => {
  const { userID } = req.body;
  try{
    const orders= await orderModel.find({userID});
    res.status(200).send(orders);
  }catch(error){
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});
app.post('/viewUser', async (req, res) => {
  const { userID } = req.body;
  try{
    const user= await userModel.find({userID});
    res.status(200).send(user);
  }catch(error){
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});

const convertToDateTime = (date, time) => {
  const [hours, minutes] = time.split(':').map(Number);
  const dateTime = new Date(date);
  dateTime.setHours(hours, minutes, 0, 0);
  return dateTime;
};
const updateOrderStatus = async () => {
  const now = new Date();
  const thresholdTime = new Date(now.getTime() - (30 * 60 * 1000)); // 30 minutes ago
  try {
    // Find all orders where status is 'pending' and the combined date and time is older than thresholdTime
    const orders = await orderModel.find({ status: 'pending' });
    const updatePromises = orders.map(async (order) => {
      const orderDateTime = convertToDateTime(order.date, order.time);
      if (orderDateTime <= thresholdTime) {
        await orderModel.updateOne(
          { _id: order._id },
          { $set: { status: 'completed' } }
        );
      }
    });

    await Promise.all(updatePromises);
    console.log('Orders updated to "completed".');
  } catch (error) {
    console.error('Error updating orders:', error);
  }
};

// Set up the cron job to run every minute
cron.schedule('* * * * *', updateOrderStatus); // Runs every minute

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
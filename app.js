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
const locationModel=require("./models/locationModel")
const reservationModel=require("./models/reservationModel")
const orderModel=require("./models/orderModel")
const userModel=require("./models/userModel")
const voucherModel=require("./models/voucherModel")
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const { DateTime } = require('luxon');
const allowedOrigins = [
    'http://localhost:3000',
    'https://calm-bush-0adbb231e.5.azurestaticapps.net'
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



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'compsciwarriors@gmail.com', // Your Gmail address
    pass: 'lept uods rcrc vznf',    // Your App Password
  },
});

const convertToDateTime = (date, time) => {
  const [hours, minutes] = time.split(':').map(Number);

  // Parse the date using JavaScript Date object and then convert to Luxon DateTime with timezone
  const jsDate = new Date(date); // If date is already in Date format
  const dateTime = DateTime.fromJSDate(jsDate, { zone: 'Africa/Johannesburg' }).set({
    hour: hours,
    minute: minutes,
    second: 0,
    millisecond: 0
  });

  return dateTime.setZone('Africa/Johannesburg'); // Ensure both DateTime objects are in the same timezone
};
const updateOrderStatus = async () => {
  const now = DateTime.now().setZone('Africa/Johannesburg');
  const thresholdTime = now.minus({ minutes: 2 }); // 2 minutes ago
  console.log("Current time:", now);
  console.log("Threshold time:", thresholdTime);

  try {
    console.log('Checking pending orders for status update...');
    const orders = await orderModel.find({ status: 'pending' });
    const updatePromises = orders.map(async (order) => {
      const orderDateTime = convertToDateTime(order.date, order.time);
      console.log("Order DateTime:", orderDateTime, "Threshold Time:", thresholdTime);

      // Perform a comparison using .valueOf() to compare their timestamp in milliseconds
      if (orderDateTime.valueOf() <= thresholdTime.valueOf()) {
        console.log(`Updating order ${order._id} to 'ready for collection'`);

        await orderModel.updateOne(
          { _id: order._id },
          { $set: { status: 'ready for collection' } }
        );

        const mailOptions = {
          from: 'compsciwarriors@gmail.com',
          to: order.userID,
          subject: `Order from ${order.restaurant} ready for collection`,
          html: `<b>Hello,</b><p>Your order from ${order.restaurant} is ready for collection. Don't forget to click <b>"collected"</b> once you have picked it up!</p>`,
        };

        try {
          console.log(`Sending email to ${order.userID}...`);
          const info = await transporter.sendMail(mailOptions);
          console.log('Email sent: ' + info.response);
        } catch (emailError) {
          console.error('Error sending email:', emailError);
        }
      }
    });

    await Promise.all(updatePromises);
    console.log('Orders updated to "ready for collection".');
  } catch (error) {
    console.error('Error updating orders:', error);
  }
};
app.get('/api/viewRestaurants', async (req, res) => {
  // Retrieves all restaurants from the database using a GET METHOD 
  try {
    const restaurants = await restaurantModel.find({}).select('name description -_id');
    res.status(200).send(restaurants);
  } catch (error) {
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});
app.post('/addLocations',async (req,res)=>{//ignore
  try{
    //console.log(req.body)
    await locationModel.insertMany(req.body);
    res.status(200).send({ message: 'Restaurants added successfully'});
  }catch (error){
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});
app.get('/api/viewLocations', async (req, res) => { //takes in a restaurant and checks the menuitems table for entries from that restaurant and return all of them for that restaruant 
  try { 
    const locationItems = await locationModel.find({}); 
    res.status(200).send(locationItems); 
  } catch (error) {
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
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

//we make a fecth from the front end to these api end points 

app.get('/viewRestaurants', async (req, res) => {//retrives all restaurants from the database using a GET METHOD 
  try{
    const restaurants= await restaurantModel.find({});
    res.status(200).send(restaurants);
  }catch(error){
    res.status(500).send({ message: 'Server error processing the request', error: error.message }); //error
  }
});

app.post('/addRestaurants',async (req,res)=>{//ignore
  try{
    //console.log(req.body)
    await restaurantModel.insertMany(req.body);
    res.status(200).send({ message: 'Restaurants added successfully'});
  }catch (error){
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});
app.post('/addVouchers',async (req,res)=>{//ignore
  try{
    //console.log(req.body)
    await voucherModel.insertMany(req.body);
    res.status(200).send({ message: 'Restaurants added successfully'});
  }catch (error){
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});
app.post('/addCredits', async (req, res) => {//takes the voucher and userid as input checks if the voucher is a valid voucher then adds the credits to that user by user id in the database
  const { userID, vouch } = req.body; // Expecting userID and vouch in the request body
  try {
    const voucher = await voucherModel.findOne({ vouch });
    if (!voucher) {
      return res.status(404).send({ message: 'Voucher not found' });
    }
    const user = await userModel.findOne({ userID });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    user.credits += voucher.credits;
    await user.save();
    res.status(200).send({ message: 'Credits added successfully', updatedCredits: user.credits });
  } catch (error) {
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});


app.post('/addMenuItems',async (req,res)=>{//ignore
  try{
    //console.log(req.body)
    await menuItemModel.insertMany(req.body);
    res.status(200).send({ message: 'Items added successfully'});
  }catch (error){
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});

app.post('/viewMenuItems', async (req, res) => { //takes in a restaurant and checks the menuitems table for entries from that restaurant and return all of them for that restaruant 
  try {
    const { restaurant } = req.body; // Get the restaurant name from the request body
    const menuItems = await menuItemModel.find({restaurant}); // Find the menu items matching the query
    res.status(200).send(menuItems); // Send the found menu items
  } catch (error) {
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});
app.post('/addReview', async (req, res) => {//takes in the parameters seen below and add the review to the review table 
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

app.post('/completeOrder', async (req, res) => {//updates the status of order in the order table to completed once the user clicks completed 
  const { orderID } = req.body; // Expecting the orderID in the request body
  try {
    // Use updateOne to update the status of the order with the given orderID
    const result = await orderModel.updateOne(
      { orderID }, // Match based on orderID field
      { $set: { status: 'completed' } } // Update the status to 'completed'
    );
    if (result.nModified === 0) {
      return res.status(404).send({ message: 'Order not found or already completed' });
    }
    res.status(200).send({ message: 'Order status updated to completed' });
  } catch (error) {
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});

app.post('/addReservation',async (req,res)=>{//adds a reservation to the reservation table 
  try{
    //console.log(req.body)
    await reservationModel.insertMany(req.body);
    res.status(200).send({ message: 'Items added successfully'});
  }catch (error){
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});
app.post('/addOrder', async (req, res) => {// adds order to the order table 
  const { userID, total, items, orderID, email,restaurant,date, time } = req.body; // Expect email in the request body
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
    // Create the order with only the required fields
    const orderData = {
      userID:email, // Use the userID from the request body (as per your instructions)
      orderID,
      items, // Items being ordered
      total,
      time, // Additional field for delivery address
      status: 'pending', // Set default status to 'pending'
      date,
      restaurant, // Timestamp for when the order was placed
    };

    // Insert the new order into the database
    await orderModel.create(orderData);

    res.status(200).send({ message: 'Order added successfully', order: orderData });
  } catch (error) {
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});

app.post('/viewOrders', async (req, res) => {//view all orders
  const { userID } = req.body;
  try{
    const orders= await orderModel.find({userID});
    res.status(200).send(orders);
  }catch(error){
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});
app.post('/viewReservations', async (req, res) => {//view all the reservation from the particular user
  const { userID } = req.body;
  try{
    const reservations= await reservationModel.find({userID});
    res.status(200).send(reservations);
  }catch(error){
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});
app.post('/viewReviews', async (req, res) => {//view all the reviews
  const { restaurant } = req.body;
  try{
    const reviews= await reviewModel.find({restaurant});
    res.status(200).send(reviews);
  }catch(error){
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});
app.post('/deleteReservation', async (req, res) => {//deletes reservation by the reservation id that is passed from front end
  const { _id } = req.body; // Use _id from the request body to identify the reservation
  try {
    // Find the reservation by its _id and delete it
    const reservationId = new mongoose.Types.ObjectId(_id);
    const deletedReservation = await reservationModel.findByIdAndDelete(reservationId);
    if (!deletedReservation) {
      return res.status(404).send({ message: 'Reservation not found' });
    }
    res.status(200).send({ message: 'Reservation deleted successfully', deletedReservation });
  } catch (error) {
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});


app.post('/viewUser', async (req, res) => {//view user information like credits 
  const { userID } = req.body;
  try{
    const user= await userModel.find({userID});
    res.status(200).send(user);
  }catch(error){
    res.status(500).send({ message: 'Server error processing the request', error: error.message });
  }
});


cron.schedule('* * * * *', updateOrderStatus); // Runs every minute

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

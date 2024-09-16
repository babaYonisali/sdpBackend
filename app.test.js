const supertest = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('./app');
const restaurantModel = require('./models/restaurantModel');
const menuItemModel = require('./models/menuItemModel');
const userModel = require('./models/userModel');
const orderModel = require('./models/orderModel');
const voucherModel = require('./models/voucherModel');
const reservationModel = require('./models/reservationModel');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const { DateTime } = require('luxon');
const reviewModel = require('./models/reviewModel');
const transporter = app.transporter;
const updateOrderStatus = app.updateOrderStatus;

// Mock JWT middleware
jest.mock('express-jwt', () => ({
  expressjwt: jest.fn(() => (req, res, next) => next()), // Mocking JWT to always pass
}));

// Mock nodemailer
jest.mock('nodemailer');
const sendMailMock = jest.fn();
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

// Mock cron
jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}));

let mongoServer;

beforeAll(async () => {
  // Start the in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  // Close MongoDB connection and stop the in-memory server
  await mongoose.connection.close(); // Close Mongoose connection
  await mongoServer.stop(); // Stop the MongoMemoryServer
});

describe('Testing API Endpoints', () => {

  describe('Base Route Tests', () => {
    it('GET / - should return a welcome message', async () => {
      const res = await supertest(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe('This is about as far as you are getting to our data!');
    });
  });

  describe('Restaurant Tests', () => {

    it('GET /viewRestaurants - should return a list of restaurants', async () => {
      const res = await supertest(app)
        .get('/viewRestaurants')
        .set('Authorization', 'Bearer validJWTTokenHere'); // Token is mocked, but include it for completeness
  
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true); // Assuming the body should be an array
    });
  
    it('GET /viewRestaurants - should return a 500 error when an error occurs', async () => {
      // Mock restaurantModel.find to throw an error
      jest.spyOn(restaurantModel, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
    
      const res = await supertest(app)
        .get('/viewRestaurants')
        .set('Authorization', 'Bearer validJWTTokenHere');
    
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Server error processing the request');
      expect(res.body.error).toBe('Database error');
    });

    it('POST /addRestaurants - should add new restaurants', async () => {
      const restaurantData = [
        {
          name: 'Test Restaurant', 
          image: 'http://example.com/image.jpg', 
          description: 'A test restaurant', 
          rating: 4.5
        }
      ];
    
      const res = await supertest(app)
        .post('/addRestaurants')
        .send(restaurantData)
        .set('Authorization', 'Bearer validJWTTokenHere'); // Token is mocked, but include it for completeness
    
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Restaurants added successfully');
    });
  
    it('POST /addRestaurants - should return a 500 error when an error occurs', async () => {
      // Mock restaurantModel.insertMany to throw an error
      jest.spyOn(restaurantModel, 'insertMany').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
    
      const restaurantData = [
        {
          name: 'Test Restaurant',
          image: 'http://example.com/image.jpg',
          description: 'A test restaurant',
          rating: 4.5,
        },
      ];
    
      const res = await supertest(app)
        .post('/addRestaurants')
        .send(restaurantData)
        .set('Authorization', 'Bearer validJWTTokenHere');
    
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Server error processing the request');
      expect(res.body.error).toBe('Database error');
    });

  });

  describe('Menu Item Tests', () => {

    it('POST /addMenuItems - should add new menu items', async () => {
      const menuItemData = [
        {
          name: 'Test Item',
          description: 'A delicious test item',
          ingredients: ['Ingredient1', 'Ingredient2'],
          price: 10.99,
          dietary: ['Vegan', 'Gluten-Free'],
          restaurant: 'Test Restaurant'
        }
      ];
    
      const res = await supertest(app)
        .post('/addMenuItems')
        .send(menuItemData)
        .set('Authorization', 'Bearer validJWTTokenHere'); // Token is mocked, but include it for completeness
    
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Items added successfully');
    });
  
    it('POST /addMenuItems - should return a 500 error when an error occurs', async () => {
      // Mock menuItemModel.insertMany to throw an error
      jest.spyOn(menuItemModel, 'insertMany').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
    
      const menuItemData = [
        {
          name: 'Test Item',
          description: 'A delicious test item',
          ingredients: ['Ingredient1', 'Ingredient2'],
          price: 10.99,
          dietary: ['Vegan', 'Gluten-Free'],
          restaurant: 'Test Restaurant',
        },
      ];
    
      const res = await supertest(app)
        .post('/addMenuItems')
        .send(menuItemData)
        .set('Authorization', 'Bearer validJWTTokenHere');
    
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Server error processing the request');
      expect(res.body.error).toBe('Database error');
    });
  
    it('POST /viewMenuItems - should return menu items for a restaurant', async () => {
      const requestData = {
        restaurant: 'Test Restaurant'
      };
  
      const res = await supertest(app)
        .post('/viewMenuItems')
        .send(requestData)
        .set('Authorization', 'Bearer validJWTTokenHere'); // Token is mocked, but include it for completeness
  
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true); // Assuming the body should be an array
    });
  
    it('POST /viewMenuItems - should return a 500 error when an error occurs', async () => {
      // Mock menuItemModel.find to throw an error
      jest.spyOn(menuItemModel, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
    
      const requestData = { restaurant: 'Test Restaurant' };
    
      const res = await supertest(app)
        .post('/viewMenuItems')
        .send(requestData)
        .set('Authorization', 'Bearer validJWTTokenHere');
    
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Server error processing the request');
      expect(res.body.error).toBe('Database error');
    });
  });

  describe('Signup', () => {

    it('POST /signUp - should add a new user', async () => {
        const userData = { userID: 'testUser123' };
        
        const res = await supertest(app)
          .post('/signUp')
          .send(userData)
          .set('Authorization', 'Bearer validJWTTokenHere');
      
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('User added successfully');
      });
      
      it('POST /signUp - should return 200 if user already exists', async () => {
        const existingUser = new userModel({ userID: 'existingUser' });
        await existingUser.save();
      
        const res = await supertest(app)
          .post('/signUp')
          .send({ userID: 'existingUser' })
          .set('Authorization', 'Bearer validJWTTokenHere');
      
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('User already exists');
      });        

  });

  describe('Vouchers', () => {

    it('POST /addVouchers - should add vouchers successfully', async () => {
        const voucherData = [{ vouch: 'TEST123', credits: 100 }];
      
        const res = await supertest(app)
          .post('/addVouchers')
          .send(voucherData)
          .set('Authorization', 'Bearer validJWTTokenHere');
      
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Restaurants added successfully');
      });

      it('should return 500 error when adding vouchers fails', async () => {
        jest.spyOn(voucherModel, 'insertMany').mockImplementationOnce(() => {
          throw new Error('Database error');
        });
        const res = await supertest(app)
          .post('/addVouchers')
          .send({ vouch: 'INVALID', credits: 0 })
          .set('Authorization', 'Bearer validJWTTokenHere');
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('Server error processing the request');
      });

  });

  describe('Add Credits', () => {

    it('POST /addCredits - should add credits to user successfully', async () => {
        // Clear the user and voucher collections before each test to avoid data persistence between tests
        await userModel.deleteMany({});
        await voucherModel.deleteMany({});
      
        // Set the user’s initial credits to 50 and voucher credits to 100
        const user = new userModel({ userID: 'testUser123', credits: 50 });
        const voucher = new voucherModel({ vouch: 'TEST123', credits: 100 });
        await user.save();
        await voucher.save();
      
        // Perform the request to add credits
        const res = await supertest(app)
          .post('/addCredits')
          .send({ userID: 'testUser123', vouch: 'TEST123' })
          .set('Authorization', 'Bearer validJWTTokenHere');
      
        // Check the updated credits
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Credits added successfully');
        expect(res.body.updatedCredits).toBe(150); // 50 initial + 100 voucher = 150
      });
      
      
      it('POST /addCredits - should return 404 if voucher not found', async () => {
        const res = await supertest(app)
          .post('/addCredits')
          .send({ userID: 'testUser123', vouch: 'INVALID' })
          .set('Authorization', 'Bearer validJWTTokenHere');
      
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Voucher not found');
      });

      it('should return 500 if there is a server error when adding credits', async () => {
        jest.spyOn(voucherModel, 'findOne').mockRejectedValue(new Error('Server error'));
      
        const res = await supertest(app)
          .post('/addCredits')
          .send({ userID: 'testUser', vouch: 'invalidVoucher' });
      
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('Server error processing the request');
      });

      it('POST /addOrder - should return 400 if user has insufficient credits', async () => {
        const user = new userModel({ userID: 'user@example.com', credits: 50 });
        await user.save();
    
        const orderData = {
          userID: 'user@example.com',
          total: 100, // More than user's credits
          items: ['item1'],
          orderID: 'ORD125',
          email: 'user@example.com',
          restaurant: 'Test Restaurant',
          date: '2023-01-01',
          time: '12:00',
        };
    
        const res = await supertest(app)
          .post('/addOrder')
          .send(orderData)
          .set('Authorization', 'Bearer validJWTTokenHere');
    
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Insufficient credits');
      });

  });

  describe('Order', () => {

    it('POST /addOrder - should create an order and update user credits', async () => {
        const user = new userModel({ userID: 'testUser123', credits: 200 });
        await user.save();
      
        const orderData = {
          userID: 'testUser123',
          total: 100,
          items: ['item1', 'item2'],
          orderID: 'ORD123',
          email: 'user@example.com',
          restaurant: 'Test Restaurant',
          date: '2023-01-01',
          time: '12:00'
        };
      
        const res = await supertest(app)
          .post('/addOrder')
          .send(orderData)
          .set('Authorization', 'Bearer validJWTTokenHere');
      
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Order added successfully');
        expect(res.body.order.total).toBe(100);
      });      

      it('POST /completeOrder - should update order status to completed', async () => {
        const order = new orderModel({
          orderID: 'ORD123',
          status: 'pending',
          total: 100,             // Add required fields
          userID: 'testUser123',   // Add required fields
          restaurant: 'Test Restaurant',
          time: '12:00',
          date: '2023-01-01'
        });
        await order.save();
      
        const res = await supertest(app)
          .post('/completeOrder')
          .send({ orderID: 'ORD123' })
          .set('Authorization', 'Bearer validJWTTokenHere');
      
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Order status updated to completed');
      });

      it('should return 500 if adding order fails', async () => {
        jest.spyOn(orderModel, 'create').mockImplementationOnce(() => {
          throw new Error('Database error');
        });
        const res = await supertest(app)
          .post('/addOrder')
          .send({ userID: 'user123' })
          .set('Authorization', 'Bearer validJWTTokenHere');
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('User not found');
      });

      it('should complete the order and update the status', async () => {
        const order = { orderID: 'ORD123', status: 'pending' };
        jest.spyOn(orderModel, 'updateOne').mockResolvedValue({ nModified: 1 });
      
        const res = await supertest(app)
          .post('/completeOrder')
          .send({ orderID: 'ORD123' });
      
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Order status updated to completed');
      });
      
      it('should return 404 if the order is not found', async () => {
        jest.spyOn(orderModel, 'updateOne').mockResolvedValue({ nModified: 0 });
      
        const res = await supertest(app)
          .post('/completeOrder')
          .send({ orderID: 'ORD999' });
      
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Order not found or already completed');
      });

      it('POST /viewOrders - should return orders for a user', async () => {
        const order = new orderModel({
          userID: 'user@example.com',
          orderID: 'ORD123',
          items: ['item1'],
          total: 50,
          status: 'pending',
          date: '2023-01-01',
          time: '12:00',
          restaurant: 'Test Restaurant',
        });
        await order.save();
    
        const res = await supertest(app)
          .post('/viewOrders')
          .send({ userID: 'user@example.com' })
          .set('Authorization', 'Bearer validJWTTokenHere');
    
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
      });

      it('POST /viewOrders - should return empty array if no orders', async () => {
        const res = await supertest(app)
          .post('/viewOrders')
          .send({ userID: 'noorders@example.com' })
          .set('Authorization', 'Bearer validJWTTokenHere');
    
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
      });

      it('should not update orders that are not pending or not older than 2 minutes', async () => {
        // Setup: Create a recent order
        const recentDateTime = DateTime.now().setZone('Africa/Johannesburg').minus({ minutes: 1 });
        const order = new orderModel({
          userID: 'user@example.com',
          orderID: 'ORD124',
          items: ['item1'],
          total: 50,
          status: 'pending',
          date: recentDateTime.toISODate(),
          time: recentDateTime.toFormat('HH:mm'),
          restaurant: 'Test Restaurant',
        });
        await order.save();
    
        // Call the function
        await updateOrderStatus();
    
        // Check if the order status remains pending
        const updatedOrder = await orderModel.findOne({ orderID: 'ORD124' });
        expect(updatedOrder.status).toBe('pending');
      });

      it('POST /addOrder - should return 400 if user has insufficient credits', async () => {
        const user = new userModel({ userID: 'user@example.com', credits: 50 });
        await user.save();
    
        const orderData = {
          userID: 'user@example.com',
          total: 100, // More than user's credits
          items: ['item1'],
          orderID: 'ORD125',
          email: 'user@example.com',
          restaurant: 'Test Restaurant',
          date: '2023-01-01',
          time: '12:00',
        };
    
        const res = await supertest(app)
          .post('/addOrder')
          .send(orderData)
          .set('Authorization', 'Bearer validJWTTokenHere');
    
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Insufficient credits');
      });

  });

  describe('Reservation', () => {

    it('POST /addReservation - should add a reservation successfully', async () => {
        const reservationData = { userID: 'testUser123', date: '2023-01-01', time: '12:00', restaurant: 'Test Restaurant', numberOfGuests: 4 };
      
        const res = await supertest(app)
          .post('/addReservation')
          .send(reservationData)
          .set('Authorization', 'Bearer validJWTTokenHere');
      
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Items added successfully');
      });

      it('should delete a reservation successfully', async () => {
        // Mocking a valid ObjectId for the test
        const validId = new mongoose.Types.ObjectId();
    
        jest.spyOn(reservationModel, 'findByIdAndDelete').mockResolvedValueOnce({ _id: validId });
    
        const res = await supertest(app)
          .post('/deleteReservation')
          .send({ _id: validId.toString() }) // Ensure the correct ObjectId is passed
          .set('Authorization', 'Bearer validJWTTokenHere');
    
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Reservation deleted successfully');
      });
    
      it('should return 404 if reservation not found', async () => {
        jest.spyOn(reservationModel, 'findByIdAndDelete').mockResolvedValueOnce(null);
        const res = await supertest(app)
          .post('/deleteReservation')
          .send({ _id: 'invalidReservationId' })
          .set('Authorization', 'Bearer validJWTTokenHere');
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('Server error processing the request');
      });

      it('POST /viewReservations - should return reservations for a user', async () => {
        const reservation = new reservationModel({
          userID: 'user@example.com',
          date: '2023-01-01',
          time: '19:00',
          restaurant: 'Test Restaurant',
          numberOfGuests: 2,
        });
        await reservation.save();
    
        const res = await supertest(app)
          .post('/viewReservations')
          .send({ userID: 'user@example.com' })
          .set('Authorization', 'Bearer validJWTTokenHere');
    
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
      });

      it('POST /viewReservations - should return empty array if no reservations', async () => {
        const res = await supertest(app)
          .post('/viewReservations')
          .send({ userID: 'noreservations@example.com' })
          .set('Authorization', 'Bearer validJWTTokenHere');
    
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
      });

  });

  describe('View User', () => {

    it('POST /viewUser - should return user details', async () => {
        const user = new userModel({ userID: 'testUser123', credits: 100 });
        await user.save();
      
        const res = await supertest(app)
          .post('/viewUser')
          .send({ userID: 'testUser123' })
          .set('Authorization', 'Bearer validJWTTokenHere');
      
        expect(res.statusCode).toBe(200);
        expect(res.body[0].userID).toBe('testUser123');
      });

      it('POST /viewUser - should return empty array if user not found', async () => {
        const res = await supertest(app)
          .post('/viewUser')
          .send({ userID: 'nonexistentuser' })
          .set('Authorization', 'Bearer validJWTTokenHere');
    
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
      });

  });

  describe('Reviews', () => {
    
    it('POST /addReview - should add a review and update restaurant rating', async () => {
      // Setup: Create a restaurant to review
      const restaurant = new restaurantModel({
        name: 'Test Restaurant',
        rating: 0,
        description: 'Test Description',
        image: 'http://example.com/image.jpg',
      });
      await restaurant.save();
    
      const reviewData = {
        restaurant: 'Test Restaurant',
        rating: 5,
        comment: 'Great food!',
      };
    
      const res = await supertest(app)
        .post('/addReview')
        .send(reviewData)
        .set('Authorization', 'Bearer validJWTTokenHere');
    
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Review added and restaurant rating updated');
      expect(res.body.averageRating).toBe(5);
    
      // Verify that the restaurant rating was updated
      const updatedRestaurant = await restaurantModel.findOne({ name: 'Test Restaurant' });
      expect(updatedRestaurant.rating).toBe(5);
    });
    
  
    it('POST /addReview - should return 500 if an error occurs', async () => {
      jest.spyOn(reviewModel, 'insertMany').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
  
      const reviewData = {
        restaurant: 'Nonexistent Restaurant',
        rating: 5,
        comment: 'Great food!',
      };
  
      const res = await supertest(app)
        .post('/addReview')
        .send(reviewData)
        .set('Authorization', 'Bearer validJWTTokenHere');
  
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Server error processing the request');
    });

    it('POST /viewReviews - should return reviews for a restaurant', async () => {
      // Setup: Add a review
      const review = new reviewModel({
        restaurant: 'Test Restaurant',
        rating: 5,
        comment: 'Great place!',
      });
      await review.save();
  
      const res = await supertest(app)
        .post('/viewReviews')
        .send({ restaurant: 'Test Restaurant' })
        .set('Authorization', 'Bearer validJWTTokenHere');
  
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  
    it('POST /viewReviews - should return empty array if no reviews', async () => {
      const res = await supertest(app)
        .post('/viewReviews')
        .send({ restaurant: 'Empty Restaurant' })
        .set('Authorization', 'Bearer validJWTTokenHere');
  
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

  });

});


describe('Test JWT Tokens', () => {

    it('should reject access to a protected route when JWT is invalid', async () => {
        const res = await supertest(app)
          .get('/protectedRoute')
          .set('Authorization', 'Bearer invalidJWTTokenHere');
      
        expect(res.statusCode).toBe(404);
    });

});


describe('Test CORS', () => {

    it('should allow access from an allowed origin', async () => {
        const res = await supertest(app)
          .get('/')
          .set('Origin', 'http://localhost:3000');
        
        expect(res.statusCode).toBe(200);
      });

});
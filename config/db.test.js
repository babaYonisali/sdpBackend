const mongoose = require('mongoose');
const connectDB = require('../config/db');

jest.mock('mongoose', () => ({
    set: jest.fn(),
    connect: jest.fn(() => ({
      connection: { host: 'localhost' }
    }))
  }));
  
  describe('Database Connection', () => {
    it('should connect to the database', async () => {
      await connectDB();
      expect(mongoose.connect).toHaveBeenCalledWith(
        "mongodb+srv://2460755:qg2XJWBsvqW5yfJt@sdpcluster.vux5q.mongodb.net/"
      );
    });
  
    it('should log the connected host', async () => {
      console.log = jest.fn(); // Mock console.log
      await connectDB();
      expect(console.log).toHaveBeenCalledWith('Database connected: localhost');
    });
  
    it('should handle connection errors', async () => {
      mongoose.connect.mockImplementationOnce(() => {
        throw new Error('Connection failed');
      });
      console.log = jest.fn(); // Mock console.log to capture the error
      await connectDB();
      expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    });
  });
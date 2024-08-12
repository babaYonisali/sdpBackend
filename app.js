const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const {expressjwt:jwt}=require('express-jwt')
const jwksRsa=require('jwks-rsa')
const cors= require('cors')
app.use(express.json());
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
  
 
app.get('/', (req, res) => {
  res.send('Hello, Yoooo ma se!');
});
app.use(jwtCheck);
app.get('/hello', (req, res) => {
    res.send('Hello this shouldnt be working !');
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
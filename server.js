
const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);


const corsOptions = {
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://sph4919.github.io'
  ],
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

//middle vars
app.use(session({
  name: 'connect.sid',         // default cookie name
  secret: 'Sugnay@simplyhire',
  resave: false,               // don’t save if unmodified
  saveUninitialized: false,    // don’t set cookie until something’s stored
  cookie: { 
    maxAge: 1000 * 60 * 60,    // 1 hour
    sameSite: 'none',          
    secure: process.env.NODE_ENV === 'production',
    path: '/'                  // sent to every path on your domain
  }
}));
 



app.get('/', (req, res) => {
  res.send('✅ SimplyHire API is running');
});

  
let userEndPoints = require('./routes/userRoutes.js')
let providerEndPoints = require('./routes/serviceProviderRoutes.js')

app.use('/user',userEndPoints);
app.use('/provider',providerEndPoints)


app.listen(PORT,'0.0.0.0',() => {
  console.log(`Backend running at http://0.0.0.0:${PORT}`);
});
 
const express = require('express');
const router = express.Router();
const db = require('../db.js');

//index page 
  router.post('/userLogin', (req, res) => {

  const {email,password} = req.body;

  const query = 'SELECT user_id FROM users WHERE email = ? AND password = ?';
  db.query(query,[email,password], (err, result) => {
   
        
      if(err)
       {
        res.status(500).json({message:' Server is Down : Please try again :) '});
       }
     
      if (result.length === 0)
       {
        res.status(401).json({ message: 'Invalid credentials. If you are newbiee plz sign Up asap' });
       }

       if(result.length === 1)
       {  
        const sessionId = req.sessionID;
        req.session.visted = true;
        console.log(sessionId);
        req.session.userId = result[0].user_id;
        res.status(202).json({message:'Correct credentials'});
       }

  });

});


router.get('/sessionChecker',(req,res)=>{

  if(req.sessionID)
        {
           res.clearCookie('connect.sid', { path: '/' });
           res.status(200).json({message: "session removed"});
        }
      else
      {
        res.status(500).json({message: "Server session removal error"});
      }
        }

)

//main page
 router.get('/mainFetch', (req, res) => {

    if (!req.session.userId) {
    return res.status(401).json({ error: 'You must log in first' });
     }

    const query = 'SELECT service_type, servicedescription FROM services';
    db.query(query, (err, result) => {
      if (err) 
        {
         res.status(500).json({message:' Server is Down : Please try again :) '});
        }
        console.log(result);
      res.status(200).json(result);
    });
  });


//providerlist.html
router.get('/providerListFetch/:serviceType', (req, res) => {
    
     if (!req.session.userId) {
       return res.status(401).json({ error: 'You must log in first' });
     }
     let type = req.params.serviceType;
     let obj = [type];

     const query = 'SELECT name, shortdescription FROM service_provider WHERE job_type = ?';
     db.query(query,obj, (err, results) => {
      if (err) 
        {
         res.status(500).json({ message: ' Server is Down : Please try again :) ' });
        }
      console.log('DB results provider lsit:', results); //for debugging
      res.status(200).json(results);
    });

});

//profile.html
router.get('/providerInfoFetch/:name', (req, res) => {
    
    if (!req.session.userId) {
    return res.status(401).json({ error: 'You must log in first' });
     }
     let type = req.params.name;
     console.log(type);
     let obj = [type]

    const query = 'SELECT name,description,rate,job_type FROM service_provider WHERE name = ?';
    db.query(query,obj, (err, results) => {
      if (err) 
        {
        res.status(500).json({ message: ' Server is Down : Please try again :) ' });
        }
      console.log('DB results profile page:', results); //for debugging
      res.status(200).json(results);
    });

});


//request page
router.post('/findServiceProviderId', (req, res) => {
   if (!req.session.userId) {
    return res.status(401).json({ error: 'You must log in first' });
     }
  const {personalName} = req.body;
  const obj = [personalName];
 
  const query = 'SELECT serviceprovider_id FROM service_provider WHERE name = ?';
  db.query(query, obj, (err, result) => {
      if (err) 
      {
       res.status(500).json({ message: 'Server is drunk' });
      }

        console.log(result); // for debugging only
        res.status(200).json({result});
  });
});


router.post('/createRequest', (req, res) => {
   if (!req.session.userId) {
    return res.status(401).json({ error: 'You must log in first' });
     }
  const {street,city,state,zip,description,serviceProviderId } = req.body;
  const userId = req.session.userId;

  const obj = [userId, serviceProviderId , description , street , city , state , zip ];
  console.log(obj);

  const query = 'INSERT INTO request (user_id,serviceprovider_id,description,address,city,state,zip) VALUES ( ? , ? , ? , ? , ? , ? , ?)';
  db.query(query, obj, (err, result) => {
      if (err) 
      {
      console.error("DB insert error:", err);
      return res.status(500).json({ message: 'Database error' });
      }
     else
      { 
        res.status(201).json({ message: 'Request created'});
      }

  });
});


//userDashboard page
router.get('/userReqFetch', (req, res) => {

   if (!req.session.userId) {
    return res.status(401).json({ error: 'You must log in first' });
     }
  let userid = [req.session.userId];
  let obj = [userid];
  
    const query = 'SELECT description,address,city,state,status,serviceprovider_id FROM request WHERE user_id = ?';
    db.query(query,obj, (err, results) => {
      if (err) {
        
        res.status(500).json({ message: 'Server is busy in dance class. Please get back after 30 min or contact support' });
      }
      console.log('DB results: userReq ', results); //for debugging
       res.status(200).json(results);
    });

});


router.get('/providerNameFetch/:providerId', (req, res) => {

   if (!req.session.userId) {
    return res.status(401).json({ error: 'You must log in first' });
     }
    let ProviderId = [ req.params.providerId ]; 
    console.log(ProviderId);
    let obj = [ProviderId];
    const query = 'SELECT name FROM service_provider WHERE serviceprovider_id = ?';
    db.query(query,obj,(err, results) => {
      if (err) {
         res.status(500).json({ message: 'Server is swimming plz try agian after 15 min or contact 91111112828 '});
      }
       res.status(200).json(results);
    });

});



//signup page
router.post('/check', (req, res) => {
 
  const {email} = req.body;
    if ( !email ) 
    {
     res.status(400).json({ message: 'All fields are required' });
    }

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, result) => {
      if (err) 
      {
          res.status(500).json({ message: 'Server is learning french plz try again' });
      }

      if(result.length > 0)
      {
        res.status(201).json({ message: 'User Email already exist' });
      }

  });
});


router.post('/signup', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) 
    {
     res.status(400).json({ message: 'All fields are required' });
    }

  const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  db.query(query, [name, email, password], (err, result) => {
    if (err) 
      {
      return res.status(500).json({ message: 'Inserting server error plz try again after 30 min or contact the webpage admin' });
      }
    res.status(201).json({ message: 'User registered successfully' });
  });
});


//error page 
router.get('/sessionCheck', (req, res) => {

     if (!req.session.userId )
     {
     
     res.status(401).json({ error: 'You must log in first' });
     }

    res.status(200).json({message : "Session is on"});

});


router.post('/logout', (req, res) => {

  req.session.destroy(err => {
    if (err) {
      res.clearCookie('connect.sid', { path: '/' });
      res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid', { path: '/' });
    res.status(200).json({ message: 'Logged out' });
  });
});

module.exports = router;
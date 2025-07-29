const express = require('express');
const router = express.Router();
const db = require('../db.js');


//serviceProvdier login
router.post('/serviceUserLogin', (req, res) => {

    const {email,password} = req.body;
    console.log("rq processing");  //for debugging
    const query = 'SELECT serviceprovider_id FROM service_provider WHERE email = ? AND password = ?';
    db.query(query, [email,password], (err, result) => {
     if(err)
       {
        res.status(500).json({message:' Server is Down : Please try again :) '});
       }
     
      if (result.length === 0|| !result)
       {
     
        res.status(401).json({ message: 'Invalid credentials. Please sign up first.' });
       }
       else
       {  
        const sessionId = req.sessionID;
        req.session.visted = true;
        console.log(sessionId); //for degugging
        req.session.serviceProId = result[0].serviceprovider_id;
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




// serviceSignup
router.post('/serviceSignup', (req, res) => {
  const {
    name, email, password,
    type, description, rate, shortDescription
  } = req.body;

   if (!name || !email || !password || !type || !description || !rate || !shortDescription ) 
    {
    res.status(400).json({ message: 'All fields are required' });
  }


  const sql = `
    INSERT INTO service_provider
      (name, email, password, job_type, description, rate, shortdescription)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [name, email, password, type, description, rate, shortDescription],
    (err, result) => {
      if (err) 
        {
         res.status(500).json({ message: 'Registartion error plz try again after 30 mins' });
        }
      res.status(201).json({ message: 'Registered successfully', id: result.insertId });
    }
  );
});

router.post('/serviceSignUpCheck', (req, res) => {
  const { email } = req.body;
  db.query(
    'SELECT * FROM service_provider WHERE email = ?',
    [email],
    (err, rows) => {
      if (err) 
        {
         res.status(500).json({ message: 'DB error' });
        }
      console.log(rows.length)
      if (rows.length >=1 )
         {
          res.status(409).json({ message: 'User is already registered as current user' });
         } 
     
    }
  );
});


router.get('/listServices', (req, res) => {
  
    const query = 'SELECT service_type FROM services';
    db.query(query,(err, results) => {
      if (err)
         {
            res.status(500).json({ message: 'Server list fetching error plz contact admin and check your contection' });
         }
      console.log('DB results:', results); //for degugginh
      res.status(200).json(results);
    });

});

//dashboard 
router.get('/serviceDashboardFetch', (req, res) => {

 if (!req.session.serviceProId) {
     res.status(401).json({ error: 'You must log in first' });
     }
  let id = req.session.serviceProId;
  let obj = [id];
    const query = 'SELECT request_id, description , address , city , state , zip , status  FROM request WHERE serviceprovider_id = ?';
    db.query(query,obj,(err, results) => {
      if (err) 
        {
         res.status(500).json({ message: 'Server is dancing plz try it after 30 mins' });
        }
      console.log('DB results serviceDashboard:', results); //for debugging
      res.status(200).json(results);
    });

});


router.post('/requestAccepted', (req, res) => {

  const {reqId} = req.body;
  console.log(reqId);
  const obj = ["confirm", reqId];

    const query = 'UPDATE request SET status = ? WHERE request_id = ?';
    db.query(query,obj,(err, results) => {
      if (err) 
      {
        res.status(500).json({ message: 'Request is not confrim due to server is hot and sweety plz try again' });
      }
       res.status(200).json({message : 'request Updated'});
    });
});


//providersetting
router.get('/getSettingDetail', (req, res) => {
   if (!req.session.serviceProId) 
    {
      res.status(401).json({ error: 'You must log in first' });
    }
  
const id = req.session.serviceProId ;
const obj = [id];

      const query = 'SELECT name , rate FROM service_provider WHERE serviceproviderid = ?';
      db.query(query,obj,(err, results) => {
      if (err)
         {
           res.status(500).json({ message: 'Server is dancing plz try it after 30 mins' });
         }
       console.log('DB results:', results); //for debugging
       res.status(200).json(results);
    });
});


router.post('/updateRate', (req, res) => {
  
  const {newRate} = req.body;
  const id = req.session.serviceProId ;
  const obj = [newRate,id];

    const query = 'UPDATE service_provider SET rate = ? WHERE serviceprovider_id = ?';
    db.query(query,obj,(err, results) => {
      if (err) 
        {
          res.status(500).json({ message: 'Server is dancing plz try rate change  after 30 mins or your are not worst that rate' });
        }
       res.status(200).json({message : 'updated'});
    });
});


//session check
router.get('/sessionCheck', (req, res) => {

     if ( !req.session.serviceId )
     {
     res.status(401).json({ error: 'You must log in first' });
     }

    res.status(200).json({message : "Session is on"});

});


//logout logic
router.post('/logout', (req, res) => {

  req.session.destroy(err => {
    if (err) {
      console.error('Session destroy error:', err);
      res.clearCookie('connect.sid', { path: '/' });
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid', { path: '/' });
    res.status(200).json({ message: 'Logged out' });
  });
});



module.exports = router;
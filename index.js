const express = require('express')
const app = express();
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const port = 3000; // You can choose any available port
const userModel = require("./src/model/userModel")
const validation = require("./src/validation/validations")
// Serve static files (HTML) from the "public" directory
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('public'));
mongoose.connect('mongodb+srv://nehajaiswal:neha123@nehadb.pcorgpc.mongodb.net/anmol', {useNewUrlParser:true})
.then(()=>{
  console.log('mongodb is connnected')
})
.catch((error)=>{
  console.log(error.message)
})
const session = require('express-session');

app.use(session({
    secret: 'anmol', 
    resave: false,
    saveUninitialized: true,
}));




app.get("/signUpUser",(req,res)=>{
    res.sendFile(__dirname + '/public/signUpUser.html')
})
app.post("/signUpUser",async(req,res)=>{
        try {
          let userData = req.body;
      console.log(userData)
          let { userName, password, email, phone } = userData;
      
          if (Object.keys(userData).length == 0)
            return res.status(400).send({ status: false, message: "please provide required fields" });
      
         
      
          if (!userName)
            return res.status(400).send({ status: false, message: "user name is mandatory" });
      console.log(typeof userName)
          if (typeof userName != "string")
            return res.status(400).send({ status: false, message: "user name should be in string" });
      
          // regex
          userName = userData.userName = userName.trim();
      
          if (userName == "")
            return res.status(400).send({ status: false, message: "Please Enter user name value" });
      
      
      
          //================================ email ======
      
          if (!email)
            return res.status(400).send({ status: false, message: "email is mandatory" });
      
          if (typeof email != "string")
            return res.status(400).send({ status: false, message: "email id  should be in string" });
      
          //=========== email =======
      
          email = userData.email = email.trim().toLowerCase()
          if (email == "")
            return res.status(400).send({ status: false, message: "Please enter email value" });
      
          if (!validation.validateEmail(email))
            return res.status(400).send({ status: false, message: "Please provide valid email id" });
      
      
          //========= password ======
      
          if (!password)
            return res.status(400).send({ status: false, message: "password is mandatory" });
      
          if (typeof password != "string")
            return res.status(400).send({ status: false, message: "please provide password in string " });
      
          password = userData.password = password.trim();
          if (password == "")
            return res.status(400).send({ status: false, message: "Please provide password value" });
      
      
          //regex password
          if (!validation.validatePassword(password))
            return res.status(400).send({ status: false, message: "8-15 characters, one lowercase letter, one number and maybe one UpperCase & one special character" });
      
          //Encrypting password
          let hashing = bcrypt.hashSync(password, 10);
          userData.password = hashing;
      
          //======= phone =============
          if (!phone)
            return res.status(400).send({ status: false, message: "phone is mandatory" });
      
          if (typeof phone != "string")
            return res.status(400).send({ status: false, message: "phone should be in string" });
      
          phone = userData.phone = phone.trim();
          if (phone == "")
            return res.status(400).send({ status: false, message: "Please enter phone value" });
      
          if (!validation.validateMobileNo(phone))
            return res.status(400).send({ status: false, message: "please provide valid 10 digit Phone Number" });
      
          const userExist = await userModel.findOne({ $or: [{ email: email }, { phone: phone }] });
      
          if (userExist) {
            if (userExist.email == email)
              return res.status(400).send({ status: false, message: "email id  already exist, send another email" });
      
            if (userExist.phone == phone)
              return res.status(400).send({ status: false, message: "phone  already exist, send another phone number" });
          }
      
      
          const userCreated = await userModel.create(userData);
          console.log(userCreated);
          res.redirect("/logindata");
        } catch (error) {
          console.log(error.message);
          return res.status(500).send({ status: false, message: error.message });
        }
  })
// Route for serving the login form
app.get('/logindata', (req, res) => {
  res.sendFile(__dirname + '/public/logindata.html');
});
app.post("/logindata",async(req,res)=>{
        try {
          console.log("someeeeee")
          let data = req.body;
          let { userName, password } = data;
      
          if (Object.keys(data).length == 0)
            return res.status(400).send({ status: false, message: "Please send data" });
      
          let expectedQueries = ["userName", "password"];
          let queries = Object.keys(data);
          let count = 0;
          for (let i = 0; i < queries.length; i++) {
            if (!expectedQueries.includes(queries[i])) count++;
          }
          if (count > 0)
            return res.status(400).send({ status: false, message: "queries can only have userName, password" });
      
          if (!userName)
            return res.status(400).send({ status: false, message: "Please enter userName" });
      
      
          if (userName != undefined && typeof userName != "string")
            return res.status(400).send({ status: false, message: "Please enter userName in string format" });
      
          userName = data.userName = userName.trim();
          if (userName == "")
            return res.status(400).send({ status: false, message: "Please enter userName value" });
      
      
          if (!password)
            return res.status(400).send({ status: false, message: "Please enter password" });
      
          if (password != undefined && typeof password != "string")
            return res.status(400).send({ status: false, message: "Please enter password in string format" });
      
          password = data.password = password.trim();
      
          if (password == "")
            return res.status(400).send({ status: false, message: "Please enter password" });
      
      
      
          let isUserExist = await userModel.findOne({ userName: userName });
          console.log(isUserExist)
          if(isUserExist.votedCandidate) return res.status(400).send({status:false, message:"you have voted Already"}); 
          if (!isUserExist)
            return res.status(404).send({ status: false, message: "No user found with given userName", });
          console.log(isUserExist)
          let passwordCompare = await bcrypt.compare(password, isUserExist.password);

          if (!passwordCompare) return res.status(400).send({ status: false, message: "Please enter valid password" })
      
          let token = jwt.sign(
            { userId: isUserExist._id, exp: Math.floor(Date.now() / 1000) + 86400 },
            "anmol"
          );
      
          let tokenInfo = { userId: isUserExist._id, token: token };
      console.log(tokenInfo)
          res.setHeader('x-api-key', token)
      
      
          res.redirect("/vote");
        }
        catch (err) {
            return res.status(500).send({ status: false, error: err.message });
          }

})

//admin 
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/public/admin.html');
  });
  app.post("/admin",async(req,res)=>{
          try {
            let data = req.body;
            let { userName, password } = data;
        
            if (Object.keys(data).length == 0)
              return res.status(400).send({ status: false, message: "Please send data" });
        
            let expectedQueries = ["userName", "password"];
            let queries = Object.keys(data);
            let count = 0;
            for (let i = 0; i < queries.length; i++) {
              if (!expectedQueries.includes(queries[i])) count++;
            }
            if (count > 0)
              return res.status(400).send({ status: false, message: "queries can only have userName, password" });
        
            if (!userName)
              return res.status(400).send({ status: false, message: "Please enter userName" });
        
        
            if (userName != undefined && typeof userName != "string")
              return res.status(400).send({ status: false, message: "Please enter userName in string format" });
        
            userName = data.userName = userName.trim();
            if (userName == "")
              return res.status(400).send({ status: false, message: "Please enter userName value" });
        
        
            if (!password)
              return res.status(400).send({ status: false, message: "Please enter password" });
        
            if (password != undefined && typeof password != "string")
              return res.status(400).send({ status: false, message: "Please enter password in string format" });
        
            password = data.password = password.trim();
        
            if (password == "")
              return res.status(400).send({ status: false, message: "Please enter password" });
              if( userName !== "Admin")
              return res.status(400).send({ status: false, message: "Incorrect userName! you are not authorised!" });
          
                if( password !== "Admin@123")
                return res.status(400).send({ status: false, message: "Please enter correct password!  you are not authorised!" });
                req.session.isAdmin = true;

            res.redirect("/voteCount");
          }
          catch (err) {
              return res.status(500).send({ status: false, error: err.message });
            }
  
  })
app.get('/vote', (req, res) => {
  res.sendFile(__dirname + '/public/vote.html');
});
app.post("/vote",async(req,res)=>{
  console.log(req.body);
  let data= req.body;
  let {email,candidate}=data;
  let found = await userModel.find({votedCandidate:candidate});
  let count = found.length;
  let foundData = await userModel.findOneAndUpdate({email:email},{$set:{votedCandidate:candidate, count:count}},{new:true});
  
  res.send(foundData)
})

app.get('/voteCount', (req,res)=>{
  res.sendFile(__dirname + '/public/voteCount.html')
})
app.post("/voteCount",async(req,res)=>{
  console.log(req.body)
  if(req.session.isAdmin){
  let data= req.body;
  let{candidate} = data;
  let foundData = await userModel.find({votedCandidate:candidate});
    console.log(foundData)
  const length = foundData.length;
console.log(length)
  res.send({"length":length})
}else{
    return  res.status(403).send("You are not authorized to access this page!")
}
})

app.get('/logout', (req, res) => {
    // Destroy the user's session to log them out
    req.session.destroy(err => {
        if (err) {
            console.error(err);
        }
        res.redirect('/logindata');
    });
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
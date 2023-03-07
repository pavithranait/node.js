var express = require("express");
const path = require('path');
var app = express();
var bodyParser = require("body-parser");
var mysql = require("mysql");
app.use(express.json());
app.use(express.urlencoded());
const bcrypt = require("bcryptjs");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const http = require("http");
const fs = require("fs");
const url = require("url");
app.use(express.static(__dirname + '/public'));
app.use('.', express.static('uploads'));
const multer = require('multer');
const { signupValidation, loginValidation } = require("./validation");
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// default route
app.get("/", function (req, res) {
  return res.send({ error: true, message: "hello" });
});

// connection configurations
var dbConn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mydb3",
});
// connect to database
dbConn.connect();
// Retrieve all users
app.get("/users", function (req, res) {
  const token = req.headers.authorization
  console.log(token)

  if (!token) {
    return res.status(403).send("A token is required for deletion");
  }else{
    dbConn.query("SELECT * FROM users1", function (error, results, fields) {
      if (error) throw error;
      return res.send({ data: results });
    });
  }
  
});
// Retrieve user with id
app.get("/user/:id", auth, function (req, res) {
  let user_id = req.params.id;
  const token = req.headers.authorization

  if (!token) {
    return res.status(403).send("A token is required for deletion");
  }
  if (!user_id) {
    return res
      .status(400)
      .send({ error: true, message: "Please provide user_id" });
  }
  dbConn.query(
    "SELECT * FROM users1 where id=?",
    user_id,
    function (error, results, fields) {
      if (error) throw error;
      return res.send({ data: results[0] });
    }
  );
});
// Add a new user
app.post("/user", function (req, res) {
  let user = req.body.data[0];
  console.log(user);
  const token = req.headers.authorization

  if (!token) {
    return res.status(403).send("A token is required for deletion");
  }
  if (!user) {
    return res
      .status(400)
      .send({ error: true, message: "Please provide user" });
  }
  dbConn.query(
    "INSERT INTO users1 SET ? ",
    { name: user },
    function (error, results, fields) {
      if (error) throw error;
      // console.log(results);
      return res.send({
        error: false,
        data: results,
        message: "New user has been created successfully.",
      });
    }
  );
});

//  Update user with id
app.put("/user/:id", function (req, res) {
  let user_id = req.params.id;
  let user = req.body.data[0];
  //   console.log(user)
  const token = req.headers.authorization

  if (!token) {
    return res.status(403).send("A token is required for deletion");
  }
  if (!user_id || !user) {
    return res
      .status(400)
      .send({ error: user, message: "Please provide user and user_id" });
  }
  dbConn.query(
    "UPDATE users1 SET name = ? WHERE id = ?",
    [user, user_id],
    function (error, results, fields) {
      // console.log(error)
      if (error) throw error;
      return res.send({
        data: results,
        message: "user has been updated successfully.",
      });
    }
  );
});
//  Delete user
app.delete("/user", function (req, res) {
  let user_id = req.body.user_id;
  const token = req.headers.authorization

  if (!token) {
    return res.status(403).send("A token is required for deletion");
  }
  if (!user_id) {
    return res
      .status(400)
      .send({ error: true, message: "Please provide user_id" });
  }
  dbConn.query(
    "DELETE FROM users WHERE id = ?",
    [user_id],
    function (error, results, fields) {
      if (error) throw error;
      return res.send({
        error: false,
        data: results,
        message: "User has been updated successfully.",
      });
    }
  );
});
app.post("/register", signupValidation, (req, res, next) => {
  dbConn.query(
    `SELECT * FROM users1 WHERE LOWER(email) = LOWER(${dbConn.escape(
      req.body.email
    )});`,
    (err, result) => {
      if (result.length) {
        return res.status(409).send({
          msg: "This user is already in use!",
        });
      } else {
        // username is available
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({
              msg: err,
            });
          } else {
            // has hashed pw => add to database
            dbConn.query(
              `INSERT INTO users1 (name, email, password) VALUES ('${
                req.body.name
              }', ${dbConn.escape(req.body.email)}, ${dbConn.escape(
                req.body.password
              )})`,
              (err, result) => {
                if (err) {
                  throw err;
                  return res.status(400).send({
                    msg: err,
                  });
                }
                return res.status(201).send({
                  msg: "The user has been registerd with us!",
                });
              }
            );
          }
        });
      }
    }
  );
});
//JWT
app.post("/login", loginValidation, (req, res, next) => {
  console.log(req)
  
  dbConn.query(
    `SELECT * FROM users1 WHERE email = ${dbConn.escape(req.body.email)};`,
    (err, result) => {
      console.log(result);
      // user does not exists
      if (err) {
        throw err;
        return res.status(400).send({
          msg: err,
        });
      }
      // if (!result) {
      //   return res.status(401).send({
      //     msg: "Email or password is incorrect!",
      //   });
      // }
      // check password
      console.log(req.body.password, result[0]["password"])
          if (req.body.password === result[0]["password"]) {
            const token = jwt.sign(
              { id: result[0].id },
              "the-super-strong-secrect",
              { expiresIn: "1h" }
            );
            result[0].token = token;
            dbConn.query(
              `UPDATE users1 SET token_S = now() WHERE id = '${result[0].id}'`
            );
            return res.status(200).send({
              msg: "Logged in!",
              token,
              user: result[0],
            });
          }
          return res.status(401).send({
            msg: "Username or password is incorrect!",
          });`
          `
        }
      );
    }
  );
app.post("/get-user", signupValidation, (req, res, next) => {
  // const token = req.headers.authorization

  // if (!token) {
  //   return res.status(403).send("A token is required for deletion");
  // }
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer") ||
    !req.headers.authorization.split(" ")[1]
  ) {
    return res.status(422).json({
      message: "Please provide the token",
    });
  }
  const theToken = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(theToken, "the-super-strong-secrect");
  dbConn.query(
    "SELECT * FROM users1 where id=?",
    decoded.id,
    function (error, results, fields) {
      if (error) throw error;
      return res.send({ data: results[0], message: "Fetch Successfully." });
    }
  );
});
app.put("/get-users", signupValidation, (req, res, next) => {

const user_id = req.params.id
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer") ||
    !req.headers.authorization.split(" ")[1]
  ) {
    return res.status(422).json({
      message: "Please provide the token",
    });
  }
  const theToken = req.headers.authorization.split(" ")[1];
  // console.log(theToken)
  const decoded = jwt.verify(theToken, "the-super-strong-secrect");
 console.log("data", req.body.name)
  if(req.headers.authorization){
    dbConn.query(
      "UPDATE users1 SET email = ? WHERE id = ?",
      [req.body.email, decoded.id],
      function (error, results, fields) {
        // console.log(decoded.name)
        if (error) throw error;
        return res.send({ data: results, message: "Users updated Successfully." });
      }
    );
  }
});
app.get("/get-users", signupValidation, (req, res, next) => {
  // const token = req.headers.authorization

  // if (!token) {
  //   return res.status(403).send("A token is required for retrie");
  // }
  // // console.log(req.body)

  // if (
  //   !req.headers.authorization ||
  //   !req.headers.authorization.startsWith("Bearer") ||
  //   !req.headers.authorization.split(" ")[1]
  // ) {
  //   return res.status(422).json({
  //     message: "Please provide the token",
  //   });
  // }
  // const theToken = req.headers.authorization.split(" ")[1];
  // const decoded = jwt.verify(theToken, "the-super-strong-secrect");
  // console.log(decoded)
  // if(theToken){
    // console.log(theToken)
    dbConn.query(
      "SELECT * FROM users1",
      function (error, results, fields) {
        // console.log(decoded.name)
        if (error) throw error;
        return res.send({ data: results, message: "Users Fetch Successfully." });
      }
    );
  // }
});
app.get("/get-users/:id", signupValidation, (req, res, next) => {
  const token = req.headers.authorization
  const user_id = req.params.id
  console.log(user_id)

  if (!token) {
    return res.status(403).send("A token is required for retrie");
  }
  // console.log(req.body)

  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer") ||
    !req.headers.authorization.split(" ")[1]
  ) {
    return res.status(422).json({
      message: "Please provide the token",
    });
  }
  const theToken = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(theToken, "the-super-strong-secrect");
  console.log(decoded)
  if(theToken){
    console.log(theToken)
    dbConn.query(
      "SELECT * FROM users1 WHERE id=?",
      user_id,
      function (error, results, fields) {
        // console.log(decoded.name)
        if (error) throw error;
        return res.send({ data: results, message: "Users Fetch Successfully." });
      }
    );
  }
});

   
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
   
    filename: function(req, file, cb) {
      // console.log(req.headers)
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
   
var upload = multer({ storage: storage })
   
app.get('/file', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/profile-upload-single', upload.any('profile-file'), function (req, res, next) {
  console.log(req)
  // req.file is the `profile-file` file
  // req.body will hold the text fields, if there were any
  console.log(JSON.stringify(req.files))
  var response = '<a href="/">Home</a><br>'
  response += "Files uploaded successfully.<br>"
  response += `<img src="${req.files[0].path}" /><br>`
  var imgsrc = req.files[0].path
  var insertData = "INSERT INTO users1(images1)VALUES(?)"
  dbConn.query(insertData, [imgsrc],  (err, result) => {
      if (err) throw err;
      console.log("file uploaded")
      res.send({ message: "image added Successfully into database." });
  })
  return res.send(response)
})
   
app.post('/fileupload', upload.any('image'), (req, res) => {
  res.send({ message: "image added Successfully." });
  console.log(req.files[0].filename)
  console.log(req.files[0].path)
    var imgsrc = 'uploads/' + req.files[0].filename
    var insertData = "INSERT INTO users1(images1)VALUES(?)"
    dbConn.query(insertData, [imgsrc],  (err, result) => {
        if (err) throw err;
        console.log("file uploaded")
        res.send({ message: "image added Successfully into database." });
    })
});
// const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//       cb(null, './C:/xampp/htdocs/Test/CRUD/uploads');
//   },
 
//   filename: function(req, file, cb) {
//     // console.log(req.headers)
//       cb(null, + '-' + Date.now() + (file.originalname));
//   }
// });
 
// var upload = multer({ storage: storage })
 
// app.get('/file', (req, res, next) => {
// res.sendFile(__dirname + '/index.html');
// });
 
// app.post('/fileupload', upload.any('image'), (req, res) => {
// res.send({ message: "image added Successfully." });
// console.log(req.files)
// res.redirect('/file');
// });
// app.post("/post", upload.single('image'), (req, res) => {
// console.log(req.file)
// if (!req.file) {
//   console.log(req.file)
//     console.log("No file upload");
// } else {

//     console.log(req.file.filename)
//     var imgsrc = 'http://127.0.0.1:3000/uploads/' + req.file.filename
//     var insertData = "UPDATE users1 SET images1 = ? "
//     dbConn.query(insertData, [imgsrc],  (err, result) => {
//         if (err) throw err;
//         console.log("file uploaded")
//         res.send({ path: req.file.path, message: "image added Successfully into database." });
//     })
// }
// });
// app.get('/', (req, res) => res.render('upload'))
// app.post('/uploads', function(req, res) {
// dbConn.query(`SELECT images1 FROM users1(images)VALUES(?)`, [req.filename], (err, result) => {
//   if (err) throw err;
//   console.log(result)
//   res.send({ image: result, message: "image added Successfully into database." });
// })
// })
// app.get('/image', (req, res, next) => {
// console.log(req)
// dbConn.query(`SELECT * FROM users1(images)VALUES(?)`, [req.filename], (err, result) => {
//   if (err) throw err;
//   console.log(result)
//   res.send({ image: result, message: "image added Successfully into database." });
// })
// });


app.delete("/get-users/:id", signupValidation, (req, res, next) => {


  const user_id = req.params.id

  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer") ||
    !req.headers.authorization.split(" ")[1]
  ) {
    return res.status(422).json({
      message: "Please provide the token",
    });
  }
  const theToken = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(theToken, "the-super-strong-secrect");
  console.log(decoded)
  if(theToken){
    console.log(theToken)
    dbConn.query(
      "DELETE FROM users1 WHERE id = ?",
      [user_id],
      function (error, results, fields) {
        if (error) throw error;
        return res.send({
          error: false,
          data: results,
          message: "User has been deleted successfully.",
        });
      }
    );
  }
});
//auth
app.post("/api", auth, (req, res) => {
  console.log(req.body);
  return res.status(200).send({
    msg: "connected",
    user: req.body,
  });
});

app.post('/img',(req, res) => {
  console.log(req)
  // Parsing the URL
  var request = url.parse(req.url, true);
  
  // Extracting the path of file
  var action = request.pathname;

  // Path Refinements
  var filePath = path.join(__dirname,
          action).split("%20").join(" ");

  // Checking if the path exists
  fs.exists(filePath, function (exists) {
    console.log(filePath)

      if (!exists) {
          res.writeHead(404, {
              "Content-Type": "text/plain" });
          res.end("404 Not Found");
          return;
      }

      // Extracting file extension
      var ext = path.extname(action);

      // Setting default Content-Type
      var contentType = "text/plain";

      // Checking if the extension of
      // image is '.png'
      if (ext === ".jpg") {
          contentType = "image/jpg";
      }

      // Setting the headers
      res.writeHead(200, {
          "Content-Type": contentType });

      // Reading the file
      fs.readFile(filePath,
          function (err, content) {
              // Serving the image
              res.end(content);
          });
  });
})


// set port
app.listen(3000, function () {
  console.log("Node app is running on port 3000");
});
module.exports = app;

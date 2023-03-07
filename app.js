
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mysql = require('mysql');
const app = express();

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "mydb3",
  });

 connection.connect(function (error) {
    if (!!error) {
      console.log(error);
    } else {
      console.log("Connected!:)");
    }
  });

  //set videw engine
  app.set('views', path.join(__dirname, 'views'));

  //set view engine
  app.set('view engine', 'ejs');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
    // res.send( "Crud Operation"
    // )
    let sql = "SELECT * FROM users";
    let query = connection.query(sql, (err, rows) => {
        if(err) throw err;
        console.log(rows);
        res.send("post fecthed"
        );

    })
})
app.post('/', (req, res) => {
    // res.send( "Crud Operation"
    // )
    let sql = "SELECT * FROM users";
    let query = connection.query(sql, (err, rows) => {
        if(err) throw err;
        console.log(rows);
        res.send("post fecthed"
        );

    })
})
app.post('/img',(req, res) => {
 
  // Parsing the URL
  var request = url.parse(req.url, true);

  // Extracting the path of file
  var action = request.pathname;

  // Path Refinements
  var filePath = path.join(__dirname,
          action).split("%20").join(" ");

  // Checking if the path exists
  fs.exists(filePath, function (exists) {

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

//server listening
app.listen(3000, () => {
    console.log("Server is running at port 3000")
})
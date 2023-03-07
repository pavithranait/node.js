const jwt = require('jsonwebtoken');
var mysql = require("mysql");
var dbConn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "mydb3",
  });
  // connect to database
  dbConn.connect();
  const register = (req, res) => {

    console.log(req.headers)
    const {name, email, password} = req.body
      console.log(token)
  
    if (!name|| !email || !password) {
      return res.status(203).send("A field is required for authentication");
    }

    const check = "SELECT * FROM users1 WHERE email=?";
    dbConn.query(
        "SELECT * FROM users1 where email=?",
        [email],
        function (error, results) {
          if (error) throw error;
          if(results.length !==0){

              return res.status(400).send("user already found");
          }else{
            const salt = bcrypt.genSaltSync(10);
            let hpass = bcrypt.genSaltSync(password, salt);
            dbConn.query(
                "INSERT into users1(NAME, EMAIL, PASSWORD) values(?,?,?)"
                [name, email, hpass],
                function (err, results) {
                    const token = jwt.sign({id:results[0].id},'the-super-strong-secrect',{ expiresIn: '1h' }); {
                        if(err) {
                          throw err;
                        }else{
                          return res.status(201).send(data);
                  
                        }
                        console.log(token)
                    }

                })

          }
        }
      );
    
  };
  
  module.exports = register;
const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const fs = require("fs");
const rsa = require("node-rsa");
const { StringDecoder } = require("string_decoder");
const { stringify } = require("querystring");

const app = express();

var publickey = new rsa();
var privateKey = new rsa();

var public = fs.readFileSync("public.pem", "utf8");
var private = fs.readFileSync("private.pem", "utf8");

publickey.importKey(public);
privateKey.importKey(private);


app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res){res.sendFile(__dirname + "/index.html");})

app.get("/:any", function(req, res){res.send("Error 404 Page Not Found!");})


app.post("/", function(req, res){
    const rollno = req.body.rollno;
    const url = "https://safe-inlet-89748.herokuapp.com/students/" +rollno;

    https.get(url, function(response){

        response.on("data", function(data){

            if (rollno>=1 && rollno<=50) {
                const studentData = String(data)
                const decryptedData = JSON.parse(publickey.decryptPublic(studentData))
                res.write("Roll No. : " + decryptedData.rollNo);
                res.write("\nStudent Name: " + decryptedData.name);
            } else {
                res.write("No student found with this Roll No.");
            }
            res.send();
        })
    })
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 2000;
}

app.listen(port, function(){
  console.log("Server has started on http://localhost:2000/");
});
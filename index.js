const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const fs = require("fs");
const rsa = require("node-rsa");

const app = express();

var publickey = new rsa();
var privateKey = new rsa();

var public = fs.readFileSync("public.pem", "utf8");
var private = fs.readFileSync("private.pem", "utf8");

publickey.importKey(public);
privateKey.importKey(private);


app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res){res.sendFile(__dirname + "/index.html");})

app.post("/", function(req, res){
    const rollno = req.body.rollno;
    const url = "https://safe-inlet-89748.herokuapp.com/students/" +rollno;
    const RegUrl = "https://guarded-inlet-86199.herokuapp.com/registrations/" +rollno;

    if (rollno>=1 && rollno<=50){
        https.get(url, function(response){
            response.on("data", function(data){
                const studentData = String(data)
                const decryptedData = JSON.parse(publickey.decryptPublic(studentData))
                res.write("Roll No. : " + decryptedData.rollNo);
                res.write("\nStudent Name: " + decryptedData.name);
                https.get(RegUrl, function(response){
                    response.on("data", function(data){
                        const regData = JSON.parse(data)
                        res.write("\nRegistration No. : " + regData.regNo);
                        res.send();
                    })
                })
            })
        })
    } else {
        res.write("No student found with this Roll No.");
        res.send();
    }
})
 
app.get("/:any", function(request, response){
    if(response){
        response.send('<div id="main"><div class="fof"><center><h1>Error 404\nPage Not Found</h1></center></div></div>');
    }
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 2000;
}

app.listen(port, function(){
  console.log("Server has started on http://localhost:2000/");
});
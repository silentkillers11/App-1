//importing required libraries
const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const fs = require("fs");
const rsa = require("node-rsa");
const crypto = require("crypto");

const app = express();

var publickey = new rsa();
var privateKey = new rsa();

var public = fs.readFileSync("public.pem", "utf8");
var private = fs.readFileSync("private.pem", "utf8");

publickey.importKey(public);
privateKey.importKey(private);

//Function to decrypt data
function decryptString (ciphertext, privateKeyFile) {
	const privateKey = fs.readFileSync(privateKeyFile, "utf8");
	// privateDecrypt() method with its parameters
	const decrypted = crypto.privateDecrypt({key: privateKey,passphrase: ''},Buffer.from(ciphertext, "base64"));
	return decrypted.toString("utf8");
}

app.use(bodyParser.urlencoded({extended: true}));

//GET method for index url
app.get("/", function(req, res){res.sendFile(__dirname + "/index.html");})

//POST Method for fetching data from App-2 and App-3 through API call
app.post("/", function(req, res){
    const rollno = req.body.rollno;
    const url = "https://safe-inlet-89748.herokuapp.com/students/" +rollno;     //App-2 API call
    const RegUrl = "https://guarded-inlet-86199.herokuapp.com/registrations/" +rollno;      //App-3 API call

    if (rollno>=1 && rollno<=50){
        https.get(url, function(response){
            response.on("data", function(data){
                const studentData = String(data)
                const decryptedData = JSON.parse(publickey.decryptPublic(studentData))
                res.write("Roll No. : " + decryptedData.rollNo);
                res.write("\nStudent Name: " + decryptedData.name);
                https.get(RegUrl, function(response){
                    response.on("data", function(data){
                        const regData = String(data)
                        res.write("\nRegistration No. : " + JSON.parse(decryptString(regData, "private_key")));
                        res.end();
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
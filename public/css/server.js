const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const data = require("./modules/officeData.js");

const app = express();

const HTTP_PORT = process.env.PORT || 8080;
app.use(express.static("public"));


app.engine(".hbs", exphbs.engine({ extname: ".hbs", defaultLayout: 'main'}));
app.set("view engine", ".hbs");

app.get("/", (req, res)=>{
    res.sendFile(path.join(__dirname, "/views/home.html"));
});

app.get("/PartTimer", (req,res) => {
    data.getPartTimers().then((data)=>{
        res.json(data);
    });
});

app.get("/employees", (req, res)=>{
    data.getAllEmployees().then((data)=>{
        res.render("employees", {employees: data});
    }).catch((err)=>{
        res.render("employees", {message: "no results"});
    });
});

app.get("/employees/add", (req, res)=>{
    res.sendFile(path.join(__dirname, "/views/addEmployee.html"));
});

app.post("/employees/add", (req,res)=>{
    data.addEmployee(req.body).then(()=>{
        res.redirect("/employees");
    });
});
app.get("/description", (req, res)=>{
        res.render("description");
    });


app.use((req,res)=>{
    res.status(404).send("Page Not Found");
});

app.use(express.urlencoded({extended:true}));
data.initialize().then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});


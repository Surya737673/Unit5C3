const express = require("express");
const { v4: uuid } = require('uuid');
const fs = require("fs");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use((req, res, next) => {
    const myData = req.myData;
    if (req.url === "/user/login" && (myData.username === undefined || myData.password === undefined)) {
        res.status(400).send({ status: "please provide username and password" })
    }
    next();
})


app.post("/user/create", (req, res) => {
    const myData = req.myData;
    myData.id = uuid();
    console.log(myData);
    fs.readFile("./db.json", { encoding: "utf8" }, (error, data) => {
        const parse = JSON.parse(data);
        parse.users = [...parse.users, myData];

        fs.writeFile("./db.json", JSON.stringify(parse), (err, data) => {
            res.status(201).send({status: "user created",id:myData.id})
        })
    })
    
})

app.post("/user/login", (req, res) => {
    const myData = req.myData;
    fs.readFile("./db.json", { encoding: "utf8" }, (error, data) => {
        const parse = JSON.parse(data);
        const token = uuid();
        let flag = false;
        parse.users = parse.users.map(user => {
            if (user.username === myData.username && user.password === myData.password) {
                flag = true;
                return {...user,token:token};
            } else {
                return user;
            }
        })

        if (flag) {
            fs.writeFile("./db.json", JSON.stringify(parse), (err, data) => {
                res.send({ status: "Login Successful", token:token })
            })
        } else {
            res.status(401).send({ status: "Invalid Credentials" })
        }
    })
})

app.post("/user/logout", (req, res) => {
    const apikey = req.query.apikey;
    console.log(apikey)
    fs.readFile("./db.json", { encoding: "utf8" }, (error, data) => {
        const parse = JSON.parse(data);
        parse.users = parse.users.map(user => {
            if (user.token === apikey) {
                 delete user.token;                          
                return user;
            } else {
                return user;
            }
        })       
            fs.writeFile("./db.json", JSON.stringify(parse), (err, data) => {
                res.send({ status: "user logged out successfully" })
            })
    })
})

app.get("/votes/party/:party", (req, res) => {

    const { party } = req.params;
    fs.readFile("./db.json", { encoding: "utf8" }, (error, data) => {
        const parsed = JSON.parse(data);
        let namesArr = parsed.users.filter(user => {
            return user.party === party;
        })
        res.send(namesArr);
    })
})
app.get("/votes/voters", (req, res) => {
    fs.readFile("./db.json", { encoding: "utf8" }, (error, data) => {
        const parsed = JSON.parse(data);
        let namesArr = parsed.users.filter(user => {
            return user.role === "voter";
        })
        res.send(namesArr)
    })
})

app.get("/db", (req, res) => {
    fs.readFile('./db.json', { encoding: 'utf8' }, (error, data) => {
        res.send(JSON.parse(data))
    })
})

app.post("/db", (req, res) => {
    const myData = req.myData;
    fs.readFile("./db.json", { encoding: 'utf8' }, (error, data) => {
        const parsed = JSON.parse(data);
        parsed.users = [req.myData.users];
        fs.writeFile("./db.json", JSON.stringify(parsed), (err, data) => {
            res.send("Db.json file is Overwritten ")
        })
    })
})




app.listen(process.env.PORT || 8080, () => {
    console.log( "Server started " );
})
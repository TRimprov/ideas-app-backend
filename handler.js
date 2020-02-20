const express = require("express");
const cors = require("cors");
const serverlessHttp = require("serverless-http");
const bodyParser = require("body-parser");
const mysql = require("mysql");

const app = express();



app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "improv"
});

// GET /tasks

function getRandom(data, response) {

    let randomPostion = Math.floor(Math.random() * data.length);
    return data[randomPostion];
    // response.status(200).json(
    //     {
    //         suggestion: randomSuggestion
    //     });

}

app.get("/suggestion", function (request, response) {

    connection.query("SELECT * FROM Suggestions", function (err, data) {

        if (err) {
            response.status(500).json({
                error: err
            })
        }
        else {

            let randomSuggestion = getRandom(data, response);
            response.status(200).json(
                {
                    suggestion: randomSuggestion
                });

        };
    });

});

app.get("/suggestion/:id", function (request, response) {


   // let answer = {};
    let id = request.params.id;
    let secondId = 0;
    let book = false;
    if (id == 4 || id == 5) {
        book = true;
        id = 3;
        secondId = 7;
    }

    connection.query("Select * from Suggestions where typeId = ?", [id], function (err, data) {
        if (err) {
            response.status(500).json({
                error: err
            })
        }
        else {

            let randomSuggestion = getRandom(data, response);

            if (book) {
                connection.query("Select * from Suggestions where typeId = ?", [secondId], function (err, data) {
                    if (err) {
                        response.status(500).json({
                            error: err
                        })
                    }
                    else {

                                let nextBit = getRandom(data, response);

                              //  console.log(nextBit);

                                let answer = 'The '.concat(nextBit.suggestion, ' ', randomSuggestion.suggestion  );
                           //     console.log(answer);

                                randomSuggestion = { id: null, suggestion: answer, typeId: id, favourite: null}
                       console.log("to start with in here its ", randomSuggestion);
                       response.status(200).json(
                        {
                            suggestion: randomSuggestion
                        });
                       
                                // closing inside else
                    }
               //closing inside conn quiery     }
                })
            
            

            // closing if book
            }
            else{

            // if a normal one.

            console.log("but ehre it's back to" , randomSuggestion);

            response.status(200).json(
                {
                    suggestion: randomSuggestion
                });

            }

        //closing outside else
        }

    //closing first connection query 
    });

    //closing app.get
});


app.get("/types", function (request, response) {

    connection.query("SELECT * FROM Types where display = true", function (err, data) {

        if (err) {
            response.status(500).json({
                error: err
            })
        }
        else {
            response.status(200).json(
                {
                    types: data
                });
        };
    });
});


// POST 

app.post("/suggestion", function (request, response) {

    const newSuggestion = request.body;
    connection.query("INSERT INTO Suggestions SET ?", [newSuggestion], function (err, data) {

        if (err) {
            response.status(500).json({
                error:
                    err
            })
        }
        else {
            newSuggestion.id = data.insertId;
            response.status(201).json(newSuggestion);
        }
    });

});

// PUT 
app.put("/suggestion/:id", function (request, response) {

    const id = request.params.id;

    connection.query("UPDATE Suggestions set favourite = true WHERE id=?", [id], function (err, data) {

        if (err) {
            response.status(500).json({
                error: err
            })
        }
        else {
            response.status(200).json({
                suggestion: data
            });
        }
    });

});

// DELETE

app.delete("/suggestion/:id", function (request, response) {

    const id = request.params.id;

    connection.query("Delete FROM Suggestions WHERE id = ?", [id], function (err) {
        if (err) {
            response.status(500).json({
                error: err
            })
        }
        else {
            response.sendStatus(200);
        };
    });
});

module.exports.app = serverlessHttp(app);

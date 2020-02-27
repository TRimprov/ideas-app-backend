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

function getRandom(data, response) {

    let randomPostion = Math.floor(Math.random() * data.length);
    return data[randomPostion];
}

app.get("/suggestion", function (request, response) {

    console.log("def in the new branch");

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

function completeBookTitle(secondId, randomSuggestion, response){

    connection.query("Select * from Suggestions where typeId = ?", [secondId], function (err, data) {
        if (err) {
            response.status(500).json({
                error: err
            })
        }
        else {

            console.log("got book data next bit ")

           // let nextBit = getRandom(data, response);
            let nextBit = getRandom(data);

            console.log(nextBit)


            let answer = 'The '.concat(nextBit.suggestion, ' ', randomSuggestion.suggestion);

          //  randomSuggestion = { id: null, suggestion: answer, typeId: id, favourite: null }
        randomSuggestion = { id: null, suggestion: answer, typeId: 4, favourite: null }

            console.log("to start with in here its ", randomSuggestion);

            response.status(200).json(
                {
                    suggestion: randomSuggestion
                });

        }

    })


}

function  getThird(thirdId, randomSuggestion, noun, response){

    console.log("got into get third")
    connection.query("Select * from Suggestions where typeId = ?", [thirdId], function (err, data) {
        if (err) {
            response.status(500).json({
                error: err
            })
        }
        else {

            let verbObject = getRandom(data, response);
            let verb = verbObject.suggestion;
            let randomSuggestionAdjective = randomSuggestion.suggestion;

            let answer = 'You\'re so '.concat(randomSuggestionAdjective, ' you make ', noun, ' ', verb);

            response.status(200).json(
                {
                    suggestion: { id: null, suggestion: answer, typeId: 6, favourite: null }
                });
        }

    })
}

function completeInsult(secondId, thirdId, randomSuggestion, response){

    console.log("got into complete insult")
    connection.query("Select * from Suggestions where typeId = ?", [secondId], function (err, data) {
        if (err) {
            response.status(500).json({
                error: err
            })
        }
        else {

            let nounObject = getRandom(data, response);
            let noun = nounObject.suggestion;

            getThird(thirdId, randomSuggestion, noun, response);

        }

    })
}

app.get("/suggestion/:id", function (request, response) {

    console.log("def in the new branch");

    let id = request.params.id;
    let secondId = 0;
    let thirdId = 0;
    const BOOK_TYPE = "Book Title";
    const PLAY_TYPE = "Play Title"
    const INSULT = "Insult";
    let bookId = 4;
    let playId = 5;
    let insultId = 6;
    let book = false;
    let insult = false;

    //get book id
    connection.query("Select typeId from Types where type = ?", [BOOK_TYPE], function (err, data) {

        if (err) {
            response.status(500).json({
                error: err
            })
        }
        else {
            bookId = data[0].typeId;
            console.log(bookId);
         
        };
    });

    if (id == 4 ||  id == 5) {
        book = true;
        id = 3;
        secondId = 7;
    }

    if (id == 6) {
        insult = true;
        id = 8;
        secondId = 9;
        thirdId = 10;
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

                console.log("in book");


                        completeBookTitle(secondId, randomSuggestion, response);
            }
            else if (insult) {

                console.log("its in insult")

                    completeInsult(secondId, thirdId, randomSuggestion, response);

            }
            else {

                response.status(200).json(
                    {
                        suggestion: randomSuggestion
                    });

            }
        }
    });

});


app.get("/types", function (request, response) {

    //  connection.query("SELECT * FROM Types where display = true", function (err, data) {
    connection.query("SELECT * FROM Types", function (err, data) {

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

app.get("/creatableTypes", function (request, response) {

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
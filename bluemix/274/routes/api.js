/**
 * Created by ruiyun_zhou on 5/4/15.
 */

var express = require('express');
var watson = require('watson-developer-cloud');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./nndss.db');
var question_and_answer_healthcare = watson.question_and_answer({
    username: '5ad1961d-0518-45e6-96ef-f93c22592cac',
    password: 'AzZphzw7uEiq',
    version: 'v1',
    dataset: 'healthcare'
});

router.get('/watson/:q*?', function (req, res) {
    var q = req.param('q') || 'What is watson?';
    var result = {question: q};
    question_and_answer_healthcare.ask({
        text: q
    }, function (err, response) {
        if (err) {
            result.error = err;
            console.log('error:', err);
        } else {
            result.answer = response[0].question.answers;
        }
        res.json(result);
    });
});

//http://codeforgeek.com/2014/07/node-sqlite-tutorial/
router.get('/db', function (req, res) {
    db.all("SELECT * from nndss limit 1000",function(err, rows){
        res.json(rows);
    });
});

module.exports = router;
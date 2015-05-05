/**
 * Created by ruiyun_zhou on 5/4/15.
 */

var express = require('express');
var watson = require('watson-developer-cloud');
var sqlite3 = require('sqlite3').verbose(); //http://codeforgeek.com/2014/07/node-sqlite-tutorial/

var router = express.Router();
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

router.get('/db', function (req, res) {
    db.all("SELECT * from nndss limit 1000",function(err, rows){
        if(err) console.log(err);
        else res.json(rows);
    });
});

router.get('/areas', function (req, res) {
    db.all("select distinct area, latitude, longitude from nndss where latitude != '' group by area order by area, latitude, longitude desc;",function(err, rows) {
        if(err) console.log(err);
        else res.json(rows);
    });
});

router.get('/diseases', function (req, res) {
    db.all("SELECT distinct disease from nndss order by disease",function(err, rows){
        if(err) console.log(err);
        else res.json(rows.map(function(row){
            return row.Disease;
        }));
    });
});

router.get('/count/:disease/:area*?', function (req, res) {
    var disease = req.param('disease') || '';
    var area = req.param('area') || '';
    db.all("select year, week, count from nndss where area = ? and disease = ? group by year, week order by year, week;",
        [area, disease],
        function(err, rows){
            if(err) console.log(err);
            else res.json({Area: area, Disease: disease, Data: rows});
        });
});

module.exports = router;
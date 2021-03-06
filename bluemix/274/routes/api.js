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

router.get('/groups', function (req, res) {
    db.all("SELECT name from disease_group order by name",function(err, rows){
        if(err) console.log(err);
        else res.json(rows);
    });
});

router.get('/count/area/:area*?', function (req, res) {
    var area = req.param('area') || '';
    db.all("select year, week, disease, count from nndss where area = ? group by year, week, disease order by year, week;",
        [area],
        function(err, rows){
            if(err) console.log(err);
            else {
                var map = [];
                rows.forEach(function (row) {

                });
                res.json({Area: area, Data: rows});
            }
        });
});

router.get('/count/disease/:disease*?', function (req, res) {
    var disease = req.param('disease') || '';
    db.all("select area, year, week, count from nndss where disease = ? group by area, year, week order by area, year, week;",
        [disease],
        function(err, rows){
            if(err) console.log(err);
            else res.json({Disease: disease, Data: rows});
        });
});

router.get('/sum/disease/:disease*?', function (req, res) {
    var disease = req.param('disease') || '';
    //db.all("select area, sum(count) as Sum from nndss where disease = ? group by area order by area;",
    db.all("select nndss.area Area, state.abbreviation State, nndss.Latitude, nndss.Longitude, sum(Count) Count from nndss inner join state on nndss.Area = state.name where nndss.disease = ? group by nndss.Area;",
        [disease],
        function(err, rows){
            if(err) console.log(err);
            else res.json({Disease: disease, Data: rows});
        });
});

router.get('/groups/:group*?', function (req, res) {
    var disease = req.param('group') || '';
    db.all("select distinct Disease from nndss where disease like ? order by Disease",
        [disease ? disease + '%' : disease],
        function(err, rows){
            if(err) console.log(err);
            else res.json({Group: disease, Data: rows.map(function(item){return item.Disease})});
        });
});

router.get('/group/:group/:area*?', function (req, res) {
    var disease = req.param('group') || '';
    var area = req.param('area') || '';
    db.all("select Disease, sum(Count) Count from nndss where area = ? and  disease like ? group by Disease",
        [area, disease ? disease + '%' : disease],
        function(err, rows){
            if(err) console.log(err);
            else res.json({Group: disease, Data: rows});
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
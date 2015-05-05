/**
 * Created by ruiyun_zhou on 5/1/15.
 */

//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');
var rest = require('restler');
var fs = require('fs');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;



var getData = function(url, callback) {
    rest.get(url).on('complete', function(result) {
        console.log(url);
        if (result instanceof Error || !(result instanceof Object)) {
            if(result) {
                console.log('Error:', result.message || result);
            }
            this.retry(3000);
        } else {
            callback(result);
        }
    });
};

var connect = function(callback) {

    // Connection URL. This is where your mongodb server is running.
    var url = 'mongodb://localhost:27017/healthdata';

    // Use connect method to connect to the Server
    MongoClient.connect(url, function (err, db) {
        if (err) {
            console.log('Unable to connect to the mongoDB server. Error:', err);
        } else {
            //HURRAY!! We are connected. :)
            console.log('Connection established to', url);
            callback(db);
        }
    });
};

var getCatalog = function() {
    getData('http://hub.healthdata.gov/api/search/dataset?fl=id,name&q=title:nndss-table&rows=100', function (result) {
        connect(function (db) {
            // Get the documents collection
            var collectionName = 'catalog';
            var collection = db.collection(collectionName);
            collection.insertMany(result.results, function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Inserted %d documents into the "%s" collection:', result.length, collectionName, result);
                }

                //Close connection
                db.close();
            });
        });
    });
};

var getDatasets = function() {
    connect(function (db) {
        // Get the documents collection
        var collectionName = 'catalog';
        var collection = db.collection(collectionName);

        collection.find().toArray(function(err, result){
            if(err) {
                console.log(err);
                return;
            }

            result.forEach(function(item) {
                getData('http://hub.healthdata.gov/api/2/rest/dataset/'+item.id, function (dataset) {
                    console.log(item);
                    var collectionName = 'dataset';
                    var collection = db.collection(collectionName);

                    if(dataset['id']) {
                        collection.insertOne(dataset, function (err, result) {
                            console.log(dataset.id);
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Result: ok');
                            }
                        });
                    }
                });
            });
        });
    });
};

var getDetails = function() {
    connect(function (db) {
        // Get the documents collection
        var collectionName = 'dataset';
        var collection = db.collection(collectionName);
        var urls = [];

        collection.find({resources: {$elemMatch: {mimetype: {$eq: 'application/json'}}}}, { id:1, name:1, title:1, notes:1, "resources.$": 1})
            .toArray(function(err, result){
            if(err) {
                console.log(err);
                return;
            }

            result.forEach(function(item) {
                var url = item.resources[0].url.trim();
                console.log(url);
                if(urls.indexOf(url) >=0 ) {
                    console.log('existed');
                } else {
                    console.log('new');
                    urls.push(url);

                    getData(url, function (detail) {

                        var collectionName = 'detail';
                        var collection = db.collection(collectionName);

                        if(detail instanceof Object) {
                            detail.id = item.id;
                            detail.name = detail.meta.view.name;
                            detail.columns = detail.meta.view.columns;
                            collection.insertOne(detail, function (err, result) {
                                //console.log(result);
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('Result: ok');
                                }
                            });
                        }
                    });
                }

            });
        });
    });
};


var showDetail = function() {
    connect(function (db) {
        // Get the documents collection
        var collectionName = 'detail';
        var collection = db.collection(collectionName);

        collection.find().toArray(function(err, result){

            var cols = [/Reporting\s?area/i, /MMWR.+/i, /.+?,\s?Current\s?week$/i, /Location 1/i ];

            result.forEach(function(nndss){
                var indices = [];
                console.log(nndss.name, nndss.meta.view.description.substring(0, 100));
                //console.log(nndss.columns.filter(function(item, index){
                //    var flag = cols.some(function(col){
                //        return item.name.match(col);
                //    });
                //    if(flag) {
                //        indices.push(index);
                //    }
                //    return flag;
                //}).map(function(item){
                //    return item.name;
                //}).join(' || '));

                nndss.data.forEach(function(row){
                    //console.log(indices);
                    var filteredRow = [];
                    indices.forEach(function(index){
                        var data = row[index];
                        data = data || 0;
                        if(data=='-') data = 0;
                        filteredRow.push(data);
                    });
                    //console.log(filteredRow.join('|| '));
                });
            });

            db.close();

        });

    });
};

var getWeekly = function() {
    connect(function (db) {
        // Get the documents collection
        var collectionName = 'detail';
        var collection = db.collection(collectionName);
        var weeklyDataPattern = /.+?,\s*Current\s*week$/i;

        collection.find({}, {columns:1, data:1, name: 1}).toArray(function(err, result){

            var cols = [/Reporting\s?area/i, /MMWR.+/i, weeklyDataPattern, /Location 1/i ];

            result.forEach(function(nndss) {
                var indices = [];
                //console.log(nndss.name);

                var columns = nndss.columns.filter(function(item, index){
                    var flag = cols.some(function(col){
                        return item.name.match(col);
                    });
                    if(flag) {
                        indices.push(index);
                    }
                    return flag;
                }).map(function(item){
                    return item.name;
                });

                var data = [];

                nndss.data.forEach(function(row){
                    //console.log(indices);
                    var filteredRow = [];
                    indices.forEach(function(index){
                        var data = row[index];
                        data = data || 0;
                        if(data=='-') data = 0;
                        filteredRow.push(data);
                    });
                    data.push(filteredRow);
                    //console.log(filteredRow.join('|| '));
                });

                if(columns.some(function(col){
                        return col.match(weeklyDataPattern);
                    }))
                {
                    for (var i = 0; i < columns.length; i++) {
                        columns[i] = columns[i].replace(/Reporting/, '');
                        columns[i] = columns[i].replace(/MMWR/, '');
                        columns[i] = columns[i].replace(/,\s*Current\s*week$/i, '');
                        columns[i] = columns[i].replace(/Location\s+\d+/, 'Location');
                        columns[i] = columns[i].trim();
                    }

                    console.log(nndss.name);

                    var weekly = {name: nndss.name, columns: columns, data: data};

                    var collectionName = 'weekly';
                    var collection = db.collection(collectionName);

                    //console.log(columns.length, data[0].length, columns.length == data[0].length ? 'match' : 'not match');
                    collection.insertOne(weekly, function (err, result) {
                        //console.log(result);
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Result: ok');
                        }
                    });
                }

            });

        });

    });
};

var showWeekly = function() {
    connect(function (db) {
        var collectionName = 'weekly';
        var collection = db.collection(collectionName);
        var weeklyDataPattern = /.+?,\s?Current\s?week$/i;

        collection.find().toArray(function(err, result){

            result.forEach(function(nndss){

                if(nndss.columns.some(function(col){
                        return col.match(weeklyDataPattern);
                })) {

                    console.log(nndss.columns.join(' || '));

                    nndss.data.forEach(function (row) {
                        //console.log(row.join('|| '));
                    });
                }
            });

            db.close();

        });

    });
};

var getFinal = function() {
    connect(function (db) {
        var collectionName = 'weekly';
        var collection = db.collection(collectionName);
        var dimentionPatterns = [/Area/i, /Year/i, /Week/i, /Location/i];

        collection.find().toArray(function(err, result){

            result.forEach(function(nndss){
                var dimensionIndices = [];
                var factIndices = [];
                var locationIndex = -1;
                var data = [];
                var columns = nndss.columns.filter(function(col){
                    var isDimension = dimentionPatterns.some(function(pattern){
                        return col.match(pattern);
                    });
                    return isDimension;
                });
                columns.push('Disease');
                columns.push('Count');
                columns.push('Latitude');
                columns.push('Longitude');

                console.log(columns.join(' || '));

                console.log(nndss.columns.filter(function(col, index){
                    var isDimension = dimentionPatterns.some(function(pattern){
                        return col.match(pattern);
                    });
                    if(!isDimension) {
                        factIndices.push(index);
                    } else {
                        dimensionIndices.push(index);
                    }

                    if(col.match(/Location/i)) {
                        locationIndex = index;
                    }

                    return !isDimension;
                }).join(' || '));

                console.log(factIndices.join(', '));

                nndss.data.forEach(function (row) {
                    var diseases = [];
                    var dimensions = [];
                    var location = row[locationIndex];

                    factIndices.forEach(function(index){
                        diseases.push({name: nndss.columns[index], count: row[index]});
                    });

                    dimensionIndices.forEach(function(index){
                        if(index !== locationIndex) {
                            dimensions.push(row[index]);
                        }
                    });

                    diseases.forEach(function(disease){
                        var d = dimensions.slice();
                        d.push(disease.name);
                        d.push(disease.count);
                        if(location) {
                            d.push(location[1]);
                            d.push(location[2]);
                        } else {
                            d.push(0);
                            d.push(0);
                        }
                        data.push(d);
                    });
                });

                var collectionName = 'final';
                var collection = db.collection(collectionName);

                collection.insertOne({
                        columns: columns.filter(function(col){
                            return !col.match(/Location/i);
                        }),
                        data: data},
                            function(err, result){
                            if(err) console.log(err);
                            console.log('ok');
                });

            });

        });
    });
};

var generateSql = function() {

    connect(function (db) {
        var collectionName = 'final';
        var collection = db.collection(collectionName);

        collection.find().toArray(function (err, result) {
            var wstream = fs.createWriteStream('data.sql');
            result.forEach(function (nndss) {
                var sql = 'insert into nndss(\'' + nndss.columns.join('\',\'') + '\') values(\'';
                nndss.data.forEach(function (row) {
                    console.log(sql + row.join('\',\'') + '\');');
                    wstream.write(sql + row.join('\',\'') + '\');' + '\n');
                });
            });
            wstream.end();
        });
    });
};

var generateCsv = function() {

    connect(function (db) {
        var collectionName = 'final';
        var collection = db.collection(collectionName);

        collection.find().toArray(function (err, result) {
            var wstream = fs.createWriteStream('data\\data.csv');
            var hasHeader = false;
            result.forEach(function (nndss) {
                if(!hasHeader) {
                    var header = '\"' + nndss.columns.join('\",\"') + '\"\n';
                    wstream.write(header);
                    hasHeader = true;
                }

                nndss.data.forEach(function (row) {
                    wstream.write(row.join(',') + '\n');
                });
            });
            wstream.end();
        });
    });
};

//getCatalog();
//getDatasets();
//getDetails();
//showDetail();
//getWeekly();
//showWeekly();
//getFinal();
//generateSql();
generateCsv();
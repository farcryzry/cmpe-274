/**
 * Created by ruiyun_zhou on 5/1/15.
 */

//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');
var rest = require('restler');

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

        collection.find({resources: {$elemMatch: {mimetype: {$eq: 'application/json'}}}}, { id:1, name:1, title:1, notes:1, "resources.$": 1})
            .toArray(function(err, result){
            if(err) {
                console.log(err);
                return;
            }

            result.forEach(function(item) {
                var url = item.resources[0].url;
                console.log(url);
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
            });
        });
    });
};


var showDetail = function() {
    connect(function (db) {
        // Get the documents collection
        var collectionName = 'detail';
        var collection = db.collection(collectionName);

        collection.find({}, {columns:1, data:1, name: 1}).toArray(function(err, result){

            result.forEach(function(nndss){
                console.log(nndss.name);
                console.log(nndss.columns.map(function(item){
                    return item.name;
                }).join(' || '));

                //nndss.data.forEach(function(row){
                //    console.log(row.join(', '));
                //});
            });

            db.close();

        });

    });
};

//getCatalog();
//getDatasets();
//getDetails();

showDetail();
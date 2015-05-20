var MongoClient = require('mongodb').MongoClient,
  format = require('util').format,
  assert = require('assert');

host = 'localhost';
port = 27017;
dbName = 'test';    // Name of the database to use. A single instance of mongoDB can have multiple databases
url = 'mongodb://' + host + ':' + port + '/' + dbName;

// ---- Some helper functions ---- //

// Insert some documents to the 'documents' collection
var insertDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Insert some documents
  collection.insert([
    {a : 1}, {a : 2}, {a : 3}
  ], function(err, result) {
    assert.equal(err, null);
    assert.equal(3, result.result.n);
    assert.equal(3, result.ops.length);
    console.log("Inserted 3 documents into the document collection");
    callback(result);
  });
};

// Update a document
var updateDocument = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Update document where a is 2, set b equal to 1
  collection.update({ a : 2 },
    { $set: { b : 1 } }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log("Updated the document with the field a equal to 2");
    callback(result);
  });
};

// Remove a document
var removeDocument = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Remove a document
  collection.remove({ a : 3 }, function(err, result) {  // find the first document with a=3 and remove it
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log("Removed the document with the field a equal to 3");
    callback(result);
  });
};

// Drop a collection
var dropDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Drop the collection
  collection.drop(function(err, reply) {
    if (err) throw err;
    console.log("Dropped the 'documents' collection.");
    callback(reply);
  });
};

// Find all documents matching a query
var findDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Find some documents
  collection.find({}).toArray(function(err, docs) {  // the query is {} which should match all documents
    assert.equal(err, null);
    assert.equal(2, docs.length);
    console.log("Found the following records");
    console.dir(docs);
    callback(docs);
  });
};




// ---- Run some sample code ---- //

sampleCodeToRun = [
  true,  // assert connection
  false,  // do an insert
  true,  // insert documents and update a document
];
var i = 0;  // test index

// Connection URL
if (sampleCodeToRun[i]) {
  // Use connect method to connect to the Server
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    db.close();
  });
}
i++;

if (sampleCodeToRun[i]) {
  MongoClient.connect(url, function(err, db) {
    if(err) throw err;

    var collection = db.collection('test_insert');

    collection.insert({"a":2}, {w:1}, function(err, docs) {

      collection.count(function(err, count) {
        console.log(format("count = %s", count));
      });

      // Locate all the entries using find
      collection.find().toArray(function(err, results) {
        console.dir(results);
        // Let's close the db
        db.close();
      });
    });
  });
}
i++;

if (sampleCodeToRun[i]) {
  MongoClient.connect(url, function(err,db) {
    if(err) throw err;

    dropDocuments(db, function() {
      insertDocuments(db, function() {
        updateDocument(db, function() {
          removeDocument(db, function() {
            findDocuments(db, function() {
              db.close();
            });
          });
        });
      });
    });
  });
}
i++;

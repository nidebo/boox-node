var mongo = require('mongodb');

var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;

var server = new Server('127.0.0.1', 27017, {auto_reconnect: true});
db = new Db('userdb', server);

db.open(function(err, db) {
	if(!err) {
		console.log("Connected to 'userdb' database");
		db.collection('users', function(err, collection) {
			collection.findOne(function(err, item) {
				if (!item) {
					console.log("The 'users' collection doesn't exist.");
				}
			});
		});	
	}
});

exports.findAll = function(req, res) {
    db.collection('users', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving user: ' + id);
    db.collection('users', function(err, collection) {
        collection.findOne({'_id': id }, function(err, item) {
            res.send(item);
        });
    });
};

exports.getAllCustomLists = function(req, res) {
    var id = req.params.id;

    console.log('Retrieving lists of: ' + id);
    var doc1 = {"_id": id };
    var doc2 = { "customLists.name":1, "_id":0 };
    db.collection('users', function(err, collection) {
        collection.findOne(doc1, doc2, function(err, item){
                res.send(item);
            }); 
        });
};

exports.getCustomList = function(req, res) {
    var id = req.params.id;
    var lista = req.params.lista;

    console.log('Retrieving books of list ' + lista + " from user " + id);
    var doc1 = {"_id": id };
    var doc2 = { 'customLists':1, '_id':0 };
    db.collection('users', function(err, collection) {
        collection.findOne(doc1, doc2, function(err, item){

            if( item == null) {
                res.send(null);   
            }
            else {
                var aux = item.customLists.filter(
                    function(value) {
                        if(value.name == lista) return true;
                    });
                if(aux.length == 0){
                    res.send(null);
                } 
                else {
                    var res1 = { customLists: aux };
                    var res2 = { books: res1.customLists[0].content };
                    res.send(res2);
                }
            }
        });
    });
};

exports.friendList = function(req, res) {
    var id = req.params.id;

    console.log('Retrieving friends of: ' + id);
    var doc1 = {"_id": id };
    var doc2 = { "friends":1, "_id":0 };
    db.collection('users', function(err, collection) {
        collection.findOne(doc1, doc2, function(err, item){
            var doc3 = { _id: {$in: item.friends }};
            var doc4 = {cp:1, name:1};
            collection.find(doc3,doc4).toArray(function(err, item2) {
                var result = { friends: item2 };
                res.send(result);
            }); 
        });
    });
};


exports.addUser = function(req, res) {
    var uname = req.body.uname;
    var cp = req.body.cp;
    var fullname = req.body.fullname;
    var pass = req.body.pass;
    //city
    var doc1 = {"_id": uname, password: pass, name: fullname, cp: cp, cole: [], customLists: [], friends: [] };
    console.log('Adding user: ' + JSON.stringify(uname));
    db.collection('users', function(err, collection) {
        collection.insert(doc1, {safe:true}, function(err, result) {
            if (err) {
                res.send("Error");
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
};

exports.addFriend = function(req, res) {

    var id = req.params.id;
    //var id2 = req.params.id2;
    var uname = req.body.uname;
    var fname = req.body.fname;
    console.log('Adding friend ' + fname + ' to user ' + uname );
    //console.log(JSON.stringify(book));
    var doc1 =  { "_id": id };
    //var doc2 = { '$addToSet': { 'friends': { name: fname }}};
    //var doc2 = { '$addToSet': { 'friends': { _id: fname }}};
    var doc2 = { '$addToSet': { 'friends':  fname }};

    db.collection('users', function(err, collection) {
        collection.count( { "_id": fname }, function(err, cuenta) {
            if (err) {
                console.log('Error updating user: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                if(cuenta > 0) {
                    collection.update(doc1, doc2, {safe:true}, function(err, result) {
                        if (err) {
                            console.log('Error updating user: ' + err);
                            res.send({'error':'An error has occurred'});
                        } else {
                            console.log('' + result + ' document(s) updated');
                            res.send(doc1);
                        }
                    });
                } else {
                    console.log('Error unexisting user.');
                    res.send({'error':'An error has occurred'});
                }
            }
        });  
    });
};

exports.delFriend = function(req, res) {
    var id = req.params.id;
    //var id2 = req.params.id2;
    var uname = req.body.uname;
    var fname = req.body.fname;
    console.log('Deleting friend ' + fname + ' from user ' + uname );
    //console.log(JSON.stringify(book));
    var doc1 =  { "_id": id };
    //var doc2 = { '$pull': { 'friends': { name: fname }}};
    //var doc2 = { '$pull': { 'friends': { _id : fname }}};
    var doc2 = { '$pull': { 'friends':  fname }};
    db.collection('users', function(err, collection) {
        collection.update(doc1, doc2, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating user: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(doc1);
            }
        });  
    });
};

exports.addCustomList = function(req, res) {
    var id = req.params.id;
    var uname = req.body.uname;
    var custom = req.body.custom;
    console.log('Adding custom list ' + custom + ' to user ' + uname );
    //console.log(JSON.stringify(book));
    var doc1 =  { '_id': id };
    var doc2 =  { 'customLists.name':1, '_id':0 }
    var doc3 = { '$push': { 'customLists': { name: custom, content:[] }}};
    db.collection('users', function(err, collection) {
        collection.findOne(doc1, doc2, function(err, item) {
            var aux = item.customLists.filter(
                function (value) {
                    if(value.name == custom) return true;
                });
            if(aux.length == 0){
                collection.update(doc1, doc3, {safe:true}, function(err, result) {
                    console.log('' + result + ' document(s) updated');
                    res.send(doc1);
                });
            }
            else {
                console.log('Error duplicate name for custom list in user.');
                res.send({'error':'An error has occurred'});
            }
        });
    });
};

exports.delCustomList = function(req, res) {
    var id = req.params.id;
    var uname = req.body.uname;
    var custom = req.body.custom;
    console.log('Deleting custom list ' + custom + ' from user ' + uname );
    //console.log(JSON.stringify(book));
    var doc1 =  { '_id': id };
    var doc2 = { '$pull': { 'customLists': { name: custom }}};
    db.collection('users', function(err, collection) {
        collection.update(doc1, doc2, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating user: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(doc1);
            }
        });
    });
};


exports.addBookToCustomList = function(req, res) {
    var id = req.params.id;
    var uname = req.body.uname;
    var custom = req.body.custom;
    var book = req.body.book;
    console.log('Adding book ' + book + ' to custom list ' + custom + ' to user ' + uname );
    //console.log(JSON.stringify(book));
    var doc1 =  { '_id': id, 'customLists.name': custom };
    var doc2 = { '$addToSet': { 'customLists.$.content': { 'isbn': book }}};

    db.collection('users', function(err, collection) {
        collection.update(doc1, doc2, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating book: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(doc1);
            }
        });
    });
};

exports.delBookFromCustomList = function(req, res) {
    var id = req.params.id;
    var uname = req.body.uname;
    var custom = req.body.custom;
    var book = req.body.book;
    console.log('Deleting book ' + book + ' from custom list ' + custom + ' to user ' + uname );
    //console.log(JSON.stringify(book));
    var doc1 =  { '_id': id, 'customLists.name': custom };
    var doc2 = { '$pull': { 'customLists.$.content': { 'isbn': book }}};

    db.collection('users', function(err, collection) {
        collection.update(doc1, doc2, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating book: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(doc1);
            }
        });
    });
};

exports.deleteUser = function(req, res) {
    var id = req.params.id;
    console.log('Deleting user: ' + id);
    db.collection('users', function(err, collection) {
        collection.remove({'_id': id }, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
};

exports.checkUser = function(req, res) {
    var id = req.params.id;
    var pass = req.params.pass;
    console.log('Checking user: ' + id);
    db.collection('users', function(err,collection) {
        collection.findOne({_id: id, password: pass}, function(err,result){
            if(result){
                res.send('true');
            } else res.send('false');
        });
    });
};

/////////////////////////////////////////////////////////////////////
/////// CROSSING SIDE ///////////////////////////////////////////////

exports.getCrossings = function(req, res) {
    var id = req.params.id;
    var a = [];
    var b = [];
    var c = [];
    console.log('Retrieving crossings from user: ' + id);
    db.collection('Xings', function(err, collection) {
        collection.find({'user1': id }).toArray(function(err, item) {
            //res.send(item);
            b = a.concat(item);
            collection.find({'user2': id}).toArray(function(err,item2){
            c = b.concat(item2);
            var cross = {crossings: c};
            res.send(cross);
            });
        });
        
    });
};

exports.addCrossing = function(req, res) {
    var id = req.params.id;
    var user2 = req.body.user2;
    var book2 = req.body.book2;
    var doc1 = {'user1': id,'user2': user2, 'book1':"",'book2':book2, 'state':'proposal'};

    console.log('Adding crossing from user1: ' + id + 'and user2: ' + user2);
    db.collection('Xings', function(err, collection) {
        collection.insert(doc1, {safe:true}, function(err, result) {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
        });
    });
};

exports.delCrossing = function(req, res) {
    var id = req.params.id;
    var xing = req.params.xing;
    var o_id = new BSON.ObjectID(xing);

    var doc1 = {'_id': o_id };

    console.log('Deleting crossing: ' + xing);
    db.collection('Xings', function(err, collection) {
        collection.remove(doc1, {safe:true}, function(err, result) {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
        });
    });
};
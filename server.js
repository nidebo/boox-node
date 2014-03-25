var express = require('express'),
	users = require('./routes/users');

var app = express();

app.configure(function () {
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
});


app.get('/users', users.findAll);
app.get('/users/:id', users.findById);
app.get('/users/:id/friendList', users.friendList);
app.get('/users/:id/getCustomList/:lista', users.getCustomList);
app.get('/users/:id/getAllCustomLists', users.getAllCustomLists);
app.put('/users/:id/addFriend', users.addFriend);
app.put('/users/:id/delFriend', users.delFriend);
app.put('/users/:id/addCustomList', users.addCustomList);
app.put('/users/:id/delCustomList', users.delCustomList);
app.put('/users/:id/addBookToCustomList', users.addBookToCustomList);
app.put('/users/:id/delBookFromCustomList', users.delBookFromCustomList);
app.post('/users', users.addUser);
app.delete('/users/:id', users.deleteUser);
app.get('/checkUser/:id/:pass', users.checkUser);
app.get('/users/:id/getCrossings', users.getCrossings);
app.post('/users/:id/addCrossing', users.addCrossing);
app.delete('/users/:id/delCrossing/:xing', users.delCrossing);


app.listen(3000);
console.log('Listening on port 3000...');
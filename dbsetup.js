var mongoose = require('mongoose')
var secrets = require('./secrets.js')
// Database setup
var status = true;
// mongoose.connect('mongodb://'+secrets.dbusername+':'+secrets.dbpassword+'@ds058369.mlab.com:58369/eyeonexpenses');
mongoose.connect('mongodb://localhost:27017/eyeonexpenses');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    status = true;
    console.log('DB Connection successfull!');
});

var storeSchema = new mongoose.Schema({
    username: String,
    stores: Array // {'name': '<name>', 'balance': '<amount>'}
});

var expenseSchema = new mongoose.Schema({
    username: String,
    expense_cur: Array,
    expense_history: Array // Array of objects {'reason': "", 'amount': Number, 'fromstore': String, 'date': Date}
});

var logSchema = new mongoose.Schema({
    username: String,
    log: Array // Array of objects {store: String, type: <credit/debit>, amount: Number, when: Date, reason }
});

var userSchema = new mongoose.Schema({
    username: String,
    password: String
});

module.exports = {'db': db, 'storeSchema': storeSchema, 'expenseSchema': expenseSchema, 'logSchema': logSchema, 'userSchema': userSchema,'status': status};
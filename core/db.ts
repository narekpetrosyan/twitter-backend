import mongoose from 'mongoose';

mongoose.Promise = Promise;

mongoose.connect(
  'mongodb+srv://narek:narek123456@cluster0.debap.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
);
console.log('connected');
const db = mongoose.connection;

db.on('success', console.log.bind(console, 'Connected to db'));

db.on('error', console.error.bind(console, 'Connection error.'));

export { db, mongoose };

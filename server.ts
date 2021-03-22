import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { UserCtrl } from './controllers/UserController';
import { passport } from './core/passport';
import { registerValidations } from './validations/register';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.get('/users', UserCtrl.index);
app.get('/users/me', passport.authenticate('jwt', { session: false }), UserCtrl.getUserInfo);
app.post('/auth/register', registerValidations, UserCtrl.create);
app.get('/auth/verify', registerValidations, UserCtrl.verify);
app.get('/users/:id', UserCtrl.show);
app.post('/auth/login', passport.authenticate('local'), UserCtrl.afterLogin);
// app.patch('/users', UserCtrl.update);
// app.delete('/users', UserCtrl.delete);

app.listen(process.env.PORT, () => {
  console.log('Running');
});

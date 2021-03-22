import { body } from 'express-validator';

export const registerValidations = [
  body('email', 'Please write an email.')
    .isString()
    .isEmail()
    .withMessage('Wrong email type.')
    .isLength({ min: 10, max: 40 })
    .withMessage('Wrong email min length > min 10.'),

  body('fullname', 'Please write your name.')
    .isString()
    .isLength({ min: 2, max: 40 })
    .withMessage('Wrong name length.'),

  body('username', 'Please write a username.')
    .isString()
    .isLength({ min: 6, max: 40 })
    .withMessage('Wrong username length.'),

  body('password', 'Please write a password.')
    .isString()
    .isLength({ min: 8 })
    .withMessage('Wrong password length > min 8.')
    .custom((value, { req }) => {
      if (value !== req.body.password2) {
        throw new Error('Passwords does not match.');
      } else {
        return value;
      }
    }),
];

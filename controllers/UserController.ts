import express from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { UserModel, UserModelDocumentInterface, UserModelInterface } from '../models/UserModel';
import { generateMD5 } from '../utils/generateHash';
import { sendEmail } from '../utils/sendMail';
import { Error } from 'mongoose';
import { mongoose } from '../core/db';

const idValidObjectId = mongoose.Types.ObjectId.isValid;

class UserController {
  async index(_: any, res: express.Response): Promise<void> {
    try {
      const users = await UserModel.find({}).exec();

      res.json({
        status: 'success',
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        errors: error,
      });
    }
  }

  async show(req: express.Request, res: express.Response): Promise<void> {
    try {
      const userId = req.params.id;

      if (!idValidObjectId(userId)) {
        res.status(400).send();
        return;
      }

      const user = await UserModel.findById(userId).exec();

      if (!user) {
        res.status(400).send();
        return;
      }
      console.log(user.password, user.confirmHash);

      res.json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        errors: error,
      });
    }
  }

  async create(req: express.Request, res: express.Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ status: 'error', errors: errors.array() });
        return;
      }

      const data: UserModelInterface = {
        email: req.body.email,
        fullname: req.body.fullname,
        username: req.body.username,
        password: generateMD5(req.body.password + process.env.SECRET_KEY),
        confirmHash: generateMD5(process.env.SECRET_KEY || Math.random().toString()),
      };

      const user = await UserModel.create(data);

      sendEmail(
        {
          emailFrom: 'admin@test.com',
          emailTo: data.email,
          subject: 'Подтверждение почты.',
          html: `Для того, чтобы подтвердить почту, перейдите <a href="http://localhost:${
            process.env.PORT || 3000
          }/auth/verify?hash=${data.confirmHash}">по этой ссылке</a>`,
        },
        (err: Error | null) => {
          if (err) {
            res.json({
              errors: err,
            });
          } else {
            res.json({ status: 'success', data: user });
          }
        },
      );
    } catch (error) {
      res.status(500).json({
        errors: error,
      });
    }
  }

  async verify(req: any, res: express.Response): Promise<void> {
    try {
      const hash = req.query.hash;
      if (!hash) {
        res.status(400).send();
        return;
      }
      const user = await UserModel.findOne({ confirmHash: hash }).exec();

      if (user) {
        user.confirmed = true;
        user.save();
        res.json({
          status: 'success',
        });
      }
    } catch (error) {
      res.status(500).json({
        errors: error,
      });
    }
  }

  // @ts-nocheck
  async afterLogin(req: any, res: express.Response): Promise<void> {
    try {
      const user = req.user ? (req.user as UserModelDocumentInterface).toJSON() : undefined;
      res.json({
        status: 'success',
        data: {
          ...user,
          token: jwt.sign({ data: req.user }, process.env.SECRET_KEY || 'Qwerty123', {
            expiresIn: '30 days',
          }),
        },
      });
    } catch (error) {
      res.status(500).json({
        errors: error,
      });
    }
  }

  async getUserInfo(req: any, res: express.Response): Promise<void> {
    try {
      const user = req.user ? (req.user as UserModelDocumentInterface).toJSON() : undefined;
      res.json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        errors: error,
      });
    }
  }
}

export const UserCtrl = new UserController();

const express = require('express');
const messageRouter = express.Router();
const { Users, Messages, Conversations } = require('../database/index');
const { Op } = require("sequelize");

messageRouter.get('/user:username', (req, res) => {
  const { username } = req.params;
  Users.findOne({ where: { username }})
    // data will either be an object or null
    .then((data) => {
      if (data) {
        res.send(data.dataValues);
      } else {
        res.sendStatus(204);
      }
    })
    .catch((err) => {
      console.log('error finding user by username: ', err);
      res.sendStatus(500);
    });
});

messageRouter.get('/conversations:userId', (req, res) => {
  const { userId } = req.params;
  Conversations.findAll({
    where: {
      [Op.or]: [
        { userOneId: userId },
        { userTwoId: userId }
      ]
    }
  })
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.sendStatus(204);
      }
    })
    .catch((err) => {
      console.log('error finding all conversations: ', err);
    });
});

messageRouter.post('/message', (req, res) => {
  console.log(req.body);
  const { senderId, recipientId, conversationId, img } = req.body;
  if (conversationId) {
    Messages.create(req.body)
      .then(() => {
        res.sendStatus(201);
      })
      .catch((err) => {
        console.log('error creating message: ', err);
        res.sendStatus(500);
      });
  } else {
    Conversations.create({userOneId: senderId, userTwoId: recipientId})
      .then((data) => {
        const { id } = data.dataValues;
        return Messages.create({ senderId, recipientId, conversationId: id, img: img});
      })
      .then(() => {
        res.sendStatus(201);
      })
      .catch((err) => {
        console.log('error creating message: ', err);
        res.sendStatus(500);
      });
  }

});

module.exports = messageRouter;

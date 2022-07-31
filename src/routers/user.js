const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, cancelationEmail } = require('../emails/accounts');
//! Sign Up
router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeEmail(user.name, user.email);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send(err.message);
  }
});
router.post('/users/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    // res.send({ user: user.getPublicProfile(), token });
    //! See user modal, toJSON method
    res.send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

router.patch('/users/me', auth, async (req, res) => {
  try {
    // // const _id = req.user._id;
    const allowedUpdates = ['name', 'age', 'email', 'password'];
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every(el => allowedUpdates.includes(el));
    if (!isValidUpdate) return res.status(400).send({ error: `Invalid Update` });
    // if (!isValidUpdate) throw new Error('Invalid Update');
    //* new: true => returns the user before it gets updated
    //* runValidators : true => assure the validation of the modal
    //// const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true });
    // // const user = await User.findById(_id);
    const user = req.user;
    updates.forEach(update => (user[update] = req.body[update]));
    await user.save();
    //! We used .save() for updating because we want to use middleware(password hashing)
    res.send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete('/users/me', auth, async (req, res) => {
  try {
    //// const user = await User.findByIdAndDelete(req.user._id);
    await req.user.remove();
    cancelationEmail(req.user.name, req.user.email);
    res.send(req.user);
  } catch (err) {
    res.status(400).send();
  }
});

const upload = multer({
  // // dest: 'avatars',
  //* We don't want to store it locally => we cant file.buffer
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image'));
    }
    cb(undefined, true);
  },
});

//* Upload.single(key of form-data)
//! Update and Save Avatar
router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    // req.user.avatar = req.file.buffer;
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    // <img src="data:image/image;base64,{{the binary of image / take it from Robo3T}}</img>
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);
//! Delete avatar
router.delete('/users/me/avatar', auth, async function (req, res) {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});
//! save avatar
router.get('/users/:id/avatar', async function (req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) throw new Error('User or avatar does not exists');
    res.set('Content-type', 'image/png');
    res.send(user.avatar);
  } catch (err) {
    res.status(404).send(err);
  }
});

module.exports = router;

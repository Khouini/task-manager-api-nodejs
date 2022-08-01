const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');
const Joi = require('joi');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      default: 0,
      type: Number,
      validate(value) {
        if (value < 0) throw new Error('Age must be a positive number!');
      },
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) throw new Error('The email is not valid');
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      validate(value) {
        if (validator.contains(value.toLowerCase(), 'password'))
          throw new Error('The password cotains the word password!!');
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

//! Jointure
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner',
});

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Unable to login!');
  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) throw new Error('Unable to login');
  return user;
};

//! Hiding private informations
//* The name of this function was getPublicProfile(); see Hiding Private Data video!!!
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;
  return userObject;
};
//! Token

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  user.tokens.push({ token });
  await user.save();
  return token;
};
//! Hashing the password // MiddleWAre before creating of updating the user we hash the password
//! Middleware BEFORE ANY SAVE
userSchema.pre('save', async function (next) {
  const user = this;
  //* isModified()=> true, if the user has created or updated his password
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

//! A middleware : deletes user tasks when he is removed

userSchema.pre('remove', async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model('User', userSchema);
//! We can pass a schema or an object to mongoose.model
//* but we passed a schema because we want to use the middleware (password hashing), we use .pre()
module.exports = User;

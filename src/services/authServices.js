const userModel = require('../config/models/userModel');
const AppError = require('./errors/AppError');
const util = require('util');
const jwt = require('jsonwebtoken');

const jwtSign = util.promisify(jwt.sign);
const jwtVerify = util.promisify(jwt.verify);

const registerUser = async ({
  email,
  password,
  rePassword,
  fullName,
  role,
}) => {
  await userModel.create({
    email,
    password,
    rePassword,
    fullName,
    role,
  });
};

const logUser = async (userToLog) => {
  const { email, password } = userToLog;
  const user = await userModel.findOne({ email });
  if (!email || !password || !user) {
    throw new AppError('Email or Password are invalid!', 401);
  }

  const isValid = await user.validatePassword(password);
  if (!isValid) {
    throw new AppError('Email or Password are invalid!', 401);
  }

  return user;
};

const createToken = (user) => {
  const { _id, email, role } = user;
  const payload = {
    _id,
    email,
    role,
  };
  return jwtSign(payload, process.env.SECRET);
};

const verifyToken = (token) => jwtVerify(token, process.env.SECRET);

const getUser = (id) => userModel.findById(id).lean();

const authServices = {
  registerUser,
  logUser,
  createToken,
  verifyToken,
  getUser,
};

module.exports = authServices;

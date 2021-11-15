const User = require("../models/User");

const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

// Imports Helpers
const createUserToken = require("../helpers/create-user-token");
const getToken = require('../helpers/get-token');

module.exports = class UserController {
  static async register(req, res) {
    const { name, email, phone, password, confirmPassword } = req.body;

    // Validations
    if (!name) {
      res.status(422).json({
        message: "O nome é obrigatorio",
      });
      return;
    }
    if (!email) {
      res.status(422).json({
        message: "O email é obrigatorio",
      });
      return;
    }
    if (!phone) {
      res.status(422).json({
        message: "O telefone é obrigatorio",
      });
      return;
    }
    if (!password) {
      res.status(422).json({
        message: "O senha é obrigatorio",
      });
      return;
    }
    if (!confirmPassword) {
      res.status(422).json({
        message: "O confirmação de senha é obrigatorio",
      });
      return;
    }
    if (password !== confirmPassword) {
      res.status(422).json({
        message: "Senha não conferem, verifique o valor digitado!",
      });
      return;
    }
    // Check if users exists
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      res.status(422).json({
        message: "Email ja cadastrado, escolha outro ou faça login!",
      });
      return;
    }

    // create a password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // create a user
    const user = new User({
      name,
      email,
      phone,
      password: passwordHash,
    });

    try {
      const newUser = await user.save();

      await createUserToken(newUser, req, res);
    } catch (error) {
      res.status(500).json({
        message: error,
      });
    }
  }

  // Method login user
  static async login(req, res) {
    const { email, password } = req.body;

    if (!email) {
      res.status(422).json({
        message: "O email é obrigatorio",
      });
      return;
    }
    if (!password) {
      res.status(422).json({
        message: "O senha é obrigatorio",
      });
      return;
    }

    // Check if user exists
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(422).json({
        message: "Não existe nenhum usuario cadastrado com esse email!",
      });
      return;
    }

    // Check if password match with db password
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      res.status(422).json({
        message: "Senha digitada esta incorreta!",
      });
      return;
    }
    await createUserToken(user, req, res);
  }

  // Verify user to token
  static async checkUser(req, res){
    let currentUser

    if(req.headers.authorization){
        const token = getToken(req);
        const decoded = jwt.verify(token, 'nossosecret');

        currentUser = await User.findById(decoded.id);
        currentUser.password = undefined;
    }else{
        currentUser = null
    }

    res.status(200).send(currentUser)
  }

  // Resgate db by user id
  static async getById(req,res){

    const id = req.params.id;

    const user = await User.findById(id).select('-password');
    if(!user){
        req.status(422).json({
          message: 'Usuario não encontrado!'})
        
          return;
    }
    res.status(200).json({ user })
  }
};

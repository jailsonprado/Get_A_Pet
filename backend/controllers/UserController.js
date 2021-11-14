const User = require('../models/User');

const bcrypt = require('bcrypt');

module.exports = class UserController{
    static async register(req, res){
        const {name, email, phone, password, confirmPassword} = req.body;

        // Validations
        if(!name){
            res.status(422).json({
                message: 'O nome é obrigatorio'})
            return;
        }
        if(!email){
            res.status(422).json({
                message: 'O email é obrigatorio'})
            return;
        }
        if(!phone){
            res.status(422).json({
                message: 'O telefone é obrigatorio'})
            return;
        }
        if(!password){
            res.status(422).json({
                message: 'O senha é obrigatorio'})
            return;
        }
        if(!confirmPassword){
            res.status(422).json({
                message: 'O confirmação de senha é obrigatorio'})
            return;
        }
        if(password !== confirmPassword){
            res.status(422).json({
                message: 'Senha não conferem, verifique o valor digitado!'})
            return;    
        }
    // Check if users exists
      const userExists = await User.findOne({email: email})
      if(userExists){
        res.status(422).json({
            message: 'Email ja cadastrado, escolha outro ou faça login!'})
        return;    
      }

      // create a password
      const salt = await bcrypt.genSalt(12)
      const passwordHash = await bcrypt.hash(password, salt)

      // create a user
      const user = new User({
          name,
          email,
          phone,
          password: passwordHash,
      })

      try {
          const newUser = await user.save()
          res.status(201).json({
            message: 'Usuario criado com sucesso!',
            newUser,
        })   
      } catch (error) {
          res.status(500).json({
              message: error})
      }
    }
}
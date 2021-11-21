const Pet = require("../models/Pet");

// Helpers
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = class PetController {
  // Create a pet
  static async create(req, res) {
    const { name, age, weight, color } = req.body;
    const images = req.files

    const available = true;

    //Images upload

    // Validations
    if (!name) {
      res.status(422).json({ message: "O  campo nome é obrigatorio!" });
      return;
    }
    if (!age) {
      res.status(422).json({ message: "O campo idade é obrigatorio!" });
      return;
    }
    if (!weight) {
      res.status(422).json({ message: "O campo peso é obrigatorio!" });
      return;
    }
    if (!color) {
      res.status(422).json({ message: "O campo cor é obrigatorio!" });
      return;
    }
    if (images.length === 0) {
      res.status(422).json({ message: "A imagem é obrigatorio!" });
      return;
    }
    // get pet owner
    const token = getToken(req);
    const user = await getUserByToken(token);

    // Create a pet
    const pet = new Pet({
      name,
      age,
      weight,
      color,
      available,
      images: [],
      user: {
        _id: user._id,
        name: user.name,
        image: user.image,
        phone: user.phone,
      },
    });

    images.map((image) => {
        pet.images.push(image.filename)
    })

    try {
      const newPet = await pet.save();
      res.status(201).json({
        message: "Pet cadastrado com sucesso!",
        newPet,
    });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  }

  // Method Find Pets
  static async getAll(req, res) {
      const pets = await Pet.find().sort('-createdAt')
      res.status(200).json({
          pets: pets,
      })
  }

  static async getAllUserPets(req, res){

    // get user from token
    const token = getToken(req);
    const user = await getUserByToken(token);

    const pets = await Pet.find({'user._id': user._id}).sort('-createdAt')

    res.status(200).json({
        pets,
    })
  }

  // Method adoptions pets
  static async getAllUserAdoptions(req, res){
     // get user from token
    const token = getToken(req);
    const user = await getUserByToken(token);

    const pets = await Pet.find({'adopter._id': user._id}).sort('-createdAt')

    res.status(200).json({
        pets,
    })
  }

  // Create method to find object Pet by ID
  static async getPetById(req, res){
      const id = req.params.id

      if(!ObjectId.isValid(id)){
          res.status(422).json({message: 'ID Invalido'})
          return;
      }

      // Check if pet exists
      const pet = await Pet.findOne({_id: id})

      if(!pet){
          res.status(404).json({message: 'Pet não encontrado!'})
      }

      res.status(200).json({
          pet: pet,
      })
  }

    
};

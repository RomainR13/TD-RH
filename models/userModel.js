const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Le nom de l'entreprise est requis"]
    },
    siret: { 
        type: Number,
        required: [true, "Le numéro de Siret est requis"]
    },
    mail: {
        type: String,
        required: [true, "L'adresse mail est requise"],
        unique: true,
        validate: {
            validator: function(v) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(v);
            },
            message: "Entrez un mail valide"
        }
    },
    directorName: {
        type: String,
        required: [true, "Le nom du directeur est requis"]
    },
    password: {
        type: String,
        required: [true, "Le nom du directeur est requis"]
    },
    employeeCollection: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employees'
    }]
})

userSchema.pre("validate", async function(next) {
    try {
        const existingUser = await this.constructor.findOne({ mail: this.mail });
        if(existingUser) {
            this.invalidate("mail", "Cet email est déjà enregistré.");
        }
        next()
    } catch (error) {
        next(error);
    }
})

userSchema.pre("save", function (next) {
    if(!this.isModified("password")) {
        return next();
    }

    bcrypt.hash(this.password, 10, (error, hash) => {
        if(error) {
            return next(error);
        }
        this.password = hash;
        next()
    })
})

const userModel = mongoose.model('Users', userSchema)
module.exports = userModel
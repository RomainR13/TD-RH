const userModel= require("../models/userModel")
const session = require("express-session")

const authguard = async (req, res, next)=> {
    try {
        if(req.session.userId){
            let user = await userModel.findOne({_id: req.session.userId});
            if(user){
                return next()
            }
        }
        throw new Error ("utilisateur non connecté")
    } catch (error) {
        res.status(401).render('login/loginPage.twig', {
            errorAuth: error.message
        })
    }
}

module.exports = authguard
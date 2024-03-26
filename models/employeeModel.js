const mongoose = require('mongoose');
const userModel = require('./userModel');

const employeeSchema = mongoose.Schema({
    image: {
        type: String,
        required: [true, "La photo de l'employé est requise"]
    },
    name: {
        type: String,
        required: [true, "Le nom de l'employé est requis"]
    },
    function: {
        type: String,
        required: [true, " La fonction de l'employé est requis"]
    },
    blame: {
        type: Number,
        default: 0
    }
});

employeeSchema.pre("save", async function (next) {
    await userModel.updateOne(
        { _id: this._user },
        { $addToSet: { employeeCollection: this._id }}
    )
    next()
})

employeeSchema.post("deleteOne", async function (doc,next) {
    const deletedEmployeeId = this.getQuery()._id;
    await userModel.updateOne({ employeeCollection: { $in: [deletedEmployeeId] }},{$pull: {employeeCollection : deletedEmployeeId}});
    next()
})

const employeeModel = mongoose.model("employees", employeeSchema);
module.exports = employeeModel
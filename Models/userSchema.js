import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    token: String,
    resetToken: String,
    resetTokenExpiration: Date
})

/* to return the schema to json file */
userSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password; // Remove password field
        return ret; // Return the modified object
    },
});

const User = mongoose.model("User", userSchema);

export default User;
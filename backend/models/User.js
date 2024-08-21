const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    guesses: [
        {
            lat: Number,
            lng: Number,
            score: Number
        }
    ],
    friends: [{ type: String }],
    photos: [
        {
            url: String,
            description: String,
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;

const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

// Define a schema for the member model
const memberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'vous devez avoir un nom valide'],
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: ['vous devez avoire une adresse email valide',true],
        unique: true,
        lowercase:true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    role: {
        type: String,
        enum: ['member', 'chef-projet', 'admin'],
        default: 'user'
    },
    avatar: {
        type: String,
        default: 'default.png'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    active:{
        type: Boolean,
        default: true,
        select: false // to hide this field from the output
    },
    password: {
        type: String,
        required: [true, 'Vous devez avoir un mot de passe'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Vous devez confirmer votre mot de passe'],
        validate: {
            // This only works on CREATE and SAVE
            validator: function(el) {
                return el === this.password;
            },
            message: 'Les mots de passe ne sont pas identiques'
        }
    },
    slug: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Encrypt the password before saving it to the database
memberSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete the passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

// select only active members
memberSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } });
    next();
});

// Compare the password entered by the user with the one stored in the database
memberSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};


// Check if the password was changed after the token was issued
memberSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }

    // False means NOT changed
    return false;
};

// Generate a unique password reset token
memberSchema.methods.generatePasswordResetToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash the token with a timestamp for expiration
    this.passwordResetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set the expiration time for the token
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

//creation de slug pour un membre

memberSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});



module.exports = mongoose.model('Member', memberSchema);




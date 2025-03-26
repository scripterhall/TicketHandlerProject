const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const Member = require('../models/memberModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/emailFactory');
const crypto = require('crypto');


//generate token signature
const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

//create and send token
const createSendToken = (member, statusCode, res) => {
    const token = signToken(member._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: false
    };
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);
    //remove password from output
    member.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            member
        }
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newMember = await Member.create({
        name: req.body.name,
        email: req.body.email,
        phone:req.body.phone,
        addresse: req.body.address,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    //send email with url to /me route
    const url = `${req.protocol}://${req.get('host')}/me`;
    //send email
    await new Email(newMember, url).sendWelcome();
    createSendToken(newMember, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;
    //check if email and password exist
    if(!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }
    //check if member exists and password is correct
    const member = await Member.findOne({email}).select('+password');
    if(!member || !(await member.correctPassword(password, member.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }
    //if everything is ok, send token
    createSendToken(member, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    //get token even from coockies and check if it exists 
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')  ) {
        token = req.headers.authorization.split(' ')[1];
    }else if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt; // 👉 ici tu lis le cookie
    }
    if(!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }
    //verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  
    //check if member still exists
    const currentMember = await Member.findById(decoded.id);
    if(!currentMember) {
        return next(new AppError('The member belonging to this token does no longer exist.', 401));
    }
    //check if member changed password after the token was issued
    if(currentMember.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('Member recently changed password! Please log in again.', 401));
    }
    //grant access to protected route
    req.member = currentMember;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles is an array ['admin', 'lead-guide']
        if(!roles.includes(req.member.role)) {
            return next(new AppError('Vous n\'avez pas la permission pour acceder a cette URL!', 403));
        }
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //get member based on posted email
    const member = await Member.findOne({email: req.body.email});
    if(!member) {
        return next(new AppError('email introuvable  !', 404));
    }
    //generate random reset token
    const resetToken  = member.generatePasswordResetToken();
    await member.save({validateBeforeSave: false});
    //send email with url to /resetPassword/:resetToken route
    try{
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/members/reset-password/${resetToken}`;
        await new Email(member, resetURL).sendPasswordReset();
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    }catch(err){
        member.passwordResetToken = undefined;
        member.passwordResetExpires = undefined;
        await member.save({validateBeforeSave: false});
        return next(new AppError('erreur l\'heurs de l\'envoie de mail !', 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //get member based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const member = await Member.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}});
    if(!member) {
        return next(new AppError('Token expiré ou invalide!', 400));
    }
    //update password and reset token fields
    member.password = req.body.password;
    member.passwordConfirm = req.body.passwordConfirm;
    member.passwordResetToken = undefined;
    member.passwordResetExpires = undefined;
    await member.save();
    //log the member in, send JWT
    createSendToken(member, 200, res);
});

//update password for logged in member /me
exports.updatePassword = catchAsync(async (req, res, next) => {
    const member = await  Member.findById(req.member.id).select('+password');
    //check if posted current password is correct
    if(!(await member.correctPassword(req.body.passwordCurrent, member.password))) {
        return next(new AppError('Votre mot de passe courant est invalid!', 401));
    } 

    member.password = req.body.password;
    member.passwordConfirm = req.body.passwordConfirm;
    await member.save();

    createSendToken(member, 200, res);

});


exports.isLoggedIn = catchAsync(async (req, res, next) => {
    if(req.cookies.jwt) {
        try{
            //verify token then i will get the id from it 
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
            //check if member still exists
            const currentMember = await Member.findById(decoded.id);
            if(!currentMember) {
                return next(new AppError('The member belonging to this token does no longer exist.', 401)  );
            }
            //check if member changed password after the token was issued
            if(currentMember.changedPasswordAfter(decoded.iat)) {
                return next();
            }
            //there is a logged in member
            req.member = currentMember; // access from template engine
            res.locals.member = currentMember; // access from template engine
            return next();
        }catch(err){
            return next();
        }
    }
   res.render('auth/login');
});

exports.logout = (req, res) => {
    res.cookie('jwt', '', {
        expires: new Date(Date.now() + 10 * 1000),//10 minutes
        httpOnly: true
    });
    res.status(200).json({status:'success', message: 'Déconnexion!'});
};


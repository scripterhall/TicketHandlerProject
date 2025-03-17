const Member = require('../models/memberModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Seul les images sont pris en charge', 400), false);
    }
};

const upload = multer({ 
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadAvatar = upload.single('avatar');

exports.resizeAvatar = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `member-${req.member.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/members/${req.file.filename}`);

    next();
});

//consultation de profile
exports.getMe = (req, res, next) => {
    req.params.id = req.member.id;
    next();
};

//creattion manuelle de membre
exports.createMember = factory.createOne(Member);

//recuperation de tous les membres
exports.getAllMembers = factory.getAll(Member);

//recuperation d'un membre
exports.getMember = factory.getOne(Member);


/**
 * Filter object by fields for 
 * @param {*} obj 
 * @param  {...any} fields 
 * @returns  object filtered by provided fields
 */
const filterObj = (obj, ...fields) => {
    Object.keys(obj).forEach(key => {
        if (!fields.includes(key)) delete obj[key];
    });
    return obj;
}

//modification de profile de membre
exports.updateMe = catchAsync(async (req, res, next) => {
    //1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('Cette route n\'est pas pour la modification de mot de passe. Veuillez utiliser /updateMyPassword.', 400));
    }

    //2) Update user document
    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) filteredBody.avatar = req.file.filename;

    const updatedMember = await Member.findByIdAndUpdate(req.member.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            data: updatedMember
        }
    });
});

//suppression de profile de membre
exports.deleteMe = catchAsync(async (req, res, next) => {
    await Member.findByIdAndUpdate(req.member.id, { active: false });
     res.status(204).json({
        status:'success',
        data: null
    });
});

exports.updateMember = factory.updateOne(Member);
exports.deleteMember = factory.deleteOne(Member);


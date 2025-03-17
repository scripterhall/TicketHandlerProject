const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberHandler');
const authController = require('../controllers/authHandler');

//protected routes with JWT token
router.use(authController.protect);

router.patch('/update-password', authController.updatePassword);
router
  .route('/me')
  .get(memberController.getMe, memberController.getMember)
  .patch(
    memberController.uploadAvatar,
    memberController.resizeAvatar,
    memberController.updateMe
  )
  .delete(memberController.deleteMe);

//routes for admin only
router.use(authController.restrictTo('admin'));
router
    .route('/')
    .get(memberController.getAllMembers)
    .post(memberController.createMember);
router
    .route('/:id')
    .get(memberController.getMember)
    .patch(memberController.updateMember)
    .delete(memberController.deleteMember);

module.exports = router;

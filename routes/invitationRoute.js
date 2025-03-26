const express = require('express');
const invitationHandler = require('../controllers/invitationHandler');
const authHandler = require('../controllers/authHandler');
const router = express.Router({ mergeParams: true });

router.route('/:id/accept')
    .patch(invitationHandler.acceptInvitation);
router.route('/:id/decline')
    .patch(invitationHandler.rejectInvitation);
// Protected routes with JWT token
router.use(authHandler.protect);

router.route('/my-invitations')
      .get(authHandler.restrictTo('member'),invitationHandler.getMemberInvitations);
      
router.route('/my-pending-invitations')
      .get(authHandler.restrictTo('member'),invitationHandler.getPendingInvitations);

router.route('/')
    .get(authHandler.restrictTo('chef-projet'),invitationHandler.getAllInvitations)
    .post(authHandler.restrictTo('chef-projet'),invitationHandler.addProjectAndChefProjet,
                                                   invitationHandler.createInvitation,
                                                   invitationHandler.sendInvitation
                                                   );

router.route('/:id')
    .get(authHandler.restrictTo('chef-projet','member'),invitationHandler.getInvitation)
    .patch(authHandler.restrictTo('chef-projet','admin'),invitationHandler.updateInvitation)
    .delete(authHandler.restrictTo('chef-projet','admin'),invitationHandler.deleteInvitation);


    
module.exports = router;




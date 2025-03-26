const viewsHandler = require('../controllers/viewsHandler');
const authHandler = require('../controllers/authHandler');
const express = require('express');
const router = express.Router();



router.route('/login')
      .get(viewsHandler.getLoginForm);

router.get('/register',viewsHandler.getRegisterForm);

router.get('/',authHandler.isLoggedIn,viewsHandler.getDashboard);

router.get('/projects/:projectId/tickets',authHandler.isLoggedIn,viewsHandler.getProjectTickets);
router.get('/projects/:projetId/members',authHandler.isLoggedIn,viewsHandler.getProjectMembers);
router.get('/invitations/:invitationId/accept',viewsHandler.acceptInvitation);
router.get('/invitations/:invitationId/decline',viewsHandler.declineInvitation);

router.get('/projects/:projectId/normal-tickets',authHandler.isLoggedIn,viewsHandler.getNormalTicketsProject);

router.get('/projects/:projectId/composed-tickets',authHandler.isLoggedIn,viewsHandler.getComposedTicketsProject);
router.get('/projects/:projectId/invitations',authHandler.isLoggedIn,viewsHandler.getMemberInvitations);

module.exports = router;
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectHandler');
const authController = require('../controllers/authHandler');
const invitationRoute = require('./invitationRoute');
const ticketRoute = require('./ticketRoute');
const composedTicketRoute = require('./composedTicketRoute');     
const normalTicketRoute = require('./normalTicketRoute');

//allow nested routes
router.use('/:projectId/tickets',ticketRoute);
router.use('/:projectId/composed-tickets',composedTicketRoute);
router.use('/:projectId/normal-tickets',normalTicketRoute);
router.use('/:projectId/invitations',invitationRoute);

router.route('/top-5-biggest-projects')
      .get(projectController.getBiggestProjects);

router.use(authController.protect);



router.route('/')
      .get(projectController.getAllProjects)
      .post(authController.restrictTo('chef-projet'),projectController.setProjectChef,projectController.createProject);

router.route('/biggest-5-duration-projects')
      .get(authController.restrictTo('chef-projet'),projectController.aliasBiggestDurationProjects, projectController.getAllProjects);

router.route('/:id')
      .get(projectController.getProject)
      .patch(authController.restrictTo('chef-projet','admin'),projectController.updateProject)
      .delete(authController.restrictTo('chef-projet','admin'),projectController.deleteProject);

module.exports = router;

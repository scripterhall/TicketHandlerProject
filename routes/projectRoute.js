const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectHandler');
const authController = require('../controllers/authHandler');

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

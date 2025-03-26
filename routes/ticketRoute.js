const ticketHandler = require('../controllers/ticketHandler');
const authHandler = require('../controllers/authHandler');
const express = require('express');
const router = express.Router({ mergeParams: true });

// Protected routes with JWT token
router.use(authHandler.protect);

// my tickets
router.route('/my-tickets')
        .get(authHandler.restrictTo('member'),ticketHandler.getAllTicketsByMemberId)

router.route('/')
        .get(authHandler.restrictTo('member','chef-projet'),ticketHandler.getAllTicketsByProjectId);
router.route('/:id')
        .get(authHandler.restrictTo('member','chef-projet'),ticketHandler.getTicketById)
        .patch(authHandler.restrictTo('member','chef-projet'),ticketHandler.updateTicket)

module.exports = router;
      
const express = require('express');
const composedTicketHandler = require('../controllers/composedTicketHandler');
const authHandler = require('../controllers/authHandler');
const router = express.Router({ mergeParams: true });

// Protected routes with JWT token
router.use(authHandler.protect);

router.route('/my-tickets')
    .get(authHandler.restrictTo('member'), composedTicketHandler.getAllComposedTicketsByConnectedMember);

router.route('/')
    .get(authHandler.restrictTo('member', 'chef-projet'),composedTicketHandler.addPriorityFilterToComposedTickets,
                                                         composedTicketHandler.addStatusFilterToComposedTickets,
                                                         composedTicketHandler.addAssignedToFilterToComposedTickets,
                                                         composedTicketHandler.getAllComposedTickets)
.post(authHandler.restrictTo('member','chef-projet'),composedTicketHandler.addTicketToMemberAndProject,
                                                     composedTicketHandler.addComposedTicket);

router.route('/:id')
    .get(authHandler.restrictTo('member', 'chef-projet'), composedTicketHandler.getComposedTicket)
    .patch(authHandler.restrictTo('member','chef-projet'),composedTicketHandler.updateComposedTicket)
    .delete(authHandler.restrictTo('member','chef-projet'),composedTicketHandler.deleteComposedTicket);

module.exports = router;


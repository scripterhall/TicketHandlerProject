const express = require('express');
const normalTicketHandler = require('../controllers/normalTicketHandler');
const authHandler = require('../controllers/authHandler');
const router = express.Router({ mergeParams: true });

//protected routes with JWT token
router.use(authHandler.protect); 

router.route('/my-tickets')
      .get(authHandler.restrictTo('member'),normalTicketHandler.getAllNormalTicketsByConnectedMember);

router.route('/')
      .get(authHandler.restrictTo('member','chef-projet'),normalTicketHandler.addPriorityFilterToNormalTickets,
                                                          normalTicketHandler.addStatusFilterToNormalTickets,
                                                          normalTicketHandler.addAssignedToFilterToNormalTickets,
                                                          normalTicketHandler.getAllNormalTickets)
      .post(authHandler.restrictTo('member','chef-projet'),normalTicketHandler.addTicketToMemberAndProject,
                                                            normalTicketHandler.addNormalTicket);
router.route('/:id')
        .get(authHandler.restrictTo('member','chef-projet'),normalTicketHandler.getNormalTicket)
        .patch(authHandler.restrictTo('member','chef-projet'),normalTicketHandler.updateNormalTicket)
        .delete(authHandler.restrictTo('member','chef-projet'),normalTicketHandler.deleteNormalTicket);
module.exports = router;
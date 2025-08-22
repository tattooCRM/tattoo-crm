const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.get('/:userId', eventController.getEventsByUser);
router.post('/', eventController.createEvent);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;

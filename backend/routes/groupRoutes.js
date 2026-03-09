const express = require('express');
const router = express.Router();
const {
    getAvailableGroups,
    joinGroup,
    createGroup
} = require('../controllers/groupController');
const protect = require('../middleware/authMiddleware');

router.use(protect);

router.get('/available', getAvailableGroups);
router.post('/', createGroup);
router.post('/:id/join', joinGroup);

module.exports = router;

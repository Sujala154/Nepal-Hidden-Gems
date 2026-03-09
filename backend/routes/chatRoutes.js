const express = require('express');
const router = express.Router();
const {
    sendInvite,
    getChats,
    acceptInvite,
    declineInvite,
    getNotifications,
    getMessages,
    sendMessage,
    deleteChat,
    deleteNotification
} = require('../controllers/chatController');
const protect = require('../middleware/authMiddleware');


router.use(protect);

router.use((req, res, next) => {
    console.log(`[CHAT_ROUTE] ${req.method} ${req.path}`);
    next();
});

router.post('/invite', sendInvite);
router.get('/', getChats);
router.get('/notifications', getNotifications);
router.delete('/notifications/:id', deleteNotification);
router.put('/:id/accept', acceptInvite);
router.put('/:id/decline', declineInvite);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);
router.delete('/:id', deleteChat);

module.exports = router;

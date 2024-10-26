// routes/users.js
const express = require('express');
const router = express.Router();
const userStore = require('../store/users');

// 전체 사용자 조회
router.get('/', (req, res) => {
  const users = userStore.getAllUsers();
  res.json(users);
});

// 온라인 사용자만 조회
router.get('/online', (req, res) => {
  const onlineUsers = userStore.getOnlineUsers();
  res.json(onlineUsers);
});

// 사용자 생성/로그인
router.post('/', (req, res) => {
  const { name, email } = req.body;
  const id = Date.now().toString();
  const user = userStore.addUser(id, { name, email });
  res.json(user);
});

// 특정 사용자 조회
router.get('/:id', (req, res) => {
  const user = userStore.getUser(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
  }
});

module.exports = router;
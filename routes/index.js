const express = require('express');
const router = express.Router();
const userRouter = require('./users');

// API 라우트
router.get('/', (req, res) => {
  res.json({ message: '서버가 정상적으로 실행중입니다.' });
});

router.use('/users', userRouter);

module.exports = router;
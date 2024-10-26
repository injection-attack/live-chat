const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');
const userStore = require('./store/users');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 커스텀 morgan 포맷 정의
morgan.token('ip', (req) => {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
});
  
// morgan 설정 - IP 주소 포함
app.use(morgan(':ip :method :url :status :response-time ms'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 추가 로깅 미들웨어
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] IP: ${req.ip} Path: ${req.path}`);
    next();
});

// API 라우트
app.use('/api', routes);

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'client/build')));

// React Router를 위한 설정
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// WebSocket 연결 처리
wss.on('connection', (ws, req) => {  // req 파라미터 추가
  console.log('New client connected');
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`New WebSocket connection from IP: ${ip}`);
  let userId = null;

  // heartbeat 체크를 위한 변수 추가
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('받은 메시지:', data);

      if (data.type === 'login') {
        userId = data.userId;
        userStore.updateUserSocket(userId, ws);
        
        const onlineUsers = userStore.getOnlineUsers();
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'userList',
              users: onlineUsers
            }));
          }
        });
      }
      else if (data.type === 'message') {
        const user = userStore.getUser(userId);
        if (user) {
          const messageWithUser = {
            ...data,
            sender: user,
            timestamp: new Date().toISOString()
          };

          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(messageWithUser));
            }
          });
        }
      }
    } catch (error) {
      console.error('메시지 처리 중 에러:', error);
      // 에러 발생 시 클라이언트에게 에러 메시지 전송
      ws.send(JSON.stringify({
        type: 'error',
        message: '메시지 처리 중 오류가 발생했습니다.'
      }));
    }
  });

  ws.on('close', () => {
    if (userId) {
      userStore.updateUserStatus(userId, false);
      const onlineUsers = userStore.getOnlineUsers();
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'userList',
            users: onlineUsers
          }));
        }
      });
    }
    console.log(`Client disconnected from IP: ${ip}`);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error from IP ${ip}:`, error);
  });
});

// heartbeat 체크 인터벌 설정
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      // heartbeat 실패 시 연결 종료
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// 서버 종료 시 인터벌 정리
wss.on('close', () => {
  clearInterval(interval);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행중입니다.`);
});
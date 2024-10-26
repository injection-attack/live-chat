import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (!userString) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(userString);
    setCurrentUser(userData);

    // WebSocket 연결
    const connectWebSocket = (userData) => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('Connected to server');
        setConnected(true);
        // 로그인 메시지 전송
        ws.current.send(JSON.stringify({
          type: 'login',
          userId: userData.id
        }));
      };

      ws.current.onmessage = (event) => {
        console.log('Message received:', event.data);
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'userList') {
            setOnlineUsers(data.users);
          } else if (data.type === 'message') {
            setMessages(prev => [...prev, data]);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('Disconnected from server');
        setConnected(false);
      };
    };

    connectWebSocket(userData);

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [navigate]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && ws.current?.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'message',
        content: newMessage,
        timestamp: new Date().toISOString(),
        sender: currentUser
      };
      
      ws.current.send(JSON.stringify(messageData));
      setMessages(prev => [...prev, messageData]);
      setNewMessage('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="grid grid-cols-4 gap-4">
        {/* 온라인 사용자 목록 */}
        <div className="col-span-1 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Online Users</h3>
          <div className="space-y-2">
            {onlineUsers.map((user) => (
              <div key={user.id} className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <span>{user.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 채팅 창 */}
        <div className="col-span-3 bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <div className="h-96 overflow-y-auto mb-4 border rounded p-4">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`mb-2 ${msg.sender.id === currentUser?.id ? 'text-right' : 'text-left'}`}
              >
                <div className="inline-block max-w-xs lg:max-w-md">
                  <div className="text-xs text-gray-500 mb-1">
                    {msg.sender.name}
                  </div>
                  <div className={`rounded p-2 ${
                    msg.sender.id === currentUser?.id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="break-words">{msg.content}</p>
                    <span className={`text-xs ${
                      msg.sender.id === currentUser?.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 border rounded-l px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Type a message..."
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-r hover:bg-blue-600 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
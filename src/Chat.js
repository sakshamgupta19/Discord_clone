import React, { useState, useEffect } from 'react';
import './Chat.css';
import ChatHeader from './ChatHeader';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import CradGiftcardIcon from '@material-ui/icons/CardGiftcard';
import GifIcon from '@material-ui/icons/Gif';
import EmojiEmoticonsIcon from '@material-ui/icons/EmojiEmotions';
import Message from './Message';
import { useSelector } from 'react-redux';
import { selectUser } from './features/userSlice';
import { selectChannelId, selectChannelName } from './features/appSlice';
import { db, FieldValue } from './firebase'; // use centralized exports

const Chat = () => {
  const user = useSelector(selectUser);
  const channelId = useSelector(selectChannelId);
  const channelName = useSelector(selectChannelName);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (channelId) {
      const unsubscribe = db
        .collection('channels')
        .doc(channelId)
        .collection('messages')
        .orderBy('timestamp', 'desc')
        .onSnapshot(snapshot => {
          setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

      return () => unsubscribe();
    } else {
      setMessages([]);
    }
  }, [channelId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!channelId || !input.trim()) return;

    db.collection('channels').doc(channelId).collection('messages').add({
      message: input,
      user: user,
      timestamp: FieldValue.serverTimestamp()
    });

    setInput('');
  };

  return (
    <div className="chat">
      <ChatHeader channelName={channelName} />

      <div className="chat__messages">
        {messages.map(({ id, message, timestamp, user }) => (
          <Message key={id} message={message} timestamp={timestamp} user={user} />
        ))}
      </div>

      <div className="chat__input">
        <AddCircleIcon fontSize="large" />
        <form>
          <input
            type="text"
            disabled={!channelId}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message #${channelName}`}
          />
          <button className="chat__inputButton" onClick={sendMessage} disabled={!channelId} type="submit">
            Send Message
          </button>
        </form>

        <div className="chat__inputIcon">
          <CradGiftcardIcon fontSize="large" />
          <GifIcon fontSize="large" />
          <EmojiEmoticonsIcon fontSize="large" />
        </div>
      </div>
    </div>
  );
};

export default Chat;

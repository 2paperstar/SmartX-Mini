import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/post', { title, username, password, content });
      navigate('/');
    } catch (err) {
      setError('게시글 작성에 실패했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div><input placeholder="제목" value={title} onChange={e => setTitle(e.target.value)} required /></div>
      <div><input placeholder="닉네임" value={username} onChange={e => setUsername(e.target.value)} required /></div>
      <div><input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required /></div>
      <div><textarea placeholder="본문" value={content} onChange={e => setContent(e.target.value)} required /></div>
      <button type="submit">작성</button>
    </form>
  );
}

export default CreatePost;
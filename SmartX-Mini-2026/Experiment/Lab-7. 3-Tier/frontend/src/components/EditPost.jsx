import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/post/${id}`)
      .then(({ data }) => {
        setTitle(data.title);
        setContent(data.content);
      })
      .catch(() => setError('게시글을 불러오는 중 오류가 발생했습니다.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async e => {
    e.preventDefault();
    try {
      await api.put(`/post/${id}`, { title, content, password });
      navigate(`/post/${id}`);
    } catch {
      setError('수정에 실패했습니다. 비밀번호를 확인하세요.');
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <form onSubmit={handleUpdate} style={{ padding: '1rem' }}>
      <div><input value={title} onChange={e => setTitle(e.target.value)} required /></div>
      <div><textarea value={content} onChange={e => setContent(e.target.value)} required /></div>
      <div><input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required /></div>
      <button type="submit">수정</button>
    </form>
  );
}

export default EditPost;
import React, { useState } from 'react';
import api from '../api';

function CommentItem({ comment, postId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState('');
  const [content, setContent] = useState(comment.content);
  const [error, setError] = useState(null);
  const [isTryDelete, setIsTryDelete] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const handleEdit = async e => {
    e.preventDefault();
    try {
      const { data } = await api.patch(
        `/post/${postId}/comment/${comment.id}`,
        { content, password }
      );
      setContent(data.content);
      setIsEditing(false);
      setPassword('');
      setError(null);
    } catch {
      setError('비밀번호가 일치하지 않거나 수정에 실패했습니다.');
    }
  };

  const handleDelete = async e => {
    e.preventDefault();
    try {
      const { data } = await api.delete(
        `/post/${postId}/comment/${comment.id}`,
        { data: {password } }
      );
      setIsTryDelete(false);
      setPassword('');
      setError(null);
      setIsDeleted(true); 
    } catch {
      setError('비밀번호가 일치하지 않거나 삭제에 실패했습니다.');
    }
  }

  if (isDeleted) return (<></>)
  else return (
    <div style={{ border: '1px solid #ddd', padding: '0.5rem', margin: '0.5rem 0' }}>
      <p> <strong>{comment.username}</strong> <small>(작성일: {new Date(comment.created_at).toLocaleString('ko-KR')})</small> </p>
      {isEditing ? (
        <form onSubmit={handleEdit} style={{ marginTop: '0.5rem' }}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <textarea value={content} onChange={e => setContent(e.target.value)} required style={{ width: '100%', minHeight: '4rem' }} />
          <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required style={{ display: 'block', margin: '0.5rem 0' }} />
          <button type="submit">수정</button>
          <button type="button" onClick={() => { setPassword(''); setIsEditing(false); setError(null); }}>취소</button>
        </form>
      ) : (
        <></>
      )}
      
      {isTryDelete ? (
        <form onSubmit={handleDelete} style={{ marginTop: '0.5rem' }}>
          <p>{content}</p>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required style={{ display: 'block', margin: '0.5rem 0' }} />
          <button type="submit">삭제</button>
          <button type="button" onClick={() => { setPassword(''); setIsTryDelete(false); setError(null); }}>취소</button>
        </form>
        )
        : (
          <></>
        )
      }

      {!isTryDelete && !isEditing ? (
        <>
        <p>{content}</p>
        <button onClick={() => {setPassword(''); setIsEditing(true)}}>수정</button>
        <button onClick={() => {setPassword(''); setIsTryDelete(true)}}>삭제</button>
        </>
        )
        : (
        <></>
        )
      }
    </div>
  );
}

export default CommentItem;
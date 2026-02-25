import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import CommentItem from './CommentItem';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState('');
  const [tryDelete, setTryDelete] = useState(false);

  const [commentUsername, setCommentUsername] = useState('');
  const [commentPassword, setCommentPassword] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [commentError, setCommentError] = useState(null);

  useEffect(() => {
    api.get(`/post/${id}`)
      .then(({ data }) => setPost(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleComment = async e => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/post/${id}/comment`, {
        username: commentUsername,
        password: commentPassword,
        content: commentContent
      });
      setPost(prev => ({ ...prev, comments: [...prev.comments, data] }));
      setCommentUsername('');
      setCommentPassword('');
      setCommentContent('');
      setCommentError(null);
    } catch (e) {
      console.error(e)
      setCommentError('댓글 작성에 실패했습니다.');
    }
  };

  const handleDelete = async e => {
    e.preventDefault();
    const { data } = await api.delete(`/post/${id}`, {
      data: { password }
    })
    navigate('/')
  }

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>게시글을 불러오는 중 오류가 발생했습니다.</p>;
  if (!post) return <p>게시글이 없습니다.</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>{post.title}</h2>
      <p>작성자: {post.username}</p>
      <p>작성일: {new Date(post.created_at).toLocaleString('ko-KR')}</p>
      <p>{post.content}</p>
      
      {
        tryDelete ?
        <form onSubmit={handleDelete}>
          <input type="password" placeholder='패스워드 확인' value={password} onChange={e => setPassword(e.target.value)} required />
          <br/>
          <button type='submit'> 삭제 </button>
          <button type='button' onClick={()=>setTryDelete(false)}> 취소 </button>
        </form>
        :
        <>
        <button onClick={() => navigate(`/edit/${id}`)}>수정</button>
        <button onClick={() => {setPassword(''); setTryDelete(true)}}>삭제</button>
        </>
      }
      

      <form onSubmit={handleComment} style={{ margin: '1rem 0' }}>
        <h3>댓글 작성</h3>
        {commentError && <p style={{ color: 'red' }}>{commentError}</p>}
        <div><input placeholder="닉네임" value={commentUsername} onChange={e => setCommentUsername(e.target.value)} required /></div>
        <div><input type="password" placeholder="비밀번호" value={commentPassword} onChange={e => setCommentPassword(e.target.value)} required /></div>
        <div><textarea placeholder="댓글 내용" value={commentContent} onChange={e => setCommentContent(e.target.value)} required /></div>
        <button type="submit">댓글 작성</button>
      </form>

      <div>
        <h3>댓글 목록</h3>
        {post.comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} postId={id} />
        ))}
      </div>
    </div>
  );
}

export default PostDetail;
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function PostList() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 의존성 배열이 비어있으므로, Load 시점에서 1회만 실행된다.
  useEffect(() => {
    api.get('/post')
      .then(({ data }) => setPosts(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  const searchPosts = async e  => {
    e.preventDefault();
    setLoading(true)
    try {
      const { data } = await api.get('/post', {
        params: { keyword: searchTerm }
      });
      setPosts(data)
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  //const filtered = posts.filter(p => p.title.includes(searchTerm));

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>게시글을 불러오는 중 오류가 발생했습니다.</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <form onSubmit={searchPosts}>
          <input
            type="text"
            placeholder="제목 검색"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ padding: '0.5rem', width: '200px' }}
          />
          <button type="submit"> 검색 </button>
        </form>
        <button onClick={() => navigate('/create')}>게시글 작성</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '0.5rem' }}>번호</th>
            <th style={{ border: '1px solid #ddd', padding: '0.5rem' }}>제목</th>
            <th style={{ border: '1px solid #ddd', padding: '0.5rem' }}>작성자</th>
            <th style={{ border: '1px solid #ddd', padding: '0.5rem' }}>작성일</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => (
            <tr key={post.id}>
              <td style={{ border: '1px solid #ddd', padding: '0.5rem' }}>{post.id}</td>
              <td style={{ border: '1px solid #ddd', padding: '0.5rem' }}>
                <Link to={`/post/${post.id}`}>{post.title}</Link>
              </td>
              <td style={{ border: '1px solid #ddd', padding: '0.5rem' }}>{post.username}</td>
              <td style={{ border: '1px solid #ddd', padding: '0.5rem' }}>
                {new Date(post.created_at).toLocaleString('ko-KR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PostList;

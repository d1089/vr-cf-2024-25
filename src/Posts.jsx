import React, { useEffect, useState } from "react";

const Posts = () => {
  const [posts, setPost] = useState([]);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then((res) => res.json())
      .then((data) => setPost(data));
  }, []);

  return (
    <div>
      {posts &&
        posts.map((post) => (
          <div key={post.id}>
            <div>
              UserId: <p>{post.userId}</p>
            </div>
            <div>
              Title: <p>{post.title}</p>
            </div>
            <textarea>{post.body}</textarea>
          </div>
        ))}
    </div>
  );
};

export default Posts;

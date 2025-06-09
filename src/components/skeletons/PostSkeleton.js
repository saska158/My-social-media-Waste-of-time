const PostSkeleton = () => {
  return (
    <div className="post-container skeleton" style={{height: '400px'}}>
      <div className="post-header-container">
        <div className="user-img user-img-medium" style={{background: '#5c3d2a'}}></div>
        <div style={{background: '#5c3d2a', width: '100px', height: '30px', borderRadius: '15px'}}></div>
      </div>
      <div style={{width: '80%', height: '250px', background: '#5c3d2a', borderRadius: '15px'}}></div>
    </div>
  )
}

export default PostSkeleton
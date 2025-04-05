const PostSkeleton = () => {
  return (
    <div className="post-container skeleton" style={{height: '400px'}}>
      <div className="post-header-container">
        <div className="post-header-profile-image" style={{background: '#facdd4'}}></div>
        <div style={{background: '#facdd4', width: '100px', height: '30px', borderRadius: '15px'}}></div>
      </div>
      <div style={{width: '80%', height: '250px', background: '#facdd4', borderRadius: '15px'}}></div>
    </div>
  )
}

export default PostSkeleton
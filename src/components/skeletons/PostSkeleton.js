const PostSkeleton = () => {
  return (
    <div className="post-container skeleton" style={{height: '400px', width: '400px'}}>
      <div className="post-header-container">
        <div className="user-img user-img-medium" style={{background: '#eaf4f0'}}></div>
        <div style={{background: '#eaf4f0', width: '100px', height: '30px', borderRadius: '15px'}}></div>
      </div>
      <div style={{width: '80%', height: '250px', background: '#eaf4f0', borderRadius: '15px'}}></div>
    </div>
  )
}

export default PostSkeleton
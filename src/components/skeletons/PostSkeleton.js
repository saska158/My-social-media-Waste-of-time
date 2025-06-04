const PostSkeleton = () => {
  return (
    <div className="post-container skeleton" style={{height: '400px', width: '100%'}}>
      <div className="post-header-container">
        <div className="post-header-profile-image" style={{background: 'rgb(126, 84, 58)'}}></div>
        <div style={{background: 'rgb(126, 84, 58)', width: '100px', height: '30px', borderRadius: '15px'}}></div>
      </div>
      <div style={{width: '80%', height: '250px', background: 'rgb(126, 84, 58)', borderRadius: '15px'}}></div>
    </div>
  )
}

export default PostSkeleton
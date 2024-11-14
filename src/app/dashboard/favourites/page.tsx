'use client'
import FileBrowser from "../_components/file-browser"

export default (

) => {
  return (
    <div className='w-full'>
      <FileBrowser title="Your Favourites" favourites={true} />
    </div>
  )
}

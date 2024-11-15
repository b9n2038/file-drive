
'use client'
import FileBrowser from '../_components/file-browser'

export default function FilesPage() {
  return (
    <div className='w-full'>
      <h1 className='text-4xl font-bold'>Your Files</h1>
      <FileBrowser title="Your Files" />
    </div>
  )
}

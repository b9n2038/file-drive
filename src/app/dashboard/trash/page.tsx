'use client'
import FileBrowser from '../_components/file-browser'

export default function TrashPage() {
  return (
    <div className="w-full">
      <FileBrowser title="Your Trash" deletedOnly={true} />
    </div>
  )
}

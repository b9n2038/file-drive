'use client'
import FileBrowser from '../_components/file-browser'

export default function FavouritesPage() {
  return (
    <div className="w-full">
      <FileBrowser title="Your Favourites" favouritesOnly={true} />
    </div>
  )
}

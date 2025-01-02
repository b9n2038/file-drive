'use client'
import { useOrganization, useSession, useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { api } from '../../../../convex/_generated/api'
import { FileCard } from './file-card'
import SearchBar from './search-bar'
import UploadButton from './upload-button'

function Placeholder() {
  return (
    <div className="flex flex-col mt-24 gap-8 mx-auto w-full items-center">
      <Image alt="an image of a picture and directory icon" width="300" height="300" src="/empty.svg" />
      <div className="text-2xl">You have no files, upload one now</div>
      <UploadButton />
    </div>
  )
}

export default function FileBrowser({
  title,
  favouritesOnly,
  deletedOnly
}: {
  title: string
  favouritesOnly?: boolean
  deletedOnly?: boolean
}) {
  const { session } = useSession()
  console.log(session)
  const organization = useOrganization()
  const [query, setQuery] = useState('')
  const user = useUser()

  let orgId: string | undefined = undefined
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization?.organization?.id ?? user.user?.id
  }

  const favourites = useQuery(api.files.getAllFavourites, orgId ? { orgId } : 'skip')

  const files = useQuery(
    api.files.getFiles,
    orgId ? { orgId, query, favourites: favouritesOnly, deleted: deletedOnly } : 'skip'
  )

  const isLoading = files === undefined

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">{title}</h1>
        <SearchBar query={query} setQuery={setQuery} />
        <UploadButton />
      </div>
      <div>
        {isLoading && (
          <div className="flex flex-col gap-8 w-full items-center mt-24">
            <Loader2 className="h-32 w-32 animate-spin text-gray-500" />
            <div className="text-2xl">Loading your images...</div>
          </div>
        )}

        {!isLoading && query.length === 0 && files?.length === 0 && <Placeholder />}

        <div className="grid grid-cols-4 gap-2">
          {files?.map((file) => {
            return <FileCard key={file._id} file={file} favourites={favourites ?? []} />
          })}
        </div>
      </div>
    </div>
  )
}

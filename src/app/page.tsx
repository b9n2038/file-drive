'use client'
import { SignedIn, SignedOut, SignInButton, SignOutButton, useOrganization, useSession, useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import UploadButton from './upload-button'
import { Button } from '../components/ui/button'
import Image from 'next/image'
import { FileCard } from './file-card'
import { Loader2 } from 'lucide-react'
import SearchBar from './search-bar'
import { useState } from 'react'

export default function Home() {
  const { session } = useSession()
  console.log(session)
  const organization = useOrganization()
  const [query, setQuery] = useState('')
  const user = useUser()

  let orgId: string | undefined = undefined
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization?.organization?.id ?? user.user?.id
  }
  const files = useQuery(api.files.getFiles, orgId ? { orgId, query } : 'skip')

  const isLoading = files === undefined

  return (
    <main className="container mx-auto pt-12">
      {isLoading && (
        <div className='flex flex-col gap-8 w-full items-center mt-24'>
          <Loader2 className='h-32 w-32 animate-spin text-gray-500' />
          <div className='text-2xl'>Loading your images...</div>
        </div>
      )}
      {!isLoading && !query && files?.length === 0 && (
        <div className='flex flex-col mt-24 gap-8 mx-auto w-full items-center'>
          <Image
            alt="an image of a picture and directory icon"
            width="300"
            height="300"
            src="/empty.svg"
          />
          <div className='text-2xl'>You have no files, upload one now</div>
          <UploadButton />
        </div>
      )}

      {!isLoading && (

        <>
          <div className='flex justify-between items-center mb-8'>
            <h1 className='text-4xl font-bold'>Your Files</h1>
            <SearchBar query={query} setQuery={setQuery} />

            <UploadButton />
          </div>

          {query.length === 0 && files?.length === 0 && (
            <div className='flex flex-col mt-24 gap-8 mx-auto w-full items-center'>
              <Image
                alt="an image of a picture and directory icon"
                width="300"
                height="300"
                src="/empty.svg"
              />
              <div className='text-2xl'>You have no files, upload one now</div>
              <UploadButton />
            </div>
          )}

          {query.length > 0 && files?.length === 0 && (
            <span>not found</span>
          )}

          <div className='grid grid-cols-4 gap-2'>
            {files?.map((file) => {
              return <FileCard key={file._id} file={file} />
            })}
          </div>
        </>
      )}

      <SignedIn>
        <SignOutButton>
          <Button>Sign Out World</Button>
        </SignOutButton>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button>Sign In</Button>
        </SignInButton>
      </SignedOut>
    </main>
  )
}

'use client'
import { SignedIn, SignedOut, SignInButton, SignOutButton, useOrganization, useSession, useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import UploadButton from './upload-button'
import { Button } from '@/components/ui/button'
import { FileCard } from './file-card'


export default function Home() {
  const { session } = useSession()
  console.log(session)
  const organization = useOrganization()
  const user = useUser()

  let orgId: string | undefined = undefined
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization?.organization?.id ?? user.user?.id
  }
  const files = useQuery(api.files.getFiles, orgId ? { orgId } : 'skip')


  return (
    <main className="container mx-auto pt-12">
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-4xl font-bold'>Your Files</h1>
        <UploadButton />
      </div>

      <div className='grid grid-cols-4 gap-2'>
        {files?.map((file) => {
          return <FileCard key={file._id} file={file} />
          //<div key={file._id}>{file.name}</div>
        })}
      </div>
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

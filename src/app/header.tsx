import { Button } from '@/components/ui/button'
import { OrganizationSwitcher, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

export function Header() {
  return (
    <div className="border-b py-4 bg-gray-50">
      <div className="container mx-auto justify-between flex items-center">
        <Link href="/" className="flex gap-2 items-center text-xl">
          <Image src="/logo.png" width={40} height={40} alt="file drive logo" />
          File Drive
        </Link>
        <div className="flex gap-2">
          <SignedIn>
            <Button variant={'outline'}>
              <Link href="/dashboard/files">Your Files</Link>
            </Button>
          </SignedIn>
        </div>
        <div className="flex gap-2">
          <OrganizationSwitcher />
          <UserButton />
          <SignedOut>
            <SignInButton>
              <Button>Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </div>
  )
}

import { Button } from '@/components/ui/button'
import { UserButton, OrganizationSwitcher, SignedIn, SignedOut, SignIn, SignInButton } from '@clerk/nextjs'
import Link from 'next/link'

export function Header() {
  return <div className="border-b py-4 bg-gray-50">
    <div className="container mx-auto justify-between flex items-center">
      <div>File Drive</div>
      <div className="flex gap-2">
        <SignedIn>
          <Button variant={"outline"}>
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
}

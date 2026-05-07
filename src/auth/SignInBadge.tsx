import React, { useState } from 'react';
import * as Clerk from '@clerk/clerk-react';
import { isAuthConfigured } from './AuthProvider';
import RosterEditor from '../components/RosterEditor';
import './SignInBadge.css';

const SignedIn = Clerk.SignedIn as React.ComponentType<{ children: React.ReactNode }>;
const SignedOut = Clerk.SignedOut as React.ComponentType<{ children: React.ReactNode }>;
const SignInButton = Clerk.SignInButton as React.ComponentType<{
  mode?: 'modal' | 'redirect';
  children: React.ReactNode;
}>;
const UserButton = Clerk.UserButton as React.ComponentType<{ afterSignOutUrl?: string }>;

export function SignInBadge() {
  const [isRosterOpen, setIsRosterOpen] = useState(false);

  if (!isAuthConfigured()) return null;

  return (
    <>
      <div className="sign-in-badge">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="sign-in-button" type="button">
              Sign in
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <button
            type="button"
            className="sign-in-button"
            onClick={() => setIsRosterOpen(true)}
          >
            Roster
          </button>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
      <RosterEditor isOpen={isRosterOpen} onClose={() => setIsRosterOpen(false)} />
    </>
  );
}

"use client";
import React, { useState } from 'react';
import { useAuth } from '../../../components/auth/auth-context';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="bg-white shadow rounded p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign in to IPMS</h1>
      <form onSubmit={(e) => { e.preventDefault(); login(email, password); }} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full border px-3 py-2 rounded" />
        </div>
        <div className="flex items-center justify-between">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Sign in</button>
          <a href="#" className="text-sm text-blue-600">Forgot password?</a>
        </div>
      </form>
    </div>
  );
}

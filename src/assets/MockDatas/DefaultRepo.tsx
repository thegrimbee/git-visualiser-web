import type { MockData } from '../MockData'

export const defaultRepo: MockData = {
    name: 'Default Repository',
    description: 'A sample repository for testing purposes',
    objects: [
    {
      hash: 'a7f3c2e4d8b9a1c5',
      type: 'commit',
      size: 256,
      tree: 'e7a3f2d8c1b5e4a9',
      parent: ['b4e5d1a3c7f2e8b9'],
      author: 'Alice <alice@example.com>',
      message: 'Add user authentication',
      timestamp: '2026-01-15 14:30:00',
      referencedBy: [],
    },
    {
      hash: 'b4e5d1a3c7f2e8b9',
      type: 'commit',
      size: 243,
      tree: 'f1d4e8a2c9b6f3e7',
      parent: ['c8f2a3b1e5d7a9c4'],
      author: 'Bob <bob@example.com>',
      message: 'Update README.md',
      timestamp: '2026-01-15 11:15:00',
      referencedBy: ['a7f3c2e4d8b9a1c5'],
    },
    {
      hash: 'c8f2a3b1e5d7a9c4',
      type: 'commit',
      size: 251,
      tree: '631d9e3f7b1d4a8',
      parent: [],
      author: 'Alice <alice@example.com>',
      message: 'Initial commit',
      timestamp: '2026-01-12 09:00:00',
      referencedBy: ['b4e5d1a3c7f2e8b9'],
    },
    {
      hash: 'e7a3f2d8c1b5e4a9',
      type: 'tree',
      size: 128,
      names: ['test repo'],
      entries: [
        { mode: '100644', type: 'blob', hash: 'c2a6d9e3f7b1d4a8', name: 'Auth.tsx' },
        { mode: '100644', type: 'blob', hash: 'a9d3f6e2b8c4d1a7', name: 'Login.tsx' },
        { mode: '040000', type: 'tree', hash: 'abc123def456ghi7', name: 'utils' },
      ],
      referencedBy: ['a7f3c2e4d8b9a1c5'],
    },
    {
      hash: 'f1d4e8a2c9b6f3e7',
      type: 'tree',
      size: 96,
      names: ['test repo'],
      entries: [
        { mode: '100644', type: 'blob', hash: 'b1c8e4d9a3f7b2e6', name: 'api.ts' },
        { mode: '040000', type: 'tree', hash: 'abc123def456ghi7', name: 'utils' },
      ],
      referencedBy: ['b4e5d1a3c7f2e8b9'],
    },
    {
      hash: '631d9e3f7b1d4a8',
      type: 'tree',
      size: 96,
      names: ['test repo'],
      entries: [
        { mode: '100644', type: 'blob', hash: 'b1c8e4d9a3f7b2e6', name: 'api-renamed.ts' }
      ],
      referencedBy: ['c8f2a3b1e5d7a9c4'],
    },
    {
      hash: 'abc123def456ghi7',
      type: 'tree',
      size: 96,
      names: ['utils'],
      entries: [
        { mode: '100644', type: 'blob', hash: 'd5e2a8f3c7b4d9a1', name: 'README.md' },
        { mode: '040000', type: 'tree', hash: 'fgh789ijk012lmn3', name: 'utils' },
      ],
      referencedBy: ['f1d4e8a2c9b6f3e7'],
    },
    {
      hash: 'fgh789ijk012lmn3',
      type: 'tree',
      size: 96,
      names: ['utils'],
      entries: [
      ],
      referencedBy: ['abc123def456ghi7'],
    },
    {
      hash: 'c2a6d9e3f7b1d4a8',
      type: 'blob',
      size: 1847,
      names: ['Auth.tsx'],
      content: `import { useState } from 'react';
  import { login, logout } from '@renderer/utils/api';

  export function Auth() {
    const [user, setUser] = useState(null);
    
    const handleLogin = async (email: string, password: string) => {
      const result = await login(email, password);
      setUser(result.user);
    };
    
    return (
      <div>
        {user ? (
          <button onClick={() => logout()}>Logout</button>
        ) : (
          <LoginForm onSubmit={handleLogin} />
        )}
      </div>
    );
  }`,
      referencedBy: ['e7a3f2d8c1b5e4a9'],
    },
    {
      hash: 'a9d3f6e2b8c4d1a7',
      type: 'blob',
      size: 2134,
      names: ['Login.tsx'],
      content: `import { useState } from 'react';
  import { Button } from './ui/button';
  import { Input } from './ui/input';

  export function LoginForm({ onSubmit }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(email, password);
      }}>
        <Input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <Input 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <Button type="submit">Login</Button>
      </form>
    );
  }`,
      referencedBy: ['e7a3f2d8c1b5e4a9'],
    },
    {
      hash: 'b1c8e4d9a3f7b2e6',
      type: 'blob',
      size: 892,
      names: ['api.ts', 'api-renamed.ts'],
      content: `const API_URL = 'https://api.example.com';

  export async function login(email: string, password: string) {
    const response = await fetch(\`\${API_URL}/auth/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  export async function logout() {
    await fetch(\`\${API_URL}/auth/logout\`, { method: 'POST' });
  }`,
      referencedBy: ['f1d4e8a2c9b6f3e7', '631d9e3f7b1d4a8'],
    },
    {
      hash: 'd5e2a8f3c7b4d9a1',
      type: 'blob',
      size: 543,
      names: ['README.md'],
      content: `# My Project

  A simple authentication application.

  ## Features
  - User login
  - User logout
  - Session management

  ## Installation
  \`\`\`bash
  npm install
  npm start
  \`\`\``,
      referencedBy: ['f1d4e8a2c9b6f3e7'],
    },
  ]}
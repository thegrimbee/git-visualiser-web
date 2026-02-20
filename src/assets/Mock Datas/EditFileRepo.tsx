import type { MockData } from '../MockData'

export const editFileRepo: MockData = {
    name: 'File Edit Example',
    description: 'A sample repository to show file editing',
    objects: [
        {
            hash: 'd1e2f3a4b5c6d7e8',
            type: 'commit',
            size: 200,
            tree: 'a1b2c3d4e5f6g7h8',
            parent: ['e1f2a3b4c5d6e7f8'],
            author: 'Bob <bob@example.com>',
            message: 'Edit README.md',
            timestamp: '2026-01-15 16:45:00',
            referencedBy: [],
        },
        {
            hash: 'e1f2a3b4c5d6e7f8',
            type: 'commit',
            size: 210,
            tree: '56f7g8h9i0j1k2l3',
            parent: [],
            author: 'Bob <bob@example.com>',
            message: 'Initial commit with README',
            timestamp: '2026-01-14 10:00:00',
            referencedBy: ['d1e2f3a4b5c6d7e8'],
        },
        {
            hash: 'a1b2c3d4e5f6g7h8',
            type: 'tree',
            size: 64,
            names: ['edit-repo'],
            entries: [
                { mode: '100644', type: 'blob', hash: 'f1e2d3c4b5a6g7h8', name: 'README.md' },
            ],
            referencedBy: ['d1e2f3a4b5c6d7e8']
        },
        {
            hash: '56f7g8h9i0j1k2l3',
            type: 'tree',
            size: 64,
            names: ['edit-repo'],
            entries: [
                { mode: '100644', type: 'blob', hash: 'ce5623b7892ab890', name: 'README.md' },
            ],
            referencedBy: ['e1f2a3b4c5d6e7f8']
        },
        {
            hash: 'f1e2d3c4b5a6g7h8',
            type: 'blob',
            size: 512,
            names: ['README.md'],
            content: `# Edit Example
This repository demonstrates file editing in Git.

This file has been edited in the latest commit to show how file changes are represented in Git.`,
            referencedBy: ['a1b2c3d4e5f6g7h8']
        },
        {
            hash: 'ce5623b7892ab890',
            type: 'blob',
            size: 512,
            names: ['README.md'],
            content: `# Edit Example
This repository demonstrates file editing in Git.

This is the initial version of the README file before editing.`,
            referencedBy: ['56f7g8h9i0j1k2l3']
        },
    ]
}
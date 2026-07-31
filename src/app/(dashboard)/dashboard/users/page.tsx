import React from 'react';
import Image from 'next/image';
import { UserService } from '@/services/user.service';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export default async function UsersPage() {
  const users = await UserService.getUsers();

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground">Manage platform authors, administrators, and readers.</p>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground border-b border-border font-medium">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Articles</th>
              <th className="p-4">Followers</th>
              <th className="p-4">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <Image src={u.avatar} alt={u.name} width={36} height={36} className="rounded-full" />
                  <div>
                    <div className="font-bold text-foreground">{u.name}</div>
                    <div className="text-xs text-muted-foreground">@{u.username}</div>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant={u.role === 'admin' ? 'accent' : 'secondary'}>{u.role.toUpperCase()}</Badge>
                </td>
                <td className="p-4 font-mono text-xs">{u.articlesCount}</td>
                <td className="p-4 font-mono text-xs">{u.followersCount.toLocaleString()}</td>
                <td className="p-4 text-xs text-muted-foreground">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

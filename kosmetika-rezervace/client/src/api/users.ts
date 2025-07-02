export type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

export async function getAllUsers(): Promise<User[]> {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/admin/users', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Chyba při načítání uživatelů');
  return await response.json();
}

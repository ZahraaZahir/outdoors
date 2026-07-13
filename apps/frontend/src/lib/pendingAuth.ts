let pendingPassword: string | null = null;

export function setPendingPassword(password: string) {
  pendingPassword = password;
}

export function consumePendingPassword(): string | null {
  const pw = pendingPassword;
  pendingPassword = null;
  return pw;
}

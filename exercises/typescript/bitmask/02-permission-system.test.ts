import { describe, it, expect } from 'vitest';

/**
 * Bitmask - Intermediate: Build a permission system.
 *
 * TODO: Implement the functions below to create a role-based
 * permission system using bitmask flags.
 */

const Permission = {
  NONE: 0,
  READ: 1 << 0,
  WRITE: 1 << 1,
  DELETE: 1 << 2,
  ADMIN: 1 << 3,
} as const;

type PermissionFlags = number;

/** Combine multiple permissions into a single role value */
function createRole(...perms: number[]): PermissionFlags {
  return perms.reduce((acc, p) => acc | p, 0); // TODO: implement
}

/** Check if role has a specific permission (or all bits in perm) */
function hasPermission(role: PermissionFlags, perm: number): boolean {
  return (role & perm) === perm; // TODO: implement
}

/** Check if role has ANY of the permissions in mask */
function hasAnyPermission(role: PermissionFlags, mask: number): boolean {
  return (role & mask) !== 0; // TODO: implement
}

/** Add a permission to a role */
function grant(role: PermissionFlags, perm: number): PermissionFlags {
  return role | perm; // TODO: implement
}

/** Remove a permission from a role */
function revoke(role: PermissionFlags, perm: number): PermissionFlags {
  return role & ~perm; // TODO: implement
}

/** List the names of all active permissions */
function listPermissions(role: PermissionFlags): string[] {
  const names: string[] = []; // TODO: implement — check each flag, push name if set
  if (role & Permission.READ) names.push('READ');
  if (role & Permission.WRITE) names.push('WRITE');
  if (role & Permission.DELETE) names.push('DELETE');
  if (role & Permission.ADMIN) names.push('ADMIN');
  return names;
}

// ─── Tests (do not modify below this line) ───────────────────────

describe('Bitmask - Intermediate: Permission System', () => {
  const VIEWER = createRole(Permission.READ);
  const EDITOR = createRole(Permission.READ, Permission.WRITE);
  const MODERATOR = createRole(Permission.READ, Permission.WRITE, Permission.DELETE);
  const SUPER_ADMIN = createRole(
    Permission.READ,
    Permission.WRITE,
    Permission.DELETE,
    Permission.ADMIN,
  );

  it('should create roles with correct flag values', () => {
    expect(VIEWER).toBe(0b0001);
    expect(EDITOR).toBe(0b0011);
    expect(MODERATOR).toBe(0b0111);
    expect(SUPER_ADMIN).toBe(0b1111);
  });

  it('should check individual permissions', () => {
    expect(hasPermission(VIEWER, Permission.READ)).toBe(true);
    expect(hasPermission(VIEWER, Permission.WRITE)).toBe(false);
    expect(hasPermission(EDITOR, Permission.WRITE)).toBe(true);
    expect(hasPermission(EDITOR, Permission.DELETE)).toBe(false);
  });

  it('should check compound permissions', () => {
    const editAccess = Permission.READ | Permission.WRITE;
    expect(hasPermission(EDITOR, editAccess)).toBe(true);
    expect(hasPermission(VIEWER, editAccess)).toBe(false);
  });

  it('should check if any permission matches', () => {
    const writeOrDelete = Permission.WRITE | Permission.DELETE;
    expect(hasAnyPermission(VIEWER, writeOrDelete)).toBe(false);
    expect(hasAnyPermission(EDITOR, writeOrDelete)).toBe(true);
  });

  it('should grant and revoke permissions', () => {
    expect(hasPermission(grant(VIEWER, Permission.WRITE), Permission.WRITE)).toBe(true);
    expect(hasPermission(revoke(EDITOR, Permission.WRITE), Permission.WRITE)).toBe(false);
  });

  it('should list active permissions', () => {
    expect(listPermissions(VIEWER)).toEqual(['READ']);
    expect(listPermissions(EDITOR)).toEqual(['READ', 'WRITE']);
    expect(listPermissions(SUPER_ADMIN)).toEqual(['READ', 'WRITE', 'DELETE', 'ADMIN']);
    expect(listPermissions(Permission.NONE)).toEqual([]);
  });

  it('should be idempotent', () => {
    expect(grant(EDITOR, Permission.READ)).toBe(EDITOR);
    expect(revoke(VIEWER, Permission.DELETE)).toBe(VIEWER);
  });
});

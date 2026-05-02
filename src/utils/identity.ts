export interface IdentityShape {
  kind: 'USER' | 'GUEST'
  displayName: string
  discriminator?: string
  username?: string
}

/**
 * Renders a User or Guest identity as a single string label.
 * - User → "@username"
 * - Guest → "displayName#0001"
 */
export function identityLabel(i: IdentityShape): string {
  return i.kind === 'USER'
    ? `@${i.username ?? i.displayName}`
    : `${i.displayName}#${i.discriminator ?? ''}`
}

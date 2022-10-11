export default function normalizeAccount(account: string) {
  const [content, comment] = account.trim().split('#')
  if (comment) {
    return content + '#' + encodeURIComponent(comment)
  }
  return account.trim()
}

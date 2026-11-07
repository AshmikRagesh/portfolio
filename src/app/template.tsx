// A small page transition: unlike the layout, a template mounts afresh on every
// navigation, so each new page fades in with a slight rise (.page-enter in globals.css).
// The navbar, ruler and résumé sheet live in the layout above it and stay put.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}

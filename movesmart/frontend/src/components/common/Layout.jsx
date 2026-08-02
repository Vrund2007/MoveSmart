// components/common/Layout.jsx — App shell layout with nav and main content area (Architecture.md §5)
// TODO: implement Navbar with role-based nav links from AuthContext.role
// TODO: implement Footer
// TODO: render children in main content area
// TODO: nav uses secondary (#393E46) per Design.md §2.1
function Layout({ children }) {
  return (
    <div>
      <nav>Navbar — TODO</nav>
      <main>{children}</main>
      <footer>Footer — TODO</footer>
    </div>
  );
}
export default Layout;

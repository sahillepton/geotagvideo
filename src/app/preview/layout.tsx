const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="px-4 mt-4" suppressHydrationWarning>
      {children}
    </div>
  );
};

export default Layout;

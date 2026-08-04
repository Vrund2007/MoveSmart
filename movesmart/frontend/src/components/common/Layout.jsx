import React from 'react';
import MainLayout from './MainLayout';

/**
 * Layout wrapper delegating to MainLayout.
 */
const Layout = ({ children }) => {
  return <MainLayout>{children}</MainLayout>;
};

export default Layout;

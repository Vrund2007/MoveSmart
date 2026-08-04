import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/common/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

/**
 * 404 Not Found Page Component.
 */
const NotFound = () => {
  return (
    <MainLayout>
      <div className="flex justify-center items-center py-16">
        <Card className="max-w-md w-full text-center py-10 px-6">
          <h1 className="text-6xl font-extrabold text-primary mb-2">404</h1>
          <h2 className="text-xl font-bold text-text-primary mb-4">Page Not Found</h2>
          <p className="text-sm text-text-secondary mb-6">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link to="/">
            <Button variant="primary" size="md">
              Return to Home
            </Button>
          </Link>
        </Card>
      </div>
    </MainLayout>
  );
};

export default NotFound;

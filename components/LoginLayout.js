import React from 'react';

const LoginLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-4">{children}</div>
    </div>
  );
};

export default LoginLayout;

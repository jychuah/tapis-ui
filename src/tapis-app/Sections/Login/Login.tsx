import React from 'react';
import { Redirect } from 'react-router-dom';
import { Login as TapisLogin } from 'tapis-ui/components/authenticator';
import { SectionHeader } from 'tapis-ui/_common';
import { useTapisConfig } from 'tapis-hooks';

const Login: React.FC = () => {
  const { accessToken } = useTapisConfig();

  if (accessToken?.access_token) {
    return <Redirect to="/" />;
  }

  return (
    <>
      <SectionHeader>Login</SectionHeader>
      <div className="container">
        <TapisLogin />
      </div>
    </>
  );
};

export default Login;

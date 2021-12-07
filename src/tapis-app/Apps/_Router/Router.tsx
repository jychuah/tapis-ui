import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import JobLauncher from '../JobLauncher';
import { SectionMessage } from 'tapis-ui/_common';

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <SectionMessage type="info">
          Select an app from the list.
        </SectionMessage>
      </Route>

      <Route
        path={`${path}/:appId/:appVersion/launcher`}
        render={({
          history,
          match: {
            url,
            params: { appVersion, appId },
          },
        }: RouteComponentProps<{
          appId: string;
          appVersion: string;
        }>) => <JobLauncher appId={appId} appVersion={appVersion} history={history} url={url} />}
      />
    </Switch>
  );
};

export default Router;

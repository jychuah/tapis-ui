import * as Apps from '@tapis/tapis-typescript-apps';
import { apiGenerator, errorDecoder } from 'tapis-api/utils';

const detail = (params: Apps.GetAppRequest, basePath: string, jwt: string) => {
  const api: Apps.ApplicationsApi = apiGenerator<Apps.ApplicationsApi>(
    Apps,
    Apps.ApplicationsApi,
    basePath,
    jwt
  );
  return errorDecoder<Apps.RespApp>(() => api.getApp(params));
};

export default detail;

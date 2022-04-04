import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { WizardStep } from 'tapis-ui/_wrappers/Wizard';
import { QueryWrapper, Wizard } from 'tapis-ui/_wrappers';
import { WizardSubmitWrapper } from 'tapis-ui/_wrappers/Wizard';
import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';
import { JobStart, JobStartSummary } from './steps/JobStart';
import { FileInputs, FileInputsSummary } from './steps/FileInputs';
import { ExecSystem, ExecSystemSummary } from './steps/ExecSystem';
import { JobSubmission, JobSubmissionSummary } from './steps/JobSubmission';
import { ArchiveFilter, ArchiveFilterSummary } from './steps/ArchiveFilter';
import { EnvVariables, EnvVariablesSummary } from './steps/EnvVariables';
import {
  FileInputArrays,
  FileInputArraysSummary,
} from './steps/FileInputArrays';
import {
  generateRequiredFileInputsFromApp,
  fileInputsComplete,
} from 'tapis-api/utils/jobFileInputs';
import {
  generateRequiredFileInputArraysFromApp,
  fileInputArraysComplete,
} from 'tapis-api/utils/jobFileInputArrays';
import { jobRequiredFieldsComplete } from 'tapis-api/utils/jobRequiredFields';
import { Button } from 'reactstrap';
import { useSubmit } from 'tapis-hooks/jobs';
import { useDetail as useAppDetail } from 'tapis-hooks/apps';
import { useList as useSystemsList } from 'tapis-hooks/systems';
import { useJobLauncher, JobLauncherProvider } from './components';

type JobLauncherWizardProps = {
  appId: string;
  appVersion: string;
};

const generateDefaultValues = (
  app: Apps.TapisApp,
  systems: Array<Systems.TapisSystem>
): Partial<Jobs.ReqSubmitJob> => {
  const systemDefaultQueue = systems.find(
    (system) => system.id === app.jobAttributes?.execSystemId
  )?.batchDefaultLogicalQueue;
  const defaultValues: Partial<Jobs.ReqSubmitJob> = {
    name: `${app.id}-${app.version}-${new Date().toISOString().slice(0, -5)}`,
    appId: app.id,
    appVersion: app.version,
    execSystemId: app.jobAttributes?.execSystemId,
    execSystemLogicalQueue:
      app.jobAttributes?.execSystemLogicalQueue ?? systemDefaultQueue,
    fileInputs: generateRequiredFileInputsFromApp(app),
    fileInputArrays: generateRequiredFileInputArraysFromApp(app),
    parameterSet: {
      archiveFilter: app.jobAttributes?.parameterSet?.archiveFilter,
      envVariables: app.jobAttributes?.parameterSet?.envVariables
    },
  };
  return defaultValues;
};

const JobLauncherWizardSubmit: React.FC<{ app: Apps.TapisApp }> = ({ app }) => {
  const { job } = useJobLauncher();
  const isComplete =
    jobRequiredFieldsComplete(job) &&
    fileInputsComplete(app, job.fileInputs ?? []) &&
    fileInputArraysComplete(app, job.fileInputArrays ?? []);
  const { isLoading, error, isSuccess, submit, data } = useSubmit(
    app.id!,
    app.version!
  );
  const onSubmit = useCallback(() => {
    submit(job as Jobs.ReqSubmitJob);
  }, [submit, job]);
  return (
    <WizardSubmitWrapper
      isLoading={isLoading}
      error={error}
      success={
        isSuccess
          ? `Successfully submitted job ${data?.result?.uuid ?? ''}`
          : ''
      }
      title={`Job Submission Summary`}
    >
      <Button disabled={!isComplete} color="primary" onClick={onSubmit}>
        Submit
      </Button>
    </WizardSubmitWrapper>
  );
};

const JobLauncherWizard: React.FC<JobLauncherWizardProps> = ({
  appId,
  appVersion,
}) => {
  const { data, isLoading, error } = useAppDetail(
    { appId, appVersion },
    { refetchOnWindowFocus: false }
  );
  const {
    data: systemsData,
    isLoading: systemsIsLoading,
    error: systemsError,
  } = useSystemsList(
    { select: 'allAttributes' },
    { refetchOnWindowFocus: false }
  );
  const app = data?.result;
  const systems = useMemo(() => systemsData?.result ?? [], [systemsData]);
  const [defaultValues, setDefaultValues] = useState<
    Partial<Jobs.ReqSubmitJob>
  >({});
  useEffect(() => {
    if (app) {
      setDefaultValues(generateDefaultValues(app, systems));
    }
  }, [app, systems]);
  const generateSteps = (): Array<WizardStep> => [
    {
      id: 'start',
      name: `Job Name`,
      render: <JobStart />,
      summary: <JobStartSummary />,
    },
    {
      id: 'execSystem',
      name: 'Execution System',
      render: <ExecSystem />,
      summary: <ExecSystemSummary />,
    },
    {
      id: 'fileInputs',
      name: 'File Inputs',
      render: <FileInputs />,
      summary: <FileInputsSummary />,
    },
    {
      id: 'fileInputArrays',
      name: 'File Input Arrays',
      render: <FileInputArrays />,
      summary: <FileInputArraysSummary />,
    },
    {
      id: 'envVariables',
      name: 'Environment Variables',
      render: <EnvVariables />,
      summary: <EnvVariablesSummary />
    },
    {
      id: 'archiveFilter',
      name: 'Archive Filter',
      render: <ArchiveFilter />,
      summary: <ArchiveFilterSummary />,
    },
    {
      id: 'jobSubmission',
      name: 'Job Submission',
      render: <JobSubmission />,
      summary: <JobSubmissionSummary />,
    },
  ];

  return (
    <QueryWrapper
      isLoading={isLoading || systemsIsLoading}
      error={error || systemsError}
    >
      {app && (
        <JobLauncherProvider value={{ app, systems, defaultValues }}>
          <Wizard
            steps={generateSteps()}
            memo={`${app.id}${app.version}`}
            renderSubmit={<JobLauncherWizardSubmit app={app} />}
          />
        </JobLauncherProvider>
      )}
    </QueryWrapper>
  );
};

export default JobLauncherWizard;

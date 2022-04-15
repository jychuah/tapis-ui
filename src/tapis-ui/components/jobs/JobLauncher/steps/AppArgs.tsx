import React, { useMemo } from 'react';
import { Apps, Jobs } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import { useJobLauncher, StepSummaryField } from '../components';
import fieldArrayStyles from '../FieldArray.module.scss';
import { Collapse } from 'tapis-ui/_common';
import { FieldArray, useField, FieldArrayRenderProps } from 'formik';
import { FormikJobStepWrapper } from '../components';
import { FormikInput } from 'tapis-ui/_common';
import { FormikCheck } from 'tapis-ui/_common/FieldWrapperFormik';
import { getArgMode } from 'tapis-api/utils/jobArgs';
import * as Yup from 'yup';

type ArgFieldProps = {
  index: number;
  name: string;
  argType: string;
  arrayHelpers: FieldArrayRenderProps;
  inputMode?: Apps.ArgInputModeEnum;
};

const ArgField: React.FC<ArgFieldProps> = ({
  index,
  name,
  argType,
  arrayHelpers,
  inputMode,
}) => {
  const [field] = useField(`${name}.name`);
  const argName = useMemo(() => field.value, [field]);
  return (
    <Collapse
      key={`${argType}.${index}`}
      title={!!argName && argName.length ? argName : argType}
      className={fieldArrayStyles.item}
    >
      <FormikInput
        name={`${name}.name`}
        required={true}
        label="Name"
        disabled={!!inputMode}
        description={`The name for this ${argType} ${
          !!inputMode
            ? 'is defined in the application and cannot be changed'
            : ''
        }`}
      />
      <FormikInput
        name={`${name}.arg`}
        required={true}
        label="Value"
        disabled={inputMode === Apps.ArgInputModeEnum.Fixed}
        description={`A value for this ${argType}`}
      />
      <FormikInput
        name={`${name}.description`}
        required={false}
        label="Description"
        disabled={inputMode === Apps.ArgInputModeEnum.Fixed}
        description={`A description for this ${argType}`}
      />
      <FormikCheck
        name={`${name}.include`}
        required={false}
        label="Include"
        disabled={
          inputMode === Apps.ArgInputModeEnum.Fixed ||
          inputMode === Apps.ArgInputModeEnum.Required
        }
        description={
          inputMode === Apps.ArgInputModeEnum.Fixed ||
          inputMode === Apps.ArgInputModeEnum.Required
            ? `This ${argType} must be included`
            : `If checked, this ${argType} will be included`
        }
      />
      <Button size="sm" onClick={() => arrayHelpers.remove(index)}>
        Remove
      </Button>
    </Collapse>
  );
};

type ArgsFieldArrayProps = {
  argSpecs: Array<Apps.AppArgSpec>;
  name: string;
  argType: string;
};

const ArgsFieldArray: React.FC<ArgsFieldArrayProps> = ({
  argSpecs,
  name,
  argType,
}) => {
  const [field] = useField(name);
  const args = useMemo(
    () => (field.value as Array<Jobs.JobArgSpec>) ?? [],
    [field]
  );
  return (
    <FieldArray
      name={name}
      render={(arrayHelpers) => (
        <div className={fieldArrayStyles.array}>
          <h3>{`${argType}s`}</h3>
          <div className={fieldArrayStyles['array-group']}>
            {args.map((arg, index) => {
              const inputMode = arg.name
                ? getArgMode(arg.name, argSpecs)
                : undefined;
              return (
                <ArgField
                  index={index}
                  arrayHelpers={arrayHelpers}
                  name={`${name}.${index}`}
                  argType={argType}
                  inputMode={inputMode}
                />
              );
            })}
          </div>
          <Button
            onClick={() =>
              arrayHelpers.push({
                name: '',
                description: '',
                include: true,
                arg: '',
              })
            }
            size="sm"
          >
            + Add
          </Button>
        </div>
      )}
    />
  );
};

export const Args: React.FC = () => {
  const { job, app } = useJobLauncher();
  const argsSchema = Yup.array(
    Yup.object({
      name: Yup.string(),
      description: Yup.string(),
      include: Yup.boolean(),
      arg: Yup.string().min(1).required('The argument cannot be blank'),
    })
  );
  const validationSchema = Yup.object().shape({
    parameterSet: Yup.object({
      appArgs: argsSchema,
      containerArgs: argsSchema,
      scheduleOptions: argsSchema,
    }),
  });

  const initialValues = useMemo(
    () => ({
      parameterSet: {
        appArgs: job.parameterSet?.appArgs,
        containerArgs: job.parameterSet?.containerArgs,
        schedulerOptions: job.parameterSet?.schedulerOptions,
      },
    }),
    [job]
  );

  const appArgSpecs = useMemo(
    () => app.jobAttributes?.parameterSet?.appArgs ?? [],
    [app]
  );
  const containerArgSpecs = useMemo(
    () => app.jobAttributes?.parameterSet?.containerArgs ?? [],
    [app]
  );
  const scheduleOptionSpecs = useMemo(
    () => app.jobAttributes?.parameterSet?.schedulerOptions ?? [],
    [app]
  );

  return (
    <FormikJobStepWrapper
      validationSchema={validationSchema}
      initialValues={initialValues}
    >
      <ArgsFieldArray
        name="parameterSet.appArgs"
        argType="App Argument"
        argSpecs={appArgSpecs}
      />
      <ArgsFieldArray
        name="parameterSet.containerArgs"
        argType="Container Argument"
        argSpecs={containerArgSpecs}
      />
      <ArgsFieldArray
        name="parameterSet.schedulerOptions"
        argType="Scheduler Option"
        argSpecs={scheduleOptionSpecs}
      />
    </FormikJobStepWrapper>
  );
};

const assembleArgSpec = (argSpecs: Array<Jobs.JobArgSpec>) =>
  argSpecs.reduce(
    (previous, current) =>
      `${previous}${current.include ? ` ${current.arg}` : ``}`,
    ''
  );

export const ArgsSummary: React.FC = () => {
  const { job } = useJobLauncher();
  const appArgs = job.parameterSet?.appArgs ?? [];
  const containerArgs = job.parameterSet?.containerArgs ?? [];
  const schedulerOptions = job.parameterSet?.schedulerOptions ?? [];
  return (
    <div>
      <StepSummaryField
        field={`App: ${assembleArgSpec(appArgs)}`}
        key={`app-args-summary`}
      />
      <StepSummaryField
        field={`Container: ${assembleArgSpec(containerArgs)}`}
        key={`container-args-summary`}
      />
      <StepSummaryField
        field={`Scheduler: ${assembleArgSpec(schedulerOptions)}`}
        key={`scheduler-options-summary`}
      />
    </div>
  );
};

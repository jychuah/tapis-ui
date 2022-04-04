import React, { useMemo } from 'react';
import { Jobs } from '@tapis/tapis-typescript';
import FieldWrapper from 'tapis-ui/_common/FieldWrapper';
import { Input } from 'reactstrap';
import { Button } from 'reactstrap';
import { useJobLauncher, StepSummaryField } from '../components';
import styles from './ArchiveFilter.module.scss';
import fieldArrayStyles from '../FieldArray.module.scss';
import { Collapse } from 'tapis-ui/_common';
import {
  FieldArray,
  useFormikContext,
  useField,
  Field,
  ErrorMessage,
  FieldProps,
  FieldArrayRenderProps
} from 'formik';
import { InputGroup, InputGroupAddon } from 'reactstrap';
import { FormikCheck } from 'tapis-ui/_common/FieldWrapperFormik';
import { FormikJobStepWrapper } from '../components';
import { FormikInput } from 'tapis-ui/_common';
import * as Yup from 'yup';
import formStyles from 'tapis-ui/_common/FieldWrapperFormik/FieldWrapperFormik.module.css';

type EnvVariableFieldProps = {
  index: number;
  arrayHelpers: FieldArrayRenderProps;
};

const EnvVariableField: React.FC<EnvVariableFieldProps> = ({
  index,
  arrayHelpers
}) => {
  const [field] = useField(`parameterSet.envVariables.${index}.key`);
  const key = useMemo(() => field.value, [field]);
  return (
    <Collapse 
      key={`envVariables.${index}`}
      title={(!!key && key.length) ? key : 'Environment Variable'}
      className={fieldArrayStyles.item}
    >
      <FormikInput
        name={`parameterSet.envVariables.${index}.key`}
        required={true}
        label="Key"
        description="The key name for this environment variable"
      />
      <FormikInput
        name={`parameterSet.envVariables.${index}.value`}
        required={false}
        label="Value"
        description="A value for this environment variable"
      />
      <Button size="sm" onClick={() => arrayHelpers.remove(index)}>Remove</Button>
    </Collapse>
  );
};

const EnvVariablesRender: React.FC = () => {
  const { values } = useFormikContext();
  const envVariables =
    (values as Partial<Jobs.ReqSubmitJob>).parameterSet?.envVariables ?? [];
  return (
    <FieldArray
      name={'parameterSet.envVariables'}
      render={(arrayHelpers) => (
        <div>
          <h3>Environment Variables</h3>
          <div className={fieldArrayStyles['array-group']}>
            {envVariables.map(
              (envVariable, index) => (
                <EnvVariableField index={index} arrayHelpers={arrayHelpers} />              
              )
            )}
          </div>
          <Button onClick={() => arrayHelpers.push({ key: '', value: ''})} size="sm">+ Add</Button>
        </div> 
      )}
    />
  )
};

export const EnvVariables: React.FC = () => {
  const { job } = useJobLauncher();

  const validationSchema = Yup.object().shape({
    parameterSet: Yup.object({
      envVariables: Yup.array(
        Yup.object({
          key: Yup.string().min(1).required('A key name is required for this environment variable'),
          value: Yup.string().required('A value is required for this environment variable')
        })
      )
    }),
  });

  const initialValues = useMemo(
    () => ({
      parameterSet: {
        envVariables: job.parameterSet?.envVariables,
      },
    }),
    [job]
  );

  return (
    <FormikJobStepWrapper
      validationSchema={validationSchema}
      initialValues={initialValues}
    >
      <EnvVariablesRender />
    </FormikJobStepWrapper>
  );
};

export const EnvVariablesSummary: React.FC = () => {
  const { job } = useJobLauncher();
  const envVariables = job.parameterSet?.envVariables ?? [];
  return (
    <div>
      <StepSummaryField
        field={`Environment Variables: ${envVariables.length}`}
        key={`env-variables-summary`}
      />
    </div>
  );
};

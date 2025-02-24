import { useEffect, useState } from 'react';

interface FormInputProps {
  question: Question;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  disabled?: boolean;
  error?: string;
}

export interface Question {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  value?: string;
  validation?: (value: string) => string | undefined;
}

export interface FormProps {
  questions: Question[];
  onSubmit: (answers: { [key: string]: string }) => void;
  onBlur?: (answers: { [key: string]: string }) => void;
  title?: string;
  description?: string;
  initialValues?: { [key: string]: string };
  isLoading?: boolean;
  isValidForm?: boolean;
  submitText?: string;
  wigth?: 'full' | 'half';
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const TextInput = ({ question, value, onChange, onBlur, disabled, error }: FormInputProps) => (
  <input
    type={question.type}
    id={question.id}
    name={question.id}
    placeholder={question.placeholder}
    required={question.required}
    value={value}
    onChange={onChange}
    onBlur={onBlur}
    disabled={disabled}
    className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${error
        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
      }`}
  />
);

const TextArea = ({ question, value, onChange, onBlur, disabled, error }: FormInputProps) => (
  <textarea
    id={question.id}
    name={question.id}
    placeholder={question.placeholder}
    required={question.required}
    value={value}
    onChange={onChange}
    onBlur={onBlur}
    disabled={disabled}
    className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${error
        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
      }`}
  />
);

const Select = ({ question, value, onChange, onBlur, disabled, error }: FormInputProps) => (
  <select
    id={question.id}
    name={question.id}
    required={question.required}
    value={value}
    onChange={onChange}
    onBlur={onBlur}
    disabled={disabled}
    className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${error
        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
      }`}
  >
    <option value=''>
      --{question.placeholder}--
    </option>
    {question.options?.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

export function Form({
  questions,
  onSubmit,
  onBlur = () => { },
  title,
  description,
  initialValues,
  submitText = 'Enviar',
  wigth = 'half',
  isValidForm = true,
}: FormProps) {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [isValidExtern, setIsValidExtern] = useState<boolean>(isValidForm);
  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    setIsValidExtern(isValidForm);
  }, [isValidForm]);

  useEffect(() => {
    if (initialValues) {
      setAnswers(initialValues);
      setErrors({});
    }
  }, [initialValues]);

  useEffect(() => {
    if (formStatus === 'success') {
      const timer = setTimeout(() => {
        setFormStatus('idle');
      }, 3000); // El mensaje de éxito se borra después de 3 segundos
      return () => clearTimeout(timer);
    }
  }, [formStatus]);

  const validateField = (questionId: string, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    let error: string | undefined;

    if (question.required && !value) {
      error = 'Este campo es obligatorio';
    } else if (question.validation) {
      error = question.validation(value);
    }

    if (!error) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
    setErrors(prev => ({
      ...prev,
      [questionId]: error || ''
    }));

    handleBlur();

    if (!error) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
    return !error;
  };

  const handleInputChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationResults = questions.map(q =>
      validateField(q.id, answers[q.id] || '')
    );
    if (validationResults.some(result => !result)) {
      setFormStatus('error');
      return;
    }

    setFormStatus('submitting');
    try {
      await onSubmit(answers);
      setFormStatus('success');
      setAnswers({});
      setErrors({});
    } catch {
      setFormStatus('error');
    }
  };

  const handleBlur = () => {
    onBlur(answers);
  }

  return (
    // <div className='max-w-1/3 mx-auto p-6'>
    <div className={`max-w-${wigth === 'full' ? 'full' : '1/2'} mx-auto p-6`}>
      <h1 className='text-2xl font-bold'>{title}</h1>
      <p className='text-gray-500' > {description}</p>
      {formStatus === 'error' && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Por favor, revise el formulario para ver errores
        </div>
      )}
      {formStatus === 'success' && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Formulario enviado con éxito
        </div>
      )}
      <form onSubmit={handleSubmit}>
        {questions.map((question) => (
          <div key={question.id} className='mb-4'>
            <label htmlFor={question.id} className='block text-sm font-medium text-gray-700'>
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.type === 'textarea' ? (
              <TextArea
                question={question}
                value={answers[question.id] || ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                onBlur={(e) => validateField(question.id, e.target.value)}
                disabled={formStatus === 'submitting'}
                error={errors[question.id]}
              />
            ) : question.type === 'select' ? (
              <Select
                question={question}
                value={answers[question.id] || ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                onBlur={(e) => validateField(question.id, e.target.value)}
                disabled={formStatus === 'submitting'}
                error={errors[question.id]}
              />
            ) : (
              <TextInput
                question={question}
                value={answers[question.id] || ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                onBlur={(e) => validateField(question.id, e.target.value)}
                disabled={formStatus === 'submitting'}
                error={errors[question.id]}
              />
            )}
            {errors[question.id] && (
              <p className='mt-2 text-sm text-red-600'>
                {errors[question.id]}
              </p>
            )}
          </div>
        ))}
        <button
          type='submit'
          disabled={formStatus === 'submitting' || !(isValidExtern && isValid)}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed
            ${formStatus === 'submitting'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-4`}
        >
          {formStatus === 'submitting' ? 'Enviando...' : submitText}
        </button>
      </form>

    </div >
  )
}
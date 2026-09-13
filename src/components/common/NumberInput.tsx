import React, { useEffect, useState } from 'react';
import { formatNumber } from '../../lib/svg';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number;
  onChange: (val: number) => void;
  formatterType?: 'float' | 'positive-float' | 'integer' | 'positive-integer';
  suffix?: string;
  onEnter?: () => void;
  fractionDigits?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  formatterType = 'float',
  suffix = '',
  onEnter,
  fractionDigits = 4,
  className = 'app-input',
  disabled,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState<string>(() => formatNumber(value, fractionDigits) + suffix);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumber(value, fractionDigits) + suffix);
    }
  }, [value, suffix, isFocused, fractionDigits]);

  const sanitizeInput = (text: string) => {
    let sanitized = text;
    if (formatterType === 'float') {
      sanitized = text.replace(/[\u066B,]/g, '.').replace(/[^\-0-9.eE]/g, '');
    } else if (formatterType === 'integer') {
      sanitized = text.replace(/[^\-0-9]/g, '');
    } else if (formatterType === 'positive-float') {
      sanitized = text.replace(/[\u066B,]/g, '.').replace(/[^0-9.eE]/g, '');
    } else if (formatterType === 'positive-integer') {
      sanitized = text.replace(/[^0-9]/g, '');
    }
    return sanitized;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const sanitized = sanitizeInput(raw);
    setDisplayValue(sanitized);

    const parsed = parseFloat(sanitized);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (suffix !== '') {
      setDisplayValue(prev => prev.replace(suffix, ''));
    }
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setDisplayValue(formatNumber(value, fractionDigits) + suffix);
    props.onBlur?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onEnter?.();
    }
    props.onKeyDown?.(e);
  };

  return (
    <input
      type="text"
      className={className}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      {...props}
    />
  );
};

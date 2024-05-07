import type {
  CompositionEvent,
} from 'react';
import type React from 'react';
import {
  useCallback, useState,
} from 'react';

import type { SubmittableInputProps } from './types';

export const useSubmittable = (props: SubmittableInputProps): Partial<React.InputHTMLAttributes<HTMLInputElement>> => {

  const {
    value,
    onChange, onBlur,
    onCompositionStart, onCompositionEnd,
    onSubmit, onCancel,
  } = props;

  const [inputText, setInputText] = useState(value ?? '');
  const [isComposing, setComposing] = useState(false);

  const changeHandler = useCallback(async(e: React.ChangeEvent<HTMLInputElement>) => {
    const inputText = e.target.value;
    setInputText(inputText);

    onChange?.(e);
  }, [onChange]);

  const keyDownHandler = useCallback((e) => {
    switch (e.key) {
      case 'Enter':
        // Do nothing when composing
        if (isComposing) {
          return;
        }
        onSubmit?.(inputText.trim());
        break;
      case 'Escape':
        if (isComposing) {
          return;
        }
        onCancel?.();
        break;
    }
  }, [inputText, isComposing, onCancel, onSubmit]);

  const blurHandler = useCallback((e) => {
    // submit on blur
    onSubmit?.(inputText.trim());
    onBlur?.(e);
  }, [inputText, onSubmit, onBlur]);

  const compositionStartHandler = useCallback((e: CompositionEvent<HTMLInputElement>) => {
    setComposing(true);
    onCompositionStart?.(e);
  }, [onCompositionStart]);

  const compositionEndHandler = useCallback((e: CompositionEvent<HTMLInputElement>) => {
    setComposing(false);
    onCompositionEnd?.(e);
  }, [onCompositionEnd]);

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSubmit: _onSubmit, onCancel: _onCancel,
    ...cleanedProps
  } = props;

  return {
    ...cleanedProps,
    onChange: changeHandler,
    onKeyDown: keyDownHandler,
    onBlur: blurHandler,
    onCompositionStart: compositionStartHandler,
    onCompositionEnd: compositionEndHandler,
  };

};

import React from 'react';
import { Button, ButtonProps } from '../../ui/Button';

export interface LoadingButtonProps extends ButtonProps {
  loadingMessage?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = React.memo(
  ({ children, loading = false, loadingMessage = 'Processing...', ...props }) => {
    return (
      <Button loading={loading} disabled={loading || props.disabled} {...props}>
        {loading ? loadingMessage : children}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

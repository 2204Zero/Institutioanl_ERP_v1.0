import React from 'react';

export const RequiredIndicator: React.FC = React.memo(() => {
  return (
    <span
      className="text-red-500 font-bold ml-1 select-none"
      title="This field is required for institutional submission"
      aria-hidden="true"
    >
      *
    </span>
  );
});

RequiredIndicator.displayName = 'RequiredIndicator';

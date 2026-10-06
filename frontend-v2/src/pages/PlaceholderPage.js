import React from 'react';
import { Construction } from 'lucide-react';
export default function PlaceholderPage({ title }) {
    return (<div className="flex flex-col items-center justify-center h-full text-slate-500">
      <Construction className="w-16 h-16 mb-4 text-slate-300"/>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
      <p className="max-w-md text-center">
        Backend/API dependency � do not mock in final implementation. This module is pending backend integration.
      </p>
    </div>);
}

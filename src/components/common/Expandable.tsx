import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableProps {
  panelTitle: string;
  panelInfo?: string;
  defaultOpened?: boolean;
  children: React.ReactNode;
}

export const Expandable: React.FC<ExpandableProps> = ({
  panelTitle,
  panelInfo,
  defaultOpened = true,
  children
}) => {
  const [opened, setOpened] = useState(defaultOpened);

  return (
    <div style={{ marginBottom: 2 }}>
      <div
        onClick={() => setOpened(prev => !prev)}
        style={{
          color: 'white',
          cursor: 'pointer',
          backgroundColor: '#383838',
          margin: 0,
          padding: '4px 8px',
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          userSelect: 'none'
        }}
      >
        <span style={{ flexGrow: 1 }}>{panelTitle}</span>
        {panelInfo !== undefined && (
          <span style={{ color: '#c8c8c8', fontStyle: 'italic', fontSize: '0.9em', paddingRight: 4 }}>
            {panelInfo}
          </span>
        )}
        {opened ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </div>
      {opened && (
        <div style={{ paddingTop: 2, paddingBottom: 6 }}>
          {children}
        </div>
      )}
    </div>
  );
};

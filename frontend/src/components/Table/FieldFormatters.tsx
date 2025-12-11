import { CardAction } from '@/components/ui/card.tsx';
import { ItemsActions } from '@/components/Table/Fields/ItemActions.tsx';
import * as React from 'react';
import { flexRender } from '@tanstack/react-table';

export const TitleFormatter = ({ output }) => {
  return (
    <h4 className="line-clamp-3 scroll-m-20 font-semibold tracking-tight sm:text-lg md:text-xl" title={output}>
      {output}
    </h4>
  );
};

export const URLFormatter = ({ output }) => {
  return <div className="line-clamp-3 text-sm break-all sm:text-base">{output}</div>;
};

export const DescriptionFormatter = ({ output }) => {
  return (
    <div className="text-muted-foreground line-clamp-3 text-sm leading-6 whitespace-pre-line md:line-clamp-none">
      {output}
    </div>
  );
};

export const NotesFormatter = ({ output }) => {
  return (
    <blockquote className="text-muted-foreground line-clamp-3 border-l-2 pl-6 text-sm whitespace-pre-line italic md:line-clamp-none">
      {output}
    </blockquote>
  );
};

export const ActionsFormatter = ({ row }) => {
  return (
    <CardAction className="absolute top-2 right-2">
      <ItemsActions row={row} />
    </CardAction>
  );
};

export const DateFormatter = ({ output, cell }) => {
  return (
    // If last item, stick to bottom
    <p className="text-muted-foreground text-sm [&:first-of-type]:mt-auto [&:nth-of-type(2)]:-mt-1">
      <small className="text-sm leading-none font-medium">{cell.column.columnDef.header}:</small> {output}
    </p>
  );
};

export const renderField = ({ cell, row }) => {
  const isActionColumn = cell.column.columnDef.meta?.isAction ?? false;
  const value = cell.getValue();

  if (!isActionColumn && (value === undefined || value === null || value === '')) {
    return null;
  }
  const output = flexRender(cell.column.columnDef.cell, cell.getContext());

  const componentMap = {
    comments: <NotesFormatter output={output} />,
    description: <DescriptionFormatter output={output} />,
    url: <URLFormatter output={output} />,
    title: <TitleFormatter output={output} />,
    actions: <ActionsFormatter row={row} />,
    created_at: <DateFormatter output={output} cell={cell} />,
    updated_at: <DateFormatter output={output} cell={cell} />,
    default: output,
  };
  return <>{componentMap[cell.column.id] || componentMap.default}</>;
};

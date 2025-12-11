import * as React from 'react';
import { Card, CardContent } from '../../ui/card.tsx';
import { renderField } from '@/components/Table/FieldFormatters.tsx';

export const ListLayout = ({ rows }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {rows.map((row) => {
        const imageOutput = row
          .getVisibleCells()
          .filter((cell) => cell.column.id === 'image')
          .map((cell) =>
            renderField({
              cell: cell,
              row: row,
            })
          );
        return (
          <Card key={row.original.id} className="@container/card relative">
            <CardContent className="hover-action-container flex h-full flex-row flex-nowrap gap-3 md:gap-6 lg:gap-10">
              {imageOutput && <div className="flex flex-2/5 items-start justify-end">{imageOutput}</div>}
              <div className="flex h-full flex-3/5 flex-col items-start gap-3 text-left">
                {row
                  .getVisibleCells()
                  .filter((cell) => cell.column.id !== 'image')
                  .map((cell) =>
                    renderField({
                      cell: cell,
                      row: row,
                    })
                  )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

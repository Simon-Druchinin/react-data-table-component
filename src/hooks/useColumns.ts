import * as React from 'react';
import { alignFrozenColumns, decorateColumns, findColumnIndexById, getSortDirection } from '../DataTable/util';
import useDidUpdateEffect from '../hooks/useDidUpdateEffect';
import { ColumnOffset, SortOrder, TableColumn, TableColumnExtended } from '../DataTable/types';
import { Alignment, Direction } from '../DataTable/constants';

type ColumnsHook<T> = {
	tableColumns: TableColumnExtended<T>[];
	draggingColumnId: string;
	handleDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
	handleDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
	handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
	handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
	handleDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
	setColumnOffset: (offset: ColumnOffset, id: string | undefined) => void;
	defaultSortDirection: SortOrder;
	defaultSortColumn: TableColumn<T>;
};

function useColumns<T>(
	columns: TableColumn<T>[],
	onColumnOrderChange: (nextOrder: TableColumn<T>[]) => void,
	defaultSortFieldId: string | number | null | undefined,
	defaultSortAsc: boolean,
	frozenColumnsAlignment: Alignment.LEFT | Alignment.RIGHT | undefined,
	tableDirection: Direction,
	windowWidth: number = 0
): ColumnsHook<T> {

	// Frozen columns alignment parameters
	const isRTL = tableDirection == Direction.RTL;
	const isLeftAligned = frozenColumnsAlignment == Alignment.LEFT || !frozenColumnsAlignment;
	const shouldLeftAlign = (isLeftAligned && !isRTL) || (!isLeftAligned && isRTL);

	const [tableColumns, setTableColumns] = React.useState<TableColumnExtended<T>[]>(
		alignFrozenColumns(decorateColumns(columns, windowWidth), shouldLeftAlign)
	);
	const [draggingColumnId, setDraggingColumn] = React.useState('');
	const sourceColumnId = React.useRef('');



	useDidUpdateEffect(() => {
		const offsets: {
			[id: string]: ColumnOffset
		} = Object.assign({},
			...tableColumns.map(col => {
				return { [col.id?.toString() || '']: col.$offset }
			})
		);

		setTableColumns(
			alignFrozenColumns(decorateColumns(columns, windowWidth, offsets), shouldLeftAlign)
		);
	}, [columns, windowWidth, shouldLeftAlign]);

	const handleDragStart = React.useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			const { attributes } = e.target as HTMLDivElement;
			const id = attributes.getNamedItem('data-column-id')?.value;

			if (id) {
				sourceColumnId.current = tableColumns[findColumnIndexById(tableColumns, id)]?.id?.toString() || '';

				setDraggingColumn(sourceColumnId.current);
			}
		},
		[tableColumns],
	);

	const handleDragEnter = React.useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			const { attributes } = e.target as HTMLDivElement;
			const id = attributes.getNamedItem('data-column-id')?.value;

			if (id && sourceColumnId.current && id !== sourceColumnId.current) {
				const selectedColIndex = findColumnIndexById(tableColumns, sourceColumnId.current);
				const targetColIndex = findColumnIndexById(tableColumns, id);
				const reorderedCols = [...tableColumns];

				if (
					frozenColumnsAlignment &&
					((tableColumns[targetColIndex].$isFrozen && !tableColumns[selectedColIndex].$isFrozen) ||
						(!tableColumns[targetColIndex].$isFrozen && tableColumns[selectedColIndex].$isFrozen))
				) {
					e.preventDefault();
					return;
				}

				reorderedCols[selectedColIndex] = tableColumns[targetColIndex];
				reorderedCols[targetColIndex] = tableColumns[selectedColIndex];

				setTableColumns(reorderedCols);

				onColumnOrderChange(reorderedCols);
			}
		},
		[onColumnOrderChange, tableColumns],
	);

	const handleDragOver = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
	}, []);

	const handleDragLeave = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
	}, []);

	const handleDragEnd = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();

		sourceColumnId.current = '';

		setDraggingColumn('');
	}, []);

	const defaultSortDirection = getSortDirection(defaultSortAsc);
	const defaultSortColumn = React.useMemo(
		() => tableColumns[findColumnIndexById(tableColumns, defaultSortFieldId?.toString())] || {},
		[defaultSortFieldId, tableColumns],
	);

	const setColumnOffset = (offset: ColumnOffset, id: string | undefined) => {
		const offsetColumns = [...tableColumns];
		offsetColumns[findColumnIndexById(tableColumns, id)].$offset = offset;
		setTableColumns(offsetColumns);
	};

	return {
		tableColumns,
		draggingColumnId,
		handleDragStart,
		handleDragEnter,
		handleDragOver,
		handleDragLeave,
		handleDragEnd,
		setColumnOffset,
		defaultSortDirection,
		defaultSortColumn,
	};
}

export default useColumns;

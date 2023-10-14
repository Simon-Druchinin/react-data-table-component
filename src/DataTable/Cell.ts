import styled, { css } from 'styled-components';
import { media } from './media';
import { ColumnOffset, TableColumnBase } from './types';

export const CellBase = styled.div<{
	$headCell?: boolean;
	$noPadding?: boolean;
}>`
	position: relative;
	display: flex;
	align-items: center;
	box-sizing: border-box;
	line-height: normal;
	${({ theme, $headCell }) => theme[$headCell ? 'headCells' : 'cells'].style};
	${({ $noPadding }) => $noPadding && 'padding: 0'};
`;

export type CellProps = Pick<
	TableColumnBase,
	'button' | 'grow' | 'maxWidth' | 'minWidth' | 'width' | 'right' | 'center' | 'compact' | 'hide' | 'allowOverflow' | 'freeze' | 'paddingLeft' | 'paddingRight'
	>;

export type CellPropsExtended = CellProps & {
	offset: ColumnOffset
}

// Flex calculations
export const CellExtended = styled(CellBase)<CellPropsExtended>`
	flex-grow: ${({ button, grow }) => (grow === 0 || button ? 0 : grow || 1)};
	flex-shrink: 0;
	flex-basis: 0;
	max-width: ${({ maxWidth }) => maxWidth || '100%'};
	min-width: ${({ minWidth }) => minWidth || '100px'};
	${({ width }) =>
		width &&
		css`
			min-width: ${width};
			max-width: ${width};
		`};
	${({ right }) => right && 'justify-content: flex-end'};
	${({ button, center }) => (center || button) && 'justify-content: center'};
	${({ compact, button }) => (compact || button) && 'padding: 0'};

	/* handle left and right padding */
	padding-left: ${({ paddingLeft }) => paddingLeft || 'unset'};
	padding-right: ${({ paddingRight }) => paddingRight || 'unset'};

	/* handle freezing cells */
	${({ freeze, offset }) =>
		freeze &&
		freeze === true && `
		position: sticky;
		background: inherit;
		z-index: 1;
		${offset?.direction}: ${offset?.value}px;
	`}

	${({ freeze, offset }) =>
		freeze &&
		freeze === 'sm' &&
		media.min_sm`
		position: sticky;
		background: inherit;
		z-index: 1;
		${offset?.direction === 'left' ?
		{ left: offset?.value } :
		{ right: offset?.value }}
	`}

	${({ freeze, offset }) =>
		freeze &&
		freeze === 'md' &&
		media.min_md`
		position: sticky;
		background: inherit;
		z-index: 1;
		${offset?.direction === 'left' ?
		{ left: offset?.value } :
		{ right: offset?.value }}
	`}

	${({ freeze, offset }) =>
		freeze &&
		freeze === 'lg' &&
		media.min_lg`
		position: sticky;
		background: inherit;
		z-index: 1;
		${offset?.direction === 'left' ?
		{ left: offset?.value } :
		{ right: offset?.value }}
	`}

	${({ freeze, offset }) =>
		freeze &&
		Number.isInteger(freeze) &&
		media.min_custom(freeze as number)`
		position: sticky;
		background: inherit;
		z-index: 1;
		${offset?.direction === 'left' ?
		{ left: offset?.value } :
		{ right: offset?.value }}
	`}

	/* handle hiding cells */
	${({ hide }) =>
		hide &&
		hide === 'sm' &&
		media.sm`
    display: none;
  `};
	${({ hide }) =>
		hide &&
		hide === 'md' &&
		media.md`
    display: none;
  `};
	${({ hide }) =>
		hide &&
		hide === 'lg' &&
		media.lg`
    display: none;
  `};
	${({ hide }) =>
		hide &&
		Number.isInteger(hide) &&
		media.custom(hide as number)`
    display: none;
  `};
`;

export enum Direction {
  ACROSS,
  DOWN,
}

export interface CellProps {
  index: number;
  row?: number;
  col?: number;
  // ref: React.RefObject<HTMLInputElement>;
  // cornerLabel: number;
  // correctEntry: string;
  // userEntry: string;
}

export interface Coordinate {
  row: number;
  col: number;
}

export interface ClueProps {
  number: number;
  clue: string;
  startingCoordinate: Coordinate;
}

export interface GameContextType {
  allAnswersRevealed: boolean;
  direction: Direction;
  cells: CellProps[][];
  grid: string[];
  gridnums: number[];
  highlightedClueNumber: number;
  highlightedSquares: number[];
  inputRefs: Array<React.RefObject<HTMLInputElement>>;
  selectedSquare: number;
  size: { rows: number; cols: number };
  setDirection: (d: Direction) => void;
  setSelectedSquare: (i: number) => void;
}

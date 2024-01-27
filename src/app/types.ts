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
  cluesIndex?: number;
  direction: Direction;
  number: number;
  gridIndex: number;
  startingCoordinate?: Coordinate;
  text: string;
}

export interface GameContextType {
  allAnswersRevealed: boolean;
  direction: Direction;
  cells: CellProps[][];
  clues: { across: ClueProps[]; down: ClueProps[] };
  grid: string[];
  gridnums: number[];
  highlightedClueNumber: number;
  highlightedSquares: number[];
  inputRefs: Array<React.RefObject<HTMLInputElement>>;
  selectedSquare: number;
  size: { rows: number; cols: number };
  setDirection: (d: Direction) => void;
  setSelectedSquare: (i: number) => void;
  toggleDirection: () => void;
}

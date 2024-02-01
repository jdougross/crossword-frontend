// export enum Direction {
//   ACROSS,
//   DOWN,
// }

export enum Direction {
  ACROSS = "across",
  DOWN = "down",
}

export interface Cell {
  clues: {
    across: number;
    down: number;
  };
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

export interface Clue {
  cells: number[];
  cluesIndex: number;
  direction: Direction;
  number: number;
  gridIndex: number;
  startingCoordinate?: Coordinate;
  text: string;
}

export interface CrosswordInputObject {
  author: string;
  clues: {
    across: string[];
    down: string[];
  };
  date: string;
  dow: string; // should this be a day-of-week enum?
  grid: string[];
  gridnums: number[];
  size: {
    rows: number;
    cols: number;
  };
  title: string;
}

export interface CrosswordProps {
  author: string;
  cells: Cell[];
  clues: {
    across: Clue[];
    down: Clue[];
  };
  date: string;
  dow: string; // should this be a day-of-week enum?
  grid: string[];
  gridnums: number[];
  inputRefs: React.RefObject<HTMLInputElement>[];
  size: {
    rows: number;
    cols: number;
  };
  title: string;
}

export interface GameContextType {
  allAnswersRevealed: boolean;
  direction: Direction;
  cells: Cell[];
  clues: { across: Clue[]; down: Clue[] };
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

export interface GridProps {
  size: { rows: number; cols: number };
  data: any[]; // this is a 1d array of grid-element props
  renderChildComponent: ({
    props,
    key,
  }: {
    props: any;
    key: string;
  }) => JSX.Element;
}

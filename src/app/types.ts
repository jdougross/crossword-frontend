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
  nextIndex: Record<Direction, number>;
  prevIndex: Record<Direction, number>;
}

export interface Clue {
  cells: number[];
  clueListIndex: number;
  clueNumber: number;
  direction: Direction;
  gridIndex: number;
  nextClue: {
    clueListIndex: number;
    direction: Direction;
  };
  onClick?: () => void;
  prevClue: {
    clueListIndex: number;
    direction: Direction;
  };
  ref?: React.RefObject<any>;
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
  boundaryIndexes: {
    first: {
      across: number;
      down: number;
    };
    last: {
      across: number;
      down: number;
    };
  };
  cells: Cell[];
  clueListRefs: {
    across: React.RefObject<HTMLParagraphElement>[];
    down: React.RefObject<HTMLParagraphElement>[];
  };
  clues: {
    across: Clue[];
    down: Clue[];
  };
  date: string;
  dow: string; // should this be a day-of-week enum?
  grid: string[];
  gridnums: number[];
  initialGrid: string[];
  inputRefs: React.RefObject<HTMLInputElement>[];
  size: {
    rows: number;
    cols: number;
  };
  title: string;
}

export interface GetNextIndexParams {
  skipFilledCells?: boolean;
  prev?: boolean;
  touchEveryCell?: boolean;
}

export interface GameContextType {
  allAnswersRevealed: boolean;
  direction: Direction;
  cells: Cell[];
  cellsToCheck: boolean[];
  clueListRefs: {
    across: React.RefObject<HTMLParagraphElement>[];
    down: React.RefObject<HTMLParagraphElement>[];
  };
  clues: { across: Clue[]; down: Clue[] };
  editableCells: boolean[];
  getNextIndex: ({}: GetNextIndexParams) => number;
  grid: string[];
  gridnums: number[];
  selectedClueNumber: number;
  inputRefs: Array<React.RefObject<HTMLInputElement>>;
  selectedSquare: number;
  size: { rows: number; cols: number };
  setDirection: (d: Direction) => void;
  selectSquare: (i: number) => void;
  toggleDirection: () => void;
  updateUserInputs: (args: Array<[number, string]>) => void;
  userInputs: string[];
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

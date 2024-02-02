import { Box, Flex, Heading } from "@chakra-ui/react";
import {
  Cell,
  Clue,
  CrosswordInputObject,
  CrosswordProps,
  Direction,
} from "./types";
import React from "react";

export const theme = {
  border: {
    width: "1px",
  },
  color: {
    background: "white",
    foreground: "black",
    highlight: "#BDF",
  },
};

export const fullSize = { w: "100%", h: "100%" };

export function HeaderSection({
  author,
  date,
  title,
}: {
  author: string;
  date: string;
  title: string;
}) {
  return (
    <Flex direction="column" align="center" justify="space-between" w="100%">
      <Heading color={theme.color.background}>{title}</Heading>
      {/* <Heading color={theme.color.background}>{date}</Heading> */}
      {/* <Heading color={theme.color.background}>{`by ${author}`}</Heading> */}
    </Flex>
  );
}

export function parseRawClue(clueString: string) {
  const dot = clueString.indexOf(".");
  const clueNumber = Number(clueString.slice(0, dot));
  const text = clueString.slice(dot + 1).trim();
  return { clueNumber, text };
}

export function transformData(input: CrosswordInputObject): CrosswordProps {
  const {
    author,
    clues: rawClues,
    date,
    dow,
    grid,
    gridnums,
    size: { rows, cols },
    title,
  } = input;

  const clueToIndex: Record<Direction, Record<number, number[]>> = {
    across: {},
    down: {},
  };

  const indexToClue = gridnums.map((n, i) => {
    if (grid[i] === ".") {
      return { across: -1, down: -1 };
    }

    let leftSideOfClue = i;
    let topOfClue = i;

    while (leftSideOfClue % cols != 0 && grid[leftSideOfClue - 1] != ".") {
      leftSideOfClue -= 1;
    }

    while (topOfClue - cols >= 0 && grid[topOfClue - cols] != ".") {
      topOfClue -= cols;
    }

    let acrossClueNumber = gridnums[leftSideOfClue];
    let downClueNumber = gridnums[topOfClue];

    if (clueToIndex.across[acrossClueNumber]) {
      clueToIndex.across[acrossClueNumber].push(i);
    } else {
      clueToIndex.across[acrossClueNumber] = [i];
    }

    if (clueToIndex.down[downClueNumber]) {
      clueToIndex.down[downClueNumber].push(i);
    } else {
      clueToIndex.down[downClueNumber] = [i];
    }

    return { across: acrossClueNumber, down: downClueNumber };
  });

  // should these be [] or Record<number, Clue> with a pointer to next / prev?
  // depends on how ClueToIndex is structured, right?
  const across: Clue[] = rawClues.across.map(
    (clueString: string, clueListIndex) => {
      const { clueNumber, text } = parseRawClue(clueString);

      const nextClue = {
        clueListIndex: clueListIndex + 1,
        direction: Direction.ACROSS,
      };

      if (clueListIndex >= rawClues.across.length - 1) {
        nextClue.clueListIndex = 0;
        nextClue.direction = Direction.DOWN;
      }

      const prevClue = {
        clueListIndex: clueListIndex - 1,
        direction: Direction.ACROSS,
      };

      if (clueListIndex <= 0) {
        prevClue.clueListIndex = rawClues.down.length - 1;
        prevClue.direction = Direction.DOWN;
      }

      return {
        cells: clueToIndex.across[clueNumber].sort((a, b) => a - b),
        clueListIndex,
        clueNumber,
        direction: Direction.ACROSS,
        nextClue,
        prevClue,
        gridIndex: gridnums.indexOf(clueNumber),
        text,
      };
    },
  );

  // should these be [] or Record<number, Clue> with a pointer to next / prev?
  const down: Clue[] = rawClues.down.map(
    (clueString: string, clueListIndex) => {
      const { clueNumber, text } = parseRawClue(clueString);

      const nextClue = {
        clueListIndex: clueListIndex + 1,
        direction: Direction.DOWN,
      };

      if (clueListIndex >= rawClues.down.length - 1) {
        nextClue.clueListIndex = 0;
        nextClue.direction = Direction.ACROSS;
      }

      const prevClue = {
        clueListIndex: clueListIndex - 1,
        direction: Direction.DOWN,
      };

      if (clueListIndex <= 0) {
        prevClue.clueListIndex = rawClues.across.length - 1;
        prevClue.direction = Direction.ACROSS;
      }

      return {
        cells: clueToIndex.down[clueNumber].sort((a, b) => a - b),
        clueListIndex,
        clueNumber,
        direction: Direction.DOWN,
        nextClue,
        prevClue,
        gridIndex: gridnums.indexOf(clueNumber),
        text,
      };
    },
  );

  const nextSquareAcross = grid.map((g, i) => {
    if (grid[i] === ".") {
      return -1;
    }

    let nextIndex = i + 1;
    while (grid[nextIndex] === ".") {
      nextIndex++;
    }

    if (!grid[nextIndex]) return 0;
    return nextIndex;
  });

  const prevSquareAcross = Array(grid.length);

  nextSquareAcross.forEach((n, i) => {
    if (n === -1) {
      prevSquareAcross[i] = -1;
    } else {
      prevSquareAcross[n] = i;
    }
  });

  const nextSquareDown = grid.map((g, i) => {
    if (grid[i] === ".") {
      return -1;
    }
    let nextIndex = i + cols;

    // SOMETHING WRONG HERE - not progressing to next dwn cluetemp

    if (!grid[nextIndex] || grid[nextIndex] === ".") {
      // get starting index of next clue
      const currentClue = down.find(
        (clue) => clue.clueNumber === indexToClue[i].down,
      );

      if (
        !currentClue || // if something went wrong with find
        !currentClue.clueListIndex || // if optional clueListIndex not populated
        currentClue.clueListIndex + 1 == down.length // if last clue in the array
      ) {
        return 0;
      }

      return down[currentClue.clueListIndex + 1].gridIndex;
    }

    return nextIndex;
  });

  // for (let r = 0; r < rows; r++) {
  //   console.log(nextSquareAcross.slice(cols * r, cols * (r + 1)));
  // }

  const inputRefs = Array.from(
    { length: grid.length },
    () => React.createRef() as React.RefObject<HTMLInputElement>,
  );

  const clueListRefs = {
    across: Array.from(
      { length: across.length },
      () => React.createRef() as React.RefObject<HTMLParagraphElement>,
    ),
    down: Array.from(
      { length: down.length },
      () => React.createRef() as React.RefObject<HTMLParagraphElement>,
    ),
  };

  const cells = grid.map((c, i) => {
    // this is silly
    // maybe add "nextIndex.Across / .Down to this object?"
    // more efficient to track activeClue AND activeSquare? is that redundant / complicated?
    return {
      index: i,
      clues: indexToClue[i],
      nextIndex: {
        across: nextSquareAcross[i],
        down: nextSquareDown[i],
      },
      prevIndex: {
        across: 0,
        down: 0,
      },
    };
  });

  const initialGrid = grid.map((g) => (g === "." ? g : "")); // BLANK GRID with "." prefilled
  // const initialGrid = grid.slice(); initialGrid[0] = ""; // one-away from correct, for testing

  return {
    author,
    date,
    dow,
    // grid: prevSquareAcross.map(n => String(n)),
    grid,
    gridnums,
    initialGrid,
    inputRefs,
    cells,
    clueListRefs,
    clues: { across, down },
    size: { rows, cols },
    title,
  };
}

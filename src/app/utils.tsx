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
  const number = Number(clueString.slice(0, dot));
  const text = clueString.slice(dot + 1).trim();
  return { number, text };
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

  const across: Clue[] = rawClues.across.map(
    (clueString: string, cluesIndex) => {
      const { number, text } = parseRawClue(clueString);
      return {
        cells: clueToIndex.across[number].sort((a, b) => a - b),
        cluesIndex,
        direction: Direction.ACROSS,
        number,
        gridIndex: gridnums.indexOf(number),
        text,
      };
    },
  );

  const down: Clue[] = rawClues.down.map((clueString: string, cluesIndex) => {
    const { number, text } = parseRawClue(clueString);
    return {
      cells: clueToIndex.down[number].sort((a, b) => a - b),
      cluesIndex,
      direction: Direction.DOWN,
      number,
      gridIndex: gridnums.indexOf(number),
      text,
    };
  });

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

  const nextSquareDown = grid.map((g, i) => {
    if (grid[i] === ".") {
      return -1;
    }
    let nextIndex = i + cols;

    if (!grid[nextIndex] || grid[nextIndex] === ".") {
      // get starting index of next clue
      const currentClue = down.find(
        (clue) => clue.number === indexToClue[i].down,
      );

      if (
        !currentClue || // if something went wrong with find
        !currentClue.cluesIndex || // if optional cluesIndex not populated
        currentClue.cluesIndex + 1 == down.length // if last clue in the array
      ) {
        return 0;
      }

      return down[currentClue.cluesIndex + 1].gridIndex;
    }

    return nextIndex;
  });

  for (let r = 0; r < rows; r++) {
    console.log(nextSquareDown.slice(cols * r, cols * (r + 1)));
  }

  const inputRefs = Array.from(
    { length: grid.length },
    () => React.createRef() as React.RefObject<HTMLInputElement>,
  );

  const cells = grid.map((c, i) => {
    // this is silly
    // maybe add "nextIndex.Across / .Down to this object?"
    // more efficient to track activeClue AND activeSquare? is that redundant / complicated?
    return { index: i, clues: indexToClue[i] };
  });

  return {
    author,
    date,
    dow,
    grid,
    gridnums,
    inputRefs,
    cells,
    clues: { across, down },
    size: { rows, cols },
    title,
  };
}

import { Box, Flex, Heading } from "@chakra-ui/react";
import { Cell, Clue, Direction } from "./types";
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

interface InputObject {
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

export function transformData(input: InputObject): CrosswordProps {
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

  const across: Clue[] = rawClues.across.map(
    (clueString: string, cluesIndex) => {
      const { number, text } = parseRawClue(clueString);
      return {
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
      cluesIndex,
      direction: Direction.DOWN,
      number,
      gridIndex: gridnums.indexOf(number),
      text,
    };
  });

  const inputRefs = Array.from(
    { length: grid.length },
    () => React.createRef() as React.RefObject<HTMLInputElement>,
  );

  const cells = grid.map((c, i) => {
    // this is silly
    // maybe add "nextIndex.Across / .Down to this object?"
    // more efficient to track activeClue AND activeSquare? is that redundant / complicated?
    return { index: i };
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

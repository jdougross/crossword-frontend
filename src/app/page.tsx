"use client";

import data from "./data.json";
import { Box, Button, Flex, List, Text } from "@chakra-ui/react";
import React, { createContext, createRef, useContext, useState } from "react";
import { CellProps, ClueProps, Direction, GameContextType } from "./types";
import { theme } from "./utils";
import { Cell } from "./Cell";

export const GameContext = createContext({} as GameContextType);

// maybe make this a child-agnostic layout?
function Grid() {
  const {
    size: { rows, cols },
  } = useContext(GameContext);

  const cells: CellProps[][] = [];
  for (let r = 0; r < rows; r++) {
    let row: CellProps[] = [];
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;

      // maybe add "nextIndex.Across / .Down to this object?"
      // more efficient to track activeClue AND activeSquare? is that redundant / complicated?
      row.push({
        index,
        // row: r,
        // col: c,
      });
    }
    cells.push(row);
  }

  const fullSize = { w: "100%", h: "100%" };

  return (
    <Box bg={theme.color.background} {...fullSize}>
      <Flex {...fullSize} direction="column">
        {" "}
        {cells.map((row, indexR) => (
          <Flex {...fullSize} key={`row-${indexR}`}>
            {row.map((cell, indexC) => (
              <Cell {...cell} key={`cell-${indexR}:${indexC}`} />
            ))}
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}

function Clue({ clue, direction }: { clue: string; direction: Direction }) {
  const {
    direction: contextDirection,
    gridnums,
    highlightedClueNumber,
    setDirection,
    setSelectedSquare,
  } = useContext(GameContext);

  const clueNumber = Number(clue.split(".")[0]);
  const backgroundColor =
    clueNumber == highlightedClueNumber && direction === contextDirection
      ? theme.color.highlight
      : theme.color.foreground; // weird theming... bg / fg should be different

  function handleClick() {
    setDirection(direction);
    setSelectedSquare(gridnums.indexOf(clueNumber) || 0);
  }

  return (
    <Text backgroundColor={backgroundColor} py={8} onClick={handleClick}>
      {clue}
    </Text>
  );
}

function ClueList({
  clues,
  direction,
}: {
  clues: string[];
  direction: Direction;
}) {
  return (
    <List width={200} padding={10}>
      {clues.map((clue) => (
        <Clue clue={clue} direction={direction} key={clue} />
      ))}
    </List>
  );
}

function Clues({ across, down }: { across: string[]; down: string[] }) {
  return (
    <Flex direction="row">
      <ClueList clues={across} direction={Direction.ACROSS} />
      <ClueList clues={down} direction={Direction.DOWN} />
    </Flex>
  );
}

function Crossword() {
  const [allAnswersRevealed, setAllAnswersRevealed] = useState(false);
  const [direction, setDirection] = useState(Direction.ACROSS);
  const [selectedSquare, setSelectedSquare] = useState(0);

  const { clues, grid, gridnums, size } = data;

  function deriveHighlightedSquares(): Array<number> {
    let highlightedSquares: number[] = [selectedSquare];

    if (direction === Direction.ACROSS) {
      let l = selectedSquare - 1;
      let r = selectedSquare + 1;
      while (grid[l] != "." && l >= 0 && l % size.rows != size.cols - 1) {
        highlightedSquares.push(l);
        l--;
      }
      while (
        grid[r] != "." &&
        r >= 0 &&
        r < grid.length &&
        r % size.rows != 0
      ) {
        highlightedSquares.push(r);
        r++;
      }
    } else {
      let t = selectedSquare - size.cols;
      let b = selectedSquare + size.cols;
      while (grid[t] != "." && t >= 0) {
        highlightedSquares.push(t);
        t -= size.cols;
      }
      while (grid[b] != "." && b >= 0 && b < grid.length) {
        highlightedSquares.push(b);
        b += size.cols;
      }
    }
    return highlightedSquares;
  }

  function deriveHighlightedClueNumber(highlighted: Array<number>) {
    let highlightedClueIndex = Math.min(...highlighted);
    let highlightedClueNumber =
      highlightedClueIndex == -1 ? 1 : gridnums[highlightedClueIndex];
    return highlightedClueNumber;
  }

  const highlightedSquares = deriveHighlightedSquares();
  const highlightedClueNumber = deriveHighlightedClueNumber(highlightedSquares);

  // test for accurate puzzle size?
  const cells: CellProps[][] = [];
  const inputRefs = Array.from(
    { length: grid.length },
    () => React.createRef() as React.RefObject<HTMLInputElement>,
  );

  const dim = 600;
  const dimensions = {
    w: dim,
    h: dim,
    padding: "10px",
  };

  const contextValue = {
    allAnswersRevealed,
    direction,
    cells,
    grid,
    gridnums,
    highlightedClueNumber: 1,
    highlightedSquares,
    inputRefs,
    selectedSquare,
    size,
    setDirection: (d: Direction) => setDirection(d),
    setSelectedSquare: (i: number) => setSelectedSquare(i),
  };

  return (
    <Flex direction="column" justify="space-between" align="center">
      <GameContext.Provider value={contextValue}>
        {/* <HeaderSection author={author} date={date} title={title} /> */}
        <Flex
          direction="row"
          w="100%"
          alignItems="center"
          justifyContent="center"
        >
          <Button
            w="15%"
            background="gray"
            margin={20}
            padding={4}
            onClick={() => setAllAnswersRevealed(!allAnswersRevealed)}
          >
            <Text>{allAnswersRevealed ? "Hide Answers" : "Show Answers"}</Text>
          </Button>
          <Button
            w="15%"
            background="gray"
            margin={20}
            padding={4}
            onClick={() =>
              setDirection(
                direction === Direction.ACROSS
                  ? Direction.DOWN
                  : Direction.ACROSS,
              )
            }
          >
            <Text>{direction === Direction.ACROSS ? "Across" : "Down"}</Text>
          </Button>
        </Flex>
        <Flex>
          <Flex {...dimensions}>
            <Grid />
          </Flex>
          <Flex>
            <Clues {...clues} />
          </Flex>
        </Flex>
      </GameContext.Provider>
    </Flex>
  );
}

export default function Home() {
  return (
    <main>
      <Crossword />
    </main>
  );
}

"use client";

import data from "./data.json";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import React, { createContext, createRef, useContext, useState } from "react";
import { CellProps, ClueProps, Direction, GameContextType } from "./types";
import { fullSize, parseRawClue, theme } from "./utils";
import { Cell } from "./Cell";
import { Clues } from "./Clues";

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
      });
    }
    cells.push(row);
  }

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

function Crossword() {
  const [allAnswersRevealed, setAllAnswersRevealed] = useState(false);
  const [direction, setDirection] = useState(Direction.ACROSS);
  const [selectedSquare, setSelectedSquare] = useState(0);

  const { clues: rawClues, grid, gridnums, size } = data;

  function toggleDirection() {
    setDirection(
      direction === Direction.ACROSS ? Direction.DOWN : Direction.ACROSS,
    );
  }

  function deriveStartingIndexOfActiveClue() {
    let index = selectedSquare;
    let decrement = direction === Direction.ACROSS ? 1 : size.cols;

    let testIndex = index - decrement;
    while (
      testIndex >= 0 &&
      grid[testIndex] != "." &&
      testIndex % size.cols <= index % size.cols
    ) {
      index = testIndex;
      testIndex -= decrement;
    }

    return index;
  }

  function deriveHighlightedSquares() {
    const startIndex = deriveStartingIndexOfActiveClue();
    const highlightedSquares = [];

    let increment = direction === Direction.ACROSS ? 1 : size.cols;
    let index = startIndex;

    while (index < grid.length && grid[index] != ".") {
      highlightedSquares.push(index);
      if (direction == Direction.ACROSS && index % size.cols == size.cols - 1)
        break;
      index += increment;
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

  const across: ClueProps[] = rawClues.across.map(
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

  const down: ClueProps[] = rawClues.down.map(
    (clueString: string, cluesIndex) => {
      const { number, text } = parseRawClue(clueString);
      return {
        cluesIndex,
        direction: Direction.DOWN,
        number,
        gridIndex: gridnums.indexOf(number),
        text,
      };
    },
  );

  const clues = { across, down };

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
    clues,
    grid,
    gridnums,
    highlightedClueNumber,
    highlightedSquares,
    inputRefs,
    selectedSquare,
    size,
    setDirection: (d: Direction) => setDirection(d),
    setSelectedSquare: (i: number) => setSelectedSquare(i),
    toggleDirection,
  };

  // console.log(`Selected Square: ${selectedSquare}`)

  function handleKeyboardEvents(event: any) {
    // fix no explicit any
    // console.log(event);
    if (event?.code === "Backspace" || event?.code === "Delete") {
      console.log(event?.code);
      // should have a method for derive prev square basically.
      // let prevSquare = (selectedSquare + grid.length - 1) % grid.length;
      // setSelectedSquare(prevSquare);
      // inputRefs[prevSquare].current?.focus();
      // console.log(prevSquare)
    }

    if (event?.code && String(event?.code).includes("Arrow")) {
      console.log(event.code);
    }

    if (event?.code && String(event?.code).includes("Tab")) {
      event.shiftKey ? console.log("Shift Tab") : console.log("Tab");
    }
  }

  return (
    <Flex
      direction="column"
      justify="space-between"
      align="center"
      onKeyDown={handleKeyboardEvents}
    >
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
            onClick={toggleDirection}
          >
            <Text>{direction === Direction.ACROSS ? "Across" : "Down"}</Text>
          </Button>
        </Flex>
        <Flex>
          <Flex {...dimensions}>
            <Grid />
          </Flex>
          <Flex>
            <Clues />
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

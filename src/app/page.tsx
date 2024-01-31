"use client";

import data from "./data.json";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import React, { createContext, createRef, useContext, useState } from "react";
import { Cell, Clue, Direction, GameContextType, GridProps } from "./types";
import {
  CrosswordProps,
  fullSize,
  parseRawClue,
  theme,
  transformData,
} from "./utils";
import { CellDisplay } from "./Cell";
import { ClueLists } from "./Clues";

export const GameContext = createContext({} as GameContextType);

function GridDisplay({
  size: { rows, cols },
  data,
  renderChildComponent,
}: GridProps) {
  const grid: Cell[][] = [...Array(rows).keys()].map((row) =>
    [...Array(cols).keys()].map((col) => data[row * cols + col]),
  );

  return (
    <Box bg={theme.color.background} {...fullSize}>
      <Flex {...fullSize} direction="column">
        {grid.map((row, indexR) => (
          <Flex {...fullSize} key={`row-${indexR}`}>
            {row.map((element, indexC) =>
              renderChildComponent({
                props: element,
                key: `cell-${indexR}:${indexC}`,
              }),
            )}
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}

function Crossword(props: CrosswordProps) {
  const [allAnswersRevealed, setAllAnswersRevealed] = useState(false);
  const [direction, setDirection] = useState(Direction.ACROSS);
  const [selectedSquare, setSelectedSquare] = useState(0);

  const { cells, clues, grid, gridnums, inputRefs, size } = props;

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

  function tabToNextOrPreviousClue(shiftKey: boolean) {
    let activeClueList =
      direction == Direction.ACROSS ? clues.across : clues.down;
    let inactiveClueList =
      direction == Direction.DOWN ? clues.across : clues.down;
    let activeClueListIndex = activeClueList.findIndex(
      (clue) => clue.number === highlightedClueNumber,
    );
    let nextIndex;
    let shouldToggleDirection = false;

    nextIndex =
      activeClueList[activeClueListIndex + (shiftKey ? -1 : 1)]?.gridIndex || 0;

    // handle TAB from end of grid
    if (!shiftKey && activeClueListIndex == activeClueList.length - 1) {
      nextIndex = inactiveClueList[0].gridIndex || 0;
      shouldToggleDirection = true;
    }

    // handle SHIFT-TAB from start of grid
    if (shiftKey && activeClueListIndex == 0) {
      nextIndex = inactiveClueList.pop()?.gridIndex || 0;
      shouldToggleDirection = true;
    }

    setSelectedSquare(nextIndex);
    shouldToggleDirection && toggleDirection();
  }

  function handleKeyboardEvents(event: any) {
    const code = event?.code;
    const shiftKey = event?.shiftKey;

    if (!code) {
      return;
    }

    // fix no explicit any
    // console.log(event);
    if (event?.code === "Backspace" || event?.code === "Delete") {
      // console.log(event?.code);
      // should have a method for derive prev square basically.
      // let prevSquare = (selectedSquare + grid.length - 1) % grid.length;
      // setSelectedSquare(prevSquare);
      // inputRefs[prevSquare].current?.focus();
      // console.log(prevSquare)
    }

    if (String(code).includes("Arrow")) {
      // console.log(event.code);
      ["ArrowLeft", "ArrowRight"].includes(code) &&
        setDirection(Direction.ACROSS);
      ["ArrowUp", "ArrowDown"].includes(code) && setDirection(Direction.DOWN);
    }

    if (String(code).includes("Tab")) {
      // note that on NYT, tab is necessary to get to next word... ?
      // shiftKey ? console.log("Shift Tab") : console.log("Tab");
      tabToNextOrPreviousClue(shiftKey);
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
            <Text>{direction}</Text>
          </Button>
        </Flex>
        <Flex>
          <Flex {...dimensions}>
            <GridDisplay
              size={size}
              data={cells}
              renderChildComponent={({
                props,
                key,
              }: {
                props: Cell;
                key: string;
              }) => {
                return <CellDisplay {...props} key={key} />;
              }}
            />
          </Flex>
          <Flex>
            <ClueLists />
          </Flex>
        </Flex>
      </GameContext.Provider>
    </Flex>
  );
}

export default function Home() {
  const crosswordProps = transformData(data);

  return (
    <main>
      <Crossword {...crosswordProps} />
    </main>
  );
}

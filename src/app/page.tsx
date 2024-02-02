"use client";

import data from "./data.json";
import { Button, Flex, Text } from "@chakra-ui/react";
import React, { createContext, useState } from "react";
import {
  Cell,
  Clue,
  CrosswordProps,
  Direction,
  GameContextType,
} from "./types";
import { theme, transformData } from "./utils";
import { CellDisplay } from "./Cell";
import { ClueDisplay, ClueLists } from "./Clues";
import { GridDisplay } from "./GridDisplay";

export const GameContext = createContext({} as GameContextType);

function Crossword(props: CrosswordProps) {
  const {
    cells,
    clues,
    clueListRefs,
    grid,
    gridnums,
    initialGrid,
    inputRefs,
    size,
  } = props;

  const [allAnswersRevealed, setAllAnswersRevealed] = useState(false);
  const [direction, setDirection] = useState(Direction.ACROSS);
  const [selectedSquare, setSelectedSquare] = useState(0);
  const [userInputs, setUserInputs] = useState(initialGrid);

  // checking for wins on every grid change
  const res = checkGrid();
  res && console.log("CONGRATULATIONS");

  function checkGrid() {
    return grid.every((g, i) => grid[i] === userInputs[i] || g === ".");
  }

  function updateUserInput(index: number, value: string) {
    let temp = userInputs;
    temp[index] = value;
    setUserInputs(temp);
  }

  function toggleDirection() {
    setDirection(
      direction === Direction.ACROSS ? Direction.DOWN : Direction.ACROSS,
    );
  }

  function selectSquare(i: number) {
    inputRefs[i].current?.focus();
    setSelectedSquare(i);
  }

  const highlightedClueNumber = cells[selectedSquare].clues[direction];
  const highlightedClue =
    clues[direction].find(
      (clue) => clue.clueNumber === highlightedClueNumber,
    ) || ({} as Clue);
  const highlightedSquares = highlightedClue
    ? highlightedClue.cells
    : [selectedSquare];

  // scroll the active clue to the top of its list
  const clueListRef = clueListRefs[direction][highlightedClue.clueListIndex];
  clueListRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });

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
    clueListRefs,
    clues,
    grid,
    gridnums,
    highlightedClueNumber,
    highlightedSquares,
    inputRefs,
    selectedSquare,
    size,
    setDirection: (d: Direction) => setDirection(d),
    selectSquare,
    toggleDirection,
    updateUserInput,
    userInputs,
  };

  // console.log(`Selected Square: ${selectedSquare}`);

  function tabToNextOrPreviousClue(shiftKey: boolean) {
    const newClue = shiftKey
      ? highlightedClue.prevClue
      : highlightedClue.nextClue;

    const newGridIndex = Math.min(
      ...clues[newClue.direction][newClue.clueListIndex].cells,
    );

    direction != newClue.direction && toggleDirection();
    selectSquare(newGridIndex);
  }

  function handleKeyboardEvents(event: any) {
    const code = event?.code;
    const shiftKey = event?.shiftKey;

    if (!code) {
      return;
    }

    if (event?.code === "Backspace" || event?.code === "Delete") {
      // should have a method for derive prev square basically.
      // let prevSquare = (selectedSquare + grid.length - 1) % grid.length;
      // setSelectedSquare(prevSquare);
      // inputRefs[prevSquare].current?.focus();
      // console.log(prevSquare)
    }

    if (String(code).includes("Arrow")) {
      ["ArrowLeft", "ArrowRight"].includes(code) &&
        setDirection(Direction.ACROSS);
      ["ArrowUp", "ArrowDown"].includes(code) && setDirection(Direction.DOWN);
    }

    if (String(code).includes("Tab")) {
      // note that on NYT, tab is necessary to get to next word... ?
      tabToNextOrPreviousClue(shiftKey);
    }
  }

  function renderCell({ props, key }: { props: Cell; key: string }) {
    return <CellDisplay {...props} key={key} />;
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
          <Flex direction="column" alignItems="center">
            <Flex
              bg={theme.color.highlight}
              textColor={theme.color.foreground}
              w={29 / 30}
              h={80}
              p={10}
              alignItems="center"
              justifyContent="center"
            >
              <ClueDisplay {...highlightedClue} />
            </Flex>
            <Flex {...dimensions}>
              <GridDisplay
                size={size}
                data={cells}
                renderChildComponent={renderCell}
              />
            </Flex>
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

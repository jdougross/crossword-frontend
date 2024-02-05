"use client";

import data from "./data.json";
import { Button, Flex, Text } from "@chakra-ui/react";
import React, { createContext, useEffect, useState } from "react";
import {
  Cell,
  Clue,
  CrosswordProps,
  Direction,
  GameContextType,
  GetNextIndexParams,
} from "./types";
import { theme, transformData } from "./utils";
import { CellDisplay } from "./Cell";
import { ClueDisplay, ClueLists } from "./Clues";
import { GridDisplay } from "./GridDisplay";

export const GameContext = createContext({} as GameContextType);

function Crossword(props: CrosswordProps) {
  const {
    boundaryIndexes,
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

  const highlightedClueNumber = cells[selectedSquare].clues[direction];
  const highlightedClue =
    clues[direction].find(
      (clue) => clue.clueNumber === highlightedClueNumber,
    ) || ({} as Clue);

  // scroll the active clue to the top of its list
  const clueListRef = clueListRefs[direction][highlightedClue.clueListIndex];
  clueListRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  useEffect(() => {
    // console.log('userInputs changed')
    checkGrid() && console.log("CONGRATULATIONS");
  }, [userInputs]);

  function checkGrid() {
    return grid.every((g, i) => g === userInputs[i] || g === ".");
  }

  function updateUserInput(index: number, value: string) {
    let temp = userInputs.slice();
    temp[index] = value;
    setUserInputs(temp);
  }

  function toggleDirection() {
    setDirection(
      direction === Direction.ACROSS ? Direction.DOWN : Direction.ACROSS,
    );
  }

  function selectSquare(i: number) {
    if (i === selectedSquare) return;

    inputRefs[selectedSquare].current?.blur();
    inputRefs[i].current?.focus();
    setSelectedSquare(i);
  }

  function getNextIndex({
    skipFilledCells = true,
    prev = false,
  }: GetNextIndexParams) {
    // NYT Behavior - finish the clue before going to the next one
    const atEndOfClue = Math.max(...highlightedClue.cells) === selectedSquare;
    const unfinishedPartOfClue = highlightedClue.cells.filter(
      (i) => userInputs[i] === "",
    );

    if (atEndOfClue && unfinishedPartOfClue.length > 0) {
      return Math.min(...unfinishedPartOfClue);
    }

    let newDirection = direction;

    function findNextIndex(currentIndex: number) {
      let newIndex =
        cells[currentIndex][prev ? "prevIndex" : "nextIndex"][newDirection];

      // important that the order of newIndex and newDirection being assigned depend on prev
      if (prev && currentIndex === boundaryIndexes.first[newDirection]) {
        newDirection =
          newDirection === Direction.ACROSS ? Direction.DOWN : Direction.ACROSS;
        newIndex = cells[currentIndex].prevIndex[newDirection];
      }

      if (!prev && currentIndex === boundaryIndexes.last[newDirection]) {
        console.log(cells[currentIndex]);
        newIndex = cells[currentIndex].nextIndex[newDirection];
        newDirection =
          newDirection === Direction.ACROSS ? Direction.DOWN : Direction.ACROSS;
      }

      return newIndex;
    }

    let newIndex = findNextIndex(selectedSquare);

    if (skipFilledCells) {
      let safety = 0;

      while (safety < grid.length && userInputs[newIndex] != "") {
        // console.log(`skipping ${userInputs[newIndex]}...`);
        newIndex = findNextIndex(newIndex);
        safety++;
      }
    }

    newDirection != direction && toggleDirection();

    return newIndex;
  }

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
    getNextIndex,
    grid,
    gridnums,
    highlightedClueNumber,
    // highlightedSquares,
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
  // console.log(`SelectedSquare.nextClues: `, cells[selectedSquare])

  function tabToNextOrPreviousClue(shiftKey: boolean) {
    let newClue = shiftKey
      ? highlightedClue.prevClue
      : highlightedClue.nextClue;

    let newGridIndex = clues[newClue.direction][
      newClue.clueListIndex
    ].cells.find((i) => userInputs[i] === "");

    if (newGridIndex === undefined) {
      newGridIndex = getNextIndex({ skipFilledCells: true, prev: shiftKey });
    } else {
      direction != newClue.direction && toggleDirection();
    }

    selectSquare(newGridIndex);
  }

  function handleKeyboardEvents(event: any) {
    const code = event?.code;
    const shiftKey = event?.shiftKey;

    if (!code) {
      return;
    }

    if (event?.code === "Backspace" || event?.code === "Delete") {
      if (userInputs[selectedSquare].length > 0) {
        updateUserInput(selectedSquare, "");
      } else {
        let nextIndex = getNextIndex({ skipFilledCells: false, prev: true });
        updateUserInput(nextIndex, "");
        selectSquare(nextIndex);
      }
    }

    // there's a race-conditions thing here - we may need to pass init index or direction into getNextIndex
    if (String(code) === "ArrowLeft") {
      if (direction === Direction.DOWN) {
        setDirection(Direction.ACROSS);
      } else {
        setSelectedSquare(getNextIndex({ skipFilledCells: false, prev: true }));
      }
    }

    if (String(code) === "ArrowRight") {
      if (direction === Direction.DOWN) {
        setDirection(Direction.ACROSS);
      } else {
        setSelectedSquare(
          getNextIndex({ skipFilledCells: false, prev: false }),
        );
      }
    }

    if (String(code) === "ArrowUp") {
      if (direction === Direction.ACROSS) {
        setDirection(Direction.DOWN);
      } else {
        setSelectedSquare(getNextIndex({ skipFilledCells: false, prev: true }));
      }
    }

    if (String(code) === "ArrowDown") {
      if (direction === Direction.ACROSS) {
        setDirection(Direction.DOWN);
      } else {
        setSelectedSquare(
          getNextIndex({ skipFilledCells: false, prev: false }),
        );
      }
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
          <Flex direction="column" alignItems="center" w={dimensions.w}>
            <Flex
              bg={theme.color.highlight}
              textColor={theme.color.foreground}
              textAlign="center"
              w={29 / 30}
              h={80}
              p={40}
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

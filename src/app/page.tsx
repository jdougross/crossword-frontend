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
  const [cellsToCheck, setCellsToCheck] = useState(
    Array(grid.length).fill(false),
  );

  /*
    we want both check and reveal
    with a correct check or a reveal, 
      cell no longer editable, text blue, normal background
  */

  const acrossClueNumber = cells[selectedSquare].clues.across;
  const downClueNumber = cells[selectedSquare].clues.down;

  const acrossClue =
    clues.across.find((clue) => clue.clueNumber === acrossClueNumber) ||
    ({} as Clue);

  const downClue =
    clues.down.find((clue) => clue.clueNumber === downClueNumber) ||
    ({} as Clue);

  // DfaC behavior: show the alt direction clue next to it
  const acrossClueListRef = clueListRefs.across[acrossClue.clueListIndex];
  const downClueListRef = clueListRefs.down[downClue.clueListIndex];

  /*
    scrollIntoView can't be called twice in succession like this with behavior: "smooth".  Can try to use scrollTo if needed.
    https://stackoverflow.com/questions/49318497/google-chrome-simultaneously-smooth-scrollintoview-with-more-elements-doesn
  */

  acrossClueListRef?.current?.scrollIntoView({
    behavior: "auto",
    block: "center",
  });
  downClueListRef?.current?.scrollIntoView({
    behavior: "auto",
    block: "center",
  });

  const selectedClue = direction === Direction.ACROSS ? acrossClue : downClue;

  useEffect(() => {
    // console.log('userInputs changed')
    checkGrid() && console.log("CONGRATULATIONS");
  }, [userInputs]);

  function checkGrid() {
    return grid.every((g, i) => g === userInputs[i] || g === ".");
  }

  function updateUserInputs(args: Array<[number, string]>) {
    let newInputs = userInputs.slice();
    let newChecks = cellsToCheck.slice();

    args.forEach(([index, value]) => {
      newInputs[index] = value;
      newChecks[index] = false;
    });

    setUserInputs(newInputs);
    setCellsToCheck(newChecks);
  }

  function toggleDirection() {
    setDirection(
      direction === Direction.ACROSS ? Direction.DOWN : Direction.ACROSS,
    );
  }

  function selectSquare(i: number) {
    // console.log(`selecting ${i}`)
    if (i === selectedSquare) return;

    inputRefs[selectedSquare].current?.blur();
    inputRefs[i].current?.focus();
    setSelectedSquare(i);
  }

  function getNextIndex({
    skipFilledCells = true,
    prev = false,
    touchEveryCell = false,
  }: GetNextIndexParams) {
    // NYT Behavior - finish the clue before going to the next one
    // state updates too slowly to not be included in unfinishedPartOfClue
    const atEndOfClue = Math.max(...selectedClue.cells) === selectedSquare;
    const unfinishedPartOfClue = selectedClue.cells.filter(
      (i) => userInputs[i] === "",
    );

    if (!touchEveryCell && atEndOfClue && unfinishedPartOfClue.length > 1) {
      console.log("finishing a clue");
      return Math.min(...unfinishedPartOfClue);
    }

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

    let newDirection = direction;
    let newIndex = findNextIndex(selectedSquare);

    if (skipFilledCells) {
      let safety = 0;
      while (safety < grid.length && userInputs[newIndex] != "") {
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
    cellsToCheck,
    clueListRefs,
    clues,
    getNextIndex,
    grid,
    gridnums,
    selectedClueNumber: selectedClue.clueNumber,
    inputRefs,
    selectedSquare,
    size,
    setDirection: (d: Direction) => setDirection(d),
    selectSquare,
    toggleDirection,
    updateUserInputs,
    userInputs,
  };

  // console.log(`Selected Square: ${selectedSquare}`);
  // console.log(`SelectedSquare.nextClues: `, cells[selectedSquare])

  function tabToNextOrPreviousClue(shiftKey: boolean) {
    let newClue = shiftKey ? selectedClue.prevClue : selectedClue.nextClue;

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
        updateUserInputs([[selectedSquare, ""]]);
      } else {
        let nextIndex = getNextIndex({
          skipFilledCells: false,
          prev: true,
          touchEveryCell: true,
        });
        updateUserInputs([[nextIndex, ""]]);
        selectSquare(nextIndex);
      }
    }

    if (String(code) === "ArrowLeft") {
      if (direction === Direction.DOWN) {
        setDirection(Direction.ACROSS);
      } else {
        selectSquare(
          getNextIndex({
            skipFilledCells: false,
            prev: true,
            touchEveryCell: true,
          }),
        );
      }
    }

    if (String(code) === "ArrowRight") {
      if (direction === Direction.DOWN) {
        setDirection(Direction.ACROSS);
      } else {
        selectSquare(
          getNextIndex({
            skipFilledCells: false,
            prev: false,
            touchEveryCell: true,
          }),
        );
      }
    }

    if (String(code) === "ArrowUp") {
      if (direction === Direction.ACROSS) {
        setDirection(Direction.DOWN);
      } else {
        selectSquare(
          getNextIndex({
            skipFilledCells: false,
            prev: true,
            touchEveryCell: true,
          }),
        );
      }
    }

    if (String(code) === "ArrowDown") {
      if (direction === Direction.ACROSS) {
        setDirection(Direction.DOWN);
      } else {
        selectSquare(
          getNextIndex({
            skipFilledCells: false,
            prev: false,
            touchEveryCell: true,
          }),
        );
      }
    }

    if (String(code).includes("Tab")) {
      /* 
        NYT: tab needed to go to next clue.

        case: edit one letter of completed word,
        dissatisfying jump to next open square.
        make configurable?
      */
      tabToNextOrPreviousClue(shiftKey);
    }
  }

  function revealCell() {
    updateUserInputs([[selectedSquare, grid[selectedSquare]]]);
  }

  function revealClue() {
    updateUserInputs(selectedClue.cells.map((i) => [i, grid[i]]));
  }

  function checkCell() {
    let temp = cellsToCheck.slice();
    temp[selectedSquare] = true;
    setCellsToCheck(temp);
  }

  function checkClue() {}

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

          <Button
            w="15%"
            background="gray"
            margin={20}
            padding={4}
            onClick={checkCell}
          >
            <Text>{"Check Cell"}</Text>
          </Button>

          <Button
            w="15%"
            background="gray"
            margin={20}
            padding={4}
            onClick={checkClue}
          >
            <Text>{"Check Clue"}</Text>
          </Button>

          <Button
            w="15%"
            background="gray"
            margin={20}
            padding={4}
            onClick={revealCell}
          >
            <Text>{"Reveal Cell"}</Text>
          </Button>

          <Button
            w="15%"
            background="gray"
            margin={20}
            padding={4}
            onClick={revealClue}
          >
            <Text>{"Reveal Clue"}</Text>
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
              <ClueDisplay {...selectedClue} />
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

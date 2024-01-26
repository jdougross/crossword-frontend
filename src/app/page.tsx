"use client";

import data from "./data.json";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  List,
  Text,
} from "@chakra-ui/react";
import next from "next";
import React, { createContext, createRef, useContext, useState } from "react";

enum Direction {
  ACROSS,
  DOWN,
}

const theme = {
  border: {
    width: "1px",
  },
  color: {
    background: "white",
    foreground: "black",
    highlight: "#BDF",
  },
};

interface Cell {
  correctEntry: string;
  index: number;
  ref: React.RefObject<HTMLInputElement>;
  squareNumber: number;
  userEntry: string;
}

function Blank() {
  return (
    <Box
      borderWidth={theme.border.width}
      borderColor={theme.color.foreground}
      bg={theme.color.foreground}
      w="100%"
      h="100%"
    />
  );
}

interface SquareProps {
  cell: Cell;
}

function Square({ cell }: SquareProps) {
  const {
    direction,
    grid,
    isRevealed,
    highlightedSquares,
    inputRefs,
    selectedSquare,
    setDirection,
    setSelectedSquare,
    size,
  } = useContext(GameContext);
  const { correctEntry, index, ref, squareNumber, userEntry } = cell;

  const [userValue, setUserValue] = useState(userEntry);

  function getNextIndex() {
    let topOfClue = -1;
    if (direction === Direction.DOWN) {
      // normal down case, open square below
      if (index + size.cols <= grid.length && grid[index + size.cols] != ".") {
        return index + size.cols;
      }

      topOfClue = index;
      while (topOfClue - size.cols >= 0 && grid[topOfClue] != ".") {
        topOfClue -= size.cols;
      }
    }
    let nextIndex = topOfClue === -1 ? index + 1 : topOfClue + 1;
    // we're not finding the next DOWN clue very well here
    while (grid[nextIndex] == ".") {
      nextIndex++;
    }

    // if we finished the last clue, swap directions and go to the top
    if (nextIndex >= grid.length) {
      setDirection(
        direction === Direction.ACROSS ? Direction.DOWN : Direction.ACROSS,
      );
      nextIndex = nextIndex % grid.length;
    }

    console.log(`NEXT INDEX: ${nextIndex}`);
    return nextIndex;
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setUserValue(event.target.value.slice(-1).toUpperCase() || "");
    const nextIndex = getNextIndex();
    // handle edge case of end of puzzle - go back and switch directions
    setSelectedSquare(nextIndex);
    inputRefs[index].current?.blur();
    inputRefs[nextIndex].current?.focus();
  }

  const backgroundColor = highlightedSquares.includes(index)
    ? selectedSquare === index
      ? "#DF0"
      : theme.color.highlight
    : theme.color.background;

  return correctEntry == "." ? (
    <Blank />
  ) : (
    <Flex
      backgroundColor={backgroundColor}
      borderWidth={theme.border.width}
      borderColor={theme.color.foreground}
      w="100%"
      h="100%"
      direction="column"
    >
      <Box h={"20%"}>
        <Text
          color={theme.color.foreground}
          fontSize={10}
          children={squareNumber || ""}
        />{" "}
        {/* OK OR NAH? */}
      </Box>
      <Flex w="100%" h="100%" align="center" justify="center">
        {isRevealed ? (
          <Text color={theme.color.foreground} children={correctEntry} />
        ) : (
          <Input
            w="100%"
            backgroundColor={backgroundColor}
            textAlign={"center"}
            textColor={theme.color.foreground}
            _focusVisible={{ outline: "none", caretColor: "transparent" }}
            value={userValue}
            ref={ref}
            onChange={handleInputChange}
            onFocus={() => setSelectedSquare(index)}
            autoFocus={selectedSquare === index}
          />
        )}
      </Flex>
    </Flex>
  );
}

function Grid({ rows }: { rows: Cell[][] }) {
  return (
    <Box bg={theme.color.background} w="100%">
      <Flex
        h="100%"
        direction="column"
        align="space-between"
        justify="space-between"
      >
        {rows.map((row, rowIndex) => (
          <Flex
            h="100%"
            direction="row"
            alignItems="center"
            justifyContent={"space-between"}
            key={JSON.stringify(row)}
          >
            {row.map((cell, colIndex) => (
              <Square cell={cell} key={`${colIndex}${cell.correctEntry}`} />
            ))}
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}

function HeaderSection({
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

const GameContext = createContext({
  isRevealed: false,
  direction: Direction.ACROSS,
  grid: [] as string[],
  gridnums: [] as number[],
  highlightedClueNumber: 1,
  highlightedSquares: [0],
  inputRefs: [] as React.RefObject<HTMLInputElement>[],
  size: { rows: 0, cols: 0 },
  selectedSquare: 0,
  setDirection: (d: Direction) => {},
  setSelectedSquare: (i: number) => {},
});

function Crossword() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [direction, setDirection] = useState(Direction.ACROSS);
  const [selectedSquare, setSelectedSquare] = useState(0);

  const { author, date, clues, grid, gridnums, size, title } = data;

  let highlightedSquares: number[] = [selectedSquare];

  if (direction === Direction.ACROSS) {
    let l = selectedSquare - 1;
    let r = selectedSquare + 1;
    while (grid[l] != "." && l >= 0 && l % size.rows != size.cols - 1) {
      highlightedSquares.push(l);
      l--;
    }
    while (grid[r] != "." && r >= 0 && r < grid.length && r % size.rows != 0) {
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
  let highlightedClueIndex = Math.min(...highlightedSquares);
  let highlightedClueNumber =
    highlightedClueIndex == -1 ? 1 : gridnums[highlightedClueIndex];

  // test for accurate puzzle size?
  const gridRows: Cell[][] = [];
  const inputRefs = Array.from(
    { length: grid.length },
    () => React.createRef() as React.RefObject<HTMLInputElement>,
  );

  for (let r = 0; r < size.rows; r++) {
    let gridRow = [];
    let chars = grid.slice(r * size.cols, (r + 1) * size.cols);
    let nums = gridnums.slice(r * size.cols, (r + 1) * size.cols);

    for (let c = 0; c < size.cols; c++) {
      const index = r * size.cols + c;
      gridRow.push({
        correctEntry: chars[c],
        index,
        ref: inputRefs[index],
        squareNumber: nums[c],
        userEntry: "",
      });
    }

    gridRows.push(gridRow);
  }

  const dim = 700;
  const dimensions = {
    w: dim,
    h: dim,
    padding: "10px",
  };

  return (
    <Flex direction="column" justify="space-between" align="center">
      <GameContext.Provider
        value={{
          isRevealed,
          direction,
          grid,
          gridnums,
          highlightedClueNumber,
          highlightedSquares,
          inputRefs,
          selectedSquare,
          size,
          setDirection: (d) => setDirection(d),
          setSelectedSquare: (i) => setSelectedSquare(i),
        }}
      >
        <HeaderSection author={author} date={date} title={title} />
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
            onClick={() => setIsRevealed(!isRevealed)}
          >
            <Text>{isRevealed ? "Hide Answers" : "Show Answers"}</Text>
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
          <Flex
            {...dimensions}
            borderWidth={theme.border.width}
            borderColor={theme.color.foreground}
          >
            <Grid rows={gridRows} />
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

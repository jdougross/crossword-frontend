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
import React, { createContext, useContext, useState } from "react";

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
  const { isRevealed, highlightedSquares, selectedSquare, setSelectedSquare } =
    useContext(GameContext);
  const { correctEntry, index, squareNumber, userEntry } = cell;

  const [userValue, setUserValue] = useState(userEntry);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setUserValue(event.target.value.slice(-1).toUpperCase() || "");
  }

  const backgroundColor =
    // selectedSquare == index ? theme.color.highlight : theme.color.background;
    highlightedSquares.includes(index)
      ? theme.color.highlight
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
            _focusVisible={{ outline: "none" }}
            value={userValue}
            onChange={handleInputChange}
            onFocus={() => setSelectedSquare(index)}
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
  const { direction: contextDirection, highlightedClueNumber } =
    useContext(GameContext);

  const clueNumber = Number(clue.split(".")[0]);
  const backgroundColor =
    clueNumber == highlightedClueNumber && direction === contextDirection
      ? theme.color.highlight
      : theme.color.foreground; // weird theming... bg / fg should be different
  return (
    <Text backgroundColor={backgroundColor} py={8}>
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
  highlightedClueNumber: 1,
  highlightedSquares: [-1],
  selectedSquare: -1,
  setSelectedSquare: (i: number) => {},
});

function Crossword() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [direction, setDirection] = useState(Direction.ACROSS);
  const [selectedSquare, setSelectedSquare] = useState(-1);

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

  for (let r = 0; r < size.rows; r++) {
    let gridRow = [];
    let chars = grid.slice(r * size.cols, (r + 1) * size.cols);
    let nums = gridnums.slice(r * size.cols, (r + 1) * size.cols);

    for (let c = 0; c < size.cols; c++) {
      gridRow.push({
        correctEntry: chars[c],
        index: r * size.cols + c,
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
          highlightedClueNumber,
          highlightedSquares,
          selectedSquare,
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

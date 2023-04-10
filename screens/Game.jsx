import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  updateDoc,
  deleteDoc,
  getDoc,
  doc,
  FieldValue,
  increment,
} from "firebase/firestore";
import { confirmPasswordReset, signOut } from "firebase/auth";
import { auth, database } from "../config/firebase";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import colors from "../colors";

export default function Game() {
  const navigation = useNavigation();
  var myRoomCode = useRoute().params.myRoomCode;
  var myPlayerID = useRoute().params.myPlayerID;
  var opponentID = myPlayerID == 1 ? 2 : 1;
  const [playersArray, setPlayersArray] = useState([
    {
      id: 1,
      name: "player1",
      cups: 11,
      rank: 1000,
    },
    {
      id: 2,
      name: "player2",
      cups: 11,
      rank: 1000,
    },
  ]);
  const [squareFrom, setSquareFrom] = useState(-1);
  const [resignedPlayer, setResignedPlayer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(0);

  const [boardState, setBoardState] = useState([
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [2, 1],
    [],
    [1],
    [2],
    [1, 2],
    [2, 1],
    [],
    [1],
    [2],
    [1, 2],
    [2, 1],
  ]);
  // var boardState = [
  //   [],
  //   [1],
  //   [2],
  //   [2, 1, 0, 1, 2],
  //   [2, 1],
  //   [],
  //   [1],
  //   [2],
  //   [1, 2],
  //   [2, 1],
  //   [],
  //   [1],
  //   [2],
  //   [1, 2],
  //   [2, 1],
  //   [],
  //   [1],
  //   [2],
  //   [1, 2],
  //   [2, 1],
  //   [],
  //   [1],
  //   [2],
  //   [1, 2],
  //   [2, 1],
  // ];
  const coords = [
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
    [2, 5],
    [3, 1],
    [3, 2],
    [3, 3],
    [3, 4],
    [3, 5],
    [4, 1],
    [4, 2],
    [4, 3],
    [4, 4],
    [4, 5],
    [5, 1],
    [5, 2],
    [5, 3],
    [5, 4],
    [5, 5],
  ];
  function moveUp(index) {
    var newBoardState = [...boardState];
    var newSquare = newBoardState[index];
    if (!newSquare.includes(0)) {
      newSquare.unshift(0);
    }
    const gapIndex = newSquare.indexOf(0);
    console.log(newSquare, "zero added");
    if (gapIndex != newSquare.length - 1) {
      [newSquare[gapIndex], newSquare[gapIndex + 1]] = [
        newSquare[gapIndex + 1],
        newSquare[gapIndex],
      ];
      console.log(newSquare, "zero moved");
      handleMyTurn(newBoardState);
      // setBoardState(newBoardState);
      setSquareFrom(index);
    } else {
      newSquare.pop();
      handleMyTurn(newBoardState);
      setSquareFrom(-1);
    }
  }

  function canMove(to, from) {
    var stackTo = boardState[to].length;
    var xDiff = Math.abs(coords[to][0] - coords[from][0]);
    var yDiff = Math.abs(coords[to][1] - coords[from][1]);
    var squaresAway = Math.max(xDiff, yDiff);
    if (stackTo == squaresAway) {
      return true;
    } else {
      return false;
    }
  }

  function myMove(index) {
    if (currentPlayer == myPlayerID) {
      const docRef = doc(database, "cups", myRoomCode);
      var nextPlayer = myPlayerID == 2 ? 1 : 2;
      if (
        boardState[index].length == 0 &&
        squareFrom == -1 &&
        playersArray[myPlayerID - 1].cups > 0
      ) {
        var newBoardState = [...boardState];
        newBoardState[index].push(myPlayerID);
        handleMyTurn(newBoardState);
        getDoc(docRef).then((doc) => {
          if (doc.exists()) {
            const currentPlayersArray = doc.data().playersArray || [];
            currentPlayersArray[myPlayerID - 1].cups--;
            updateDoc(docRef, {
              currentPlayer: nextPlayer,
              playersArray: currentPlayersArray,
            });
          }
        });

        // setBoardState(newBoardState);
      } else if (squareFrom == -1 || squareFrom == index) {
        moveUp(index);
      } else if (canMove(index, squareFrom)) {
        var newBoardState = [...boardState];
        var piecesMoved = boardState[squareFrom].slice(
          0,
          boardState[squareFrom].indexOf(0)
        );
        newBoardState[index] = piecesMoved.concat(newBoardState[index]);
        newBoardState[squareFrom].splice(
          0,
          newBoardState[squareFrom].indexOf(0) + 1
        );
        if (newBoardState[squareFrom].indexOf(0) == 0) {
          newBoardState[squareFrom] = [];
        }
        // setBoardState(newBoardState);
        handleMyTurn(newBoardState);
        updateDoc(docRef, {
          currentPlayer: nextPlayer,
        });
        setSquareFrom(-1);
      }
    }
  }
  // listen for changes and update
  useLayoutEffect(() => {
    const docRef = doc(database, "cups", myRoomCode);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.data() != null) {
        setPlayersArray(doc.data().playersArray);
        setResignedPlayer(doc.data().resignedPlayer);
        setCurrentPlayer(doc.data().currentPlayer);
        if (doc.data().playersArray.length == 2) {
          setGameStarted(true);
        }
        var boardArray = [];
        boardArray[0] = doc.data().boardState.s11;
        boardArray[1] = doc.data().boardState.s12;
        boardArray[2] = doc.data().boardState.s13;
        boardArray[3] = doc.data().boardState.s14;
        boardArray[4] = doc.data().boardState.s15;
        boardArray[5] = doc.data().boardState.s21;
        boardArray[6] = doc.data().boardState.s22;
        boardArray[7] = doc.data().boardState.s23;
        boardArray[8] = doc.data().boardState.s24;
        boardArray[9] = doc.data().boardState.s25;
        boardArray[10] = doc.data().boardState.s31;
        boardArray[11] = doc.data().boardState.s32;
        boardArray[12] = doc.data().boardState.s33;
        boardArray[13] = doc.data().boardState.s34;
        boardArray[14] = doc.data().boardState.s35;
        boardArray[15] = doc.data().boardState.s41;
        boardArray[16] = doc.data().boardState.s42;
        boardArray[17] = doc.data().boardState.s43;
        boardArray[18] = doc.data().boardState.s44;
        boardArray[19] = doc.data().boardState.s45;
        boardArray[20] = doc.data().boardState.s51;
        boardArray[21] = doc.data().boardState.s52;
        boardArray[22] = doc.data().boardState.s53;
        boardArray[23] = doc.data().boardState.s54;
        boardArray[24] = doc.data().boardState.s55;
        if (doc.data().resignedPlayer != 0) {
          setGameStarted(false);
          var winner = doc.data().resignedPlayer == 1 ? 2 : 1;
          console.log(winner, doc.data().resignedPlayer);
          setGameOver(winner);
        }
        for (let i = 1; i < 25; i++) {
          if (boardArray[i].length > 4 && !boardArray[i].includes(0)) {
            console.log(
              "game over",
              boardArray[i][0] == 2 ? "black" : "brown",
              "wins"
            );
            setGameStarted(false);
            setGameOver(boardArray[i][0]);
          }
        }
        setBoardState(boardArray);
      }
    });
    return unsubscribe;
  }, []);

  // send text to firebase
  const handleMyTurn = useCallback((newBoardState) => {
    const docRef = doc(database, "cups", myRoomCode);
    let nextPlayer = 0;
    getDoc(docRef).then((doc) => {
      if (doc.exists()) {
        // const currentPlayersArray = doc.data().playersArray || [];
        const currentBoard = doc.data().boardState || [];
        if (myPlayerID == 1) {
          nextPlayer = 2;
        } else {
          nextPlayer = 1;
        }
        currentBoard.s11 = newBoardState[0];
        currentBoard.s12 = newBoardState[1];
        currentBoard.s13 = newBoardState[2];
        currentBoard.s14 = newBoardState[3];
        currentBoard.s15 = newBoardState[4];
        currentBoard.s21 = newBoardState[5];
        currentBoard.s22 = newBoardState[6];
        currentBoard.s23 = newBoardState[7];
        currentBoard.s24 = newBoardState[8];
        currentBoard.s25 = newBoardState[9];
        currentBoard.s31 = newBoardState[10];
        currentBoard.s32 = newBoardState[11];
        currentBoard.s33 = newBoardState[12];
        currentBoard.s34 = newBoardState[13];
        currentBoard.s35 = newBoardState[14];
        currentBoard.s41 = newBoardState[15];
        currentBoard.s42 = newBoardState[16];
        currentBoard.s43 = newBoardState[17];
        currentBoard.s44 = newBoardState[18];
        currentBoard.s45 = newBoardState[19];
        currentBoard.s51 = newBoardState[20];
        currentBoard.s52 = newBoardState[21];
        currentBoard.s53 = newBoardState[22];
        currentBoard.s54 = newBoardState[23];
        currentBoard.s55 = newBoardState[24];

        updateDoc(docRef, {
          // playersArray: currentPlayersArray,
          // currentPlayer: nextPlayer,
          boardState: currentBoard,
        });
      }
    });
  }, []);

  // function handleRematch() {
  //   //
  // }
  function handleHome() {
    const docRef = doc(database, "cups", myRoomCode);
    deleteDoc(docRef);
    navigation.navigate("Home");
  }
  function handleClose() {
    setGameOver(false);
    setGameStarted(true);
    setCurrentPlayer(0);
  }

  function handleResign() {
    const docRef = doc(database, "cups", myRoomCode);
    getDoc(docRef).then((doc) => {
      if (doc.exists()) {
        updateDoc(docRef, {
          resignedPlayer: myPlayerID,
        });
      }
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>CUPS</Text>
      <View style={styles.playerTag}>
        <View
          style={[
            styles.turnIndicator,
            currentPlayer == myPlayerID
              ? {}
              : { backgroundColor: colors.darkblue },
          ]}
        >
          <Text style={styles.playerName}>
            {gameStarted ? playersArray[opponentID - 1].name : "xxxxxxxx"}
          </Text>
          <Text style={styles.playerElo}>
            {gameStarted ? playersArray[opponentID - 1].rank : "xxxx"}
          </Text>
        </View>
        <View style={styles.row}>
          <View style={myPlayerID == 2 ? styles.piece1 : styles.piece2} />
          <Text style={styles.playerCups}>
            : {gameStarted ? playersArray[myPlayerID - 1].cups : "xx"}
          </Text>
        </View>
      </View>
      {gameStarted ? (
        <View style={styles.gameBoard}>
          {boardState.map((sqr, index) => (
            <TouchableOpacity
              key={index}
              style={styles.sqr}
              onPress={() => myMove(index)}
            >
              {sqr.map((piece, index) => (
                <View
                  key={index}
                  style={[
                    piece == 0
                      ? styles.gap
                      : piece == 1
                      ? styles.piece1
                      : styles.piece2,
                  ]}
                ></View>
              ))}
            </TouchableOpacity>
          ))}
        </View>
      ) : gameOver == 0 ? (
        <View style={styles.waitingPopUp}>
          <Text style={styles.roomCode}>{myRoomCode}</Text>
          <Text style={styles.waitingText}>waiting for an opponent...</Text>
        </View>
      ) : (
        <View style={styles.waitingPopUp}>
          <Text style={styles.gameOver}>
            {(gameOver === 2 ? "Black" : "Brown") + " is victorious!"}
          </Text>
          {/* <TouchableOpacity style={styles.waitingBtn} onPress={handleRematch}>
            <Text style={styles.waitingText}>Rematch</Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.waitingBtn} onPress={handleHome}>
            <Text style={styles.waitingText}>Back to Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.waitingBtn} onPress={handleClose}>
            <Text style={styles.waitingText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.playerTag}>
        <View
          style={[
            styles.turnIndicator,
            currentPlayer == myPlayerID
              ? { backgroundColor: colors.darkblue }
              : {},
          ]}
        >
          <Text style={styles.playerName}>
            {gameStarted ? playersArray[myPlayerID - 1].name : "xxxxxxxx"}
          </Text>
          <Text style={styles.playerElo}>
            {gameStarted ? playersArray[myPlayerID - 1].rank : "xxxx"}
          </Text>
        </View>
        <View style={styles.row}>
          <View style={myPlayerID == 2 ? styles.piece2 : styles.piece1} />
          <Text style={styles.playerCups}>
            : {gameStarted ? playersArray[myPlayerID - 1].cups : "xx"}
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        {gameStarted ? (
          <TouchableOpacity onPress={handleResign}>
            <Text style={styles.footerBtn}>Resign</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleHome}>
            <Text style={styles.footerBtn}>Home</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  turnIndicator: {
    padding: 5,
    paddingRight: 40,
    borderRadius: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightblue,
    padding: 5,
    borderRadius: 5,
  },
  footerBtn: { color: colors.white, padding: 10 },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 5,
  },
  gameOver: {
    fontSize: 30,
    padding: 10,
    color: colors.white,
  },
  waitingText: {
    color: colors.white,
    margin: 5,
    fontSize: 16,
    textAlign: "center",
  },
  waitingBtn: {
    backgroundColor: colors.lightblue,
    borderRadius: 5,
    margin: 5,
    width: "50%",
  },
  roomCode: {
    fontSize: 40,
    padding: 10,
    backgroundColor: colors.lightblue,
    color: colors.white,
  },

  waitingPopUp: {
    backgroundColor: colors.darkblue,
    width: "100%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  piece1: {
    width: 40,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderTopWidth: 10,
    borderBottomWidth: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopColor: colors.white,
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  piece2: {
    width: 40,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderTopWidth: 10,
    borderBottomWidth: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopColor: colors.black,
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  gap: { width: 40, height: 5 },
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  sqr: {
    backgroundColor: String(colors.lightgrey + "3d"),
    height: "18%",
    padding: "1%",
    aspectRatio: 1,
    margin: "1%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: colors.white,
    alignSelf: "center",
    paddingBottom: 24,
  },
  playerTag: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  playerName: {
    color: colors.white,
  },
  playerElo: {
    color: colors.lightblue,
  },
  playerCups: {
    color: colors.darkgrey,
  },
  gameBoard: {
    backgroundColor: colors.darkblue,
    width: "100%",
    aspectRatio: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
});

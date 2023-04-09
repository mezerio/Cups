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
  getDoc,
  doc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, database } from "../config/firebase";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import colors from "../colors";

export default function Game() {
  const navigation = useNavigation();
  var myRoomCode = useRoute().params.RoomCode;
  var playerID = useRoute().params.myPlayerID;
  const [playersArray, setPlayersArray] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [boardState, setBoardState] = useState([
    [],
    [1],
    [2],
    [1, 1, 2, 2],
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

  function moveUp(index) {
    var newBoardState = [...boardState];
    var newSquare = boardState[index];
    if (!newSquare.includes(0)) {
      newSquare.unshift(0);
    }
    const gapIndex = newSquare.indexOf(0);
    console.log(newSquare, "9");
    if (gapIndex != newSquare.length - 1) {
      [newSquare[gapIndex], newSquare[gapIndex + 1]] = [
        newSquare[gapIndex + 1],
        newSquare[gapIndex],
      ];
      console.log(newSquare, "0");
      setBoardState(newBoardState);
    }
  }

  // listen for changes and update
  useLayoutEffect(() => {
    const docRef = doc(database, "cups", myRoomCode);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      //
    });
    return unsubscribe;
  }, []);

  // send text to firebase
  const handleCardTaken = useCallback((cardTaken) => {
    const docRef = doc(database, "cups", myRoomCode);
    let nextPlayer = 0;
    getDoc(docRef).then((doc) => {
      if (doc.exists()) {
        const currentPlayersArray = doc.data().playersArray || [];
        const currentDeck = doc.data().deck || [];
        var currentShmanksOnCard = doc.data().shmanksOnCard || 0;
        const totPlayers = currentPlayersArray.length;
        if (playerID < totPlayers) {
          nextPlayer = playerID + 1;
        } else {
          nextPlayer = 1;
        }
        if (cardTaken == true) {
          currentPlayersArray[playerID - 1].cards.push(currentDeck[0]);
          currentPlayersArray[playerID - 1].shmanks =
            currentPlayersArray[playerID - 1].shmanks + currentShmanksOnCard;
          currentDeck.shift();
          currentShmanksOnCard = 0;
        } else {
          currentPlayersArray[playerID - 1].shmanks--;
          currentShmanksOnCard++;
        }

        updateDoc(docRef, {
          playersArray: currentPlayersArray,
          currentPlayer: nextPlayer,
          deck: currentDeck,
          shmanksOnCard: currentShmanksOnCard,
        });
      }
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>CUPS</Text>
      <View style={styles.playerTag}>
        <View>
          <Text style={styles.playerName}>Player 1</Text>
          <Text style={styles.playerElo}>1000</Text>
        </View>
        <Text style={styles.playerCups}>cups:16</Text>
      </View>
      <View style={styles.gameBoard}>
        {boardState.map((sqr, index) => (
          <TouchableOpacity
            key={index}
            style={styles.sqr}
            onPress={() => moveUp(index)}
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
      <View style={styles.playerTag}>
        <View>
          <Text style={styles.playerName}>Player 2</Text>
          <Text style={styles.playerElo}>1000</Text>
        </View>
        <Text style={styles.playerCups}>cups:16</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  piece1: {
    width: 40,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderTopWidth: 10,
    borderBottomWidth: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopColor: "brown",
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
    borderTopColor: "black",
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
    backgroundColor: colors.lightgrey,
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

import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  TextInput,
  SafeAreaView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import colors from "../colors";
import { auth, database } from "../config/firebase";
// import { useClipboard } from "@react-native-community/hooks";

import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  updateDoc,
  getDoc,
  doc,
  setDoc,
  where,
  deleteDoc,
} from "firebase/firestore";

const Waiting = () => {
  // const { setString } = useClipboard();
  const [playerList, setPlayerList] = useState([]);
  const navigation = useNavigation();
  var myRoomCode = useRoute().params.RoomCode;
  var playerID = useRoute().params.myPlayerID;
  var minPlayers = 1;
  var deck = [];
  for (let i = 3; i <= 35; i++) {
    deck.push(i);
  }

  useLayoutEffect(() => {
    const docRef = doc(database, "cups", myRoomCode);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.data() != null) {
        // console.log(doc.exists, doc.data());
        const newPlayerList = [];
        doc.data().playersArray.map((player) => {
          newPlayerList.push([player.name, player.id]);
        });
        setPlayerList(newPlayerList);
        if (doc.data().gameStarted === true) {
          navigation.navigate("Game", {
            RoomCode: myRoomCode,
            myPlayerID: playerID,
          });
        }
      } else {
        navigation.navigate("Home");
      }
    });
    return unsubscribe;
  }, []);

  function handleBackToHome() {
    const docRef = doc(database, "cups", myRoomCode);
    deleteDoc(docRef);
    navigation.navigate("Home");
  }

  function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    deck.splice(0, 9);
    return deck;
  }
  function handleStartGame() {
    if (playerList.length > minPlayers) {
      deck = shuffleDeck(deck);
      const docRef = doc(database, "cups", myRoomCode);
      updateDoc(docRef, {
        gameStarted: true,
        currentPlayer: 1,
        deck: deck,
        shmanksOnCard: 0,
      });
      // //console.log("starting game in: ", myRoomCode);
    }
  }

  function copyRoomCode() {
    // setString(String(myRoomCode));
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.roomCode}>
        <Text style={styles.roomCodeText}>{myRoomCode}</Text>
      </View>
      <View style={styles.playerList}>
        <Text style={styles.title}>Waiting...</Text>
        {playerList.map((player, index) => (
          <View
            key={index}
            style={[
              styles.playerName,
              playerID == player[1]
                ? { backgroundColor: colors.darkbeige }
                : { backgroundColor: colors.cream },
            ]}
          >
            <Text
              style={
                playerID == player[1]
                  ? { color: colors.white }
                  : { color: colors.black }
              }
            >
              {player[0]}
            </Text>
          </View>
        ))}
      </View>
      {playerID == 1 ? (
        <TouchableOpacity
          onPress={handleStartGame}
          style={
            playerList.length > minPlayers
              ? styles.gameButton
              : [styles.gameButton, { opacity: 0.5 }]
          }
        >
          <Text style={styles.BtnText}>
            {playerList.length > minPlayers
              ? "Start Game"
              : "Waiting for Players..."}
          </Text>
        </TouchableOpacity>
      ) : (
        <View />
      )}
      <TouchableOpacity onPress={handleBackToHome} style={styles.leaveButton}>
        <Text style={styles.BtnText}>Back To Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Waiting;

const styles = StyleSheet.create({
  BtnText: { fontWeight: "bold", color: "#fff", fontSize: 18 },
  roomCode: {
    color: colors.black,
    backgroundColor: colors.cream,
    borderRadius: 5,
    padding: 5,
    marginTop: 40,
    width: "40%",
  },
  roomCodeText: { fontSize: 36, textAlign: "center", fontWeight: "bold" },
  title: {
    color: colors.white,
    fontSize: 20,
    padding: 20,
    paddingHorizontal: 70,
  },
  playerName: {
    color: colors.black,
    padding: 5,
    borderRadius: 5,
    margin: 5,
  },
  container: {
    flex: 1,
    backgroundColor: colors.red,
    alignItems: "center",
  },
  gameButton: {
    backgroundColor: colors.beige,
    height: 58,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
    position: "absolute",
    bottom: 110,
  },
  leaveButton: {
    backgroundColor: colors.beige,
    height: 58,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
    position: "absolute",
    bottom: 40,
  },
  input: {
    color: colors.black,
    backgroundColor: colors.cream,
    height: 58,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
  },
});

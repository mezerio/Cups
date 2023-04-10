import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  TextInput,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import colors from "../colors";
import { auth, database } from "../config/firebase";

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
  arrayUnion,
} from "firebase/firestore";

const Home = () => {
  const [roomCode, setRoomCode] = useState("");
  const navigation = useNavigation();
  var myPlayerID = 1;
  var playersArray = [];
  var startingBoard = {
    s11: [],
    s12: [],
    s13: [],
    s14: [],
    s15: [],
    s21: [],
    s22: [],
    s23: [],
    s24: [],
    s25: [],
    s31: [],
    s32: [],
    s33: [],
    s34: [],
    s35: [],
    s41: [],
    s42: [],
    s43: [],
    s44: [],
    s45: [],
    s51: [],
    s52: [],
    s53: [],
    s54: [],
    s55: [],
  };

  function generateNewCode() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    const testRef = doc(database, "cups", result);
    return getDoc(testRef).then((doc) => {
      if (doc.exists()) {
        return generateNewCode();
      } else {
        return result;
      }
    });
  }

  async function handleCreateRoom() {
    const newRoomCode = await generateNewCode();
    const docRef = doc(database, "cups", newRoomCode);
    playersArray = [
      {
        id: 1,
        name: "player1",
        cups: 11,
        rank: 1000,
      },
    ];
    setDoc(docRef, {
      playersArray,
      boardState: startingBoard,
      currentPlayer: 0,
      resignedPlayer: 0,
    });
    navigation.navigate("Game", {
      myRoomCode: newRoomCode,
      myPlayerID: myPlayerID,
    });
  }

  function handleJoinRoom() {
    if (roomCode.length == 4) {
      const docRef = doc(database, "cups", roomCode);
      getDoc(docRef).then((doc) => {
        if (doc.exists()) {
          const currentPlayersArray = doc.data().playersArray || [];
          myPlayerID = 2;

          const myPlayer = {
            id: 2,
            name: "player2",
            cups: 11,
            rank: 1000,
          };
          currentPlayersArray.push(myPlayer);
          updateDoc(docRef, {
            currentPlayer: 1,
            playersArray: currentPlayersArray,
          });
          navigation.navigate("Game", {
            myRoomCode: roomCode,
            myPlayerID: myPlayerID,
          });
          setRoomCode("");
        }
      });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>CUPS!</Text>

      <TextInput
        value={roomCode}
        style={styles.input}
        placeholder="Enter Room Code"
        autoCapitalize="characters"
        autoCorrect={false}
        textContentType="password"
        placeholderTextColor={colors.darkgrey}
        onChangeText={(text) => setRoomCode(text.toUpperCase())}
      />
      <TouchableOpacity onPress={handleJoinRoom} style={styles.gameButton}>
        <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>
          join game
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleCreateRoom} style={styles.gameButton}>
        <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>
          new game
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: colors.white,
    alignSelf: "center",
    paddingBottom: 24,
  },
  container: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: "center",
    alignItems: "center",
  },
  gameButton: {
    backgroundColor: colors.lightblue,
    height: 58,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    width: "80%",
  },
  input: {
    color: colors.white,
    backgroundColor: colors.darkblue,
    height: 58,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
    width: "50%",
    textAlign: "center",
  },
});

import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
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
  deleteDoc,
  setDoc,
  arrayUnion,
} from "firebase/firestore";

const Home = () => {
  const [roomCode, setRoomCode] = useState("");
  const navigation = useNavigation();
  var playerID = useRoute().params.myPlayerID;
  var myRoomCode = useRoute().params.RoomCode;
  const [ranked, setRanked] = useState(false);
  const [playersArray, setPlayersArray] = useState([]);
  const [playersExited, setPlayersExited] = useState(0);
  const [playersScore, setPlayersScore] = useState([]);

  useLayoutEffect(() => {
    const docRef = doc(database, "cups", myRoomCode);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.data() != null) {
        var newPlayersArray = doc.data().playersArray;
        var newPlayersExited = doc.data().playersExited;
        setPlayersExited(newPlayersExited);
        setPlayersArray(newPlayersArray);
        //   //console.log(newPlayersArray);
        sortRankings(newPlayersArray);
        if (newPlayersExited == newPlayersArray.length) {
          unsubscribe();
          deleteDoc(docRef);
        }
      }
    });
    return unsubscribe;
  }, []);

  function sortRankings(array) {
    // //console.log(array, "arr");
    var newPlayersScore = [];
    array.map((player) => {
      const score = getScore(player);
      newPlayersScore.push([player, score]);
    });
    orderByScores(newPlayersScore);
    setPlayersScore(newPlayersScore);
    setRanked(true);
  }

  function getScore(player) {
    const cardsArray = displayableCards(player.cards);
    const cardsTotal = sumTopCard(cardsArray);
    const score = cardsTotal - player.shmanks;
    return score;
  }

  function displayableCards(cards) {
    const ascendingCards = cards.sort((a, b) => b - a);
    const displayableCardsArray = [];
    let currentSequence = [ascendingCards[0]];
    for (let i = 1; i < ascendingCards.length; i++) {
      if (
        ascendingCards[i] ===
        currentSequence[currentSequence.length - 1] - 1
      ) {
        currentSequence.push(ascendingCards[i]);
      } else {
        displayableCardsArray.push(currentSequence);
        currentSequence = [ascendingCards[i]];
      }
    }
    displayableCardsArray.push(currentSequence);
    return displayableCardsArray;
  }

  function sumTopCard(arr) {
    return arr.reduce((sum, element) => {
      if (Array.isArray(element)) {
        return sum + element[element.length - 1];
      } else {
        return sum + element;
      }
    }, 0);
  }

  function orderByScores(arr) {
    return arr.sort((a, b) => a[1] - b[1]);
  }

  function handleBackToHome() {
    const docRef = doc(database, "cups", myRoomCode);
    var newPlayersExited = playersExited + 1;
    updateDoc(docRef, {
      playersExited: newPlayersExited,
    });
    // //console.log(playersExited, playersScore.length, "shutimkdjnk");
    console.log("left");
    navigation.navigate("Home");
  }

  return (
    <SafeAreaView style={styles.container}>
      {ranked ? (
        <View style={styles.leaderBoard}>
          {playerID == playersScore[0][0].id ? (
            <Text style={styles.title}>You Win!</Text>
          ) : (
            <Text style={styles.title}>You Lose!</Text>
          )}
          {playersScore.map((player, index) => (
            <View
              key={index}
              style={[
                styles.playerCard,
                player[0].id == playerID
                  ? { backgroundColor: colors.darkbeige }
                  : { backgroundColor: colors.beige },
              ]}
            >
              <Text style={styles.rank}>{index + 1}</Text>
              <Text style={styles.name}>{player[0].name}</Text>
              <Text style={styles.score}>{player[1]}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View />
      )}
      <TouchableOpacity onPress={handleBackToHome} style={styles.gameButton}>
        <Text style={styles.BtnText}>Back To Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  BtnText: { fontWeight: "bold", color: "#fff", fontSize: 18 },
  leaderBoard: {
    alignItems: "center",
  },
  title: { fontSize: 50, textAlign: "center", color: colors.white, margin: 40 },
  playerCard: {
    margin: 5,
    padding: 10,
    borderRadius: 10,
    justifyContent: "space-around",
    flexDirection: "row",
    width: "80%",
  },
  rank: { color: colors.white, fontSize: 25 },
  score: { color: colors.white, fontSize: 25 },
  name: { color: colors.white, fontSize: 25 },
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
    bottom: 40,
  },
});

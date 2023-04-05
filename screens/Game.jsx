import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, database } from "../config/firebase";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import colors from "../colors";

export default function Game() {
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();
  var boardState = [
    "s11",
    "s12",
    "s13",
    "s14",
    "s15",
    "s21",
    "s22",
    "s23",
    "s24",
    "s25",
    "s31",
    "s32",
    "s33",
    "s34",
    "s35",
    "s41",
    "s42",
    "s43",
    "s44",
    "s45",
    "s51",
    "s52",
    "s53",
    "s54",
    "s55",
  ];

  const onSignOut = () => {
    signOut(auth).catch((error) => console.log("Error logging out: ", error));
  };

  //top nav bar
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{
            marginRight: 10,
          }}
          onPress={onSignOut}
        >
          <AntDesign
            name="logout"
            size={24}
            color={colors.gray}
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  //retrieve prev messages
  useLayoutEffect(() => {
    const collectionRef = collection(database, "games");
    const q = query(collectionRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log("querySnapshot unsusbscribe");
      setMessages(
        querySnapshot.docs.map((doc) => ({
          _id: doc.data()._id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user,
        }))
      );
    });
    return unsubscribe;
  }, []);

  //send text to firebase
  // const onSend = useCallback((messages = []) => {
  //   console.log(messages);
  //   setMessages((previousMessages) =>
  //    gf.append(previousMessages, messages)
  //   );
  //   // setMessages([...messages, ...messages]);
  //   const { _id, createdAt, text, user } = messages[0];
  //   addDoc(collection(database, "chats"), {
  //     //id for text
  //     _id,
  //     createdAt,
  //     text,
  //     //object contining id of user aka the email
  //     user,
  //   });
  // }, []);

  return (
    <View style={styles.container}>
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
          <View key={index} style={styles.sqr}>
            <Text>{sqr}</Text>
          </View>
        ))}
      </View>
      <View style={styles.playerTag}>
        <View>
          <Text style={styles.playerName}>Player 2</Text>
          <Text style={styles.playerElo}>1000</Text>
        </View>
        <Text style={styles.playerCups}>cups:16</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  sqr: {
    backgroundColor: colors.lightgrey,
    height: "18%",
    aspectRatio: 1,
    margin: "1%",
    opacity: 0.3,
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

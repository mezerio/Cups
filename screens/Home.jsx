import React, { useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import colors from "../colors";

const Home = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter Room Code"
        autoCapitalize="characters"
        autoCorrect={false}
        textContentType="password"
        placeholderTextColor={colors.darkgrey}
      />
      <TouchableOpacity
        onPress={() => navigation.navigate("Game")}
        style={styles.gameButton}
      >
        <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>
          Shutup Mehdi
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate("Game")}
        style={styles.gameButton}
      >
        <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>
          Shutup Medhi
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
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
  },
});

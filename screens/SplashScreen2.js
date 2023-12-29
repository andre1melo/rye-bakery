import React from "react";
import { View, StyleSheet, Image } from "react-native";

const SplashScreen2 = () => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require("../assets/img/RyeBakeryLogo.png")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    height: 100,
    width: "90%",
    resizeMode: "contain",
  },
});

export default SplashScreen2;

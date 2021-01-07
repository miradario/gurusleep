import React from "react";
import { StyleSheet, View, Text } from "react-native";


export default () => {

    return (
      <View style={styles.container}>
        <Text >{'hola'}</Text>
      </View>
    );
  }


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f26f21",
    justifyContent: "flex-end",
  },
});

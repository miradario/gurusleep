import * as React from "react";
import { View, Image, StyleSheet, Text, Dimensions } from "react-native";

import { Channel } from "./Model";

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    width,
    aspectRatio: 640 / 360,
    backgroundColor: "#D667CE",
  },
  cover: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: width /2,
    backgroundColor: "#D667CE",
  },
  content: {
    padding: 12,
    backgroundColor: "#D667CE",
  },
  type: {
    color: "white",
    backgroundColor: "#D667CE",
    fontWeight: "bold"
  },
  title: {
    color: "white",
    backgroundColor: "#D667CE",
    fontSize: 20
  },
  subtitle: {
    color: "white",
    backgroundColor: "#D667CE",
    fontSize: 16
  }
});

interface ThumbnailProps {
  channel: Channel;
}

export default ({
  channel: { Cover, type, title, description }
}: ThumbnailProps) => {
  return (
    <>
      <View style={styles.container}>
        <Image source={{uri: 'https://tlexeurope.s3.eu-central-1.amazonaws.com/images/portaits'+Cover}} style={styles.cover} />
      </View>
      <View style={styles.content}>
        <Text style={styles.type}>{type}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{description}</Text>
      </View>
    </>
  );
};

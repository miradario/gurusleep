import React, { Component } from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import COLORS from "../assets/Colors";
import { FontAwesome as Icon } from "@expo/vector-icons";
import Images from "../components/images";

export default class BackArrow extends Component {

    handlePress() {
        this.props.handleBackPress()
    }

    render() {

        return (
            <View style={styles.mainWrapper}>
                <TouchableOpacity onPress={() => this.handlePress()}>
                    <Image source={Images.back_arrow} style={styles.img} />
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    mainWrapper: {
        position: 'absolute',
        top: 15,
        left: 15,
        zIndex: 10000
    },
    img: {
        width: 35,
        height: 35
    }
});

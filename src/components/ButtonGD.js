import React, { Component } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import COLORS from "../assets/Colors";

export default class ButtonGD extends Component {
    render() {
        const { title, onpress, color } = this.props;

        return (
            <View style={style.loginContainer}>
                <TouchableOpacity style={style.loginButton} onPress={onpress}>
                    <Text style={style.loginText}>{title}</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const style = StyleSheet.create({
    loginButton: {
        paddingLeft: 15,
        paddingRight: 15,
        marginTop: 20,
        paddingTop: 15,
        paddingBottom: 15,
        backgroundColor: COLORS.orange,
        borderRadius: 25,
        minWidth: 200,
        alignContent: "center",
    },
    loginText: {
        textAlign: "center",
        color: COLORS.white,
        fontWeight: "bold",
        fontFamily: "Avenir-Black",
    },
    loginContainer: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowRadius: 5,
        shadowOpacity: 0.7,
        shadowColor: COLORS.black,
        elevation: 2,
    },
});

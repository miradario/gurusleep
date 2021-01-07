import React, { Component } from "react";
import { StyleSheet, View, Dimensions, Image, Button } from "react-native";
import Images from "./images";
import { Text } from "native-base";
import COLORS from "../assets/Colors";
import { Ionicons } from "@expo/vector-icons";

export default class SectionTitle extends Component {
    constructor() {
        super();
        this.state = {

        };
    }
    
    render() {
        const {label, iconName} = this.props
        return (
            <View style={styles.mainWrapper}>
                <View style={styles.circle}>
                    <Ionicons name={iconName} size={30} color={COLORS.white}></Ionicons>
                </View>
                <View style={styles.textWrapper}>
                    <Text style={styles.text}>{label}</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    mainWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'stretch',
        marginTop: 20,
        marginBottom: 10
    },
    textWrapper: {
        width: 240,
        height: 25, 
        backgroundColor: COLORS.orange,
        borderTopRightRadius: 25,
        borderBottomRightRadius: 25,
        paddingLeft: 15,
        marginLeft: -5,
        justifyContent: 'center'
    },
    circle: {
        width: 50, 
        height: 50, 
        borderRadius: 50, 
        backgroundColor: COLORS.lightblue,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000
    },
    text: {
        textAlign: 'center',
        paddingRight: 15
    }
});

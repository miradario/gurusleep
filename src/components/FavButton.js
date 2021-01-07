import React, { Component } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import COLORS from "../assets/Colors";
import { Ionicons } from "@expo/vector-icons";

export default class FavButton extends Component {

    handlePress(){
        this.props.handleFavPress()
    }

    render() {
        const {heartColor, del} = this.props
        let icon='md-heart';
        if (del) {
            icon='md-close-circle'
        }

        return (
            <TouchableOpacity style={styles.btnFavWrapper} onPress={() => this.handlePress()}>
                <View style={del?styles.delOutline: styles.favOutline}>
                    <Ionicons name={icon} color={heartColor} size={20}/>
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    btnFavWrapper: {
        position: 'absolute',
        top: 7,
        right: 7
    },
    favOutline: {
        height: 30,
        width: 30,
        borderRadius: 50,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 3
    },
    delOutline: {
        height: 20,
        width: 20,
        borderRadius: 50,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center'
    }
});

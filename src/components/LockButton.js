import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import COLORS from "../assets/Colors";
import { Ionicons } from "@expo/vector-icons";

export default class LockButton extends Component {

    render() {
        const { locked } = this.props
        return (
            (locked &&
                <View style={styles.btnLockWrapper}>
                    <View style={styles.lockOutline}>
                        <Ionicons name={'md-lock'} color={COLORS.orange} size={25} />
                    </View>
                </View>)
        );
    }

}

const styles = StyleSheet.create({
    btnLockWrapper: {
        position: 'absolute',
        top: 7,
        left: 7
    },
    lockOutline: {
        height: 30,
        width: 30,
        borderRadius: 50,
        backgroundColor: COLORS.lightgray,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
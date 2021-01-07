import React, { Component } from "react";
import { StyleSheet, View, Dimensions, Image, Button, TouchableHighlight, TouchableOpacity, Animated, Easing } from "react-native";
import Images from "../components/images";
import { Text } from "native-base";
import COLORS from "../assets/Colors";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");
const img_pre = "../assets/challenges/";
const img_post = ".png";

const obj1 = {
    challenge1: require("../assets/challenges/challenge-1.png"),
    challenge2: require("../assets/challenges/challenge-2.png"),
    challenge3: require("../assets/challenges/challenge-3.png"),
    challenge4: require("../assets/challenges/challenge-4.png"),
    challenge5: require("../assets/challenges/challenge-5.png"),
    challenge6: require("../assets/challenges/challenge-6.png"),
    challenge7: require("../assets/challenges/challenge-7.png"),
    challenge8: require("../assets/challenges/challenge-8.png"),
    challenge9: require("../assets/challenges/challenge-9.png"),
    challenge10: require("../assets/challenges/challenge-10.png"),
    challenge11: require("../assets/challenges/challenge-11.png"),
    challenge12: require("../assets/challenges/challenge-12.png"),
    challenge13: require("../assets/challenges/challenge-13.png"),
    challenge14: require("../assets/challenges/challenge-14.png"),
    challenge15: require("../assets/challenges/challenge-15.png"),
    challenge16: require("../assets/challenges/challenge-16.png"),
    challenge17: require("../assets/challenges/challenge-17.png"),
    challenge18: require("../assets/challenges/challenge-18.png"),
    challenge10: require("../assets/challenges/challenge-10.png"),
    challenge11: require("../assets/challenges/challenge-11.png"),
    challenge12: require("../assets/challenges/challenge-12.png"),
    challenge13: require("../assets/challenges/challenge-13.png"),
    challenge14: require("../assets/challenges/challenge-14.png"),
    challenge15: require("../assets/challenges/challenge-15.png"),
    challenge16: require("../assets/challenges/challenge-16.png"),
    challenge17: require("../assets/challenges/challenge-17.png"),
    challenge18: require("../assets/challenges/challenge-18.png")
};

export default class ChallengeIndicator extends Component {
    constructor() {
        super();
        this.state = {
            barWidth: 0
        };
        this.dotValue = new Animated.Value(0)
    }

    componentDidUpdate(prevProps, prevSate, snapshot) {
        if(prevProps.triggerAnimation !== this.props.triggerAnimation){
            if(this.props.triggerAnimation){
                this.animateDot()
            }
        }
    }    

    animateDot() {
        this.dotValue.setValue(0);
        Animated.timing(
            this.dotValue,
            {
                toValue: this.getDotPosition(this.props.daysCompleted),
                duration: 1000,
                easing: Easing.bounce
            }
        ).start();
    }

    getBarWidth = event => {
        let barWidth = event.nativeEvent.layout.width;
        this.setState({ barWidth: barWidth });
    };

    getDotPosition(daysCompleted) {
        const minPos = 0;
        const maxPos = this.state.barWidth - 16;
        let position = minPos + (daysCompleted / 21) * (maxPos - minPos);
        return position;
    }

    render() {
        const { daysCompleted, title, image, onmountain, onedit, displayChallenge} = this.props;
        let image1 = image.replace("-", "");
        let imagesrc = obj1[image1];

        return (
            <View style={[styles.indicatorContainer, !displayChallenge && {display: 'none'}]}>
                <View style={styles.challengeLogo}>
                    <Image
                        style={[styles.image]}
                        resizeMode="cover"
                        source={imagesrc}
                    >
                    </Image>
                </View>
                <View style={styles.challengeData}>
                    <Text style={styles.challengeTitle}>{title}</Text>
                    <View
                        onLayout={event => this.getBarWidth(event)}
                        style={styles.challengeBar}
                    >
                        <Animated.View
                            style={[
                                { left: this.dotValue },
                                styles.challengeDot
                            ]}
                        ></Animated.View>
                        <View
                            style={[
                                { width: this.getDotPosition(daysCompleted) },
                                styles.challengeMeasure
                            ]}
                        ></View>
                    </View>
                </View>
                <View style={styles.challengeButton}>
                    <TouchableOpacity onPress={onmountain} title="">
                        <View style={{ borderRadius: 20, backgroundColor: COLORS.orange, padding: 7 }}>
                            <Image style={{ height: 14, width: 14, tintColor: COLORS.white}} source={Images.arrow_right}></Image>
                        </View>
                        {/* <Ionicons
                        name={"ios-arrow-dropright-circle"}
                        style={{ color: COLORS.orange }}
                        size={40}
                    /> */}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    indicatorContainer: {
        flexDirection: "row",
        borderRadius: 50,
        backgroundColor: COLORS.blue,
        marginTop: 20,
        borderWidth: 1,
        borderColor: COLORS.lightgray,
        height: 70,
        // overflow: 'hidden',
        shadowOffset: {
            width: 0, height: 2
        }, 
        shadowRadius: 5,
        shadowOpacity: 0.7,
        shadowColor: COLORS.gray,
        elevation: 2     
    },
    challengeLogo: {
        flex: 2,
        justifyContent: "center",
        alignItems: "center",
    },
    challengeData: {
        backgroundColor: COLORS.white,
        flex: 3,
        padding: 8
    },
    challengeButton: {
        flex: 1,
        backgroundColor: COLORS.white,
        justifyContent: "center",
        alignItems: "center",
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50,
    },
    challengeTitle: {
        color: "black",
        fontSize: 13
    },
    challengeBar: {
        backgroundColor: COLORS.lightgray,
        height: 14,
        borderRadius: 50,
        marginTop: 10,
        justifyContent: "center",
        paddingLeft: 7,
        paddingRight: 7
    },
    challengeMeasure: {
        backgroundColor: COLORS.black,
        height: 1,
        borderRadius: 50
    },
    challengeDot: {
        borderRadius:
            Math.round(
                Dimensions.get("window").width + Dimensions.get("window").height
            ) / 2,
        width: 8,
        height: 8,
        backgroundColor: COLORS.black,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute"
    },
    image: {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 50,
        height: 50,
        tintColor: COLORS.white
    }
});
